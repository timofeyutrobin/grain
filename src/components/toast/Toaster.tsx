import { Toast } from '@/components/toast/Toast';
import toasterAtom from '@/components/toast/toasterAtom';
import { useAtomValue } from 'jotai';

export const Toaster: React.FC = () => {
    const toasts = useAtomValue(toasterAtom);
    return (
        <>
            {toasts.map((toast, index) => (
                <Toast key={toast.id} offset={index}>
                    {toast.text}
                </Toast>
            ))}
        </>
    );
};
