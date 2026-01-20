import { useCurrentImageId } from "@/hooks/streetscapes";

export function ImagePanel() {
  const [imageId] = useCurrentImageId();

  if (imageId === null) {
    return <div className="flex-1">No image selected</div>;
  }

  return <div className="flex-1">Image Panel of {imageId}</div>;
}
