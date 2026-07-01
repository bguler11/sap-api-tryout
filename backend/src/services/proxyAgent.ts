// @ts-ignore
import { HttpsProxyAgent } from 'https-proxy-agent';

export function getProxyAgent() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  return proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
}
