import { Button } from '@/components/button/Button';
import welcomeTourStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
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
                <article className="mt-auto w-full text-sm space-y-1.5 md:m-auto md:mt-64 md:max-w-2xl py-6 px-8 md:border md:border-zinc-300 bg-zinc-800 text-zinc-50 md:text-base">
                    <p>Привет!</p>
                    <p>
                        Добро пожаловать в{' '}
                        <i className="font-semibold">emulsion engine</i>
                    </p>
                    <p>
                        С помощью этого приложения я хочу показать принцип
                        работы фотоэмульсии, а также предоставить инструмент для
                        превращения любой вашей фотографии в виртуальную
                        фотопленку.
                    </p>
                    <p>
                        Посмотрите обучающую презентацию, чтобы понять, что
                        здесь происходит!
                    </p>
                    <footer className="mt-6 flex space-x-4">
                        <Button
                            small
                            onClick={() => {
                                dialogRef.current?.close(
                                    WelcomeIntroState.TOUR_STATE_GREETING_SEEN,
                                );
                            }}
                        >
                            Начать
                        </Button>
                        <Button
                            small
                            secondary
                            onClick={() => {
                                dialogRef.current?.close(
                                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                                );
                            }}
                        >
                            Пропустить
                        </Button>
                    </footer>
                </article>
            </div>
        </dialog>
    );
};
