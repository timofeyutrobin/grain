import Editor from '@/components/editor/Editor';
import { LoadingSpinner } from '@/components/editor/LoadingSpinner';
import { Suspense } from 'react';

export default () => {
    return (
        <Suspense
            fallback={
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-900">
                    <LoadingSpinner className="h-[120px] w-[120px] opacity-40" />
                </div>
            }
        >
            <Editor />
        </Suspense>
    );
};
