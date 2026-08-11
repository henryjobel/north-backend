import sharp from "sharp";

class CompressionService {
  MAX_SIZE_BYTES = 500 * 1024;
  MIN_SIZE_BYTES = 100 * 1024;

  /**
   * Compresses an image buffer trying to fit it between 100kb and 500kb.
   * 
   * @name compress
   * @method
   * @param {Buffer} inputBuffer - The image buffer to compress
   * @param {Object} [options={}] - Optional compression settings
   * @param {number} [options.width] - Target width for the image (default: image width or 1920, max: 1920)
   * @param {number} [options.quality=80] - JPEG quality (1-100, default: 80)
   * @returns {Promise<Buffer>} A promise that resolves to the compressed image buffer
   * 
   * @example
   * // Basic usage
   * const compressedBuffer = await compress(imageBuffer);
   * 
   * @example
   * // With custom options
   * const compressedBuffer = await compress(imageBuffer, {
   *   width: 1280,
   *   quality: 85
   * });
   */
  async compress(inputBuffer, options = {}) {
    const metadata = await sharp(inputBuffer).metadata();

    let width =
      options.width ||
      (metadata.width && metadata.width > 1920 ? 1920 : metadata.width) ||
      1920;

    let quality = options.quality || 80;

    let outputBuffer = await this.processImage(inputBuffer, width, quality);


    let attempts = 0;
    while (
      outputBuffer.length > this.MAX_SIZE_BYTES &&
      attempts < 5 &&
      quality > 10
    ) {
      quality -= 10;

      if (quality < 50 && width > 1280) {
        width = 1280;
        quality = 70;
      }

      outputBuffer = await this.processImage(inputBuffer, width, quality);
      attempts++;
    }

    return outputBuffer;
  }

  /**
   * Processes an image buffer by resizing and converting it to JPEG format.
   * 
   * @name processImage
   * @method
   * @param {Buffer} buffer - The image buffer to process
   * @param {number} width - Target width for the resized image (images won't be enlarged if smaller)
   * @param {number} quality - JPEG quality setting (1-100)
   * @returns {Promise<Buffer>} A promise that resolves to the processed image buffer as JPEG format
   * 
   * @example
   * // Process an image with specific width and quality
   * const processedBuffer = await processImage(imageBuffer, 1280, 80);
   */
  async processImage(buffer, width, quality) {
    return sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }
}

export default new CompressionService();