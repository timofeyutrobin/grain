import { PropsWithClassName } from '@/lib/common';
import { GrainRenderParameters } from '@/lib/rendering/grainRenderer/GrainRenderer';
import { GraphRenderer } from '@/lib/rendering/graphRenderer/GraphRenderer';
import classNames from 'classnames';
import { useEffect, useState } from 'react';

interface GraphProps {
    width: number;
    height: number;
    renderParameters: GrainRenderParameters;
}

export const Graph: React.FC<PropsWithClassName<GraphProps>> = ({
    className,
    width,
    height,
    renderParameters,
}) => {
    const [renderer, setRenderer] = useState<GraphRenderer | null>(null);

    useEffect(() => {
        if (!renderer) {
            return;
        }
        renderer.render(renderParameters);
    }, [renderer, renderParameters]);

    return (
        <div className={classNames('relative', className)}>
            <i className="block absolute top-2 left-2 text-xs not-italic text-zinc-400 cursor-default">
                Экспозиция
            </i>
            <i className="block absolute bottom-2 right-2 text-xs not-italic text-zinc-400 cursor-default">
                Плотность
            </i>
            <div className="absolute top-0 left-0 w-[10px] h-[10px] border-t-2 border-l-2 border-stone-300 rotate-45 translate-x-[-6px]" />
            <div className="absolute bottom-0 right-0 w-[10px] h-[10px] border-b-2 border-r-2 border-stone-300 -rotate-45 translate-y-[6px]" />
            <canvas
                width={width}
                height={height}
                ref={(canvas) => {
                    if (!canvas) {
                        return;
                    }
                    setRenderer(new GraphRenderer(canvas));
                }}
            />
        </div>
    );
};
