import { testPostgresConnection, sanitizeError } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await testPostgresConnection();
    const httpStatus = result.connected ? 200 : (result.state === 'MISSING_ENV_VAR' ? 503 : 500);
    return res.status(httpStatus).json(result);
  } catch (err) {
    const safeError = sanitizeError(err);
    console.error('Error in /api/health/database handler:', safeError);
    return res.status(500).json({
      connected: false,
      state: 'CONNECTION_FAILED',
      status: 'error',
      error: safeError,
      message: `خطأ في فحص صحة قاعدة البيانات: ${safeError}`,
      testedAt: new Date().toISOString()
    });
  }
}
