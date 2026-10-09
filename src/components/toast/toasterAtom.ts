import { atom } from 'jotai';

const CLOSE_TIME_MS = 7000;

interface Toast {
    id: number;
    text: string;
}

const toasterAtom = atom<Toast[]>([]);
const idAtom = atom<number>(0);

export default toasterAtom;

export const addToastAtom = atom(null, (get, set, toast: Omit<Toast, 'id'>) => {
    const id = get(idAtom);
    set(toasterAtom, (previousToasts) => [
        ...previousToasts,
        { id, text: toast.text },
    ]);
    set(idAtom, (previousId) => previousId + 1);
    setTimeout(() => {
        set(toasterAtom, (previousToasts) =>
            previousToasts.filter((toast) => toast.id !== id),
        );
    }, CLOSE_TIME_MS);
});
