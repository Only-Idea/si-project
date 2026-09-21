import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPrice } from './fetch-price.mjs';

const offers = prices => async url => {
  const id = url.match(/product-offers\/(\d+)/)[1];
  return { ok: true, json: async () => ({ sellingMode: { price: { amount: prices[id], currency: 'PLN' } } }) };
};

test('returns the shared price of all offers', async () => {
  assert.deepEqual(await fetchPrice(['1', '2'], 't', offers({ 1: '49.00', 2: '49.00' })), { amount: '49.00', currency: 'PLN' });
});

test('refuses to publish when offers disagree', async () => {
  await assert.rejects(fetchPrice(['1', '2'], 't', offers({ 1: '49.00', 2: '55.00' })), /disagree/);
});

test('reports a failing offer', async () => {
  await assert.rejects(fetchPrice(['1'], 't', async () => ({ ok: false, status: 403 })), /HTTP 403/);
});
