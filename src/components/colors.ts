// Current color palette: gray
export const pieChartLightColor: string = "#e4e4e7"; // (color)-200
export const pieChartDarkColor: string = "#3f3f46"; // (color)-700
export const neutralColor: string = "#71717a"; // (color)-500

// Diagonal stripes for parties that support the cabinet without joining it
export function supportStripes(colour: string) {
  return `repeating-linear-gradient(-45deg, ${colour} 0 3px, color-mix(in srgb, ${colour} 45%, transparent) 3px 6px)`;
}
