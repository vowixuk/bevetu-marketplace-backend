export class GetUploadPresignedUrlDto {
  fileName: string;
  allowedContentTypes: MimeType[];
  bucket: string;
  expires: number;
  acl: 'public-read' | 'private';
  storagePath?: string;
}

export type MimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp'
  | 'image/tiff'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'text/csv'
  | 'application/json'
  | 'application/zip'
  | 'application/gzip'
  | 'application/octet-stream';
