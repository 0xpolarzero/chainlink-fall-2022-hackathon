import { useEffect, useState } from 'react';

export default function DateFromTimestamp({ timestamp, refreshDate }) {
  const [dateNow, setDateNow] = useState(new Date());

  // Refresh the date shown in each promise panel every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // If it was less that 30 days ago, return x ago
  if (timestamp > dateNow / 1000 - 60 * 60 * 24 * 30) {
    return <>{formatDistanceToNow(timestamp, dateNow)}</>;
  } else {
    // If it was more than 30 days ago, return just the date
    return <>{new Date(timestamp).toLocaleDateString()}</>;
  }
}

const formatDistanceToNow = (timestamp, dateNow) => {
  const date = new Date(timestamp * 1000);
  const difference = dateNow.getTime() - date.getTime();
  const days = Math.floor(difference / (1000 * 3600 * 24));
  const hours = Math.floor((difference % (1000 * 3600 * 24)) / (1000 * 3600));
  const minutes = Math.floor((difference % (1000 * 3600)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hours ago`;
  if (minutes > 0) return `${minutes} minutes ago`;
  if (seconds > 0) return `${seconds} seconds ago`;
};
