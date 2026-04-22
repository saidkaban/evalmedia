import type {
  GenerationResult,
  ImageGenerationInput,
  MediaType,
} from "@/lib/types";

export type ModelInfo = {
  id: string;
  name: string;
  description?: string;
  mediaType: MediaType;
  providerId: string;
  tags?: string[];
};

/**
 * A Provider runs generative-media endpoints for one backend (fal, Replicate,
 * a self-hosted endpoint, etc.). UI code must only depend on this interface.
 *
 * v0 only implements image generation. video/audio methods are intentionally
 * left off until we build those comparison views.
 */
export interface Provider {
  readonly id: string;
  readonly name: string;

  listModels(mediaType: MediaType): Promise<ModelInfo[]>;

  generateImage(modelId: string, input: ImageGenerationInput): Promise<GenerationResult>;
}
