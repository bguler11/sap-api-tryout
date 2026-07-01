import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
export const globalProxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
