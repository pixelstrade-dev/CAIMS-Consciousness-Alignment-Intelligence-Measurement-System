import { apiSuccess } from '@/lib/middleware/api-response';

export async function GET() {
  return apiSuccess({
    status: 'ok',
    version: '2.0.0-alpha',
  });
}
