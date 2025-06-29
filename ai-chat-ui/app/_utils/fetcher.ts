import { z } from 'zod';

export class FetchError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Type-safe fetch wrapper with Zod schema validation
 * @param input - The URL or path to fetch
 * @param schema - Zod schema to validate the response
 * @param options - Fetch options
 * @returns Parsed and validated response data
 */
export async function fetchJson<T>(
  input: string,
  schema: z.ZodType<T>,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options || {};

  // Add query parameters if provided
  let url = input;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url = `${input}?${searchParams.toString()}`;
  }

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorData: unknown;

      try {
        errorData = await response.json();
        if (typeof errorData === 'object' && errorData !== null && 'error' in errorData) {
          errorMessage = (errorData as { error: string }).error;
        } else if (typeof errorData === 'object' && errorData !== null && 'message' in errorData) {
          errorMessage = (errorData as { message: string }).message;
        }
      } catch {
        // Ignore JSON parse errors for error response
      }

      throw new FetchError(response.status, errorMessage, errorData);
    }

    // Parse response
    const data = await response.json();

    // Validate with Zod schema
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.error('Response validation failed:', parsed.error);
      throw new FetchError(500, 'Invalid response format', { zodError: parsed.error.flatten() });
    }

    return parsed.data;
  } catch (error) {
    // Re-throw FetchError as-is
    if (error instanceof FetchError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof Error) {
      throw new FetchError(0, error.message);
    }

    throw new FetchError(0, 'Unknown error occurred');
  }
}

/**
 * Convenience method for GET requests
 */
export function fetchGet<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson(url, schema, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export function fetchPost<T>(
  url: string,
  schema: z.ZodType<T>,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson(url, schema, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for PUT requests
 */
export function fetchPut<T>(
  url: string,
  schema: z.ZodType<T>,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson(url, schema, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for DELETE requests
 */
export function fetchDelete<T>(
  url: string,
  schema: z.ZodType<T>,
  options?: Omit<FetchOptions, 'method'>
): Promise<T> {
  return fetchJson(url, schema, { ...options, method: 'DELETE' });
}
