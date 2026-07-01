import { Router, Response } from 'express';
import fetch from 'node-fetch';
import { getEnvironmentApis, getEnvironmentById, getEnvironmentApiById } from '../services/db.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getProxyAgent } from '../services/proxyAgent';

const router = Router();

router.post('/check-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { environmentId } = req.body;
  if (!environmentId) return res.status(400).json({ error: 'environmentId zorunludur' });

  const env = getEnvironmentById(Number(environmentId), req.user!.id);
  if (!env) return res.status(404).json({ error: 'Environment bulunamadı' });

  const apis = getEnvironmentApis(Number(environmentId));
  if (apis.length === 0) return res.json({});

  const credentials = Buffer.from(`${env.username}:${env.password}`).toString('base64');
  const baseUrl = env.base_url.replace(/\/$/, '');

  const result: Record<number, { accessible: boolean; status: number }> = {};

  await Promise.all(
    apis.map(async (api) => {
      let testUrls: string[] = [];
      const serviceUrlClean = api.service_url.replace(/\/$/, '');

      try {
        const fullApi = getEnvironmentApiById(api.id);
        if (fullApi && fullApi.protocol === 'SOAP') {
          // SOAP servisleri HTTP GET pinglemesini desteklemez, doğrudan testi geçiyoruz
          result[api.id] = { accessible: true, status: 200 };
          return;
        } else if (fullApi && fullApi.spec_cache) {
          const spec = JSON.parse(fullApi.spec_cache);
          const paths = Object.keys(spec.paths || {});
          
          // Parametre içeren süslü parantezli yolları filtrele
          const cleanPaths = paths.filter(p => !p.includes('{') && !p.includes('}'));
          
          // Sadece üst seviye EntitySet yollarını bul (servis url'sinden sonra sadece 1 kırılım olanlar)
          const topLevelPaths = cleanPaths.filter(p => {
            let relativePath = p;
            if (relativePath.startsWith(serviceUrlClean)) {
              relativePath = relativePath.substring(serviceUrlClean.length);
            }
            const segments = relativePath.replace(/^\//, '').replace(/\/$/, '').split('/').filter(Boolean);
            return segments.length === 1;
          });

          // En kısa yoldan en uzuna sırala (genelde ana iş nesneleri kısadır örn: A_PurchaseOrder)
          topLevelPaths.sort((a, b) => a.length - b.length);

          if (topLevelPaths.length > 0) {
            const candidates = topLevelPaths.slice(0, 3);
            candidates.forEach(p => {
              let firstPath = p;
              if (!firstPath.startsWith('/sap/')) {
                firstPath = `${serviceUrlClean}/${firstPath.replace(/^\//, '')}`;
              }
              testUrls.push(`${baseUrl}${firstPath}?$top=1`);
            });
          }
        }
      } catch {}

      // Aday bulunamadıysa metadata fallback yap
      if (testUrls.length === 0) {
        testUrls.push(`${baseUrl}${serviceUrlClean}/$metadata`);
      }

      let finalAccessible = false;
      let finalStatus = 0;

      for (const testUrl of testUrls) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15000); // Bireysel deneme süresi
          console.log(`[TEST ACCESS] URL Test ediliyor: ${api.name} -> ${testUrl}`);
          const response = await fetch(testUrl, {
            agent: getProxyAgent(),
            method: 'GET',
            headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
            signal: controller.signal,
          });
          clearTimeout(timer);
          
          finalStatus = response.status;
          if (response.status >= 200 && response.status < 300) {
            finalAccessible = true;
            console.log(`[TEST ACCESS] BAŞARILI: ${api.name} -> HTTP ${response.status} URL: ${testUrl}`);
            break; // Bir tanesi başarılı olduysa dur!
          } else {
            console.log(`[TEST ACCESS] Deneme başarısız: ${api.name} -> HTTP ${response.status} URL: ${testUrl}`);
          }
        } catch (err: any) {
          console.error(`[TEST ACCESS] Hata oluştu: ${api.name} -> URL: ${testUrl} | Hata:`, err.message);
        }
      }

      result[api.id] = { accessible: finalAccessible, status: finalStatus };
    })
  );

  res.json(result);
});

export default router;
