import { getApiCredentials } from './apiCredentialsService';

/**
 * Service for retrieving configuration values with fallback to environment variables
 * This provides a migration path from environment variables to encrypted storage
 */

/**
 * Gets the OpenAI API key for an organization
 * Falls back to environment variable if not found in encrypted storage
 */
export async function getOpenAIApiKey(organizationId?: string): Promise<string | null> {
  // If organization ID is provided, try to get from encrypted storage first
  if (organizationId) {
    const credentials = await getApiCredentials(organizationId, 'openai');
    if (credentials && credentials.apiKey) {
      return credentials.apiKey;
    }
  }
  
  // Fall back to environment variable
  const envKey = process.env.OPENAI_API_KEY;
  if (!envKey || envKey === 'your_openai_api_key_here') {
    return null;
  }
  
  return envKey;
}

/**
 * Gets the Stripe secret key for an organization
 * Falls back to environment variable if not found in encrypted storage
 */
export async function getStripeSecretKey(organizationId?: string): Promise<string | null> {
  // If organization ID is provided, try to get from encrypted storage first
  if (organizationId) {
    const credentials = await getApiCredentials(organizationId, 'stripe');
    if (credentials && credentials.secretKey) {
      return credentials.secretKey;
    }
  }
  
  // Fall back to environment variable
  const envKey = process.env.STRIPE_SECRET_KEY;
  if (!envKey || envKey.startsWith('sk_test_development')) {
    return null;
  }
  
  return envKey;
}

/**
 * Gets Zendesk configuration for an organization
 */
export async function getZendeskConfig(organizationId: string): Promise<{
  subdomain: string;
  email: string;
  token: string;
  accessToken?: string;
} | null> {
  const credentials = await getApiCredentials(organizationId, 'zendesk');
  if (!credentials) {
    return null;
  }
  
  // Validate required fields
  if (!credentials.subdomain || !credentials.email || !credentials.token) {
    return null;
  }
  
  return {
    subdomain: credentials.subdomain,
    email: credentials.email,
    token: credentials.token,
    accessToken: credentials.accessToken,
  };
}

/**
 * Gets Intercom configuration for an organization
 */
export async function getIntercomConfig(organizationId: string): Promise<{
  accessToken: string;
  workspaceId: string;
} | null> {
  const credentials = await getApiCredentials(organizationId, 'intercom');
  if (!credentials) {
    return null;
  }
  
  // Validate required fields
  if (!credentials.accessToken || !credentials.workspaceId) {
    return null;
  }
  
  return {
    accessToken: credentials.accessToken,
    workspaceId: credentials.workspaceId,
  };
}

/**
 * Gets SMTP configuration for an organization
 * Falls back to environment variables if not found in encrypted storage
 */
export async function getSmtpConfig(organizationId?: string): Promise<{
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
} | null> {
  // If organization ID is provided, try to get from encrypted storage first
  if (organizationId) {
    const credentials = await getApiCredentials(organizationId, 'smtp');
    if (credentials && credentials.host && credentials.port && credentials.user && credentials.pass) {
      return {
        host: credentials.host,
        port: credentials.port,
        user: credentials.user,
        pass: credentials.pass,
        secure: credentials.secure || credentials.port === 465,
      };
    }
  }
  
  // Fall back to environment variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !port || !user || !pass) {
    return null;
  }
  
  return {
    host,
    port: parseInt(port, 10),
    user,
    pass,
    secure: parseInt(port, 10) === 465,
  };
}

/**
 * Gets the OpenAI model to use
 * Can be overridden per organization in the future
 */
export async function getOpenAIModel(organizationId?: string): Promise<string> {
  // In the future, this could be stored per organization
  if (organizationId) {
    const credentials = await getApiCredentials(organizationId, 'openai');
    if (credentials && credentials.model) {
      return credentials.model;
    }
  }
  
  // Fall back to environment variable or default
  return process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18';
}