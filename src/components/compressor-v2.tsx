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

type CompressedFile = {
  failedToCompress: boolean;
  fileName: string;
  newFile: File;
  newFileSizeString: string;
  originalFile: File;
  originalFileSizeString: string;
  percentSaved: number;
};

// constants
const MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE = 20;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const CompressorV2 = () => {
  // state
  const [compressedImages, setCompressedImages] = useState<CompressedFile[]>([]);
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [isCompressing, setIsCompressing] = useState(true);

  const checkIfTooManyFiles = (files: FileList) => {
    if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      setDropAreaInUse(false);
      return alert("Too many files! Please upload no more than 20 files at once.");
    }
  };

  const uploadFile = async (fileToCompress: FileReadyForCompressing) => {
    const reader = new FileReader();
    const { file, large, name, size, type } = fileToCompress;

    reader.addEventListener("loadend", async (event) => {
      try {
        // check if large is true
        // if it is, don't compress, just add to compressedImages state
        if (large) {
          const compressedImage: CompressedFile = {
            failedToCompress: true,
            fileName: name,
            newFile: file,
            newFileSizeString: getFileSizeString(size),
            originalFile: file,
            originalFileSizeString: getFileSizeString(size),
            percentSaved: 0
          };

          setCompressedImages((previousCompressedImages) => [
            ...previousCompressedImages,
            compressedImage
          ]);
          return;
        }

        const compressedFile = await compressFile(file);

        const orginalSize = file.size;
        const newSize = compressedFile.size;
        const reduction = ((orginalSize - newSize) / orginalSize) * 100;

        const compressedImage: CompressedFile = {
          failedToCompress: false,
          fileName: name,
          newFile: compressedFile,
          newFileSizeString: getFileSizeString(newSize),
          originalFile: file,
          originalFileSizeString: getFileSizeString(orginalSize),
          percentSaved: parseFloat(reduction.toFixed(2))
        };

        setCompressedImages((previousCompressedImages) => [
          ...previousCompressedImages,
          compressedImage
        ]);
        setIsCompressing(false);
      } catch (error) {
        console.error("Error compressing file: ", error);
      }
    });

    reader.readAsDataURL(fileToCompress.file);
  };

  const handleFiles = (files: FileReadyForCompressing[]) => {
    files.forEach((file) => {
      uploadFile(file);
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    // console.log(files);

    if (files) {
      // if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      //   setDropAreaInUse(false);
      //   return alert("Too many files! Please upload no more than 20 files at once.");
      // }

      checkIfTooManyFiles(files);

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

    // if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
    //   setDropAreaInUse(false);
    //   return alert("Too many files! Please upload no more than 20 files at once.");
    // }

    checkIfTooManyFiles(files);

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

      {compressedImages.length ? (
        <section className="results">
          <ul id="results__list" className="results__list">
            {compressedImages.map((compressedImage) => {
              return (
                <li key={compressedImage.originalFile.name}>
                  <div>
                    <p className="results__title">{compressedImage.originalFile.name}</p>
                    <p className="results__size">{compressedImage.originalFileSizeString}</p>
                  </div>

                  <span
                    className={`results__bar results__bar--${
                      isCompressing ? "compressing" : "complete"
                    } ${compressedImage.failedToCompress ? "results__bar--error" : undefined}`}
                  >
                    {/* {isCompressing ? "Compressing..." : "Complete!"} */}

                    {compressedImage.failedToCompress && "Failed to compress"}
                    {!compressedImage.failedToCompress && isCompressing && "Compressing..."}
                    {!compressedImage.failedToCompress && !isCompressing && "Complete!"}
                  </span>

                  <div>
                    <p>{compressedImage.newFileSizeString}</p>

                    <div className="divDL">
                      {!isCompressing ? (
                        <p className="results__download">
                          <a
                            href={URL.createObjectURL(compressedImage.newFile)}
                            download={compressedImage.fileName}
                          >
                            Download
                          </a>
                        </p>
                      ) : null}

                      {/* display percentSaved with 2 decimal points */}
                      <p>{`-${compressedImage.percentSaved}%`}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
};

export { CompressorV2 };
