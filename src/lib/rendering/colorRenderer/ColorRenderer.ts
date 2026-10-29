import colorFragmentShader from '@/lib/rendering/colorRenderer/color.frag';
import colorVertexShader from '@/lib/rendering/colorRenderer/color.vert';
import { createLutTexture } from '@/lib/rendering/colorRenderer/lut';
import {
    createProgram,
    createShader,
    createTexture,
} from '@/lib/rendering/common';

export interface ColorRenderParameters {
    temperature?: number;
    tint?: number;
    lutUrl: string;
    lutFactor?: number;
}

export class ColorRenderer {
    private program: WebGLProgram;
    private gl: WebGL2RenderingContext;

    private imageTextureUniformLocation: WebGLUniformLocation | null;
    private temperatureUniformLocation: WebGLUniformLocation | null;
    private tintUniformLocation: WebGLUniformLocation | null;
    private lutUniformLocation: WebGLUniformLocation | null;
    private lutFactorUniformLocation: WebGLUniformLocation | null;

    constructor(private canvas: OffscreenCanvas) {
        const gl = this.canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not available');
        }

        this.gl = gl;

        const vertexShader = createShader(
            gl,
            this.gl.VERTEX_SHADER,
            colorVertexShader,
        );
        const fragmentShader = createShader(
            gl,
            this.gl.FRAGMENT_SHADER,
            colorFragmentShader,
        );
        const program = createProgram(gl, vertexShader, fragmentShader);
        this.program = program;

        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this.imageTextureUniformLocation = gl.getUniformLocation(
            program,
            'u_imageTexture',
        );
        this.temperatureUniformLocation = gl.getUniformLocation(
            program,
            'u_temp',
        );
        this.tintUniformLocation = gl.getUniformLocation(program, 'u_tint');
        this.lutUniformLocation = gl.getUniformLocation(program, 'u_lut');
        this.lutFactorUniformLocation = gl.getUniformLocation(
            program,
            'u_lutFactor',
        );
    }

    render(
        image: OffscreenCanvas | ImageBitmap,
        lut: ImageBitmap,
        params: ColorRenderParameters,
    ): void {
        this.gl.useProgram(this.program);
        this.gl.uniform1i(this.imageTextureUniformLocation, 0);
        this.gl.uniform1i(this.lutUniformLocation, 1);

        this.gl.activeTexture(this.gl.TEXTURE1);
        const lutTexture = createLutTexture(this.gl, lut);

        this.gl.activeTexture(this.gl.TEXTURE0);
        const imageTexture = createTexture(this.gl, image);

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.gl.uniform1f(
            this.temperatureUniformLocation,
            params.temperature ?? 0,
        );
        this.gl.uniform1f(this.tintUniformLocation, params.tint ?? 0);
        this.gl.uniform1f(this.lutFactorUniformLocation, params.lutFactor ?? 0);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.deleteTexture(imageTexture);
        this.gl.deleteTexture(lutTexture);
    }
}
