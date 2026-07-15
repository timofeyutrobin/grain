import {
    createFullScreenQuad,
    createProgram,
    createShader,
    createTexture,
} from '@/lib/grainRenderer/common';
import grainFragmentShader from '@/lib/grainRenderer/grain.frag';
import grainVertexShader from '@/lib/grainRenderer/grain.vert';

export interface Layer {
    contrast: number;
    sensitivity: number;
    grainSize: number;
    spawnRate: number;
    alpha: number;
}

export interface GrainRenderParameters {
    layers: Layer[];
}

interface Tile {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

const MAX_TILE_WIDTH = 512;
const MAX_TILE_HEIGHT = 512;

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
        image: ImageBitmap,
        params: GrainRenderParameters,
    ): Promise<void> {
        this.prepareTiles(image);
        await this.renderTiles(image, params);
        this.tiles = [];
    }

    private async renderTiles(
        image: ImageBitmap,
        params: GrainRenderParameters,
    ): Promise<void> {
        for (const { width, height, offsetX, offsetY } of this.tiles) {
            const scaledWidth = width * this.superSamplingScale;
            const scaledHeight = height * this.superSamplingScale;

            this.renderingCanvas.width = scaledWidth;
            this.renderingCanvas.height = scaledHeight;

            const imageBitmap = await createImageBitmap(
                image,
                offsetX,
                offsetY,
                width,
                height,
                {
                    resizeWidth: width,
                    resizeHeight: height,
                    resizeQuality: 'high',
                },
            );

            const imageTexture = createTexture(this.gl, imageBitmap);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, imageTexture);

            this.gl.viewport(0, 0, scaledWidth, scaledHeight);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            for (const {
                contrast,
                sensitivity,
                grainSize,
                spawnRate,
                alpha,
            } of params.layers) {
                this.gl.uniform2f(
                    this.resolutionUniformLocation,
                    scaledWidth,
                    scaledHeight,
                );
                this.gl.uniform1f(this.contrastUniformLocation, contrast);
                this.gl.uniform1f(this.sensitivityUniformLocation, sensitivity);
                this.gl.uniform1f(this.grainSizeUniformLocation, grainSize);
                this.gl.uniform1f(
                    this.alphaUniformLocation,
                    (1 / spawnRate) * alpha,
                );

                for (let i = 0; i < spawnRate; i++) {
                    this.gl.uniform1ui(
                        this.seedUniformLocation,
                        Math.floor(Math.random() * 1000),
                    );

                    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
                }
            }
            await new Promise((resolve) =>
                requestAnimationFrame(() => resolve(null)),
            );
            imageBitmap.close();
            this.gl.flush();

            const resultBitmap = this.renderingCanvas.transferToImageBitmap();
            this.resultCtx.fillRect(
                offsetX,
                this.resultCanvas.height - offsetY - height,
                width,
                height,
            );
            this.resultCtx.drawImage(
                resultBitmap,
                offsetX,
                this.resultCanvas.height - offsetY - height,
                width,
                height,
            );
            resultBitmap.close();
        }
    }

    private prepareTiles(image: ImageBitmap): void {
        const imageWidth = image.width;
        const imageHeight = image.height;
        if (imageWidth <= 1024 && imageHeight <= 1024) {
            this.superSamplingScale = 4;
        } else if (imageWidth <= 2048 && imageHeight <= 2048) {
            this.superSamplingScale = 2;
        } else if (imageWidth <= 8192 && imageHeight <= 8192) {
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
                    offsetX: i * tileWidth,
                    offsetY: j * tileHeight,
                    width: tileWidth,
                    height: tileHeight,
                });
            }
        }
    }
}
