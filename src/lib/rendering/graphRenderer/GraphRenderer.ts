import {
    createFullScreenQuad,
    createProgram,
    createShader,
} from '@/lib/rendering/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import graphFragmentShader from '@/lib/rendering/graphRenderer/graph.frag';
import graphVertexShader from '@/lib/rendering/graphRenderer/graph.vert';
import { getColorForLayer } from '@/lib/rendering/graphRenderer/graphColors';

export class GraphRenderer {
    private gl: WebGL2RenderingContext;

    private contrastUniformLocation: WebGLUniformLocation | null;
    private sensitivityUniformLocation: WebGLUniformLocation | null;
    private colorUniformLocation: WebGLUniformLocation | null;

    constructor(private canvas: HTMLCanvasElement) {
        const gl = this.canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 is not available');
        }

        this.gl = gl;
        createFullScreenQuad(gl);

        const vertexShader = createShader(
            gl,
            this.gl.VERTEX_SHADER,
            graphVertexShader,
        );
        const fragmentShader = createShader(
            gl,
            this.gl.FRAGMENT_SHADER,
            graphFragmentShader,
        );
        const program = createProgram(gl, vertexShader, fragmentShader);
        gl.useProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this.contrastUniformLocation = gl.getUniformLocation(
            program,
            'u_contrast',
        );
        this.sensitivityUniformLocation = gl.getUniformLocation(
            program,
            'u_sensitivity',
        );
        this.colorUniformLocation = gl.getUniformLocation(program, 'u_color');

        gl.deleteProgram(program);

        gl.depthMask(false);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);

        gl.clearColor(0, 0, 0, 0);
    }

    render(params: GrainRenderParameters): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        params.layers.forEach((layer, index) => {
            const { contrast, invertedSensitivity } = layer;
            const color = getColorForLayer(index);
            this.gl.uniform1f(this.contrastUniformLocation, contrast);
            this.gl.uniform1f(
                this.sensitivityUniformLocation,
                invertedSensitivity,
            );
            this.gl.uniform3f(
                this.colorUniformLocation,
                color.r,
                color.g,
                color.b,
            );
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        });
    }
}
