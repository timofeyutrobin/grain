import {
    GrainRenderer,
    GrainRenderParameters,
} from '@/lib/rendering/grainRenderer/GrainRenderer';
import * as Sentry from '@sentry/browser';

export type RenderWorkerRequest =
    | {
          type: 'create';
      }
    | {
          type: 'setImage';
          image: ImageBitmap;
      }
    | {
          type: 'render';
          params: GrainRenderParameters;
      };

export type RenderWorkerResponse =
    | {
          type: 'ready';
          blob: Blob;
          imageBitmap: ImageBitmap;
      }
    | {
          type: 'error';
          error: unknown;
      };

export interface RendererWorker extends Omit<
    Worker,
    'postMessage' | 'onmessage' | 'addEventListener' | 'removeEventListener'
> {
    postMessage(message: RenderWorkerRequest, transfer?: Transferable[]): void;
    onmessage:
        | ((this: Worker, ev: MessageEvent<RenderWorkerRequest>) => any)
        | null;
    addEventListener<T extends RenderWorkerRequest | RenderWorkerResponse>(
        type: 'message',
        listener: (this: RendererWorker, ev: MessageEvent<T>) => any,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<T extends RenderWorkerRequest | RenderWorkerResponse>(
        type: 'message',
        listener: (this: RendererWorker, ev: MessageEvent<T>) => any,
        options?: boolean | EventListenerOptions,
    ): void;
}

if (process.env.NODE_ENV === 'production') {
    Sentry.registerWebWorker({ self });
}

const ctx = self as unknown as RendererWorker;

let renderer: GrainRenderer | null = null;
let sourceCanvas: OffscreenCanvas = new OffscreenCanvas(0, 0);
let sourceCanvasCtx = sourceCanvas.getContext('2d');

ctx.addEventListener<RenderWorkerRequest>('message', async (event) => {
    switch (event.data.type) {
        case 'create': {
            if (renderer) {
                break;
            }
            renderer = new GrainRenderer();
            break;
        }
        case 'setImage': {
            if (!renderer || !sourceCanvasCtx) {
                break;
            }
            sourceCanvas.width = event.data.image.width;
            sourceCanvas.height = event.data.image.height;
            sourceCanvasCtx.drawImage(event.data.image, 0, 0);
            break;
        }
        case 'render': {
            if (!renderer) {
                break;
            }
            renderer.setResultCanvasSize(
                sourceCanvas.width,
                sourceCanvas.height,
            );
            let imageBitmap: ImageBitmap | null = null;
            try {
                await renderer.render(sourceCanvas, event.data.params);
                const blob = await renderer.getImageBlob();
                imageBitmap = renderer.getImageBitmap();
                postMessage(
                    { type: 'ready', blob, imageBitmap },
                    { transfer: [imageBitmap] },
                );
            } catch (error) {
                imageBitmap?.close();
                postMessage({ type: 'error', error });
            }

            break;
        }
        default: {
            throw new SyntaxError(
                'Unknown message type passed to rendererWorker.',
            );
        }
    }
});
