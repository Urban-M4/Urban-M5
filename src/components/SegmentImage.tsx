import { SegmentJobDialog } from "@/components/SegmentJobDialog";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { toast } from "sonner";

interface SegmentImageProps {
  imageId: string;
}

export function SegmentImage({ imageId }: SegmentImageProps) {
  function onSubmit(formData: FormData) {
    formData.set("imageId", imageId);
    // TODO call streetscapes API to start segmentation job for one image
    console.log("Segment single image", Array.from(formData.entries()));

    toast.promise(
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`Segmented image ${imageId}`);
        }, 1000);
      }),
      {
        loading: `Processing image ${imageId}...`,
        success: (message: string) => `${message} successfully segmented`,
        error: "Failed to segment image",
      },
    );
  }

  return (
    <SegmentJobDialog
      title="Apply Segmentation to image"
      description={`This will run segmentation on image ${imageId} using the selected model.`}
      trigger={
        <Button size="default" variant="secondary" title="Segment this image">
          <WandSparkles className="h-4 w-4" />
        </Button>
      }
      onSubmit={onSubmit}
    />
  );
}
