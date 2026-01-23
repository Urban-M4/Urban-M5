import { SegmentJobDialog } from "@/components/SegmentJobDialog";
import { useImages } from "@/hooks/streetscapes";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { toast } from "sonner";

export function SegmentImages() {
  const { data = [] } = useImages();
  const total = data.length;

  function onSubmit(formData: FormData) {
    // TODO call streetscapes API to start segmentation job
    console.log("Segment filtered images", Array.from(formData.entries()));

    const toastId = toast.loading(`Processing 0/${total} images...`);
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      if (processed < total) {
        toast.loading(`Processing ${processed}/${total} images...`, {
          id: toastId,
        });
      } else {
        toast.success(`Successfully segmented ${total} images`, {
          id: toastId,
        });
        clearInterval(interval);
      }
    }, 1000);
  }

  return (
    <SegmentJobDialog
      title="Apply Segmentation to filtered images"
      description={`This will run segmentation on all ${total} filtered images using the selected model. This may take a while.`}
      trigger={
        <Button size="sm" disabled>
          <WandSparkles className="h-4 w-4" />
          <span className="ml-2">Segment filtered</span>
        </Button>
      }
      onSubmit={onSubmit}
    />
  );
}
