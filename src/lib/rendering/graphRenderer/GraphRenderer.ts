import {
    createFullScreenQuad,
    createProgram,
    createShader,
} from '@/lib/rendering/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import graphFragmentShader from '@/lib/rendering/graphRenderer/graph.frag';
import graphVertexShader from '@/lib/rendering/graphRenderer/graph.vert';

const colorsForLayers: [number, number, number][] = [
    [0.4196078431372549, 0.12941176470588237, 0.6588235294117647],
    [0.023529411764705882, 0.37254901960784315, 0.27450980392156865],
    [0.7058823529411765, 0.3254901960784314, 0.03529411764705882],
    [0.7450980392156863, 0.07058823529411765, 0.23529411764705882],
];

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
            const { contrast, sensitivity } = layer;
            this.gl.uniform1f(this.contrastUniformLocation, contrast);
            this.gl.uniform1f(this.sensitivityUniformLocation, sensitivity);
            this.gl.uniform3f(
                this.colorUniformLocation,
                ...colorsForLayers[index % colorsForLayers.length],
            );
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        });
    }
}
