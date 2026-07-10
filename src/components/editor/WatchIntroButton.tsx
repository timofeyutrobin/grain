import { PropsWithClassName } from '@/lib/common';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';

interface WatchIntroButtonProps {
    disabled?: boolean;
}

export const WatchIntroButton: React.FC<
    PropsWithClassName<WatchIntroButtonProps>
> = ({ className, disabled }) => {
    const [_, setWelcomeIntroState] = useAtom(welcomeIntroStateAtom);

    return (
        <button
            title="Watch the intro"
            disabled={disabled}
            className={`
                w-8 h-8
                text-2xl text-stone-600 font-bold leading-none
                border-2 border-stone-600 rounded-full
                hover:text-stone-400 hover:border-stone-400
                transition-colors
                cursor-pointer
                disabled:text-stone-800 disabled:border-stone-800
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
