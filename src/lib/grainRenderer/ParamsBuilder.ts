export abstract class ParamsBuilder<T> {
    protected layersCount = 0;

    protected validateLayersCount(value: unknown[]) {
        if (this.layersCount === 0) {
            throw new RangeError('Set layers() first');
        }
        if (value.length !== this.layersCount) {
            throw new RangeError(
                'Layers count in value must be equal to general layers count',
            );
        }
    }

    public abstract build(): T[];
}
