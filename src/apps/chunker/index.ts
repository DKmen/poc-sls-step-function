
import { createInterface } from 'readline';
import https from 'https';
import { EventEmitter } from 'events';
import { generatePresignedUrl, uploadFileToS3 } from "../../helper/s3.js";


// Event emitter for chunk upload
const chunkEmitter = new EventEmitter();

// Listener for chunk upload event
chunkEmitter.on('uploadChunk', async (chunkData: { chunk: string[], chunkKey: string }) => {
    try {
        await uploadFileToS3(chunkData.chunk.join('\n'), process.env.BUCKET_NAME!, chunkData.chunkKey);
        console.log(`Chunk uploaded successfully: ${chunkData.chunkKey}`);
    } catch (error) {
        console.error(`Error uploading chunk ${chunkData.chunkKey}:`, error);
    }
});

(async function main() {
    const maxChunkSize = 2 * 1024 * 1024; // 2 MB

    // generate signed url
    const signedUrl = await generatePresignedUrl(
        process.env.BUCKET_NAME!,
        "data.json",
    );

    // Initialize variables for chunking
    let currentChunk: string[] = [];
    let currentChunkSize = 0;
    let chunkNumber = 1;
    let totalLinesProcessed = 0;

    // Array to store chunk keys for reference
    const chunkKeys: string[] = [];

    https.get(signedUrl, (response) => {
        // Create readline interface to process the response line by line
        const rl = createInterface({
            input: response,
            crlfDelay: Infinity
        });

        // Process each line of the response
        rl.on('line', (line) => {
            try {
                JSON.parse(line); // Validate JSON line
                const lineSize = Buffer.byteLength(line, 'utf8') + 1; // +1 for newline character

                // Check if adding this line exceeds the max chunk size
                if (currentChunkSize + lineSize > maxChunkSize) {
                    // Emit event to upload chunk
                    const chunkKey = `${Date.now()}/chunk-${chunkNumber}.json`;
                    chunkEmitter.emit('uploadChunk', { chunk: [...currentChunk], chunkKey });

                    // Reset for next chunk
                    chunkNumber++;
                    currentChunk = [];
                    currentChunkSize = 0;

                    // Store chunk key for reference
                    chunkKeys.push(chunkKey);
                }

                // Add line to current chunk
                currentChunk.push(line);
                currentChunkSize += lineSize;
                totalLinesProcessed++;
                
            } catch (error) {
                console.error(`Invalid JSON line: ${line}`, error);
            }
        });

        rl.on('close', () => {
            // Upload any remaining data in the last chunk
            if (currentChunk.length > 0) {
                const chunkKey = `${Date.now()}/chunk-${chunkNumber}.json`;
                chunkEmitter.emit('uploadChunk', { chunk: currentChunk, chunkKey });
            }

            console.log(`Total lines processed: ${totalLinesProcessed}`);
            console.log(`Total chunks created: ${chunkNumber}`);
            console.log(`Chunk keys: ${chunkKeys.join(', ')}`);
        });
    });
})();
