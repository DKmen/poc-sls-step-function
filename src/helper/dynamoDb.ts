import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

/**
 * Marshals a plain JS object to DynamoDB item format (only string attributes).
 */
function marshalItem(item: Record<string, any>): Record<string, { S: string }> {
    return Object.entries(item).reduce((acc, [key, value]) => {
        acc[key] = { S: String(value) };
        return acc;
    }, {} as Record<string, { S: string }>);
}

/**
 * Puts multiple items into the specified DynamoDB table.
 * @param tableName The name of the DynamoDB table.
 * @param items The items to put (array of plain JS objects).
 */
export async function batchPutItemsToDynamoDB(tableName: string, items: Record<string, any>[]): Promise<void> {
    const writeRequests = items.map(item => ({
        PutRequest: {
            Item: marshalItem(item),
        },
    }));

    const command = new BatchWriteItemCommand({
        RequestItems: {
            [tableName]: writeRequests,
        },
    });

    await client.send(command);
}
