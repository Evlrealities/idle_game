const SUFFIXES = [
  { value: 1e12, suffix: "T" },
  { value: 1e9, suffix: "B" },
  { value: 1e6, suffix: "M" },
  { value: 1e3, suffix: "K" },
];

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const absValue = Math.abs(value);
  for (const { value: threshold, suffix } of SUFFIXES) {
    if (absValue >= threshold) {
      return `${(value / threshold).toFixed(2)}${suffix}`;
    }
  }

  return value.toFixed(2);
}
