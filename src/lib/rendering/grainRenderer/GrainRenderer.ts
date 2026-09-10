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
    sensitivity: number;
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

const defaultGrayscaleValue: Color = { r: 220, g: 220, b: 220 };

const MAX_TILE_WIDTH = 256;
const MAX_TILE_HEIGHT = 256;

const TEXTURE_OVERLAP = 30;

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

    constructor(private resultCanvas: OffscreenCanvas) {
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

    async getImage(): Promise<Blob> {
        return this.resultCanvas.convertToBlob({ type: 'image/png' });
    }

    async render(
        image: OffscreenCanvas | ImageBitmap,
        params: GrainRenderParameters,
    ): Promise<void> {
        this.prepareTiles(image);
        await this.renderTiles(image, params);
        this.tiles = [];
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

            imageBitmap.close();
            this.gl.flush();

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
            for (let i = 0; i <= layer.spawnRate; i++) {
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
                sensitivity,
                grainSize,
                spawnRate,
                alpha,
                blurRadius,
            } = layers[i];
            this.gl.uniform1f(this.contrastUniformLocation, contrast);
            this.gl.uniform1f(this.sensitivityUniformLocation, sensitivity);
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

            await new Promise((resolve) =>
                requestAnimationFrame(() => resolve(null)),
            );
        }
    }

    private prepareTiles(image: OffscreenCanvas | ImageBitmap): void {
        const imageWidth = image.width;
        const imageHeight = image.height;
        const imageSize = imageWidth * imageHeight;
        if (imageSize <= 4000000) {
            this.superSamplingScale = 4;
        } else if (imageSize <= 8000000) {
            this.superSamplingScale = 2;
        } else if (imageSize <= 32000000) {
            this.superSamplingScale = 1;
        } else {
            throw new Error('Image is too big');
        }

        const widthTilesCount = Math.ceil(imageWidth / MAX_TILE_WIDTH);
        const heightTilesCount = Math.ceil(imageHeight / MAX_TILE_HEIGHT);
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
}
