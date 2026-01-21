import { useCallback, useEffect } from "react";
import { parseAsString, useQueryState } from "nuqs";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

// TODO replace with pnpm dlx openapi-typescript http://localhost:3000/openapi.json -o ./src/components/lib/streetscapes-api.ts
// mimics https://github.com/BSchilperoort/streetscapes-fastapi/blob/main/main.py
type Polygon = [number, number][];
type MultiPolygon = Polygon[];
export type Instance = {
  label: string;
  polygon: MultiPolygon;
};

export interface Segmentation {
  model: string;
  name: string;
  params: string;
  instances: Instance[];
  notes: string;
}

interface StreetscapeImage {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
  tags: string[];
  rating: number;
  notes: string;
  segmentations: Segmentation[];
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
    segmentations: [
      {
        model: "DinoSAM",
        name: "my run 1",
        params:
          '{"sky": null, "building": {"window": null, "door": null}, "tree": null, "car": null, "truck": null, "road": null}',
        notes: "Clear sky, good lighting.",
        instances: [
          {
            label: "bike",
            polygon: [
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
    segmentations: [],
  },
  {
    id: "centraal",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Amsterdam_Centraal_2016-09-13.jpg/500px-Amsterdam_Centraal_2016-09-13.jpg",
    longitude: 4.898609,
    latitude: 52.377032,
    tags: ["amsterdam", "city center", "station"],
    rating: 1,
    notes: "",
    segmentations: [],
  },
] as const;

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

export function useImages() {
  // TODO construct filter based on search params
  // TODO once the OpenAPI spec is ready, replace with actual API call
  // const $api = useStreetscapes();
  // return $api.useQuery("get", "/images", {
  //     params: {
  //         // TODO filter parameters
  //     }
  // })
  return {
    data: mock_data,
    total: mock_data.length,
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
    data: mock_data.find((img) => img.id === imageId),
    isLoading: false,
    error: null,
  };
}

export function useImageNavigation() {
  const { data: images, total, isLoading } = useImages();
  const [currentImageId, setCurrentImageId] = useCurrentImageId();

  useEffect(() => {
    if (!images.length) return;

    const exists = images.some((img) => img.id === currentImageId);
    if (!currentImageId || !exists) {
      setCurrentImageId(images[0].id);
    }
  }, [currentImageId, images, setCurrentImageId]);

  const currentIndex = images.findIndex((img) => img.id === currentImageId);
  const filtered = images.length;

  const goToNext = useCallback(() => {
    if (!images.length) return;

    const index = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (index + 1) % images.length;
    setCurrentImageId(images[nextIndex].id);
  }, [currentIndex, images, setCurrentImageId]);

  const goToPrevious = useCallback(() => {
    if (!images.length) return;

    const index = currentIndex === -1 ? images.length - 1 : currentIndex;
    const prevIndex = (index - 1 + images.length) % images.length;
    setCurrentImageId(images[prevIndex].id);
  }, [currentIndex, images, setCurrentImageId]);

  return {
    total,
    filtered,
    currentIndex,
    currentImageId,
    isLoading,
    goToPrevious,
    goToNext,
  };
}

export function useAllTags() {
  // TODO once the OpenAPI spec is ready, replace with actual API call
  const data = Array.from(new Set(mock_data.flatMap((img) => img.tags)));
  return {
    data,
    isLoading: false,
    error: null,
  };
}

export function useAllLabels() {
  // TODO once the OpenAPI spec is ready, replace with actual API call

  const data: Record<string, string> = {
    bike: "#ff0000",
    car: "#00ff00",
    person: "#0000ff",
  };
  return data;
}

export function useAllSources() {
  // TODO once the OpenAPI spec is ready, replace with actual API call
  return ["mapillary"];
}

export function useAllModels() {
  return ["DinoSAM", "maskformer", "bfms"];
}
