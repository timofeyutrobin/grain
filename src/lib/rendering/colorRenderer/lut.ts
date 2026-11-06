export function createLutTexture(
    gl: WebGL2RenderingContext,
    lut: ImageBitmap,
): WebGLTexture {
    if (lut.width !== lut.height) {
        throw new Error('HALD CLUT image must be square');
    }

    const pixelCount = lut.width * lut.height;
    const size = Math.round(Math.cbrt(pixelCount));
    const level = Math.sqrt(size);
    if (
        size ** 3 !== pixelCount ||
        !Number.isInteger(level) ||
        lut.width !== level ** 3
    ) {
        throw new Error('HALD CLUT image has unsupported dimensions');
    }

    if (size > gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)) {
        throw new Error(
            `HALD CLUT size ${size} exceeds the WebGL 3D texture limit`,
        );
    }

    const canvas = new OffscreenCanvas(lut.width, lut.height);
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('2D canvas context is not available');
    }

    context.drawImage(lut, 0, 0);
    const pixels = context.getImageData(0, 0, lut.width, lut.height).data;

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_3D, texture);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    gl.texImage3D(
        gl.TEXTURE_3D,
        0,
        gl.RGBA8,
        size,
        size,
        size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
    );

    return texture;
}
