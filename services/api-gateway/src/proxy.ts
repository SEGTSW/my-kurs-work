import { Request, Response } from 'express';

function headersFrom(req: Request) {
  const headers: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || key.toLowerCase() === 'host' || key.toLowerCase() === 'content-length') {
      continue;
    }

    headers[key] = Array.isArray(value) ? value.join(',') : value;
  }

  return headers;
}

export function proxy(target: string) {
  return async (req: Request, res: Response) => {
    const url = new URL(req.originalUrl, target);
    const method = req.method.toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...headersFrom(req),
          ...(hasBody ? { 'content-type': 'application/json' } : {}),
        },
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
      });

      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('content-type', contentType);
      }

      return res.status(response.status).send(await response.text());
    } catch (err) {
      console.error(`Proxy error: ${target}${req.originalUrl}`, err);
      return res.status(502).json({ message: 'Service unavailable' });
    }
  };
}
