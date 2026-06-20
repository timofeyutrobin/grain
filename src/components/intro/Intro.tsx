import { Button } from '@/components/button/Button';
import { Card } from '@/components/intro/components/Card';
import { Scene } from '@/components/intro/components/Scene';
import { clamp, PropsWithClassName } from '@/lib/common';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { Canvas } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { useState } from 'react';

// cspell:disable
const text = [
    {
        title: 'Зерно',
        paragraph: (
            <>
                Перед вами кристалл галогенида серебра. Именно его мы называем
                "зерно". Это главный строительный кирпичик любой фотопленки.
                Каждое зёрнышко — уникально, но есть кое-что, что их всех
                объединяет — они обладают чувствительностью к свету.
            </>
        ),
        buttonText: null,
    },
    {
        title: 'Фотоэмульсия',
        paragraph: (
            <>
                Фотоэмульсия — это светочувствительный слой любой фотопленки.
                Внутри неё мы увидим множество кристаллов, которые плавают в
                ней, подобно взвеси. Но что же происходит, когда свет попадает
                на это облако зерна? Давайте узнаем!
            </>
        ),
        buttonText: 'Зажечь свет',
    },
    {
        title: 'Экспозиция',
        paragraph: (
            <>
                Как только затвор камеры открывается, свет заливает собой
                поверхность пленки. Кристаллы, которые получили достаточно
                света, активируются. Затем, в процессе проявки, эти кристаллы
                превращаются в металлическое серебро и чернеют. А те, которые
                остались в тени, смываются в процессе обработки пленки.
            </>
        ),
        buttonText: 'Активировать зерна',
    },
    {
        title: 'Вероятность',
        paragraph: (
            <>
                Когда свет попадает на зернышко, оно может либо активироваться,
                либо остаться в исходном состоянии. Мы можем представить, что
                это случайное событие. Чем больше света попало на зернышко, тем
                выше вероятность, что оно активируется и станет частью
                изображения. В этой симуляции распределение вероятностей
                задаётся S-образной кривой.
            </>
        ),
        buttonText: null,
    },
    {
        title: 'Изображение',
        paragraph: (
            <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas dui arcu, tincidunt vitae dui in, egestas pellentesque
                lectus. Donec in nisl erat. In varius tellus in mauris posuere,
                ac tempus ante laoreet. Sed tempor felis in sapien feugiat, sit
                amet maximus urna rutrum. Aenean ut tortor et purus commodo
                feugiat. Etiam in pellentesque mi. Maecenas et neque nec nunc
                mattis interdum vel vitae nisi. Phasellus dapibus porta
                accumsan. Maecenas convallis ex vel elementum pulvinar. In
                faucibus congue massa a consequat. Etiam semper iaculis augue,
                id tempus dui vehicula at.
            </>
        ),
        buttonText: null,
    },
    {
        title: 'Цвет',
        paragraph: (
            <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas dui arcu, tincidunt vitae dui in, egestas pellentesque
                lectus. Donec in nisl erat. In varius tellus in mauris posuere,
                ac tempus ante laoreet. Sed tempor felis in sapien feugiat, sit
                amet maximus urna rutrum. Aenean ut tortor et purus commodo
                feugiat. Etiam in pellentesque mi. Maecenas et neque nec nunc
                mattis interdum vel vitae nisi. Phasellus dapibus porta
                accumsan. Maecenas convallis ex vel elementum pulvinar. In
                faucibus congue massa a consequat. Etiam semper iaculis augue,
                id tempus dui vehicula at.
            </>
        ),
        buttonText: 'Понятно!',
    },
    {
        title: 'Об этом инструменте',
        paragraph: (
            <>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas dui arcu, tincidunt vitae dui in, egestas pellentesque
                lectus. Donec in nisl erat. In varius tellus in mauris posuere,
                ac tempus ante laoreet. Sed tempor felis in sapien feugiat, sit
                amet maximus urna rutrum. Aenean ut tortor et purus commodo
                feugiat. Etiam in pellentesque mi. Maecenas et neque nec nunc
                mattis interdum vel vitae nisi. Phasellus dapibus porta
                accumsan. Maecenas convallis ex vel elementum pulvinar. In
                faucibus congue massa a consequat. Etiam semper iaculis augue,
                id tempus dui vehicula at.
            </>
        ),
        buttonText: 'К делу!',
    },
] as const;
// cspell:enable

export const Intro: React.FC<PropsWithClassName> = ({ className }) => {
    const [_, setWelcomeIntroState] = useAtom(welcomeIntroStateAtom);
    const stepsCount = text.length;
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className={`${className ?? ''} flex`}>
            <div className="mx-auto w-full h-full min-h-180 max-h-full">
                <Canvas camera={{ fov: 45, far: 60 }}>
                    <ambientLight />
                    <Scene currentStep={currentStep} />
                </Canvas>
            </div>

            <Card className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-2xl min-w-md space-y-4 flex flex-col">
                <header className="flex justify-between align-baseline space-x-8">
                    <h2 className="text-xl font-semibold">
                        {text[currentStep].title}
                    </h2>
                    <small className="text-xl font-light text-stone-300">
                        {currentStep + 1} / {stepsCount}
                    </small>
                </header>
                <p className="text-sm">{text[currentStep].paragraph}</p>
                <footer className="flex justify-between mt-6">
                    {currentStep > 0 && (
                        <Button
                            small
                            secondary
                            onClick={() =>
                                setCurrentStep(
                                    clamp(currentStep - 1, 0, stepsCount - 1),
                                )
                            }
                        >
                            Назад
                        </Button>
                    )}
                    <Button
                        className="ml-auto"
                        small
                        onClick={() => {
                            if (currentStep === stepsCount - 1) {
                                setWelcomeIntroState(
                                    WelcomeIntroState.TOUR_STATE_INTRO_SEEN,
                                );
                                return;
                            }

                            setCurrentStep(
                                clamp(currentStep + 1, 0, stepsCount - 1),
                            );
                        }}
                    >
                        {text[currentStep].buttonText ?? 'Далее'}
                    </Button>
                </footer>
            </Card>
        </div>
    );
};
