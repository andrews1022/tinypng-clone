import imageCompression from "browser-image-compression";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import type { Options } from "browser-image-compression";
import { Result } from "@/types";

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

const handleDownloadAll = (results: Result[]) => {
  const zip = new JSZip();

  results.forEach((result) => {
    zip.file(result.fileName, result.newFile);
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "tinified.zip");
  });
};

const handleSaveToDropbox = (results: Result[]) => {
  const options = {
    // Add file objects to save to Dropbox here (save the compressed images). For example:
    // { url: "URL_TO_YOUR_FILE", filename: "FILENAME_ON_DROPBOX" }
    files: results.map((result) => ({
      // FYI: having "blob:" causes the following error: r: {"error": "Url \"blob:...\" uses unsupported scheme"}
      url: URL.createObjectURL(result.newFile).replace("blob:", "data:"),
      filename: result.fileName
    })),
    // Success callback when all files have been saved
    success: () => {
      console.log("success!");
    },
    // Error callback when all files have failed to save
    error: (error: any) => {
      console.error("error: ", error);
    },
    // Progress callback called every time a file has been successfully saved
    progress: (progress: number) => {
      console.log("progress: ", progress);
    }
  };

  window.Dropbox.save(options);
};

export { compressFile, getFileSizeString, handleDownloadAll, handleSaveToDropbox };
