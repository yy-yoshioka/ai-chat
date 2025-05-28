/**
 * API helper functions for making authenticated requests using axios
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';

// Base API URL from environment or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Always include credentials (replaces credentials: 'include')
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response type for consistent API responses
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Handles API responses in a consistent way
 */
const handleResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  return {
    data: response.data,
    error: null,
    status: response.status,
  };
};

/**
 * Type for API error responses
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Handles API errors in a consistent way
 */
const handleError = (error: unknown): ApiResponse<never> => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response;
    const errorData = errorResponse?.data as ApiErrorResponse | undefined;
    const errorMessage =
      errorData?.error || errorData?.message || error.message || 'Unknown error occurred';

    return {
      data: null,
      error: errorMessage,
      status: errorResponse?.status || 0,
    };
  }

  return {
    data: null,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
    status: 0,
  };
};

/**
 * Validates API response data against a Zod schema
 */
const validateWithSchema = <T>(data: unknown, schema: z.ZodType<T>): ApiResponse<T> => {
  try {
    const validatedData = schema.parse(data);
    return {
      data: validatedData,
      error: null,
      status: 200,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: `Validation error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        status: 422, // Unprocessable Entity
      };
    }
    return handleError(error);
  }
};

/**
 * API client with typed methods for common HTTP requests
 */
export const api = {
  /**
   * GET request
   */
  get: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get<T>(endpoint, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * GET request with Zod schema validation
   */
  getWithSchema: async <T>(
    endpoint: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get(endpoint, config);
      return validateWithSchema(response.data, schema);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * POST request
   */
  post: async <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.post<T>(endpoint, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * POST request with Zod schema validation
   */
  postWithSchema: async <T>(
    endpoint: string,
    data: Record<string, unknown>,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.post(endpoint, data, config);
      return validateWithSchema(response.data, schema);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * PUT request
   */
  put: async <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put<T>(endpoint, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * PUT request with Zod schema validation
   */
  putWithSchema: async <T>(
    endpoint: string,
    data: Record<string, unknown>,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put(endpoint, data, config);
      return validateWithSchema(response.data, schema);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = unknown>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete<T>(endpoint, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * DELETE request with Zod schema validation
   */
  deleteWithSchema: async <T>(
    endpoint: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete(endpoint, config);
      return validateWithSchema(response.data, schema);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * PATCH request
   */
  patch: async <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.patch<T>(endpoint, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },

  /**
   * PATCH request with Zod schema validation
   */
  patchWithSchema: async <T>(
    endpoint: string,
    data: Record<string, unknown>,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.patch(endpoint, data, config);
      return validateWithSchema(response.data, schema);
    } catch (error) {
      return handleError(error) as ApiResponse<T>;
    }
  },
};
