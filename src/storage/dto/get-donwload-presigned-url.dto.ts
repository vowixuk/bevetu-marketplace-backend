export class GetDownloadPresignedUrlDto {
  bucket: string;
  key: string;
  expires: number;
}
