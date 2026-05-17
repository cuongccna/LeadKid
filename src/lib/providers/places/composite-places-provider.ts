import { PlacesProvider, PlaceResult } from './provider';

export class CompositePlacesProvider implements PlacesProvider {
  constructor(private providers: PlacesProvider[]) {}

  async search({ query, maxResults }: { query: string; maxResults: number }): Promise<PlaceResult[]> {
    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        const results = await provider.search({ query, maxResults });
        if (results.length > 0) {
          return results;
        }
        errors.push(`${provider.constructor.name}: returned empty results`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.constructor.name}: ${message}`);
      }
    }

    throw new Error(`All providers failed for query "${query}": ${errors.join('; ')}`);
  }
}
