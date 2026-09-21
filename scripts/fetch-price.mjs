// Stores the current Allegro price of the line holder in src/data/price.json.
// Once: `npm run price:auth` (log in to Allegro). Then `npm run price` before each build.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const path = name => fileURLToPath(new URL(`../${name}`, import.meta.url));
const AUTH = 'https://allegro.pl/auth/oauth';
const API = 'https://api.allegro.pl';

export async function fetchPrice(ids, token, fetchFn = fetch) {
  const prices = await Promise.all(ids.map(async id => {
    const response = await fetchFn(`${API}/sale/product-offers/${id}/parts?include=price`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.allegro.public.v1+json' },
    });
    if (!response.ok) throw new Error(`Offer ${id}: HTTP ${response.status}`);
    const { amount, currency } = (await response.json()).sellingMode.price;
    return `${amount} ${currency}`;
  }));
  // The site shows one price for every color, so refuse to publish a guess when offers disagree.
  if (new Set(prices).size !== 1) throw new Error(`Offers disagree on price: ${prices.join(', ')}`);
  const [amount, currency] = prices[0].split(' ');
  return { amount, currency };
}

async function form(url, body) {
  const basic = Buffer.from(`${process.env.ALLEGRO_CLIENT_ID}:${process.env.ALLEGRO_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST', body: new URLSearchParams(body),
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
}

// Allegro replaces the refresh token on every use, so the new one must be saved before anything else.
const saveToken = data => writeFileSync(path('.allegro-token.json'), JSON.stringify({ refresh_token: data.refresh_token }), { mode: 0o600 });

async function authorize() {
  const start = await form(`${AUTH}/device`, { client_id: process.env.ALLEGRO_CLIENT_ID });
  if (!start.ok) throw new Error(`Device authorization failed (HTTP ${start.status}). Check the client id and secret.`);
  console.log(`Open ${start.data.verification_uri_complete} and confirm with the Allegro account that owns the offers.`);
  for (;;) {
    await new Promise(resolve => setTimeout(resolve, start.data.interval * 1000));
    const poll = await form(`${AUTH}/token`, { grant_type: 'urn:ietf:params:oauth:grant-type:device_code', device_code: start.data.device_code });
    if (poll.ok) return saveToken(poll.data);
    if (!['authorization_pending', 'slow_down'].includes(poll.data.error)) throw new Error(`Authorization failed: ${poll.data.error}`);
  }
}

async function accessToken() {
  if (!existsSync(path('.allegro-token.json'))) throw new Error('Not logged in to Allegro. Run: npm run price:auth');
  const { refresh_token } = JSON.parse(readFileSync(path('.allegro-token.json'), 'utf8'));
  const refreshed = await form(`${AUTH}/token`, { grant_type: 'refresh_token', refresh_token });
  if (!refreshed.ok) throw new Error(`Token refresh failed (HTTP ${refreshed.status}). Run: npm run price:auth`);
  saveToken(refreshed.data);
  return refreshed.data.access_token;
}

async function main() {
  if (existsSync(path('.env'))) process.loadEnvFile(path('.env'));
  if (!process.env.ALLEGRO_CLIENT_ID || !process.env.ALLEGRO_CLIENT_SECRET) {
    console.log('ALLEGRO_CLIENT_ID / ALLEGRO_CLIENT_SECRET are not set (put them in .env). Keeping the current price.');
    return;
  }
  if (process.argv[2] === 'auth') return authorize();
  const [product] = JSON.parse(readFileSync(path('src/data/products.json'), 'utf8'));
  const ids = [...new Set(product.marketplaces.map(shop => new URL(shop.url).searchParams.get('offerId')).filter(Boolean))];
  const price = await fetchPrice(ids, await accessToken());
  writeFileSync(path('src/data/price.json'), JSON.stringify({ ...price, updatedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log(`Price updated: ${price.amount} ${price.currency}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exit(1); });
}
