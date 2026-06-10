import { Caption } from '@/components/presentation/entities/Caption';
import { Grain } from '@/components/presentation/entities/Grain';

export const Slide1: React.FC = () => {
    return (
        <>
            <directionalLight position={[0, -3, 3]} intensity={10} />
            <object3D position={[-0.3, 0, 0]}>
                <Grain rotate float />
                <Caption
                    float
                    text="This is a grain."
                    position={[-2, 1.7, 1]}
                    linePosition="bottom"
                    pointerPosition="right"
                    length={1.5}
                />
            </object3D>
        </>
    );
};
