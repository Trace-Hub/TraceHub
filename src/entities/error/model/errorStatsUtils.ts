const getYAxisTicks = (max: number): number[] => {
  if (max === 0) return [0, 5, 10, 15, 20];
  const step = Math.ceil(max / 4);
  return [0, step, step * 2, step * 3, step * 4];
};

export { getYAxisTicks };
