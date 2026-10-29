import { getLut } from '@/lib/lutService';
import {
    RenderParameters,
    RenderPipeline,
} from '@/lib/rendering/RenderPipeline';
import {
    databaseWrapper,
    DatabaseWrapper,
    openDatabase,
} from '@/lib/storage/db';

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
          params: RenderParameters;
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

const ctx = self as unknown as RendererWorker;

let renderer: RenderPipeline | null = null;
let sourceImage: ImageBitmap | null = null;
let database: DatabaseWrapper | null = null;

ctx.addEventListener<RenderWorkerRequest>('message', async (event) => {
    switch (event.data.type) {
        case 'create': {
            if (renderer) {
                break;
            }
            openDatabase((db) => {
                database = databaseWrapper(db);
                renderer = new RenderPipeline();
            });
            break;
        }
        case 'setImage': {
            if (!renderer) {
                break;
            }
            sourceImage?.close();
            sourceImage = event.data.image;
            break;
        }
        case 'render': {
            if (!renderer || !sourceImage) {
                break;
            }
            let imageBitmap: ImageBitmap | null = null;
            let lut: ImageBitmap | null = null;
            try {
                lut = await getLut(database, event.data.params.color.lutUrl);
                await renderer.render(sourceImage, lut, event.data.params);
                const blob = await renderer.getImageBlob();
                imageBitmap = renderer.getImageBitmap();
                postMessage(
                    { type: 'ready', blob, imageBitmap },
                    { transfer: [imageBitmap] },
                );
            } catch (error) {
                imageBitmap?.close();
                postMessage({ type: 'error', error });
            } finally {
                lut?.close();
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
