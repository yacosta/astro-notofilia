import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function send(metric) {
  try {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      navigationType: metric.navigationType,
      path: location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/web-vitals', body);
    } else {
      fetch('/api/web-vitals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // ignore
  }
}

onCLS(send);
onINP(send);
onLCP(send);
onFCP(send);
onTTFB(send);
