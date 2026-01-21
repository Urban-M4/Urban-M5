import { parseAsString, useQueryState } from "nuqs";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

type Polygon = [number, number][];
type MultiPolygon = Polygon[];
type Segment = {
  id: string;
  label: string;
  points: MultiPolygon;
  confidence: number;
  model: string;
};

// TODO replace with pnpm dlx openapi-typescript http://localhost:3000/openapi.json -o ./src/components/lib/streetscapes-api.ts
interface StreetscapeImage {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
  tags: string[];
  rating: number;
  notes: string;
  segments: Segment[];
}
const mock_data: StreetscapeImage[] = [
  {
    id: "183375246977980",
    url: "https://github.com/Urban-M4/Urban-M5/blob/gradio/data/183375246977980.jpg?raw=true",
    longitude: 4.9009338,
    latitude: 52.37294,
    tags: ["amsterdam", "city center"],
    rating: 5,
    notes: "Nice view of the canal.",
    //     category="bike", confidence=0.5,
    // x_min=181, x_max=355,
    // y_min=560, y_max=673,
    segments: [
      {
        id: "seg1",
        label: "bike",
        confidence: 0.95,
        model: "model-v1",
        points: [
          [
            [181, 560],
            [355, 560],
            [355, 673],
            [181, 673],
            [181, 560],
          ],
        ],
      },
    ],
  },
  {
    id: "dam",
    url: "https://github.com/Urban-M4/Urban-M5/blob/gradio/data/dam.jpg?raw=true",
    longitude: 4.893212,
    latitude: 52.372936,
    tags: ["amsterdam", "city center"],
    rating: 4,
    notes: "Crowded place.",
    segments: [],
  },
] as const;

interface ImagesFilter {
  source: string;
  tags: string[];
  max_captured_at: Date;
  min_captured_at: Date;
}

export function useStreetscapes() {
  const [streetscapesWebServiceUrl] = useQueryState(
    "s",
    parseAsString.withDefault("http://localhost:3000"),
  );
  const fetchClient = createFetchClient({
    baseUrl: streetscapesWebServiceUrl,
  });
  const $api = createClient(fetchClient);
  return $api;
}

export function useGetImages(filter: ImagesFilter | undefined = undefined) {
  // TODO once the OpenAPI spec is ready, replace with actual API call
  // const $api = useStreetscapes();
  // return $api.useQuery("get", "/images", {
  //     params: {
  //         // TODO filter parameters
  //     }
  // })

  return {
    data: mock_data,
    isLoading: false,
    error: null,
  };
}

export function useCurrentImageId() {
  return useQueryState("i", parseAsString);
}

export function useCurrentImageInfo() {
  const [imageId] = useCurrentImageId();
  // TODO use client

  return {
    data: mock_data.find((img) => img.id === imageId) || null,
    isLoading: false,
    error: null,
  };
}
