/**
 * UN Sustainable Development Goals reference (official titles + colours).
 * Used to render SDG badges and the SDG coverage/progress display.
 */
export interface SDG {
  number: number;
  title: string;
  color: string;
}

export const SDGS: Record<number, SDG> = {
  1: { number: 1, title: "No Poverty", color: "#e5243b" },
  2: { number: 2, title: "Zero Hunger", color: "#dda63a" },
  3: { number: 3, title: "Good Health & Well-being", color: "#4c9f38" },
  4: { number: 4, title: "Quality Education", color: "#c5192d" },
  5: { number: 5, title: "Gender Equality", color: "#ff3a21" },
  6: { number: 6, title: "Clean Water & Sanitation", color: "#26bde2" },
  7: { number: 7, title: "Affordable & Clean Energy", color: "#fcc30b" },
  8: { number: 8, title: "Decent Work & Economic Growth", color: "#a21942" },
  9: { number: 9, title: "Industry, Innovation & Infrastructure", color: "#fd6925" },
  10: { number: 10, title: "Reduced Inequalities", color: "#dd1367" },
  11: { number: 11, title: "Sustainable Cities & Communities", color: "#fd9d24" },
  12: { number: 12, title: "Responsible Consumption & Production", color: "#bf8b2e" },
  13: { number: 13, title: "Climate Action", color: "#3f7e44" },
  14: { number: 14, title: "Life Below Water", color: "#0a97d9" },
  15: { number: 15, title: "Life on Land", color: "#56c02b" },
  16: { number: 16, title: "Peace, Justice & Strong Institutions", color: "#00689d" },
  17: { number: 17, title: "Partnerships for the Goals", color: "#19486a" },
};

export function getSdg(n: number): SDG {
  return SDGS[n] ?? { number: n, title: `SDG ${n}`, color: "#5c6b69" };
}
