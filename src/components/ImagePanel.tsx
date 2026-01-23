import { useCurrentImageInfo } from "@/hooks/streetscapes";
import { Rating } from "@/components/rating";
import { Tags } from "@/components/Tags";
import { Notes } from "@/components/Notes";
import { Segmentations } from "@/components/Segmentations";
import { AnnotatedImage } from "./AnnotatedImage";

export function ImagePanel() {
  const { data: imageInfo, isLoading, error } = useCurrentImageInfo();

  if (imageInfo === undefined) {
    return <div className="flex-1">No image selected</div>;
  }

  if (isLoading) {
    return <div className="flex-1">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1">Error: {String(error)}</div>;
  }

  return (
    <div className="flex-1 p-2 gap-4 flex flex-col">
      <h1 className="text-xl">Image: {imageInfo.id}</h1>
      <AnnotatedImage
        id={imageInfo.id}
        url={imageInfo.url}
        segmentations={imageInfo.segmentation ?? []}
      />
      <Tags onChange={() => {}} tags={imageInfo.tags ?? []} />
      <Rating value={imageInfo.rating} onChange={() => {}} />
      <Notes value={imageInfo.notes} onChange={() => {}} />
      <Segmentations
        imageId={imageInfo.id}
        segmentations={imageInfo.segmentation ?? []}
      />
    </div>
  );
}
