import express from 'express';
import cors from 'cors';
import { initDb, seedCommScenarios } from './services/db.service';
import environmentsRouter from './routes/environments';
import { preloadCatalog } from './services/sapCatalog.service';
import { COMM_SCENARIO_MAP } from './services/commScenarioMap';
import commScenarioMapRouter from './routes/commScenarioMap';
import sapApisRouter from './routes/sapApis';
import environmentApisRouter from './routes/environmentApis';
import proxyRouter from './routes/proxy';
import historyRouter from './routes/history';
import authRouter from './routes/auth';
import variantsRouter from './routes/variants';

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/environments', environmentsRouter);
app.use('/api/sap/apis', sapApisRouter);
app.use('/api/environment-apis', environmentApisRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/history', historyRouter);
app.use('/api/comm-scenario-map', commScenarioMapRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDb().then(() => {
  seedCommScenarios(COMM_SCENARIO_MAP);
  app.listen(PORT, () => {
    console.log(`NTT API Explorer Backend çalışıyor: http://localhost:${PORT}`);
    preloadCatalog();
  });
}).catch(err => {
  console.error('DB başlatılamadı:', err);
  process.exit(1);
});
