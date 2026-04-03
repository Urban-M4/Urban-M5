import {
  parseAsArrayOf,
  parseAsString,
  useQueryStates,
  parseAsInteger,
} from "nuqs";

export function useFilters() {
  return useQueryStates(
    {
      sources: parseAsArrayOf(parseAsString).withDefault([]),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
      max_captured_at: parseAsString,
      min_captured_at: parseAsString,
      labels: parseAsArrayOf(parseAsString).withDefault([]),
      models: parseAsArrayOf(parseAsString).withDefault([]),
      image_ratings: parseAsArrayOf(parseAsInteger).withDefault([]),
      segmentation_ratings: parseAsArrayOf(parseAsInteger).withDefault([]),
    },
    {
      urlKeys: {
        sources: "src",
        tags: "t",
        max_captured_at: "maxc",
        min_captured_at: "minc",
        labels: "l",
        models: "m",
        image_ratings: "ir",
        segmentation_ratings: "sr",
      },
    },
  );
}
