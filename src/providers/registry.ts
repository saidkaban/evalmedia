import "server-only";
import { getFalProvider } from "@/providers/fal/FalProvider";
import type { Provider } from "@/providers/types";

/**
 * Registry of all configured providers. Adding a new provider means
 * implementing the Provider interface and registering it here.
 */
export function getProvider(id: string): Provider {
  switch (id) {
    case "fal":
      return getFalProvider();
    default:
      throw new Error(`Unknown provider: ${id}`);
  }
}

export function getAllProviders(): Provider[] {
  return [getFalProvider()];
}
