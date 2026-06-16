import welcomeTourStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';

export const DebugOverlay: React.FC = () => {
    const [_, setWelcomeIntroState] = useAtom(welcomeTourStateAtom);
    return (
        <div className="fixed top-0 right-0 bg-zinc-200 z-100 w-32">
            <button
                onClick={() =>
                    setWelcomeIntroState(
                        WelcomeIntroState.TOUR_STATE_GREETING_SEEN,
                    )
                }
                className="block w-full m-2 p-2 bg-zinc-600 text-sm text-zinc-50 border border-zinc-200"
            >
                Show Intro
            </button>
            <button
                onClick={() => setWelcomeIntroState(null)}
                className="block w-full m-2 p-2 bg-zinc-600 text-sm text-zinc-50 border border-zinc-200"
            >
                Show Greeting
            </button>
            <button
                onClick={() =>
                    setWelcomeIntroState(
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                    )
                }
                className="block w-full m-2 p-2 bg-zinc-600 text-sm text-zinc-50 border border-zinc-200"
            >
                Show Editor
            </button>
        </div>
    );
};
