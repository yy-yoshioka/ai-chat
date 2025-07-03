import { prisma } from '../lib/prisma';
import { encrypt, decrypt, encryptObject, decryptObject } from '../lib/encryption';
import { ApiCredentials } from '@prisma/client';
import { logSecurityEvent } from './securityService';

export interface CredentialData {
  [key: string]: any;
}

export interface CreateCredentialInput {
  organizationId: string;
  service: string;
  name: string;
  credentials: CredentialData;
  expiresAt?: Date;
}

export interface UpdateCredentialInput {
  name?: string;
  credentials?: CredentialData;
  expiresAt?: Date;
  isActive?: boolean;
}

/**
 * Creates new API credentials with encryption
 */
export async function createApiCredentials(
  input: CreateCredentialInput,
  userId: string
): Promise<ApiCredentials> {
  try {
    // Encrypt the credentials
    const encryptedData = encryptObject(input.credentials);
    
    // Create the credentials record
    const apiCredentials = await prisma.apiCredentials.create({
      data: {
        organizationId: input.organizationId,
        service: input.service,
        name: input.name,
        encryptedData,
        expiresAt: input.expiresAt,
      },
    });
    
    // Log security event
    await logSecurityEvent({
      userId,
      organizationId: input.organizationId,
      action: 'api_credentials_created',
      resource: 'api_credentials',
      resourceId: apiCredentials.id,
      success: true,
      ipAddress: null,
      userAgent: null,
      details: {
        service: input.service,
        name: input.name,
      },
      risk_level: 'medium',
    });
    
    return apiCredentials;
  } catch (error) {
    // Log failed attempt
    await logSecurityEvent({
      userId,
      organizationId: input.organizationId,
      action: 'api_credentials_create_failed',
      resource: 'api_credentials',
      success: false,
      ipAddress: null,
      userAgent: null,
      details: {
        service: input.service,
        name: input.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      risk_level: 'high',
    });
    
    throw error;
  }
}

/**
 * Retrieves and decrypts API credentials
 */
export async function getApiCredentials(
  organizationId: string,
  service: string,
  name?: string
): Promise<CredentialData | null> {
  try {
    const where: any = {
      organizationId,
      service,
      isActive: true,
    };
    
    if (name) {
      where.name = name;
    }
    
    const apiCredentials = await prisma.apiCredentials.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    if (!apiCredentials) {
      return null;
    }
    
    // Check if credentials have expired
    if (apiCredentials.expiresAt && apiCredentials.expiresAt < new Date()) {
      await prisma.apiCredentials.update({
        where: { id: apiCredentials.id },
        data: { isActive: false },
      });
      return null;
    }
    
    // Update last used timestamp
    await prisma.apiCredentials.update({
      where: { id: apiCredentials.id },
      data: { lastUsed: new Date() },
    });
    
    // Decrypt and return the credentials
    return decryptObject<CredentialData>(apiCredentials.encryptedData);
  } catch (error) {
    console.error('Failed to retrieve API credentials:', error);
    return null;
  }
}

/**
 * Updates existing API credentials
 */
export async function updateApiCredentials(
  id: string,
  organizationId: string,
  input: UpdateCredentialInput,
  userId: string
): Promise<ApiCredentials> {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.credentials !== undefined) {
      updateData.encryptedData = encryptObject(input.credentials);
      updateData.lastRotated = new Date();
    }
    
    if (input.expiresAt !== undefined) {
      updateData.expiresAt = input.expiresAt;
    }
    
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }
    
    const apiCredentials = await prisma.apiCredentials.update({
      where: {
        id,
        organizationId, // Ensure org isolation
      },
      data: updateData,
    });
    
    // Log security event
    await logSecurityEvent({
      userId,
      organizationId,
      action: 'api_credentials_updated',
      resource: 'api_credentials',
      resourceId: id,
      success: true,
      ipAddress: null,
      userAgent: null,
      details: {
        updated_fields: Object.keys(input),
        rotated: input.credentials !== undefined,
      },
      risk_level: 'medium',
    });
    
    return apiCredentials;
  } catch (error) {
    // Log failed attempt
    await logSecurityEvent({
      userId,
      organizationId,
      action: 'api_credentials_update_failed',
      resource: 'api_credentials',
      resourceId: id,
      success: false,
      ipAddress: null,
      userAgent: null,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      risk_level: 'high',
    });
    
    throw error;
  }
}

/**
 * Deletes API credentials
 */
export async function deleteApiCredentials(
  id: string,
  organizationId: string,
  userId: string
): Promise<void> {
  try {
    await prisma.apiCredentials.delete({
      where: {
        id,
        organizationId, // Ensure org isolation
      },
    });
    
    // Log security event
    await logSecurityEvent({
      userId,
      organizationId,
      action: 'api_credentials_deleted',
      resource: 'api_credentials',
      resourceId: id,
      success: true,
      ipAddress: null,
      userAgent: null,
      risk_level: 'high',
    });
  } catch (error) {
    // Log failed attempt
    await logSecurityEvent({
      userId,
      organizationId,
      action: 'api_credentials_delete_failed',
      resource: 'api_credentials',
      resourceId: id,
      success: false,
      ipAddress: null,
      userAgent: null,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      risk_level: 'high',
    });
    
    throw error;
  }
}

/**
 * Lists all API credentials for an organization (without decrypting)
 */
export async function listApiCredentials(
  organizationId: string,
  service?: string
): Promise<Omit<ApiCredentials, 'encryptedData'>[]> {
  const where: any = {
    organizationId,
  };
  
  if (service) {
    where.service = service;
  }
  
  const credentials = await prisma.apiCredentials.findMany({
    where,
    select: {
      id: true,
      organizationId: true,
      service: true,
      name: true,
      lastUsed: true,
      lastRotated: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { service: 'asc' },
      { name: 'asc' },
    ],
  });
  
  return credentials;
}

/**
 * Checks if credentials are expired and deactivates them
 */
export async function checkExpiredCredentials(
  organizationId: string
): Promise<number> {
  const result = await prisma.apiCredentials.updateMany({
    where: {
      organizationId,
      isActive: true,
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      isActive: false,
    },
  });
  
  return result.count;
}

/**
 * Migrates plain text credentials to encrypted format
 * This is a one-time migration function
 */
export async function migrateExistingCredentials(
  organizationId: string,
  plainCredentials: { service: string; name: string; credentials: CredentialData }[],
  userId: string
): Promise<void> {
  for (const cred of plainCredentials) {
    try {
      await createApiCredentials(
        {
          organizationId,
          service: cred.service,
          name: cred.name,
          credentials: cred.credentials,
        },
        userId
      );
    } catch (error) {
      console.error(`Failed to migrate credentials for ${cred.service}:${cred.name}:`, error);
    }
  }
}