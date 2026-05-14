export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  
  // Format as '10:45 AM' or '2:30 PM'
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
