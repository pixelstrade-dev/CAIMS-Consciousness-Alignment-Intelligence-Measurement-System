import { apiSuccess } from '@/lib/middleware/api-response';

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     operationId: getHealth
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               data:
 *                 status: ok
 *                 version: 1.0.0
 *               meta:
 *                 timestamp: '2026-04-06T12:00:00.000Z'
 */
export async function GET() {
  return apiSuccess({
    status: 'ok',
    version: '1.0.0',
  });
}
