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
export const handler = async (event: any): Promise<any> => {
    console.log('Event:', event);
};
