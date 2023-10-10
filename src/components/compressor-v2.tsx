"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Box, Download, DownloadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { compressFile, getFileSizeString } from "@/lib/utils";

import type { DragEvent } from "react";
import type { Result } from "@/types";

declare global {
  interface Window {
    Dropbox: any;
  }
}

// constants
const MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE = 20;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const CompressorV2 = () => {
  // state
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [imagesToCompress, setImagesToCompress] = useState([]);

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { files } = event.dataTransfer;

    console.log(files);

    if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      setDropAreaInUse(false);

      return alert("Too many files!");
    }

    // handleFiles(images);

    setDropAreaInUse(false);
  };

  const handleDragEvents = (event: DragEvent<HTMLFormElement>, dropAreaInUse: boolean) => {
    event.preventDefault();
    setDropAreaInUse(dropAreaInUse);
  };

  // const handleDragEnter = (event: DragEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setDropAreaInUse(true);
  // };

  // const handleDragOver = (event: DragEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setDropAreaInUse(true);
  // };

  // const handleDragLeave = (event: DragEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   setDropAreaInUse(false);
  // };

  const handleClick = () => {
    console.log("clicked!");
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
          Drag and drop or <span className="text-amber-500">click here to browse</span>
        </label>
        <input
          type="file"
          id="select-images"
          name="select-images"
          accept="image/*"
          multiple
          // onClick={handleClick}
          className="hidden"
          // onChange={handleFiles}
        />
        <small>Up to 20 images, max 4 MB each.</small>
      </form>
    </>
  );
};

export { CompressorV2 };
