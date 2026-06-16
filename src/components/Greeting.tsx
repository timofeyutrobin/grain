import { Button } from '@/components/button/Button';
import welcomeTourStateAtom, {
    WelcomeIntroState,
} from '@/lib/presentation/storage/welcomeIntroStateAtom';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

export const Greeting: React.FC = () => {
    const [welcomeIntroState, setWelcomeIntroState] =
        useAtom(welcomeTourStateAtom);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (welcomeIntroState === null && !dialog.open) {
            dialog.showModal();
        } else if (welcomeIntroState && dialog.open) {
            dialog.close(welcomeIntroState);
        }
    }, [welcomeIntroState]);

    return (
        <dialog
            className="fixed w-screen h-screen max-w-full max-h-full bg-transparent"
            ref={dialogRef}
            onClose={() => {
                if (
                    dialogRef.current?.returnValue ===
                    WelcomeIntroState.TOUR_STATE_GREETING_SEEN
                ) {
                    setWelcomeIntroState(
                        WelcomeIntroState.TOUR_STATE_GREETING_SEEN,
                    );
                } else {
                    setWelcomeIntroState(
                        WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                    );
                }
            }}
        >
            <div className="flex w-full h-full">
                <article className="m-auto mt-64 w-2xl py-6 px-8 border border-zinc-300 bg-zinc-800 text-zinc-50 text-xl space-y-1.5">
                    <p>Hi there!</p>
                    <p>
                        This app simulates how real photographic film works. I
                        created it to show you the science behind photo emulsion
                        and to give you a tool that turns any of your photos
                        into a virtual film snapshot.
                    </p>
                    <p>
                        Check out the quick intro presentation to see how it
                        works!
                    </p>
                    <footer className="mt-6 flex space-x-4">
                        <Button
                            onClick={() => {
                                dialogRef.current?.close(
                                    WelcomeIntroState.TOUR_STATE_GREETING_SEEN,
                                );
                            }}
                        >
                            Watch intro
                        </Button>
                        <Button
                            secondary
                            onClick={() => {
                                dialogRef.current?.close(
                                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                                );
                            }}
                        >
                            Skip
                        </Button>
                    </footer>
                </article>
            </div>
        </dialog>
    );
};

// Привет! Перед вами приложение, эмулирующее работу фотопленки. С
// помощью него я хочу показать принцип работы фотоэмульсии, а также
// предоставить инструмент для превращения любой вашей фотографии в
// виртуальную фотопленку. Посмотрите обучающую презентацию, чтобы
// понять, что здесь происходит!
