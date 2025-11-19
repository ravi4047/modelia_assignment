import sharp from 'sharp';

export interface ProcessedImages {
    fullImage: Buffer;
    thumbnailImage: Buffer;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

// Standard image sizes
export const IMAGE_SIZES = {
    FULL: { width: 1024, height: 1024 },
    THUMBNAIL: { width: 256, height: 256 },
} as const;

/**
 * Process an uploaded image into standardized full and thumbnail sizes
 */
export async function processUploadedImage(
    imageBuffer: Buffer,
    fullSize: ImageDimensions = IMAGE_SIZES.FULL,
    thumbnailSize: ImageDimensions = IMAGE_SIZES.THUMBNAIL
): Promise<ProcessedImages> {
    try {
        // Process full-size image (standardized dimensions)
        const fullImage = await sharp(imageBuffer)
            .resize(fullSize.width, fullSize.height, {
                fit: 'cover', // Crop to exact dimensions
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toBuffer();

        // Process thumbnail
        const thumbnailImage = await sharp(imageBuffer)
            .resize(thumbnailSize.width, thumbnailSize.height, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toBuffer();

        return {
            fullImage,
            thumbnailImage
        };
    } catch (error) {
        throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}