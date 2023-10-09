import imageCompression from "browser-image-compression";
import type { Options } from "browser-image-compression";

const defaultOptions: Options = {
  maxSizeMB: 4,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  maxIteration: 10,
  initialQuality: 0.3,
  exifOrientation: 1
};

const compressFile = (imageFile: File, options = defaultOptions) => {
  return imageCompression(imageFile, options);
};

const getFileSizeString = (fileSize: number) => {
  const sizeInKB = fileSize / 1024;
  const sizeInMB = sizeInKB / 1024;
  return sizeInKB > 1024 ? `${sizeInMB.toFixed(1)} MB` : `${sizeInKB.toFixed(1)} KB`;
};

export { compressFile, getFileSizeString };
