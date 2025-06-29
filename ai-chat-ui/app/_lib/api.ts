// API client for making requests to the backend
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });

      const status = response.status;
      let data: T | undefined;
      let error: string | undefined;

      try {
        const json = await response.json();
        if (response.ok) {
          data = json;
        } else {
          error = json.message || json.error || 'Request failed';
        }
      } catch {
        if (!response.ok) {
          error = 'Request failed';
        }
      }

      return { data, error, status };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body);
  }
}

export const api = new ApiClient();
