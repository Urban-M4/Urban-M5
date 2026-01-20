import { parseAsString, useQueryState } from "nuqs";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

// TODO replace with pnpm dlx openapi-typescript http://localhost:3000/openapi.json -o ./src/components/lib/streetscapes-api.ts
interface StreetscapeImage {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
}

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
  const mock_data: StreetscapeImage[] = [
    {
      id: "1",
      url: "http://example.com/image1.jpg",
      longitude: 4.9009338,
      latitude: 52.37294,
    },
  ];
  return {
    data: mock_data,
    isLoading: false,
    error: null,
  };
}

export function useCurrentImageId() {
  return useQueryState("i", parseAsString);
}
