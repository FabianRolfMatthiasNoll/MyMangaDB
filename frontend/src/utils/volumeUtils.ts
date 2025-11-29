export const parseVolumeString = (inputString: string): number[] => {
  const newOwnedVolumes = new Set<number>();
  const parts = inputString
    .split(/[;,]+/)
    .map((s) => s.trim())
    .filter((s) => s);

  parts.forEach((part) => {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          newOwnedVolumes.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        newOwnedVolumes.add(num);
      }
    }
  });

  return Array.from(newOwnedVolumes).sort((a, b) => a - b);
};
