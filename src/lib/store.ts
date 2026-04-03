import { create } from "zustand";

type HoveredSegmentationInstanceState = {
  segmentationId: string | null;
  instanceIndex: number | null;
  setHover: (segmentationId: string, instanceIndex: number) => void;
  clearHover: () => void;
};

export const useHoverSegmentationInstance =
  create<HoveredSegmentationInstanceState>((set) => ({
    segmentationId: null,
    instanceIndex: null,
    setHover: (segmentationId, instanceIndex) =>
      set({ segmentationId, instanceIndex }),
    clearHover: () => set({ segmentationId: null, instanceIndex: null }),
  }));

type AnnotationVisibilityState = {
  hiddenSegmentations: Set<string>;
  hiddenLabels: Set<string>;
  toggleSegmentation: (segmentationId: string) => void;
  toggleLabel: (label: string) => void;
  showAllLabels: () => void;
  hideAllLabels: (labels: string[]) => void;
  invertLabels: (labels: string[]) => void;
  showAllSegmentations: () => void;
  hideAllSegmentations: (segmentationIds: string[]) => void;
  getVisibilityState: () => {
    hiddenSegmentations: string[];
    hiddenLabels: string[];
  };
};

export const useAnnotationVisibility = create<AnnotationVisibilityState>(
  (set, get) => ({
    hiddenSegmentations: new Set(),
    hiddenLabels: new Set(),
    toggleSegmentation: (segmentationId: string) =>
      set((state) => {
        const newHidden = new Set(state.hiddenSegmentations);
        if (newHidden.has(segmentationId)) {
          newHidden.delete(segmentationId);
        } else {
          newHidden.add(segmentationId);
        }
        return { hiddenSegmentations: newHidden };
      }),
    toggleLabel: (label: string) =>
      set((state) => {
        const newHidden = new Set(state.hiddenLabels);
        if (newHidden.has(label)) {
          newHidden.delete(label);
        } else {
          newHidden.add(label);
        }
        return { hiddenLabels: newHidden };
      }),
    showAllLabels: () =>
      set({
        hiddenLabels: new Set(),
      }),
    hideAllLabels: (labels: string[]) =>
      set({
        hiddenLabels: new Set(labels),
      }),
    invertLabels: (labels: string[]) =>
      set((state) => {
        const newHidden = new Set<string>();
        for (const label of labels) {
          if (!state.hiddenLabels.has(label)) {
            newHidden.add(label);
          }
        }
        return { hiddenLabels: newHidden };
      }),
    showAllSegmentations: () =>
      set({
        hiddenSegmentations: new Set(),
      }),
    hideAllSegmentations: (segmentationIds: string[]) =>
      set({
        hiddenSegmentations: new Set(segmentationIds),
      }),
    getVisibilityState: () => {
      const state = get();
      return {
        hiddenSegmentations: Array.from(state.hiddenSegmentations),
        hiddenLabels: Array.from(state.hiddenLabels),
      };
    },
  }),
);
