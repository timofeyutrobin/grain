import { PropsWithClassName } from '@/lib/common';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';

export const WatchIntroButton: React.FC<PropsWithClassName> = ({
    className,
}) => {
    const [_, setWelcomeIntroState] = useAtom(welcomeIntroStateAtom);

    return (
        <button
            title="Watch the intro"
            className={`
                    w-8 h-8
                    text-2xl text-stone-600 font-bold leading-none
                    border-2 border-stone-600 rounded-full
                    hover:text-stone-400 hover:border-stone-400
                    transition-colors
                    cursor-pointer
                    ${className ?? ''}
                `}
            onClick={() =>
                setWelcomeIntroState(WelcomeIntroState.TOUR_STATE_GREETING_SEEN)
            }
        >
            i
        </button>
    );
};
