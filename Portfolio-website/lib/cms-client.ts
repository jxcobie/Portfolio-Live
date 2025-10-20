import 'server-only';

import { CMS_API_KEY, buildCmsUrl } from '@/lib/env';

export class MissingCmsApiKeyError extends Error {
  constructor() {
    super('CMS_API_KEY is not configured.');
    this.name = 'MissingCmsApiKeyError';
  }
}

const ensureCmsApiKey = () => {
  if (!CMS_API_KEY) {
    throw new MissingCmsApiKeyError();
  }
};

type FetchOptions = RequestInit & {
  headers?: HeadersInit;
};

export const fetchFromCms = async (path: string, init: FetchOptions = {}) => {
  ensureCmsApiKey();

  const headers = new Headers(init.headers);
  if (!headers.has('x-cms-api-key')) {
    headers.set('x-cms-api-key', CMS_API_KEY);
  }

  return fetch(buildCmsUrl(path), {
    ...init,
    headers,
  });
};

export const fetchJsonFromCms = async (path: string, init: FetchOptions = {}) => {
  const response = await fetchFromCms(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  return response;
};
