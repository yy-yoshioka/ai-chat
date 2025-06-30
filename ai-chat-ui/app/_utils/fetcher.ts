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
 * Generic fetch wrapper
 * @param input - The URL or path to fetch
 * @param options - Fetch options
 * @returns Response data
 */
export async function fetchJson<T = unknown>(input: string, options?: FetchOptions): Promise<T> {
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
    return data as T;
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
export function fetchGet<T = unknown>(
  url: string,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson<T>(url, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export function fetchPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for PUT requests
 */
export function fetchPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for DELETE requests
 */
export function fetchDelete<T = unknown>(
  url: string,
  options?: Omit<FetchOptions, 'method'>
): Promise<T> {
  return fetchJson<T>(url, { ...options, method: 'DELETE' });
}
