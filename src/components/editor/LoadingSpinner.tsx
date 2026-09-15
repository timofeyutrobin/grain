import { PropsWithClassName } from '@/lib/common';

export const LoadingSpinner: React.FC<PropsWithClassName> = ({ className }) => {
    return (
        <svg
            className="h-32 w-32 stroke-stone-400/30 absolute inset-0 m-auto"
            fill="none"
            role="img"
            viewBox="0 0 100 115"
        >
            <path
                d="M50,55L59.27,76.42 M50,55L65,34.35 M50,55L25.73,50.42 M50,17L59.27,14.93 M50,17L65,34.35 M50,17L25.73,26.93 M20,69L40.73,85.07 M20,69L16.46,57 M20,69L25.73,50.42 M20,31L40.73,23.58 M20,31L16.46,57 M20,31L25.73,26.93 M80,69L59.27,76.42 M80,69L83.54,43 M80,69L74.27,73.07 M80,31L59.27,14.93 M80,31L83.54,43 M80,31L74.27,49.58 M50,83L40.73,85.07 M50,83L35,65.65 M50,83L74.27,73.07 M50,45L40.73,23.58 M50,45L35,65.65 M50,45L74.27,49.58 M59.27,76.42L40.73,85.07 M59.27,14.93L40.73,23.58 M65,34.35L83.54,43 M16.46,57L35,65.65 M25.73,50.42L25.73,26.93 M74.27,73.07L74.27,49.58"
                strokeLinecap="round"
                strokeWidth="1"
            >
                <animateTransform
                    attributeName="transform"
                    dur="8s"
                    from="0 50 50"
                    repeatCount="indefinite"
                    to="360 50 50"
                    type="rotate"
                ></animateTransform>
            </path>
            <text
                x="50"
                y="105"
                stroke="none"
                textAnchor="middle"
                className="text-sm fill-stone-400/50"
            >
                Developing
            </text>
        </svg>
    );
};
