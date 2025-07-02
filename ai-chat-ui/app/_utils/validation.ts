import { NextResponse } from 'next/server';
import type { ZodError, ZodSchema } from '@/app/_schemas';

/**
 * Validation error response format
 */
interface ValidationErrorResponse {
  error: string;
  details: {
    field: string;
    message: string;
    code: string;
  }[];
  timestamp: string;
}

/**
 * Validation result type
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationErrorResponse };

/**
 * Format Zod errors into a user-friendly format
 */
const formatZodError = (error: ZodError): ValidationErrorResponse => {
  return {
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validate request data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or error
 */
export const validateRequest = <T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: formatZodError(error),
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      error: {
        error: 'Unexpected validation error',
        details: [],
        timestamp: new Date().toISOString(),
      },
    };
  }
};

/**
 * Validate response data against a schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data or throws error
 */
export const validateResponse = <T>(schema: ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Response validation failed:', formatZodError(error));
      throw new Error('Response validation failed');
    }
    throw error;
  }
};

/**
 * Create a validation error response
 * @param error - Validation error details
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with error details
 */
export const createValidationErrorResponse = (
  error: ValidationErrorResponse,
  status = 400
): NextResponse => {
  return NextResponse.json(error, { status });
};

/**
 * Validate and handle request in BFF routes
 * @param schema - Zod schema to validate against
 * @param handler - Handler function to execute with validated data
 * @returns NextResponse
 */
export const withValidation = <T>(
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<NextResponse>
) => {
  return async (data: unknown): Promise<NextResponse> => {
    const validation = validateRequest(schema, data);

    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    try {
      return await handler(validation.data);
    } catch (error) {
      console.error('Handler error:', error);

      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
};

/**
 * Validate query parameters from URL
 * @param schema - Zod schema to validate against
 * @param searchParams - URLSearchParams or query object
 * @returns Validation result
 */
export const validateQueryParams = <T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams | Record<string, string | string[]>
): ValidationResult<T> => {
  let params: Record<string, unknown> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      // Handle multiple values for the same key
      const existing = params[key];
      if (existing) {
        params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        params[key] = value;
      }
    });
  } else {
    params = searchParams;
  }

  return validateRequest(schema, params);
};

/**
 * Safe parse with default value
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param defaultValue - Default value if validation fails
 * @returns Validated data or default value
 */
export const safeParseWithDefault = <T>(
  schema: ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T => {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
};

/**
 * Merge and validate partial updates
 * @param schema - Zod schema for the complete object
 * @param existing - Existing data
 * @param updates - Partial updates to apply
 * @returns Validation result for merged data
 */
export const validatePartialUpdate = <T>(
  schema: ZodSchema<T>,
  existing: T,
  updates: Partial<T>
): ValidationResult<T> => {
  const merged = { ...existing, ...updates };
  return validateRequest(schema, merged);
};

/**
 * Create a typed validation middleware for specific schemas
 * @param schema - Zod schema to use for validation
 * @returns Validation function
 */
export const createValidator = <T>(schema: ZodSchema<T>) => {
  return {
    validate: (data: unknown): ValidationResult<T> => validateRequest(schema, data),
    validateOrThrow: (data: unknown): T => schema.parse(data),
    safeParse: (data: unknown) => schema.safeParse(data),
    validateQuery: (params: URLSearchParams | Record<string, string | string[]>) =>
      validateQueryParams(schema, params),
  };
};
