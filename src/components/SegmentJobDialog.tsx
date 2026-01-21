import { useAllModels } from "@/hooks/streetscapes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { FormEvent, ReactElement, ReactNode } from "react";
import { useState } from "react";

interface SegmentJobDialogProps {
  title: string;
  description: ReactNode;
  trigger: ReactElement;
  submitLabel?: string;
  onSubmit?: (formData: FormData) => void;
}

export function SegmentJobDialog({
  title,
  description,
  trigger,
  submitLabel = "Start segmentation",
  onSubmit,
}: SegmentJobDialogProps) {
  const allModels = useAllModels();
  const [open, setOpen] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit?.(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Model</Label>
              <RadioGroup name="model" className="w-fit" required>
                {allModels.map((model) => (
                  <div key={model} className="flex items-center gap-3">
                    <RadioGroupItem value={model} id={model} />
                    <Label htmlFor={model}>{model}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parameters">Model Parameters</Label>
              <Textarea
                id="parameters"
                name="parameters"
                placeholder="Enter model parameters here..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
