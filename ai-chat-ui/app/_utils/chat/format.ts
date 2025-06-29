export const formatDuration = (start: string, end?: string) => {
  if (!end) return '進行中';
  const duration = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
};
