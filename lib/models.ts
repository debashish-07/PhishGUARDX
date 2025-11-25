// transformers.js model helpers: lazy pipelines with WebGPU/WASM fallback and caching

import type { PipelineType } from "@xenova/transformers";

type Backend = "webgpu" | "wasm" | "cpu";

let transformersImport: any | null = null;
let textPipePromise: Promise<any> | null = null;

function detectBackend(): Backend {
  if (typeof navigator !== "undefined" && (navigator as any).gpu) return "webgpu";
  // wasm backend is default in transformers.js for browsers without WebGPU
  return "wasm";
}

export async function getTextClassificationPipeline(
  model = "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
) {
  const backend = detectBackend();
  transformersImport = transformersImport || (await import("@xenova/transformers"));
  const { pipeline, env } = transformersImport;

  // Configure backend (prefer WebGPU, fallback to WASM). Avoid Node backends entirely.
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  if (backend === "webgpu") env.backends.onnx.wasm.numThreads = 1;

  if (!textPipePromise) {
    textPipePromise = pipeline("text-classification" as PipelineType, model, {
      quantized: true,
    });
  }
  return textPipePromise;
}

export async function classifyText(
  text: string,
  timeoutMs: number = 1500
): Promise<{ label: string; score: number }[]> {
  try {
    const pipePromise = getTextClassificationPipeline();
    const infer = async () => {
      const pipe = await pipePromise;
      return (await pipe(text, { topk: 2 })) as { label: string; score: number }[];
    };
    const res = await Promise.race([
      infer(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
    return res;
  } catch {
    // On timeout or any error, return empty to keep UI responsive
    return [];
  }
}

export async function preloadModels(onProgress?: (msg: string) => void) {
  try {
    onProgress?.("initializing pipeline");
    const pipe = await getTextClassificationPipeline();
    onProgress?.("warming up");
    // Small dummy inference to ensure model weights/ops are fetched and cached
    await pipe("ok", { topk: 1 });
    onProgress?.("ready");
  } catch (e) {
    onProgress?.("preload failed");
  }
}


