export const getUsagePercentage = (used: number, limit: number) =>
  limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
