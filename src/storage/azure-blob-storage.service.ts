/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { IStorageService } from './storage.service.interface';

@Injectable()
export class AzureBlobStorageService implements IStorageService {
  private blobServiceClient: BlobServiceClient;
  private sharedKeyCredential: StorageSharedKeyCredential;

  constructor() {
    if (
      !process.env.AZURE_STORAGE_ACCOUNT_NAME ||
      !process.env.AZURE_STORAGE_ACCOUNT_KEY
    ) {
      throw new ServiceUnavailableException(
        'Missing necessary storage configuration',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT_NAME,
      process.env.AZURE_STORAGE_ACCOUNT_KEY,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      this.sharedKeyCredential,
    );
  }

  private getContainerClient(containerName: string): ContainerClient {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.blobServiceClient.getContainerClient(containerName);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getUploadPresignedUrl(
    getPresignedUrlDto: GetUploadPresignedUrlDto,
  ) {
    const [fileExtension, contentType] = this.getContentTypeFromFileName(
      getPresignedUrlDto.fileName,
    );

    if (
      !getPresignedUrlDto.allowedContentTypes.includes(
        contentType as unknown as MimeType,
      )
    ) {
      throw new BadRequestException('Unsupported file type');
    }

    const containerClient = this.getContainerClient(getPresignedUrlDto.bucket);

    const blobName = join(
      getPresignedUrlDto.storagePath || '',
      `${uuidv4()}.${fileExtension}`,
    ).replace(/\\/g, '/'); // normalize

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const blobClient = containerClient.getBlockBlobClient(blobName);

    const expiresOn = new Date(
      new Date().valueOf() + (getPresignedUrlDto.expires ?? 3600) * 1000,
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        containerName: containerClient.containerName,
        blobName: blobClient.name,
        permissions: BlobSASPermissions.parse('cwr'),
        expiresOn,
        contentType,
      },
      this.sharedKeyCredential,
    ).toString();

    const url = `${blobClient.url}?${sasToken}`;

    return url;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async getDownloadPresignedUrl(
    getDownloadPresignedUrlDto: GetDownloadPresignedUrlDto,
  ) {
    const containerClient = this.getContainerClient(
      getDownloadPresignedUrlDto.bucket,
    );

    const blobClient = containerClient.getBlockBlobClient(
      getDownloadPresignedUrlDto.key,
    );

    const expiresOn = new Date(
      new Date().valueOf() +
        (getDownloadPresignedUrlDto.expires ?? 3600) * 1000,
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: containerClient.containerName,
        blobName: blobClient.name,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      this.sharedKeyCredential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
  }

  async checkObjectAvailability(
    bucketName: string,
    fileName: string,
  ): Promise<boolean> {
    const containerClient = this.getContainerClient(bucketName);
    const blobClient = containerClient.getBlockBlobClient(fileName);

    try {
      const exists = await blobClient.exists();
      if (!exists) {
        throw new NotFoundException('Object not found');
      }
      return true;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async deleteObject(bucketName: string, fileName: string) {
    await this.checkObjectAvailability(bucketName, fileName);
    const containerClient = this.getContainerClient(bucketName);
    const blobClient = containerClient.getBlockBlobClient(fileName);

    try {
      await blobClient.delete();
      return 'Deleted';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUsageByRootPrefix(
    path: string,
    bucket: string,
  ): Promise<{ totalSize: number; fileCount: number }> {
    const containerClient = this.getContainerClient(bucket);

    let totalSize = 0;
    let fileCount = 0;

    for await (const blob of containerClient.listBlobsFlat({
      prefix: path.endsWith('/') ? path : path + '/',
    })) {
      totalSize += blob.properties.contentLength ?? 0;
      fileCount += 1;
    }

    return { totalSize, fileCount };
  }

  private getContentTypeFromFileName(
    fileName: string,
  ): [extension: string, string] {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) {
      throw new BadRequestException('Cannot determine file extension');
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
}
