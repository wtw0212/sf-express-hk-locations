// @ts-check
import { setTimeout as delay } from 'node:timers/promises';
import { sha256 } from './source-hashes.js';

/**
 * HTTP status codes that warrant a retry.
 * 408 = Request Timeout, 429 = Too Many Requests, 5xx = server errors.
 */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 20_000;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 10_000;

/**
 * Fetch JSON with retry, timeout, and exponential backoff with jitter.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {{ maxAttempts?: number, timeoutMs?: number }} [config]
 * @returns {Promise<{ ok: boolean, status: number|null, attempts: number, error: string|null, data: any, rawText?: string|null, raw_sha256?: string|null }>}
 */
export async function fetchWithRetry(url, options = {}, config = {}) {
  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError = null;
  let lastStatus = null;
  let lastRawText = null;
  let lastRawSha256 = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs)
      });

      lastStatus = response.status;

      if (response.ok) {
        let data;
        if (config.responseType === 'arrayBuffer') {
          data = await response.arrayBuffer();
        } else if (config.responseType === 'text') {
          data = await response.text();
        } else {
          const rawText = await response.text();
          const raw_sha256 = sha256(rawText);
          try {
            data = JSON.parse(rawText);
          } catch (err) {
            return {
              ok: false,
              status: response.status,
              attempts: attempt,
              error: `Invalid JSON response: ${err.message}`,
              data: null,
              rawText,
              raw_sha256
            };
          }
          return {
            ok: true,
            status: response.status,
            attempts: attempt,
            error: null,
            data,
            rawText,
            raw_sha256
          };
        }
        return { ok: true, status: response.status, attempts: attempt, error: null, data };
      }

      // Preserve the exact final HTTP response body even for API errors.
      if (config.responseType !== 'arrayBuffer') {
        lastRawText = await response.text();
        lastRawSha256 = sha256(lastRawText);
      }

      // Permanent failure — do not retry
      if (!RETRYABLE_STATUSES.has(response.status)) {
        return {
          ok: false,
          status: response.status,
          attempts: attempt,
          error: `HTTP ${response.status} ${response.statusText}`,
          data: null,
          rawText: lastRawText,
          raw_sha256: lastRawSha256
        };
      }

      lastError = `HTTP ${response.status} ${response.statusText}`;
    } catch (err) {
      lastError = err.message || String(err);

      const isRetryable =
        err.name === 'TimeoutError' ||
        err.name === 'AbortError' ||
        err.code === 'ECONNRESET' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        err.cause?.code === 'ECONNRESET';

      if (!isRetryable) {
        return { ok: false, status: null, attempts: attempt, error: lastError, data: null };
      }
    }

    // Exponential backoff with jitter before next attempt
    if (attempt < maxAttempts) {
      const backoff = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
      const jitter = Math.random() * backoff * 0.5;
      await delay(Math.floor(backoff + jitter));
    }
  }

  return {
    ok: false,
    status: lastStatus,
    attempts: maxAttempts,
    error: lastError,
    data: null,
    rawText: lastRawText,
    raw_sha256: lastRawSha256
  };
}

/**
 * Run async tasks with bounded concurrency.
 *
 * @template T, R
 * @param {T[]} items
 * @param {(item: T) => Promise<R>} fn
 * @param {number} [concurrency=5]
 * @returns {Promise<R[]>}
 */
export async function withConcurrency(items, fn, concurrency = 5) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = fn(item).then(result => {
      executing.delete(p);
      return result;
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}
