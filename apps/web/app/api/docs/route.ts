import { NextRequest, NextResponse } from 'next/server';

/**
 * Serves Swagger UI as a self-contained HTML page.
 * No external dependencies — uses the official Swagger UI CDN.
 *
 * Access at: GET /api/docs
 */
export async function GET(req: NextRequest) {
  const specUrl = new URL('/api/openapi.json', req.url).toString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CAIMS API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #0d1117; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { max-width: 1200px; margin: 0 auto; padding: 20px; }
    /* Dark mode overrides */
    .swagger-ui, .swagger-ui .info .title, .swagger-ui .opblock-tag,
    .swagger-ui .opblock .opblock-summary-description,
    .swagger-ui table thead tr th, .swagger-ui .parameter__name,
    .swagger-ui .parameter__type, .swagger-ui .response-col_status,
    .swagger-ui .response-col_links { color: #c9d1d9 !important; }
    .swagger-ui .info .description p, .swagger-ui .markdown p,
    .swagger-ui .opblock-description-wrapper p { color: #8b949e !important; }
    .swagger-ui .scheme-container, .swagger-ui .opblock .opblock-section-header {
      background: #161b22 !important; border-color: #30363d !important;
    }
    .swagger-ui section.models { border-color: #30363d !important; }
    .swagger-ui .model-box { background: #161b22 !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '${specUrl}',
      dom_id: '#swagger-ui',
      deepLinking: true,
      layout: 'BaseLayout',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
