import "server-only";
import { fal } from "@fal-ai/client";
import type {
  GenerationResult,
  ImageGenerationInput,
  MediaType,
} from "@/lib/types";
import type { ModelInfo, Provider } from "@/providers/types";
import { FAL_IMAGE_MODELS } from "@/providers/fal/models";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error(
      "FAL_KEY is not set. Copy .env.example to .env and add your fal API key.",
    );
  }
  fal.config({ credentials: key });
  configured = true;
}

type FalImageResult = {
  data: {
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      content_type?: string;
    }>;
    seed?: number;
  };
  requestId?: string;
};

export class FalProvider implements Provider {
  readonly id = "fal";
  readonly name = "fal.ai";

  async listModels(mediaType: MediaType): Promise<ModelInfo[]> {
    if (mediaType !== "image") return [];
    return FAL_IMAGE_MODELS;
  }

  async generateImage(
    modelId: string,
    input: ImageGenerationInput,
  ): Promise<GenerationResult> {
    ensureConfigured();

    const payload: Record<string, unknown> = { prompt: input.prompt };
    if (input.seed !== undefined) payload.seed = input.seed;
    if (input.imageSize) payload.image_size = input.imageSize;
    if (input.numInferenceSteps) payload.num_inference_steps = input.numInferenceSteps;
    if (input.guidanceScale) payload.guidance_scale = input.guidanceScale;

    const startedAt = Date.now();
    const result = (await fal.subscribe(modelId, {
      input: payload,
      logs: false,
    })) as unknown as FalImageResult;
    const latencyMs = Date.now() - startedAt;

    const images = (result.data.images ?? []).map((img) => ({
      url: img.url,
      width: img.width,
      height: img.height,
      contentType: img.content_type,
    }));

    if (images.length === 0) {
      throw new Error(`Model ${modelId} returned no images.`);
    }

    return {
      images,
      seed: result.data.seed,
      latencyMs,
      rawRequestId: result.requestId,
    };
  }
}

let singleton: FalProvider | null = null;
export function getFalProvider(): FalProvider {
  if (!singleton) singleton = new FalProvider();
  return singleton;
}
