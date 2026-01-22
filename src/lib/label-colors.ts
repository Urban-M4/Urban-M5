export type RGB = `rgb(${number}, ${number}, ${number})`;
// https://colorbrewer2.org/?type=diverging&scheme=RdYlBu&n=11
export const palette: RGB[] = [
  "rgb(165, 0, 38)",
  "rgb(215, 48, 39)",
  "rgb(244, 109, 67)",
  "rgb(253, 174, 97)",
  "rgb(254, 224, 144)",
  "rgb(255, 255, 191)",
  "rgb(224, 243, 248)",
  "rgb(171, 217, 233)",
  "rgb(116, 173, 209)",
  "rgb(69, 117, 180)",
  "rgb(49, 54, 149)",
] as const;
