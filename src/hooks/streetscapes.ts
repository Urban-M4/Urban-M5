import { useCallback, useEffect } from "react";
import { parseAsString, useQueryState, type UseQueryStateReturn } from "nuqs";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { palette } from "@/lib/label-colors";
import type { components, paths } from "@/lib/streetscapes-api";

export type Polygon = [number, number][];
export type MultiPolygon = Polygon[];

export type Image =
  paths["/images"]["post"]["responses"]["200"]["content"]["application/json"];
export type ImageMetadata =
  paths["/images/{image_id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type Segmentation = components["schemas"]["Segmentation"];
export type Instance = components["schemas"]["Instance"];
export type AggregateStats = components["schemas"]["AggregateStats"];

export function useStreetscapes() {
  const [streetscapesWebServiceUrl] = useQueryState(
    "s",
    parseAsString.withDefault("http://localhost:3000"),
  );
  const fetchClient = createFetchClient<paths>({
    baseUrl: streetscapesWebServiceUrl,
  });
  const $api = createClient(fetchClient);
  return $api;
}

export function useImages() {
  // TODO construct filter based on search params
  // TODO once the OpenAPI spec is ready, replace with actual API call
  const $api = useStreetscapes();
  return $api.useQuery("post", "/images", {
    placeholderData: [],
  });
}

export function useCurrentImageId(): UseQueryStateReturn<string, undefined> {
  const [imageId, setImageId] = useQueryState("i", parseAsString);
  return [imageId, setImageId];
}

export function useCurrentImageInfo() {
  const [imageId] = useCurrentImageId();

  const $api = useStreetscapes();
  return $api.useQuery("get", "/images/{image_id}", {
    params: {
      path: { image_id: imageId! },
    },
    enabled: imageId !== null,
  });
}

export function useImageNavigation() {
  const { data: images = [], isLoading } = useImages();
  const [currentImageId, setCurrentImageId] = useCurrentImageId();

  useEffect(() => {
    if (!images) return;

    const exists = images.some((img) => img.id === currentImageId);
    if ((!currentImageId || !exists) && images.length > 0) {
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
    total: images.length,
    filtered,
    currentIndex,
    currentImageId,
    isLoading,
    goToPrevious,
    goToNext,
  };
}

const placeholderStats: AggregateStats = {
  tags: [],
  labels: [],
  model_run_names: [],
  image_sources: [],
  date_range: ["1970-01-01", "2100-12-31"],
};

export function useAggregateStats() {
  const $api = useStreetscapes();
  return $api.useQuery("get", "/stats", {
    placeholderData: placeholderStats,
  });
}

export function useAllTags() {
  const { data = placeholderStats } = useAggregateStats();
  return data.tags;
}

export function useAllLabels() {
  const { data = placeholderStats } = useAggregateStats();
  const labels = data.labels;
  return Object.fromEntries(
    labels.map((l, i) => [l, palette[i % palette.length]]),
  );
}

export function useAllSources() {
  const { data = placeholderStats } = useAggregateStats();
  return data.image_sources;
}

export function useAllModels() {
  return ["DinoSAM", "maskformer", "bfms"];
}
