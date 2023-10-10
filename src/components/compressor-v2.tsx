"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Box, Download, DownloadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { compressFile, getFileSizeString } from "@/lib/utils";

import type { ChangeEvent, DragEvent } from "react";
import type { Result } from "@/types";

declare global {
  interface Window {
    Dropbox: any;
  }
}

type FileReadyForCompressing = {
  file: File;
  large: boolean;
  name: string;
  size: number;
  type: string;
};

// constants
const MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE = 20;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const CompressorV2 = () => {
  // state
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [imagesReadyToCompress, setImagesReadyToCompress] = useState<FileReadyForCompressing[]>([]);

  const handleFiles = (files: FileReadyForCompressing[]) => {
    console.log("files --> ", files);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    // console.log(files);

    if (files) {
      if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
        setDropAreaInUse(false);
        return alert("Too many files! Please upload no more than 20 files at once.");
      }

      // prepare files for compression
      const preppedFiles: FileReadyForCompressing[] = Array.from(files).map((file) => {
        const { name, size, type } = file;

        return {
          file,
          large: size > MAX_FILE_SIZE,
          name,
          size,
          type
        };
      });

      // setImagesReadyToCompress(preppedFiles);

      setDropAreaInUse(false);
      handleFiles(preppedFiles);
    }
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { files } = event.dataTransfer;
    // console.log(files);

    if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      setDropAreaInUse(false);
      return alert("Too many files! Please upload no more than 20 files at once.");
    }

    // prepare files for compression
    const preppedFiles: FileReadyForCompressing[] = Array.from(files).map((file) => {
      const { name, size, type } = file;

      return {
        file,
        large: size > MAX_FILE_SIZE,
        name,
        size,
        type
      };
    });

    // setImagesReadyToCompress(preppedFiles);

    setDropAreaInUse(false);
    handleFiles(preppedFiles);
  };

  // reusable function to handle drag events
  const handleDragEvents = (event: DragEvent<HTMLFormElement>, dropAreaInUse: boolean) => {
    event.preventDefault();
    setDropAreaInUse(dropAreaInUse);
  };

  return (
    <>
      <form
        className={`droparea ${dropAreaInUse ? "droparea--in-use" : ""}`}
        onDrop={handleDrop}
        onDragEnter={(event) => handleDragEvents(event, true)}
        onDragOver={(event) => handleDragEvents(event, true)}
        onDragLeave={(event) => handleDragEvents(event, false)}
      >
        <Download size={55} />

        <label htmlFor="select-images">
          Drag and drop or{" "}
          <span className="text-amber-500 font-semibold">click here to browse</span>
        </label>

        <input
          type="file"
          id="select-images"
          name="select-images"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <small>Up to 20 images, max 4 MB each.</small>
      </form>
    </>
  );
};

export { CompressorV2 };
