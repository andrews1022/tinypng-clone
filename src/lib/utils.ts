import imageCompression from "browser-image-compression";
import type { Options } from "browser-image-compression";

const defaultOptions: Options = {
  maxSizeMB: 4,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  maxIteration: 10,
  initialQuality: 0.5,
  exifOrientation: 1
};

const compressFile = (imageFile: File, options = defaultOptions) => {
  return imageCompression(imageFile, options);
};

export { compressFile };
