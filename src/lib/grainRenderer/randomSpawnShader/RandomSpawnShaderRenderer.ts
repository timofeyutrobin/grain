import {
    createFullScreenQuad,
    createProgram,
    createShader,
    createTexture,
} from '@/lib/grainRenderer/randomSpawnShader/common';
import grainFragmentShader from '@/lib/grainRenderer/randomSpawnShader/grain.frag';
import grainVertexShader from '@/lib/grainRenderer/randomSpawnShader/grain.vert';

export interface Layer {
    contrast: number;
    sensitivity: number;
    grainSize: number;
    alpha: number;
}

export interface RandomSpawnShaderRenderParameters {
    layers: Layer[];
}

const SUPER_SAMPLING_SCALE = 2;
const MAX_IMAGE_WIDTH = 4096;
const MAX_IMAGE_HEIGHT = 4096;

export class RandomSpawnShaderRenderer {
    private renderingCanvas = new OffscreenCanvas(0, 0);

    private gl: WebGL2RenderingContext;

    private resolutionUniformLocation: WebGLUniformLocation | null;
    private contrastUniformLocation: WebGLUniformLocation | null;
    private sensitivityUniformLocation: WebGLUniformLocation | null;
    private grainSizeUniformLocation: WebGLUniformLocation | null;
    private alphaUniformLocation: WebGLUniformLocation | null;

    constructor(private canvas: OffscreenCanvas) {
        const gl = this.renderingCanvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not supported');
        }

        this.gl = gl;
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

        const imageTextureUniformLocation = gl.getUniformLocation(
            program,
            'u_imageTexture',
        );
        gl.deleteProgram(program);

        gl.uniform1i(imageTextureUniformLocation, 0);

        gl.enable(gl.BLEND);
        gl.blendColor(0.5, 0.5, 0.5, 0.5);
        gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);

        gl.clearColor(0, 0, 0, 1);
    }

    render(image: ImageBitmap, params: RandomSpawnShaderRenderParameters) {
        const iw = Math.max(1, image.width);
        const ih = Math.max(1, image.height);
        const scale = Math.min(
            SUPER_SAMPLING_SCALE,
            MAX_IMAGE_WIDTH / iw,
            MAX_IMAGE_HEIGHT / ih,
        );
        const width = Math.round(iw * scale);
        const height = Math.round(ih * scale);
        this.renderingCanvas.width = width;
        this.renderingCanvas.height = height;
        this.gl.viewport(0, 0, width, height);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        for (const {
            contrast,
            sensitivity,
            grainSize,
            alpha,
        } of params.layers) {
            this.gl.uniform2f(this.resolutionUniformLocation, width, height);
            this.gl.uniform1f(this.contrastUniformLocation, contrast);
            this.gl.uniform1f(this.sensitivityUniformLocation, sensitivity);
            this.gl.uniform1f(this.grainSizeUniformLocation, grainSize);
            this.gl.uniform1f(this.alphaUniformLocation, alpha);

            const imageTexture = createTexture(this.gl, image);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, imageTexture);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
        this.gl.flush();

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        this.canvas.width = Math.floor(width / scale);
        this.canvas.height = Math.floor(height / scale);
        const bitmap = this.renderingCanvas.transferToImageBitmap();
        ctx.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
        bitmap.close();
    }
}
