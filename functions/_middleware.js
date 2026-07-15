export async function onRequest(context) {
  const response = await context.next();

  if (response.status === 404) {
    const url = new URL(context.request.url);
    console.log(JSON.stringify({
      event: "404",
      path: url.pathname + url.search,
      referrer: context.request.headers.get("referer") || "",
      userAgent: context.request.headers.get("user-agent") || "",
      cfRay: context.request.headers.get("cf-ray") || "",
      timestamp: new Date().toISOString(),
    }));
  }

  return response;
}
