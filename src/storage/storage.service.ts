import { GetUploadPresignedUrlDto } from './dto/get-upload-presigned-url.dto';
import { GetDownloadPresignedUrlDto } from './dto/get-donwload-presigned-url.dto';

// S3 package
import { IStorageService } from './storage.service.interface';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { S3StorageService } from './s3-storage.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService implements IStorageService {
  private readonly impl: IStorageService;

  constructor() {
    const provider = process.env.STORAGE_PROVIDER;

    if (provider === 's3') {
      this.impl = new S3StorageService();
    } else if (provider === 'azure') {
      this.impl = new AzureBlobStorageService();
    } else {
      throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`);
    }
  }

  getUploadPresignedUrl(input: GetUploadPresignedUrlDto) {
    return this.impl.getUploadPresignedUrl(input);
  }

  getDownloadPresignedUrl(input: GetDownloadPresignedUrlDto) {
    return this.impl.getDownloadPresignedUrl(input);
  }

  deleteObject(bucket: string, key: string) {
    return this.impl.deleteObject(bucket, key);
  }

  checkObjectAvailability(bucket: string, key: string) {
    return this.impl.checkObjectAvailability(bucket, key);
  }

  getUsageByRootPrefix(path: string, bucket: string) {
    return this.impl.getUsageByRootPrefix(path, bucket);
  }
}

/**
 *  Old Code. Keep it
 */
// @Injectable()
// export class StorageService {
//   private _instance: S3Client | null = null;

//   constructor() {
//     if (
//       !process.env.STORAGE_ACCESS_KEY_ID ||
//       !process.env.STORAGE_SECRET_ACCESS_KEY ||
//       !process.env.STORAGE_REGION ||
//       !process.env.STORAGE_ENDPOINT
//     ) {
//       throw new ServiceUnavailableException(
//         'Missing necessary storage configuration',
//       );
//     }

//     this._instance = new S3Client({
//       endpoint: process.env.STORAGE_ENDPOINT,
//       region: process.env.STORAGE_REGION,
//       credentials: {
//         accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
//         secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
//       },
//       forcePathStyle: true,
//     });
//   }

//   get instance(): S3Client {
//     return this._instance;
//   }

//   public async getUploadPresignedUrl(
//     getPresignedUrlDto: GetUploadPresignedUrlDto,
//   ) {
//     const [fileExtension, contentType] = this.getContentTypeFromFileName(
//       getPresignedUrlDto.fileName,
//     );

//     if (!getPresignedUrlDto.allowedContentTypes.includes(contentType)) {
//       throw new BadRequestException('Unsupported file type');
//     }

//     try {
//       return await getSignedUrl(
//         this.instance,
//         new PutObjectCommand({
//           Bucket: getPresignedUrlDto.bucket,
//           Key: join(
//             getPresignedUrlDto.storagePath || '',
//             `${uuidv4()}.${fileExtension}`,
//           ),
//           ContentType: contentType,
//           ACL: getPresignedUrlDto.acl,
//         }),
//         {
//           expiresIn: getPresignedUrlDto.expires,
//         },
//       );
//     } catch (error) {
//       throw new InternalServerErrorException(error);
//     }
//   }

//   public async getDownloadPresignedUrl(
//     getDownloadPresignedUrlDto: GetDownloadPresignedUrlDto,
//   ) {
//     try {
//       const url = await getSignedUrl(
//         this.instance,
//         new GetObjectCommand({
//           Bucket: getDownloadPresignedUrlDto.bucket,
//           Key: getDownloadPresignedUrlDto.key,
//         }),
//         {
//           expiresIn: getDownloadPresignedUrlDto.expires,
//         },
//       );

//       return this.forcePathStyle(url);
//     } catch (error) {
//       throw new InternalServerErrorException(error);
//     }
//   }

//   private forcePathStyle(url: string): string {
//     try {
//       const original = new URL(url);

//       const storageDomain = process.env.STORAGE_ENDPOINT;

//       // Check for virtual-host style
//       const isVirtualHostStyle =
//         original.hostname.endsWith(storageDomain) &&
//         original.hostname !== storageDomain;

//       if (!isVirtualHostStyle) {
//         return url; // Already path-style or not a MinIO URL
//       }

//       // Extract bucket name from subdomain only if it's virtual-host style
//       const bucket = original.hostname.replace(`.${storageDomain}`, '');

//       // Reconstruct path-style URL
//       const newUrl = new URL(url);
//       newUrl.hostname = storageDomain;
//       newUrl.pathname = `/${bucket}${original.pathname}`;

//       return newUrl.toString();
//     } catch (err) {
//       console.error('Failed to convert URL to path-style:', err);
//       return url;
//     }
//   }
//   async checkObjectAvailability(
//     bucketName: string,
//     fileName: string,
//   ): Promise<boolean> {
//     try {
//       await this.instance.send(
//         new HeadObjectCommand({
//           Bucket: bucketName,
//           Key: fileName,
//         }),
//       );

//       return true;
//     } catch (error) {
//       if (error.name === 'NotFound') {
//         throw new NotFoundException('Object not found');
//       }
//       throw new InternalServerErrorException(error);
//     }
//   }

//   public async deleteObject(bucketName: string, fileName: string) {
//     await this.checkObjectAvailability(bucketName, fileName);
//     try {
//       await this.instance.send(
//         new DeleteObjectCommand({
//           Bucket: bucketName,
//           Key: fileName,
//         }),
//       );
//       return 'Deleted';
//     } catch (error) {
//       throw new InternalServerErrorException(error);
//     }
//   }

//   private getContentTypeFromFileName(
//     fileName: string,
//   ): [extension: string, mimeType: MimeType] | null {
//     const ext = fileName.split('.').pop()?.toLowerCase();
//     if (!ext) {
//       return null;
//     }

//     let mimeType: MimeType;

//     switch (ext) {
//       case 'jpg':
//       case 'jpeg':
//         mimeType = 'image/jpeg';
//         break;
//       case 'png':
//         mimeType = 'image/png';
//         break;
//       case 'gif':
//         mimeType = 'image/gif';
//         break;
//       case 'webp':
//         mimeType = 'image/webp';
//         break;
//       case 'bmp':
//         mimeType = 'image/bmp';
//         break;
//       case 'tiff':
//         mimeType = 'image/tiff';
//         break;
//       case 'pdf':
//         mimeType = 'application/pdf';
//         break;
//       case 'doc':
//         mimeType = 'application/msword';
//         break;
//       case 'docx':
//         mimeType =
//           'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
//         break;
//       case 'xlsx':
//         mimeType =
//           'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
//         break;
//       case 'pptx':
//         mimeType =
//           'application/vnd.openxmlformats-officedocument.presentationml.presentation';
//         break;
//       case 'csv':
//         mimeType = 'text/csv';
//         break;
//       case 'json':
//         mimeType = 'application/json';
//         break;
//       case 'zip':
//         mimeType = 'application/zip';
//         break;
//       case 'gzip':
//         mimeType = 'application/gzip';
//         break;
//       default:
//         mimeType = 'application/octet-stream';
//         break;
//     }

//     return [ext, mimeType];
//   }

//   /**
//    * Calculates total storage usage for a given prefix across multiple buckets
//    * @param path e.g. '12345/''
//    * @param buckets list of bucket names
//    */
//   async getUsageByRootPrefix(
//     path: string,
//     bucket: string,
//   ): Promise<Promise<{ totalSize: number; fileCount: number }>> {
//     let totalSize = 0;
//     let fileCount = 0;

//     // for (const bucket of buckets) {
//     let continuationToken: string | undefined = undefined;
//     do {
//       const command = new ListObjectsV2Command({
//         Bucket: bucket,
//         Prefix: path.endsWith('/') ? path : path + '/',
//         ContinuationToken: continuationToken,
//       });

//       const response = await this.instance.send(command);

//       const contents = response.Contents || [];
//       for (const item of contents) {
//         totalSize += item.Size ?? 0;
//         fileCount += 1;
//       }

//       continuationToken = response.IsTruncated
//         ? response.NextContinuationToken
//         : undefined;
//     } while (continuationToken);
//     // }

//     return { totalSize, fileCount };
//   }
// }
