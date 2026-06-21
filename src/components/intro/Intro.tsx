import { Button } from '@/components/button/Button';
import { Card } from '@/components/intro/components/Card';
import { Scene } from '@/components/intro/components/Scene';
import { clamp, PropsWithClassName } from '@/lib/common';
import welcomeIntroStateAtom, {
    WelcomeIntroState,
} from '@/lib/intro/storage/welcomeIntroStateAtom';
import { Canvas } from '@react-three/fiber';
import { useAtom } from 'jotai';
import Image from 'next/image';
import { useState } from 'react';

// cspell:disable
const text = [
    {
        title: 'Зерно',
        paragraph: (
            <p>
                Перед вами кристалл галогенида серебра. Именно его мы называем
                "зерно". Это главный строительный кирпичик любой фотопленки.
                Каждое зёрнышко — уникально, но есть кое-что, что их всех
                объединяет — они обладают чувствительностью к свету.
            </p>
        ),
        buttonText: null,
    },
    {
        title: 'Фотоэмульсия',
        paragraph: (
            <p>
                Фотоэмульсия — это светочувствительный слой любой фотопленки.
                Она состоит из множества кристаллов, которые плавают в ней,
                подобно взвеси. Но что же происходит, когда свет попадает на это
                облако зерна? Давайте узнаем!
            </p>
        ),
        buttonText: 'Зажечь свет',
    },
    {
        title: 'Экспозиция',
        paragraph: (
            <>
                <p>
                    Благодаря устройству камеры и объектива, на пленку
                    проецируется изображение.
                </p>
                <p>
                    Изображение — это поток фотонов, меняющий свою интенсивность
                    в зависимости от яркости объекта, который вы снимаете.
                </p>
                <p>
                    Как только затвор камеры открывается, свет заливает собой
                    поверхность пленки. Кристаллы, которые получили много света,
                    активируются. Затем, в процессе проявки, эти кристаллы
                    превращаются в металлическое серебро и чернеют. А те,
                    которые остались в тени, смываются в процессе обработки
                    пленки.
                </p>
            </>
        ),
        buttonText: 'Активировать зерна',
    },
    {
        title: 'Вероятность',
        paragraph: (
            <>
                <p>
                    Когда свет попадает на зернышко, оно может либо
                    активироваться, либо остаться в исходном состоянии. Мы можем
                    представить, что это случайное событие. Чем больше света
                    попало на зернышко, тем выше вероятность, что оно
                    активируется и станет частью изображения.
                </p>
                <p>
                    В emulsion engine я использовал следующую формулу
                    распределения вероятности для каждого зернышка:
                </p>
                <p className="flex items-center justify-around">
                    <Image
                        src="/images/formula.svg"
                        alt="Probability function"
                        width={300}
                        height={55}
                    />
                    <span className="text-lg">
                        a — контраст
                        <br />b — чувствительность
                    </span>
                </p>
            </>
        ),
        buttonText: null,
    },
    {
        title: 'Изображение',
        paragraph: (
            <>
                <p>
                    Перед вами целый пленочный кадр, состоящий из миллионов
                    зерен. В светлых участках изображения находится больше
                    зерна, плотность его расположения выше. А в тенях зерна
                    почти нет — там изображение остается прозрачным. Из-за
                    разной плотности зерна и формируется целая фотография.
                </p>
                <p>
                    Мы имеем дело с законом больших чисел для вероятности. Из-за
                    распределения вероятностей для единственного зернышка,
                    меняется характер всего изображения.
                </p>
            </>
        ),
        buttonText: null,
    },
    {
        title: 'Цвет',
        paragraph: (
            <p>
                В цветной фотопленке целых три слоя эмульсии вместо одного.
                Каждый из них имеет чувствительность только к своему базовому
                цвету — красному, зеленому и синему. В итоге, накладываясь друг
                на друга, эти слои формируют полноценное цветное изображение.
            </p>
        ),
        buttonText: 'Наложить слои',
    },
    {
        title: 'Цвет',
        paragraph: (
            <p>
                В реальной жизни цвета на пленке инвертированы. Вместо красного,
                синего и зеленого, вы увидите циан, желтый и пурпурный. А вместо
                светлых участков, увидите темные. В этой цифровой симуляции
                сразу рождается оригинальный цвет в формате RGB.
            </p>
        ),
        buttonText: 'Далее',
    },
    {
        title: 'Попробуй сам',
        paragraph: (
            <>
                <p>
                    Спасибо за просмотр вступления! Теперь вы можете перейти в
                    редактор, загрузить свою собственную фотографию и превратить
                    её в цифровую эмульсию.
                </p>
                <p>
                    Поскольку перед вами модель реальной физики пленки, качество
                    результата будет зависеть от разрешения фотографии.
                    Экспериментируйте!
                </p>
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
                <main className="text-md space-y-2">
                    {text[currentStep].paragraph}
                </main>
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
