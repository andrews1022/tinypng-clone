"use client";

import { compressFile, getFileSizeString } from "@/lib/utils";
import { Download } from "lucide-react";
import { useState } from "react";

import { type DragEvent } from "react";

type OriginalImage = {
  file: File;
  fileName: string;
  fileSizeString: string;
};

type NewImage = {
  originalFile: File;
  newFile: File;
  fileName: string;
  newFileSizeString: string;
  originalFileSizeString: string;
  percentSaved: string;
};

const Compressor = () => {
  // state
  const [failedToCompress, setFailedToCompress] = useState(false);
  const [isCompressing, setIsCompressing] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const [files, setFiles] = useState();
  const [results, setResults] = useState<NewImage[]>([]);

  const uploadFile = async (file: File, fileName: string) => {
    const reader = new FileReader();

    reader.addEventListener("loadend", async (event) => {
      if (event.target) {
        try {
          const compressedImageFile = await compressFile(file);

          if (!compressedImageFile) {
            return setFailedToCompress(true);
          }

          const orginalSize = file.size;
          const newSize = compressedImageFile.size;
          const reduction = ((orginalSize - newSize) / orginalSize) * 100;

          setResults((previousResults) => {
            const fileIndex = previousResults.findIndex((result) => result.fileName === fileName);
            const newResults = [...previousResults];
            newResults[fileIndex] = {
              originalFile: file,
              newFile: compressedImageFile,
              fileName,
              originalFileSizeString: getFileSizeString(orginalSize),
              newFileSizeString: getFileSizeString(newSize),
              percentSaved: reduction.toFixed(2)
            };
            return newResults;
          });

          setIsCompressing(false);
        } catch (error) {
          console.error(error);
        }
      }
    });

    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList) => {
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      if (file.size > 4 * 1024 * 1024) {
        return alert("File over 4 MB");
      }

      const fileName = file.name;

      setResults((prevResults) => [
        ...prevResults,
        {
          originalFile: file,
          newFile: file,
          fileName,
          originalFileSizeString: getFileSizeString(file.size),
          newFileSizeString: "",
          percentSaved: "0"
        }
      ]);

      uploadFile(file, fileName);
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const images = event.dataTransfer.files;

    if (images.length > 20) {
      setIsActive(false);

      return alert("Too many files!");
    }

    handleFiles(images);
    setIsActive(false);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsActive(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsActive(false);
  };

  return (
    <>
      <section
        className={`droparea ${isActive ? "green-border" : undefined}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Download size={55} />
        <p>Drop your WebP, PNG or JPEG files here!</p>
        <small>Up to 20 images, max 4 MB each.</small>
      </section>

      {results.length ? (
        <section className="results">
          <ul id="results__list" className="results__list">
            {results.map((result) => {
              return (
                <li key={result.originalFile.name}>
                  <div>
                    <p className="results__title">{result.originalFile.name}</p>
                    <p className="results__size">{result.originalFileSizeString}</p>
                  </div>

                  <span
                    className={`results__bar results__bar--${
                      isCompressing ? "compressing" : "complete"
                    } ${failedToCompress ? "results__bar--error" : undefined}`}
                  >
                    {isCompressing ? "Compressing..." : "Complete!"}
                  </span>

                  <div>
                    <p>{result.newFileSizeString}</p>

                    <div className="divDL">
                      {!isCompressing ? (
                        <p className="results__download">
                          <a href={URL.createObjectURL(result.newFile)} download={result.fileName}>
                            Download
                          </a>
                        </p>
                      ) : null}

                      {/* display percentSaved with 2 decimal points */}
                      <p>{`-${result.percentSaved}%`}</p>
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

export { Compressor };
