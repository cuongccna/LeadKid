import { PlacesProvider, PlaceResult } from './provider';

export class GooglePlacesProvider implements PlacesProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search({ query, maxResults }: { query: string; maxResults: number }): Promise<PlaceResult[]> {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'vi',
        pageSize: maxResults,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    const places = data.places || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return places.map((p: any) => ({
      placeId: p.id,
      displayName: p.displayName?.text || '',
      formattedAddress: p.formattedAddress,
      phone: p.nationalPhoneNumber,
      websiteUri: p.websiteUri,
      googleMapsUri: p.googleMapsUri,
      rating: p.rating,
      userRatingCount: p.userRatingCount,
    }));
  }
}
