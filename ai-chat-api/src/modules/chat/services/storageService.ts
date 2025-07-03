import AWS from 'aws-sdk';
import { logger } from '@shared/logger';

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true, // for MinIO compatibility
});

export class SecureStorageService {
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'ai-chat-knowledge-base';
  }

  // Generate organization-specific prefix
  private getOrgPrefix(organizationId: string): string {
    return `organizations/${organizationId}/`;
  }

  // Upload file with organization isolation
  async uploadFile(
    organizationId: string,
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string
  ): Promise<string> {
    const fullKey = `${this.getOrgPrefix(organizationId)}${key}`;

    try {
      await s3
        .putObject({
          Bucket: this.bucket,
          Key: fullKey,
          Body: body,
          ContentType: contentType,
          // Set server-side encryption
          ServerSideEncryption: 'AES256',
          // Tag with organization ID for additional security
          Tagging: `organizationId=${organizationId}`,
        })
        .promise();

      logger.info('File uploaded successfully', {
        organizationId,
        key: fullKey,
      });

      return fullKey;
    } catch (error) {
      logger.error('Failed to upload file', {
        organizationId,
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error('Failed to upload file');
    }
  }

  // Download file with organization isolation
  async downloadFile(organizationId: string, key: string): Promise<Buffer> {
    const fullKey = key.startsWith(this.getOrgPrefix(organizationId))
      ? key
      : `${this.getOrgPrefix(organizationId)}${key}`;

    try {
      const result = await s3
        .getObject({
          Bucket: this.bucket,
          Key: fullKey,
        })
        .promise();

      // Verify organization tag
      const tags = await s3
        .getObjectTagging({
          Bucket: this.bucket,
          Key: fullKey,
        })
        .promise();

      const orgTag = tags.TagSet?.find((tag) => tag.Key === 'organizationId');
      if (orgTag?.Value !== organizationId) {
        throw new Error('Access denied: Organization mismatch');
      }

      return result.Body as Buffer;
    } catch (error) {
      logger.error('Failed to download file', {
        organizationId,
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error('Failed to download file');
    }
  }

  // List files for organization
  async listFiles(
    organizationId: string,
    prefix?: string
  ): Promise<AWS.S3.ObjectList> {
    const fullPrefix = `${this.getOrgPrefix(organizationId)}${prefix || ''}`;

    try {
      const result = await s3
        .listObjectsV2({
          Bucket: this.bucket,
          Prefix: fullPrefix,
          MaxKeys: 1000,
        })
        .promise();

      return result.Contents || [];
    } catch (error) {
      logger.error('Failed to list files', {
        organizationId,
        prefix,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error('Failed to list files');
    }
  }

  // Delete file with organization isolation
  async deleteFile(organizationId: string, key: string): Promise<void> {
    const fullKey = key.startsWith(this.getOrgPrefix(organizationId))
      ? key
      : `${this.getOrgPrefix(organizationId)}${key}`;

    try {
      // Verify organization tag before deletion
      const tags = await s3
        .getObjectTagging({
          Bucket: this.bucket,
          Key: fullKey,
        })
        .promise();

      const orgTag = tags.TagSet?.find((tag) => tag.Key === 'organizationId');
      if (orgTag?.Value !== organizationId) {
        throw new Error('Access denied: Organization mismatch');
      }

      await s3
        .deleteObject({
          Bucket: this.bucket,
          Key: fullKey,
        })
        .promise();

      logger.info('File deleted successfully', {
        organizationId,
        key: fullKey,
      });
    } catch (error) {
      logger.error('Failed to delete file', {
        organizationId,
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error('Failed to delete file');
    }
  }

  // Generate pre-signed URL for secure temporary access
  async getPresignedUrl(
    organizationId: string,
    key: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    const fullKey = key.startsWith(this.getOrgPrefix(organizationId))
      ? key
      : `${this.getOrgPrefix(organizationId)}${key}`;

    try {
      // Verify organization tag
      const tags = await s3
        .getObjectTagging({
          Bucket: this.bucket,
          Key: fullKey,
        })
        .promise();

      const orgTag = tags.TagSet?.find((tag) => tag.Key === 'organizationId');
      if (orgTag?.Value !== organizationId) {
        throw new Error('Access denied: Organization mismatch');
      }

      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: fullKey,
        Expires: expiresIn,
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate presigned URL', {
        organizationId,
        key,
        error: error instanceof Error ? error.message : error,
      });
      throw new Error('Failed to generate presigned URL');
    }
  }

  // Create organization bucket policy
  async setupOrganizationPolicy(organizationId: string): Promise<void> {
    // In a real implementation, this would create IAM policies
    // or bucket policies specific to the organization
    logger.info('Setting up organization storage policy', { organizationId });
  }
}

export const storageService = new SecureStorageService();
