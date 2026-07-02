export function createShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string,
): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

export function createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
): WebGLProgram {
    const program = gl.createProgram();
    try {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw new Error(
                `Failed to create program:\n${gl.getProgramInfoLog(program)}\n${gl.getShaderInfoLog(vertexShader)}\n${gl.getShaderInfoLog(fragmentShader)}`,
            );
        }
        return program;
    } catch (err) {
        gl.deleteProgram(program);
        throw err;
    }
}

export function createFullScreenQuad(gl: WebGL2RenderingContext) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertices = new Float32Array([
        -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, -1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    return vao;
}

export function createTexture(
    gl: WebGL2RenderingContext,
    image: TexImageSource | Uint8ClampedArray,
    width: number = 0,
    height: number = 0,
): WebGLTexture {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (image instanceof Uint8ClampedArray) {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image,
        );
    } else {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image,
        );
    }
    return texture;
}
