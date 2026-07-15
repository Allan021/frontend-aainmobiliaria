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
 * Generate a responsive srcset ladder up to `width` (plus a 2x retina step),
 * so mobile viewports get a genuinely smaller file instead of only 1x/2x of
 * the desktop size.
 */
export function cloudinarySrcSet(url: string, width: number): string | undefined {
  if (!url || !CLOUDINARY_REGEX.test(url)) return undefined;

  const steps = [0.3, 0.5, 0.75, 1, 2]
    .map(f => Math.round(width * f))
    .filter((w, i, arr) => w >= 200 && arr.indexOf(w) === i)
    .sort((a, b) => a - b);

  return steps.map(w => `${optimizeCloudinaryUrl(url, w)} ${w}w`).join(', ');
}
