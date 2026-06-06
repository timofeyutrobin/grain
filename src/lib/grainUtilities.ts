export function traverse(
    grain: boolean[],
    size: number,
    forEach: (x: number, y: number) => void,
) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grain[y * size + x]) {
                forEach(x, y);
            }
        }
    }
}
