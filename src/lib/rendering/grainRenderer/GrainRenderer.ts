import { Color } from '@/lib/common';
import {
    createProgram,
    createShader,
    createTexture,
} from '@/lib/rendering/common';
import grainFragmentShader from '@/lib/rendering/grainRenderer/grain.frag';
import grainVertexShader from '@/lib/rendering/grainRenderer/grain.vert';

export interface Layer {
    id: number;
    contrast: number;
    invertedSensitivity: number;
    grainSize: number;
    spawnRate: number;
    alpha: number;
    blurRadius: number;
}

export interface ColorParameters {
    dye: Color;
}

export interface GrainRenderParameters {
    layers: Layer[];
    colorParameters?: {
        r: ColorParameters;
        g: ColorParameters;
        b: ColorParameters;
    } | null;
}

type Seed = number[][];

enum Channel {
    grayscale = -1,
    r,
    g,
    b,
}

export interface GrainRendererOptions {
    enableTiles?: boolean;
}

const defaultGrayscaleValue: Color = { r: 220, g: 220, b: 220 };
const GPU_IDLE_DELAY_MS = 4;

export class GrainRendererError extends Error {}

export class GrainRendererGPUSyncError extends GrainRendererError {
    constructor(message?: string) {
        super(message);
        this.name = 'GrainRendererGPUSyncError';
    }
}

export class GrainRenderer {
    private program: WebGLProgram;
    private gl: WebGL2RenderingContext;

    private imageTextureUniformLocation: WebGLUniformLocation | null;
    private resolutionUniformLocation: WebGLUniformLocation | null;
    private contrastUniformLocation: WebGLUniformLocation | null;
    private sensitivityUniformLocation: WebGLUniformLocation | null;
    private grainSizeUniformLocation: WebGLUniformLocation | null;
    private alphaUniformLocation: WebGLUniformLocation | null;
    private seedUniformLocation: WebGLUniformLocation | null;
    private colorUniformLocation: WebGLUniformLocation | null;
    private channelUniformLocation: WebGLUniformLocation | null;
    private blurRadiusUniformLocation: WebGLUniformLocation | null;

    constructor(private canvas: OffscreenCanvas) {
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not available');
        }
        this.gl = gl;
        const vertexShader = createShader(
            gl,
            this.gl.VERTEX_SHADER,
            grainVertexShader,
        );
        const fragmentShader = createShader(
            gl,
            this.gl.FRAGMENT_SHADER,
            grainFragmentShader,
        );
        const program = createProgram(gl, vertexShader, fragmentShader);
        this.program = program;

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this.resolutionUniformLocation = gl.getUniformLocation(
            program,
            'u_resolution',
        );
        this.contrastUniformLocation = gl.getUniformLocation(
            program,
            'u_contrast',
        );
        this.sensitivityUniformLocation = gl.getUniformLocation(
            program,
            'u_sensitivity',
        );
        this.grainSizeUniformLocation = gl.getUniformLocation(
            program,
            'u_grainSize',
        );
        this.alphaUniformLocation = gl.getUniformLocation(program, 'u_alpha');
        this.seedUniformLocation = gl.getUniformLocation(program, 'u_seed');
        this.colorUniformLocation = gl.getUniformLocation(program, 'u_color');
        this.channelUniformLocation = gl.getUniformLocation(
            program,
            'u_channel',
        );
        this.blurRadiusUniformLocation = gl.getUniformLocation(
            program,
            'u_blurRadius',
        );

        this.imageTextureUniformLocation = gl.getUniformLocation(
            program,
            'u_imageTexture',
        );
    }

    async render(
        image: OffscreenCanvas | ImageBitmap,
        params: GrainRenderParameters,
    ): Promise<void> {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.imageTextureUniformLocation, 0);
        const seed = this.getSeed(params);

        const imageTexture = createTexture(this.gl, image);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, imageTexture);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.uniform2f(
            this.resolutionUniformLocation,
            this.canvas.width,
            this.canvas.height,
        );

        if (params.colorParameters) {
            await this.renderLayers(
                params.layers,
                Channel.r,
                params.colorParameters.r.dye,
                seed,
            );
            await this.renderLayers(
                params.layers,
                Channel.g,
                params.colorParameters.g.dye,
                seed,
            );
            await this.renderLayers(
                params.layers,
                Channel.b,
                params.colorParameters.b.dye,
                seed,
            );
        } else {
            await this.renderLayers(
                params.layers,
                Channel.grayscale,
                defaultGrayscaleValue,
                seed,
            );
        }

        this.gl.deleteTexture(imageTexture);
    }

    private getSeed(params: GrainRenderParameters): Seed {
        const seed = [];
        for (const layer of params.layers) {
            const iterations = [];
            for (let i = 0; i < layer.spawnRate; i++) {
                iterations.push(Math.floor(Math.random() * 1000));
            }
            seed.push(iterations);
        }
        return seed;
    }

    private async renderLayers(
        layers: Layer[],
        channel: Channel,
        color: Color,
        seed: Seed,
    ): Promise<void> {
        for (let i = 0; i < layers.length; i++) {
            const {
                contrast,
                invertedSensitivity,
                grainSize,
                spawnRate,
                alpha,
                blurRadius,
            } = layers[i];
            this.gl.uniform1f(this.contrastUniformLocation, contrast);
            this.gl.uniform1f(
                this.sensitivityUniformLocation,
                invertedSensitivity,
            );
            this.gl.uniform1f(this.grainSizeUniformLocation, grainSize);
            this.gl.uniform1f(
                this.alphaUniformLocation,
                (1 / spawnRate) * alpha,
            );
            this.gl.uniform3f(
                this.colorUniformLocation,
                color.r / 255,
                color.g / 255,
                color.b / 255,
            );
            this.gl.uniform1i(this.channelUniformLocation, channel);
            this.gl.uniform1f(this.blurRadiusUniformLocation, blurRadius);

            for (let j = 0; j < spawnRate; j++) {
                this.gl.uniform1ui(this.seedUniformLocation, seed[i][j]);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
            }
            await this.waitForGpu();
            await this.delay(GPU_IDLE_DELAY_MS);
        }
    }

    private async waitForGpu(): Promise<void> {
        const sync = this.gl.fenceSync(this.gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) {
            await this.delay(0);
            return;
        }

        this.gl.flush();

        await new Promise<void>((resolve, reject) => {
            const poll = () => {
                const status = this.gl.clientWaitSync(sync, 0, 0);
                if (
                    status === this.gl.ALREADY_SIGNALED ||
                    status === this.gl.CONDITION_SATISFIED
                ) {
                    this.gl.deleteSync(sync);
                    resolve();
                    return;
                }

                if (status === this.gl.WAIT_FAILED) {
                    this.gl.deleteSync(sync);
                    reject(new GrainRendererGPUSyncError());
                    return;
                }

                setTimeout(poll, 1);
            };

            poll();
        });
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }
}
