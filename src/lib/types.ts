export type MediaType = "image" | "video" | "audio";

export type ImageGenerationInput = {
  prompt: string;
  seed?: number;
  imageSize?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
};

export type GeneratedImage = {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
};

export type GenerationResult = {
  images: GeneratedImage[];
  seed?: number;
  latencyMs: number;
  rawRequestId?: string;
};

export type GenerationError = {
  message: string;
  code?: string;
};

export type OutputItem = {
  id: string;
  modelId: string;
  providerId: string;
  status: "pending" | "success" | "error";
  url?: string;
  width?: number;
  height?: number;
  seed?: number;
  latencyMs?: number;
  error?: string;
};

export type SessionRow = {
  id: string;
  mediaType: MediaType;
  prompt: string;
  seed: number | null;
  createdAt: string;
  outputs: OutputItem[];
  votes: VoteRow[];
};

export type VoteRow = {
  id: string;
  sessionId: string;
  winnerOutputId: string;
  createdAt: string;
};
