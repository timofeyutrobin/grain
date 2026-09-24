import { Color } from '@/lib/common';
import {
    createFullScreenQuad,
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

interface Tile {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

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

const MAX_TILE_WIDTH = 512;
const MAX_TILE_HEIGHT = 512;

const TEXTURE_OVERLAP = 30;
const GPU_IDLE_DELAY_MS = 4;

export class GrainRendererError extends Error {}

export class GrainRendererGPUSyncError extends GrainRendererError {
    constructor(message?: string) {
        super(message);
        this.name = 'GrainRendererGPUSyncError';
    }
}

export class GrainRenderer {
    private superSamplingScale: number = 1;
    private tiles: Tile[] = [];

    private renderingCanvas = new OffscreenCanvas(0, 0);

    private gl: WebGL2RenderingContext;
    private resultCtx: OffscreenCanvasRenderingContext2D;

    private resolutionUniformLocation: WebGLUniformLocation | null;
    private contrastUniformLocation: WebGLUniformLocation | null;
    private sensitivityUniformLocation: WebGLUniformLocation | null;
    private grainSizeUniformLocation: WebGLUniformLocation | null;
    private alphaUniformLocation: WebGLUniformLocation | null;
    private seedUniformLocation: WebGLUniformLocation | null;
    private colorUniformLocation: WebGLUniformLocation | null;
    private channelUniformLocation: WebGLUniformLocation | null;
    private currentTileOffsetUniformLocation: WebGLUniformLocation | null;
    private textureOverlapScaleUniformLocation: WebGLUniformLocation | null;
    private textureOverlapOffsetUniformLocation: WebGLUniformLocation | null;
    private blurRadiusUniformLocation: WebGLUniformLocation | null;

    constructor(private resultCanvas = new OffscreenCanvas(0, 0)) {
        const gl = this.renderingCanvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not available');
        }
        const ctx = this.resultCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('2d context is not available');
        }

        this.gl = gl;
        this.resultCtx = ctx;
        this.resultCtx.imageSmoothingQuality = 'high';
        this.resultCtx.fillStyle = '#000';
        createFullScreenQuad(gl);

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
        gl.useProgram(program);
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
        this.currentTileOffsetUniformLocation = gl.getUniformLocation(
            program,
            'u_currentTileOffset',
        );
        this.textureOverlapScaleUniformLocation = gl.getUniformLocation(
            program,
            'u_textureOverlapScale',
        );
        this.textureOverlapOffsetUniformLocation = gl.getUniformLocation(
            program,
            'u_textureOverlapOffset',
        );
        this.blurRadiusUniformLocation = gl.getUniformLocation(
            program,
            'u_blurRadius',
        );

        const imageTextureUniformLocation = gl.getUniformLocation(
            program,
            'u_imageTexture',
        );

        gl.deleteProgram(program);

        gl.uniform1i(imageTextureUniformLocation, 0);

        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);

        gl.clearColor(0, 0, 0, 1);
    }

    setResultCanvasSize(width: number, height: number): void {
        this.resultCanvas.width = width;
        this.resultCanvas.height = height;
    }

    async getImageBlob(): Promise<Blob> {
        return this.resultCanvas.convertToBlob({ type: 'image/png' });
    }

    getImageBitmap(): ImageBitmap {
        return this.resultCanvas.transferToImageBitmap();
    }

    async render(
        image: OffscreenCanvas | ImageBitmap,
        params: GrainRenderParameters,
        options: GrainRendererOptions = { enableTiles: true },
    ): Promise<void> {
        this.superSamplingScale = 1;
        this.tiles = [];
        this.calculateSuperSamplingScale(image);

        if (options?.enableTiles) {
            this.prepareTiles(image);
        } else {
            this.tiles.push({
                offsetX: 0,
                offsetY: 0,
                width: image.width,
                height: image.height,
            });
        }

        await this.renderTiles(image, params);
    }

    private async renderTiles(
        image: OffscreenCanvas | ImageBitmap,
        params: GrainRenderParameters,
    ): Promise<void> {
        const seed = this.getSeed(params);
        for (const { width, height, offsetX, offsetY } of this.tiles) {
            const offsetXPixels = offsetX * width;
            const offsetYPixels = offsetY * height;

            const scaledWidth = width * this.superSamplingScale;
            const scaledHeight = height * this.superSamplingScale;

            const textureOverlapRight =
                offsetXPixels + width + TEXTURE_OVERLAP > image.width
                    ? 0
                    : TEXTURE_OVERLAP;
            const textureOverlapLeft =
                offsetXPixels - TEXTURE_OVERLAP < 0 ? 0 : TEXTURE_OVERLAP;
            const textureOverlapBottom =
                offsetYPixels + height + TEXTURE_OVERLAP > image.height
                    ? 0
                    : TEXTURE_OVERLAP;
            const textureOverlapTop =
                offsetYPixels - TEXTURE_OVERLAP < 0 ? 0 : TEXTURE_OVERLAP;

            const textureWidthOverlapped = Math.min(
                width + textureOverlapLeft + textureOverlapRight,
                image.width,
            );
            const textureHeightOverlapped = Math.min(
                height + textureOverlapTop + textureOverlapBottom,
                image.height,
            );

            const textureScaleX = width / textureWidthOverlapped;
            const textureScaleY = height / textureHeightOverlapped;

            this.renderingCanvas.width = scaledWidth;
            this.renderingCanvas.height = scaledHeight;

            const imageBitmap = await createImageBitmap(
                image,
                offsetXPixels - textureOverlapLeft,
                offsetYPixels - textureOverlapTop,
                textureWidthOverlapped,
                textureHeightOverlapped,
                {
                    resizeWidth: textureWidthOverlapped,
                    resizeHeight: textureHeightOverlapped,
                    resizeQuality: 'high',
                },
            );

            const imageTexture = createTexture(this.gl, imageBitmap);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, imageTexture);

            this.gl.viewport(0, 0, scaledWidth, scaledHeight);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.gl.uniform2f(
                this.resolutionUniformLocation,
                scaledWidth,
                scaledHeight,
            );
            this.gl.uniform2f(
                this.currentTileOffsetUniformLocation,
                offsetX,
                offsetY,
            );
            this.gl.uniform2f(
                this.textureOverlapScaleUniformLocation,
                textureScaleX,
                textureScaleY,
            );
            this.gl.uniform2f(
                this.textureOverlapOffsetUniformLocation,
                textureOverlapLeft / width,
                textureOverlapTop / height,
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
            imageBitmap.close();

            this.resultCtx.fillRect(
                offsetXPixels,
                this.resultCanvas.height - offsetYPixels - height,
                width,
                height,
            );
            this.resultCtx.drawImage(
                this.renderingCanvas,
                offsetXPixels,
                this.resultCanvas.height - offsetYPixels - height,
                width,
                height,
            );
        }
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

    private prepareTiles(image: OffscreenCanvas | ImageBitmap): void {
        const imageWidth = image.width;
        const imageHeight = image.height;

        const widthTilesCount = Math.ceil(
            imageWidth / (MAX_TILE_WIDTH / this.superSamplingScale),
        );
        const heightTilesCount = Math.ceil(
            imageHeight / (MAX_TILE_HEIGHT / this.superSamplingScale),
        );
        const tileWidth = Math.floor(imageWidth / widthTilesCount);
        const tileHeight = Math.floor(imageHeight / heightTilesCount);

        for (let i = 0; i < widthTilesCount; i++) {
            for (let j = 0; j < heightTilesCount; j++) {
                this.tiles.push({
                    offsetX: i,
                    offsetY: j,
                    width: tileWidth,
                    height: tileHeight,
                });
            }
        }
    }

    private calculateSuperSamplingScale(
        image: OffscreenCanvas | ImageBitmap,
    ): void {
        const imageWidth = image.width;
        const imageHeight = image.height;
        const imageSize = imageWidth * imageHeight;
        if (imageSize <= 4000000) {
            this.superSamplingScale = 4;
        } else if (imageSize <= 12000000) {
            this.superSamplingScale = 2;
        } else if (imageSize <= 32000000) {
            this.superSamplingScale = 1;
        } else {
            throw new Error('Image is too big');
        }
    }
}
