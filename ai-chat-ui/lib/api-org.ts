/**
 * Organization-aware API helper functions for making authenticated requests with orgId context
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API URL - use Next.js API routes (proxy) for browser compatibility
const API_BASE_URL = '/api';

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
 * Creates an organization-aware API client
 */
export function createOrgApi(orgId: string) {
  // Create an axios instance with organization-specific base path
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': orgId, // Pass orgId in header for API routes that need it
    },
  });

  return {
    /**
     * GET request with orgId context
     */
    get: async <T = unknown>(
      endpoint: string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
      try {
        // Prepend orgId to organization-specific endpoints
        const orgEndpoint = endpoint.startsWith('/organizations/')
          ? endpoint.replace('/organizations/', `/organizations/${orgId}/`)
          : endpoint;

        const response = await axiosInstance.get<T>(orgEndpoint, config);
        return handleResponse<T>(response);
      } catch (error) {
        return handleError(error) as ApiResponse<T>;
      }
    },

    /**
     * POST request with orgId context
     */
    post: async <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
      try {
        const orgEndpoint = endpoint.startsWith('/organizations/')
          ? endpoint.replace('/organizations/', `/organizations/${orgId}/`)
          : endpoint;

        // Include orgId in the request data if it's an organization-specific endpoint
        const requestData = endpoint.startsWith('/organizations/') ? { ...data, orgId } : data;

        const response = await axiosInstance.post<T>(orgEndpoint, requestData, config);
        return handleResponse<T>(response);
      } catch (error) {
        return handleError(error) as ApiResponse<T>;
      }
    },

    /**
     * PUT request with orgId context
     */
    put: async <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
      try {
        const orgEndpoint = endpoint.startsWith('/organizations/')
          ? endpoint.replace('/organizations/', `/organizations/${orgId}/`)
          : endpoint;

        const requestData = endpoint.startsWith('/organizations/') ? { ...data, orgId } : data;

        const response = await axiosInstance.put<T>(orgEndpoint, requestData, config);
        return handleResponse<T>(response);
      } catch (error) {
        return handleError(error) as ApiResponse<T>;
      }
    },

    /**
     * DELETE request with orgId context
     */
    delete: async <T = unknown>(
      endpoint: string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
      try {
        const orgEndpoint = endpoint.startsWith('/organizations/')
          ? endpoint.replace('/organizations/', `/organizations/${orgId}/`)
          : endpoint;

        const response = await axiosInstance.delete<T>(orgEndpoint, config);
        return handleResponse<T>(response);
      } catch (error) {
        return handleError(error) as ApiResponse<T>;
      }
    },

    /**
     * PATCH request with orgId context
     */
    patch: async <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> => {
      try {
        const orgEndpoint = endpoint.startsWith('/organizations/')
          ? endpoint.replace('/organizations/', `/organizations/${orgId}/`)
          : endpoint;

        const requestData = endpoint.startsWith('/organizations/') ? { ...data, orgId } : data;

        const response = await axiosInstance.patch<T>(orgEndpoint, requestData, config);
        return handleResponse<T>(response);
      } catch (error) {
        return handleError(error) as ApiResponse<T>;
      }
    },
  };
}

/**
 * Hook for using organization-aware API client
 */
export function useOrgApi(orgId: string | null) {
  if (!orgId) {
    throw new Error('orgId is required for organization API calls');
  }

  return createOrgApi(orgId);
}

/**
 * Common organization-specific API endpoints
 */
export const orgEndpoints = {
  // Billing endpoints
  billing: {
    plans: '/organizations/billing/plans',
    usage: '/organizations/billing/usage',
    alerts: '/organizations/billing/overage-alerts',
  },

  // User management
  users: '/organizations/users',

  // FAQ management
  faqs: '/organizations/faqs',

  // Chat data
  chats: '/organizations/chats',

  // Reports
  reports: '/organizations/reports',

  // Logs
  logs: '/organizations/logs',

  // Settings
  settings: '/organizations/settings',
};

/**
 * Helper for React Query keys with orgId
 */
export const createOrgQueryKey = (orgId: string, key: string | string[]) => {
  const keyArray = Array.isArray(key) ? key : [key];
  return ['org', orgId, ...keyArray];
};
