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
};

type CompressedFile = {
  failedToCompress: boolean;
  name: string;
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
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [filesBeingCompressed, setFilesBeingCompressed] = useState<FileReadyForCompressing[]>([]);
  // const [compressionResults, setCompressionResults] = useState([]);
  const [isCompressing, setIsCompressing] = useState(true);

  const checkIfTooManyFiles = (files: FileList) => {
    if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      setDropAreaInUse(false);
      return alert("Too many files! Please upload no more than 20 files at once.");
    }
  };

  const uploadFile = async (fileToCompress: FileReadyForCompressing) => {
    const reader = new FileReader();
    const { file, large, name, size } = fileToCompress;

    reader.addEventListener("loadend", async (event) => {
      try {
        // check if large is true
        // if it is, don't compress, just add to compressedFiles state
        if (large) {
          const compressed: CompressedFile = {
            failedToCompress: true,
            name,
            newFile: file,
            newFileSizeString: getFileSizeString(size),
            originalFile: file,
            originalFileSizeString: getFileSizeString(size),
            percentSaved: 0
          };

          setCompressedFiles((previouscompressedFiles) => [...previouscompressedFiles, compressed]);
          return;
        }

        setIsCompressing(true);

        const compressedFile = await compressFile(file);

        const orginalSize = file.size;
        const newSize = compressedFile.size;
        const reduction = ((orginalSize - newSize) / orginalSize) * 100;

        const compressed: CompressedFile = {
          failedToCompress: false,
          name,
          newFile: compressedFile,
          newFileSizeString: getFileSizeString(newSize),
          originalFile: file,
          originalFileSizeString: getFileSizeString(orginalSize),
          percentSaved: parseFloat(reduction.toFixed(2))
        };

        setCompressedFiles((previouscompressedFiles) => [...previouscompressedFiles, compressed]);
        setIsCompressing(false);

        return;
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

    if (files) {
      checkIfTooManyFiles(files);

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

      setFilesBeingCompressed(preppedFiles);
      setDropAreaInUse(false);

      handleFiles(preppedFiles);
    }
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { files } = event.dataTransfer;

    if (files) {
      checkIfTooManyFiles(files);

      // prepare files for compression
      const preppedFiles: FileReadyForCompressing[] = Array.from(files).map((file) => {
        const { name, size } = file;

        return {
          file,
          large: size > MAX_FILE_SIZE,
          name,
          size
        };
      });

      setFilesBeingCompressed(preppedFiles);
      setDropAreaInUse(false);

      handleFiles(preppedFiles);
    }
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

      {filesBeingCompressed.length ? (
        <section className="results">
          <ul id="results__list" className="results__list">
            {filesBeingCompressed.map((file, index) => {
              return (
                <li key={file.name}>
                  <div>
                    <p className="results__title">{file.name}</p>
                    <p className="results__size">{getFileSizeString(file.size)}</p>
                  </div>

                  <span
                    className={`results__bar results__bar--${
                      isCompressing ? "compressing" : "complete"
                    }`}
                  >
                    {isCompressing ? "Compressing..." : "Complete!"}
                  </span>

                  <div>
                    <p>
                      {compressedFiles[index] &&
                      compressedFiles.find((compressedFile) => compressedFile.name === file.name)
                        ? compressedFiles[index].newFileSizeString
                        : "..."}
                    </p>

                    {/* find the matching file in compressedFiles state by fileName */}
                    {/* {compressedFiles[index] && compressedFiles.find((f) => f.name === file.name) ? (
                      <p>{compressedFiles[index].newFileSizeString}</p>
                    ) : (
                      <p>...</p>
                    )} */}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* {compressedFiles.length ? (
        <section className="results">
          <ul id="results__list" className="results__list">
            {compressedFiles.map((compressedImage) => {
              return (
                <li key={compressedImage.originalFile.name}>
                  <div>
                    <p className="results__title">{compressedImage.originalFile.name}</p>
                    <p className="results__size">{compressedImage.originalFileSizeString}</p>
                  </div>

                  <span
                    className={`results__bar results__bar--${
                      compressedImage.failedToCompress ? "error" : "complete"
                    }`}
                  >
                    {compressedImage.failedToCompress && "Failed to compress"}
                    {!compressedImage.failedToCompress && "Complete!"}
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

                      <p>{`-${compressedImage.percentSaved}%`}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null} */}

      {/* {compressedFiles.length ? (
        <section className="results"> 
          <ul id="results__list" className="results__list">  
            {compressedFiles.map((compressedImage) => {
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

                      <p>{`-${compressedImage.percentSaved}%`}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null} */}
    </>
  );
};

export { CompressorV2 };

const original = [
  {
    file: {},
    large: false,
    name: "Screenshot from 2023-08-04 11-03-09.png",
    size: 252988
  },
  {
    file: {},
    large: false,
    name: "Screenshot from 2023-08-24 13-20-17.png",
    size: 601745
  }
];

const compressed = [
  {
    failedToCompress: false,
    name: "Screenshot from 2023-08-04 11-03-09.png",
    newFile: {
      name: "Screenshot from 2023-08-04 11-03-09.png",
      lastModified: 1696916365374
    },
    newFileSizeString: "247.1 KB",
    originalFile: {},
    originalFileSizeString: "247.1 KB",
    percentSaved: 0
  },
  {
    failedToCompress: false,
    name: "Screenshot from 2023-08-24 13-20-17.png",
    newFile: {
      name: "Screenshot from 2023-08-24 13-20-17.png",
      lastModified: 1693947762122
    },
    newFileSizeString: "279.5 KB",
    originalFile: {},
    originalFileSizeString: "587.6 KB",
    percentSaved: 52.43
  }
];
