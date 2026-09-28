export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'healthy',
    service: 'UniStore Edge API',
    catalog: 'active',
    database: 'Supabase Cloud PostgreSQL Active',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
