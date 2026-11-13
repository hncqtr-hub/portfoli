import type { ImageLoaderProps } from 'next/image';

/* Cloudinary resizes and picks the format itself, so its photos skip Next's
   optimizer (which would also need res.cloudinary.com whitelisted). */
const cloudinaryLoader = ({ src, width }: ImageLoaderProps) =>
  src.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);

/* next/image `loader` for a source: Cloudinary's own for uploads, Next's
   default for anything bundled in /public. */
export const loaderFor = (src: string) =>
  src.startsWith('https://res.cloudinary.com/') ? cloudinaryLoader : undefined;
