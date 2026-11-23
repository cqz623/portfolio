import { staticUrl } from './urls.js';

let library: Promise<typeof import('pdfjs-dist')> | undefined;
/** Imported only after a PDF component enters the viewport; never during SSR. */
export function pdfLibrary() {
  return library ??= Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  });
}

export function pdfDocumentOptions(src: string) {
  return {
    url: staticUrl(src),
    cMapUrl: staticUrl('/pdfjs/cmaps/'), cMapPacked: true,
    standardFontDataUrl: staticUrl('/pdfjs/standard_fonts/'),
    wasmUrl: staticUrl('/pdfjs/wasm/'),
    iccUrl: staticUrl('/pdfjs/iccs/'),
    // Fetch only the portions needed for the requested page, when byte ranges are supported.
    disableAutoFetch: true, disableStream: true,
    isEvalSupported: false
  };
}
