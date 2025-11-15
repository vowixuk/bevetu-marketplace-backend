/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

import {
  GetUploadPresignedUrlDto,
  MimeType,
} from './dto/get-upload-presigned-url.dto';
import { GetDownloadPresignedUrlDto } from './dto/get-donwload-presigned-url.dto';

// S3 package
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from './storage.service.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private _instance: S3Client;

  constructor() {
    if (
      !process.env.STORAGE_ACCESS_KEY_ID ||
      !process.env.STORAGE_SECRET_ACCESS_KEY ||
      !process.env.STORAGE_REGION ||
      !process.env.STORAGE_ENDPOINT
    ) {
      throw new ServiceUnavailableException(
        'Missing necessary storage configuration',
      );
    }

    const config: S3ClientConfig = {
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this._instance = new S3Client(config);
  }

  get instance(): S3Client {
    if (!this._instance) {
      throw new Error('S3Client not initialized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._instance;
  }

  public async getUploadPresignedUrl(
    getPresignedUrlDto: GetUploadPresignedUrlDto,
  ): Promise<string> {
    const content = this.getContentTypeFromFileName(
      getPresignedUrlDto.fileName,
    );

    if (!content) {
      throw new BadRequestException(
        `Cannot determine content type for file: ${getPresignedUrlDto.fileName}`,
      );
    }

    const [fileExtension, contentType] = content;

    if (!getPresignedUrlDto.allowedContentTypes.includes(contentType)) {
      throw new BadRequestException('Unsupported file type');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await getSignedUrl(
        this.instance,
        new PutObjectCommand({
          Bucket: getPresignedUrlDto.bucket,
          Key: join(
            getPresignedUrlDto.storagePath || '',
            `${uuidv4()}.${fileExtension}`,
          ),
          ContentType: contentType as string,
          ACL: getPresignedUrlDto.acl,
        }),
        {
          expiresIn: getPresignedUrlDto.expires,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getDownloadPresignedUrl(
    getDownloadPresignedUrlDto: GetDownloadPresignedUrlDto,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const url = await getSignedUrl(
        this.instance,
        new GetObjectCommand({
          Bucket: getDownloadPresignedUrlDto.bucket,
          Key: getDownloadPresignedUrlDto.key,
        }),
        {
          expiresIn: getDownloadPresignedUrlDto.expires,
        },
      );

      return this.forcePathStyle(url);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private forcePathStyle(url: string): string {
    try {
      const original = new URL(url);

      const storageDomain = process.env.STORAGE_ENDPOINT;

      if (!storageDomain) {
        throw new ServiceUnavailableException(
          'Missing storage domain  configuration',
        );
      }
      // Check for virtual-host style
      const isVirtualHostStyle =
        original.hostname.endsWith(storageDomain) &&
        original.hostname !== storageDomain;

      if (!isVirtualHostStyle) {
        return url; // Already path-style or not a MinIO URL
      }

      // Extract bucket name from subdomain only if it's virtual-host style
      const bucket = original.hostname.replace(`.${storageDomain}`, '');

      // Reconstruct path-style URL
      const newUrl = new URL(url);
      newUrl.hostname = storageDomain;
      newUrl.pathname = `/${bucket}${original.pathname}`;

      return newUrl.toString();
    } catch (err) {
      console.error('Failed to convert URL to path-style:', err);
      return url;
    }
  }
  async checkObjectAvailability(
    bucketName: string,
    fileName: string,
  ): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.instance.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        }),
      );

      return true;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error && error.name === 'NotFound') {
        throw new NotFoundException('Object not found');
      }
      throw new InternalServerErrorException(error);
    }
  }

  public async deleteObject(bucketName: string, fileName: string) {
    await this.checkObjectAvailability(bucketName, fileName);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await this.instance.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        }),
      );
      return 'Deleted';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private getContentTypeFromFileName(
    fileName: string,
  ): [extension: string, mimeType: MimeType] | null {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) {
      return null;
    }

    let mimeType: MimeType;

    switch (ext) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      case 'bmp':
        mimeType = 'image/bmp';
        break;
      case 'tiff':
        mimeType = 'image/tiff';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'doc':
        mimeType = 'application/msword';
        break;
      case 'docx':
        mimeType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xlsx':
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'pptx':
        mimeType =
          'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'csv':
        mimeType = 'text/csv';
        break;
      case 'json':
        mimeType = 'application/json';
        break;
      case 'zip':
        mimeType = 'application/zip';
        break;
      case 'gzip':
        mimeType = 'application/gzip';
        break;
      default:
        mimeType = 'application/octet-stream';
        break;
    }

    return [ext, mimeType];
  }

  /**
   * Calculates total storage usage for a given prefix across multiple buckets
   * @param path e.g. '12345/''
   * @param buckets list of bucket names
   */
  async getUsageByRootPrefix(
    path: string,
    bucket: string,
  ): Promise<{ totalSize: number; fileCount: number }> {
    let totalSize = 0;
    let fileCount = 0;

    let continuationToken: string | undefined = undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: path.endsWith('/') ? path : path + '/',
        ContinuationToken: continuationToken,
      });

      const response = await this.instance.send(command);

      const contents = response.Contents || [];
      for (const item of contents) {
        totalSize += item.Size ?? 0;
        fileCount += 1;
      }

      if ('IsTruncated' in response) {
        continuationToken = response.IsTruncated
          ? response.NextContinuationToken
          : undefined;
      }

      // continuationToken = response.IsTruncated
      //   ? response.NextContinuationToken
      //   : undefined;
    } while (continuationToken);

    return { totalSize, fileCount };
  }
}
