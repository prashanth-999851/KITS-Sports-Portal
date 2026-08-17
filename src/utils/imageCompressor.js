/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Reduces raw 2MB-15MB photos to ~100KB-300KB HD WebP/JPEG base64 strings
 * so they upload instantly without exceeding Convex document size limits.
 *
 * @param {File} file - The file object from <input type="file">
 * @param {number} maxWidth - Max width threshold (default: 1200px)
 * @param {number} maxHeight - Max height threshold (default: 1200px)
 * @param {number} quality - Compression quality 0.1 to 1.0 (default: 0.75)
 * @returns {Promise<string>} Base64 DataURL string
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not a valid image.'));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context unavailable.'));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality compressed JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
};
