import { GetUploadPresignedUrlDto } from './dto/get-upload-presigned-url.dto';
import { GetDownloadPresignedUrlDto } from './dto/get-donwload-presigned-url.dto';

export interface IStorageService {
  getUploadPresignedUrl(input: GetUploadPresignedUrlDto): Promise<string>;

  getDownloadPresignedUrl(input: GetDownloadPresignedUrlDto): Promise<string>;

  deleteObject(bucket: string, key: string): Promise<string>;

  checkObjectAvailability(bucket: string, key: string): Promise<boolean>;

  getUsageByRootPrefix(
    path: string,
    bucket: string,
  ): Promise<{ totalSize: number; fileCount: number }>;
}
