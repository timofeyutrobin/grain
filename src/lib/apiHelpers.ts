import { readdirSync, rmSync, statSync } from 'fs';
import path from 'path';

export function cleanupDirToSize(dir: string, maxBytes: number): void {
    const files = readdirSync(dir).map((name) => {
        const filePath = path.join(dir, name);
        return {
            filePath,
            mtime: statSync(filePath).mtimeMs,
            size: statSync(filePath).size,
        };
    });

    let total = files.reduce((sum, f) => sum + f.size, 0);
    if (total <= maxBytes) return;

    files.sort((a, b) => a.mtime - b.mtime);
    for (const file of files) {
        rmSync(file.filePath);
        total -= file.size;
        if (total <= maxBytes) break;
    }
}
