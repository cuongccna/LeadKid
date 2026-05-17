export interface PlaceResult {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
  phone?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  latitude?: number;
  longitude?: number;
  businessStatus?: string;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  reviewsLink?: string;
  reviewsPerRating?: Record<string, number>;
  provider?: string;
}

export interface PlacesProvider {
  search(params: {
    query: string;
    maxResults: number;
  }): Promise<PlaceResult[]>;
}
