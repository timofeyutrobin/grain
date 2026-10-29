import { RenderMode } from '@/lib/common';
import {
    ColorRenderer,
    ColorRenderParameters,
} from '@/lib/rendering/colorRenderer/ColorRenderer';
import { createFullScreenQuad } from '@/lib/rendering/common';
import {
    GrainRenderer,
    GrainRenderParameters,
} from '@/lib/rendering/grainRenderer/GrainRenderer';

export interface RenderParameters {
    mode: RenderMode;
    grain: GrainRenderParameters;
    color: ColorRenderParameters;
}

export class RenderPipeline {
    private superSamplingScale: number = 1;

    private renderingCanvas = new OffscreenCanvas(0, 0);

    private gl: WebGL2RenderingContext;
    private resultCtx: OffscreenCanvasRenderingContext2D;

    private colorRenderer: ColorRenderer;
    private grainRenderer: GrainRenderer;

    constructor(private readonly resultCanvas = new OffscreenCanvas(0, 0)) {
        const gl = this.renderingCanvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not available');
        }
        const ctx = resultCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('2d context is not available');
        }
        this.gl = gl;
        this.resultCtx = ctx;
        this.resultCtx.imageSmoothingEnabled = true;
        this.resultCtx.imageSmoothingQuality = 'high';
        createFullScreenQuad(gl);

        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);
        gl.clearColor(0, 0, 0, 1);

        this.colorRenderer = new ColorRenderer(this.renderingCanvas);
        this.grainRenderer = new GrainRenderer(this.renderingCanvas);
    }

    async render(
        image: OffscreenCanvas | ImageBitmap,
        lut: ImageBitmap,
        params: RenderParameters,
    ): Promise<void> {
        this.calculateSuperSamplingScale(image);

        const width = image.width;
        const height = image.height;
        this.changeCanvasSize(width, height);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        let colorGradedImage;
        try {
            if (params.mode === 'color') {
                this.colorRenderer.render(image, lut, params.color);
                colorGradedImage = this.renderingCanvas.transferToImageBitmap();
                await this.grainRenderer.render(colorGradedImage, params.grain);
            } else {
                await this.grainRenderer.render(image, params.grain);
            }
        } finally {
            colorGradedImage?.close();
        }

        this.resultCtx.drawImage(this.renderingCanvas, 0, 0, width, height);
    }

    async getImageBlob(): Promise<Blob> {
        return this.resultCanvas.convertToBlob({ type: 'image/png' });
    }

    getImageBitmap(): ImageBitmap {
        return this.resultCanvas.transferToImageBitmap();
    }

    private changeCanvasSize(width: number, height: number): void {
        const scaledWidth = width * this.superSamplingScale;
        const scaledHeight = height * this.superSamplingScale;
        if (this.resultCanvas.width !== width) {
            this.resultCanvas.width = width;
        }
        if (this.resultCanvas.height !== height) {
            this.resultCanvas.height = height;
        }
        if (this.renderingCanvas.width !== scaledWidth) {
            this.renderingCanvas.width = scaledWidth;
        }
        if (this.renderingCanvas.height !== scaledHeight) {
            this.renderingCanvas.height = scaledHeight;
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
            throw new Error(
                'Загруженное изображение слишком большое. Максимальный размер фото — 32MP.',
            );
        }
    }
}
