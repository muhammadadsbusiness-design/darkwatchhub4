import { getAllWorksFromPostgres, saveWorksToPostgres, getConnectionString, sanitizeError } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const connStr = getConnectionString();
      if (!connStr) {
        return res.status(200).json({
          source: 'none',
          connected: false,
          works: [],
          total: 0,
          message: 'لم يتم العثور على متغير البيئة POSTGRES_URL أو DATABASE_URL في Vercel',
          lastUpdated: new Date().toISOString()
        });
      }

      const works = await getAllWorksFromPostgres();
      const allList = Array.isArray(works) ? works : [];

      const urlParams = new URLSearchParams((req.url || '').split('?')[1] || '');
      const paramId = urlParams.get('id') || urlParams.get('slug') || req.query?.id || req.query?.slug || '';
      const requestEpisodes = urlParams.get('episodes') === 'true' || req.query?.episodes === 'true';
      const episodeNumStr = urlParams.get('episodeNum') || req.query?.episodeNum || '';
      const requestServers = urlParams.get('servers') === 'true' || req.query?.servers === 'true';

      if (paramId) {
        const normId = decodeURIComponent(paramId).trim().toLowerCase();
        const found = allList.find(w =>
          w && (
            (w.id && String(w.id).toLowerCase() === normId) ||
            (w.slug && String(w.slug).toLowerCase() === normId)
          )
        );

        if (!found) {
          return res.status(404).json({ success: false, error: 'العمل غير موجود' });
        }

        if (episodeNumStr && requestServers) {
          const epNum = parseInt(episodeNumStr, 10);
          const ep = (found.episodes || []).find(e => e && e.number === epNum);
          return res.status(200).json({
            success: true,
            workId: found.id,
            episodeNumber: epNum,
            servers: ep ? (ep.servers || []) : []
          });
        }

        if (requestEpisodes) {
          return res.status(200).json({
            success: true,
            workId: found.id,
            episodes: found.episodes || []
          });
        }

        return res.status(200).json({
          success: true,
          work: found
        });
      }

      return res.status(200).json({
        source: 'postgresql',
        connected: true,
        works: allList,
        lastUpdated: new Date().toISOString(),
        total: allList.length
      });
    } catch (err) {
      const safeError = sanitizeError(err);
      console.error('Error fetching works from PostgreSQL:', safeError);
      return res.status(500).json({ 
        success: false, 
        source: 'error',
        connected: false,
        works: [],
        total: 0,
        error: safeError 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const worksList = Array.isArray(data.works) ? data.works : (data.title ? [data] : []);
      const targetState = data.statusState || 'PUBLISHED';

      const connStr = getConnectionString();
      if (!connStr) {
        return res.status(400).json({
          success: false,
          error: 'قاعدة بيانات PostgreSQL غير متصلة. يرجى إضافة POSTGRES_URL أو DATABASE_URL في إعدادات Vercel.'
        });
      }

      const result = await saveWorksToPostgres(worksList, targetState);
      return res.status(200).json({
        success: true,
        storage: 'postgresql',
        savedCount: result.savedCount,
        errorCount: result.errorCount,
        errors: result.errors
      });
    } catch (err) {
      const safeError = sanitizeError(err);
      console.error('Error saving works to PostgreSQL:', safeError);
      return res.status(500).json({ success: false, error: safeError });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

