"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, DownloadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { compressFile, getFileSizeString } from "@/lib/utils";

import { type DragEvent } from "react";

type Result = {
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
  const [results, setResults] = useState<Result[]>([]);
  const [allImagesDoneCompressing, setAllImagesDoneCompressing] = useState(false);

  useEffect(() => {
    // Check if all images are done compressing
    const compressingImages = results.filter((result) => !result.newFileSizeString);

    if (compressingImages.length === 0 && results.length > 0) {
      setAllImagesDoneCompressing(true);
    } else {
      setAllImagesDoneCompressing(false);
    }
  }, [results]); // useEffect will run whenever results state changes
  // explaination of above:
  // In this code, the useEffect hook runs whenever the results state changes. It filters the results array to find images that are still compressing (where newFileSizeString is an empty string). If there are no compressing images and the results array is not empty, it means all images are done compressing, and setAllImagesDoneCompressing(true) is called. Otherwise, setAllImagesDoneCompressing(false) is set. This ensures that allImagesDoneCompressing reflects the correct state based on the compression status of all images.

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
      // setCounter((prevCounter) => (prevCounter += 1));

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

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (event) => {
      const inputElement = event.target as HTMLInputElement;
      const images = inputElement.files;

      if (images) {
        handleFiles(images);
      }
    };

    input.click();
  };

  const handleDownloadAll = () => {
    const zip = new JSZip();

    results.forEach((result) => {
      zip.file(result.fileName, result.newFile);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "tinified.zip");
    });
  };

  const totalPercentSaved = results
    .reduce((total, result) => {
      return total + parseFloat(result.percentSaved);
    }, 0)
    .toFixed(2);
  // In this code, totalPercentSaved is calculated by using the reduce function on the results array. It adds up the individual percentSaved values for each image and formats the result to have 2 decimal places.

  const totalSizeSaved = results.reduce((total, result) => {
    const originalSize = result.originalFile.size;
    const newSize = result.newFile.size;
    const sizeDifference = originalSize - newSize;
    return total + sizeDifference;
  }, 0);
  // In this code, totalSizeSaved is calculated by using the reduce function similarly to the total percent saved. It adds up the differences in file sizes (in bytes) for each image.

  return (
    <>
      <section
        className={`droparea ${isActive ? "green-border" : undefined}`}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
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

      {allImagesDoneCompressing ? (
        <section className="download-buttons">
          <button className="results__download-all" onClick={handleDownloadAll}>
            <DownloadCloud /> Download All
          </button>
        </section>
      ) : null}

      {allImagesDoneCompressing && results.length ? (
        <section className="totals">
          <p className="totals__message">
            We just saved you <span className="totals__percent">{totalPercentSaved}%</span>
            <span className="totals__size-saved">{getFileSizeString(totalSizeSaved)} total</span>
          </p>
        </section>
      ) : null}
    </>
  );
};

export { Compressor };
