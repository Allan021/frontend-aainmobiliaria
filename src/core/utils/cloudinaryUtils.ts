/**
 * Cloudinary image URL optimizer.
 *
 * Injects `f_auto,q_auto,w_{width}` transformations into Cloudinary URLs
 * to serve images in modern formats (WebP/AVIF) with automatic quality
 * and exact dimensions for the viewport — typically saving 40-60% of bandwidth.
 *
 * Non-Cloudinary URLs are returned unchanged.
 */

const CLOUDINARY_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

export function optimizeCloudinaryUrl(
  url: string,
  width: number,
  quality: string | number = 'auto',
): string {
  if (!url) return url;

  const match = url.match(CLOUDINARY_REGEX);
  if (!match) return url;

  const [, base, rest] = match;
  const transform = `f_auto,q_${quality},w_${width}`;
  return `${base}${transform}/${rest}`;
}

/**
 * Generate a srcset string with 1x and 2x for retina screens.
 */
export function cloudinarySrcSet(url: string, width: number): string | undefined {
  if (!url || !CLOUDINARY_REGEX.test(url)) return undefined;

  const w1 = optimizeCloudinaryUrl(url, width);
  const w2 = optimizeCloudinaryUrl(url, width * 2);
  return `${w1} ${width}w, ${w2} ${width * 2}w`;
}
