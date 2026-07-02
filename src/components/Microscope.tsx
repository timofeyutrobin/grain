import { RandomSpawnGrainRenderParameters } from '@/lib/grainRenderer/randomSpawn/RandomSpawnRenderer';

interface MicroscopeProps {
    width: number;
    height: number;
    renderParameters: RandomSpawnGrainRenderParameters;
}

export const Microscope: React.FC<MicroscopeProps> = ({ width, height }) => {
    return (
        <div style={{ width, height }} className="flex bg-zinc-900">
            <em className="m-auto text-xl not-italic">Закрыто на ремонт</em>
        </div>
    );
};
