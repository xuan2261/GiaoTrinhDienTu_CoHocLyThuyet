import {
  build,
  getDocument,
  TextLayer,
  version,
} from 'pdfjs-dist/build/pdf.mjs';
import { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.mjs';

globalThis.pdfjsWorker = { WorkerMessageHandler };

globalThis.PdfTextbookRuntime = Object.freeze({
  build,
  version,
  TextLayer,
  openDocument(source) {
    return getDocument({
      ...source,
      enableScripting: false,
      useWorkerFetch: false,
      useWasm: false,
    });
  },
});
