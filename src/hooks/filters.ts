import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";

export function useFilters() {
  return useQueryStates(
    {
      sources: parseAsArrayOf(parseAsString).withDefault([]),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
      max_captured_at: parseAsString,
      min_captured_at: parseAsString,
      labels: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      urlKeys: {
        sources: "src",
        tags: "t",
        max_captured_at: "maxc",
        min_captured_at: "minc",
        labels: "l",
      },
    },
  );
}
