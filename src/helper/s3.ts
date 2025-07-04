import { createReadStream } from 'fs';
import { S3Client, PutObjectCommand, PutObjectCommandInput, PutObjectCommandOutput, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Uploads a file to S3 using AWS SDK v3.
 * @param filePath - Local path to the file.
 * @param bucket - S3 bucket name.
 * @param key - S3 object key.
 * @returns Resolves with S3 upload response.
 */
export async function uploadFileToS3(
    content: string,
    bucket: string,
    key: string
): Promise<PutObjectCommandOutput> {
    const client = new S3Client({});

    const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: content,
    };

    const command = new PutObjectCommand(params);
    return await client.send(command);
}

/**
 * Generates a pre-signed URL to access a file in S3.
 * @param bucket - S3 bucket name.
 * @param key - S3 object key.
 * @param expiresIn - Expiry time in seconds (default: 3600).
 * @returns Pre-signed URL string.
 */
export async function generatePresignedUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    const client = new S3Client({});
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return await getSignedUrl(client, command, { expiresIn });
}
