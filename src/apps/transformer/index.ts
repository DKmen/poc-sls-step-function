import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createInterface } from 'readline';

import { batchPutItemsToDynamoDB } from '../../helper/dynamoDb';

const s3 = new S3Client({});
/**
 * AWS Lambda handler to list S3 buckets.
 * This function uses AWS SDK v3 to list all S3 buckets in the account.
 *
 * @param event - The input event for the Lambda function (can be any type).
 * @returns A promise that resolves to an object containing the list of buckets and a success message.
 */
export const handler = async (
    s3Key: string
): Promise<any> => {
    // Validate environment variables
    const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: s3Key
    });

    // Fetch the S3 object
    const { Body } = await s3.send(getObjectCommand);

    // Check if Body is a readable stream
    if (!Body || typeof (Body as any).pipe !== 'function') {
        throw new Error('S3 object Body is not a readable stream');
    }

    // Create readline interface to process the S3 object line by line
    const rl = createInterface({
        input: Body as NodeJS.ReadableStream,
        crlfDelay: Infinity
    });

    const lines: Record<string, any>[] = [];
    for await (const line of rl) {
        try {
            // Parse each line as JSON
            const info = JSON.parse(line); // Validate JSON line
            lines.push(info);
        } catch (error) {
            console.error('Invalid JSON line:', line, error);
        }
    }

    // Batch put items into DynamoDB
    await batchPutItemsToDynamoDB(process.env.DYNAMODB_TABLE_NAME!, lines);
};
