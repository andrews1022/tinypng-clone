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

// constants
const MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE = 20;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const Compressor = () => {
  // state
  const [failedToCompress, setFailedToCompress] = useState(false);
  const [isCompressing, setIsCompressing] = useState(true);
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [allImagesDoneCompressing, setAllImagesDoneCompressing] = useState(false);

  useEffect(() => {
    // Check if all images are done compressing
    const compressingImages = results.filter((result) => !result.newFileSizeString);

    if (!compressingImages.length && results.length) {
      setAllImagesDoneCompressing(true);
    } else {
      setAllImagesDoneCompressing(false);
    }

    // clean up
    return () => {
      setAllImagesDoneCompressing(false);
    };
  }, [results]); // useEffect will run whenever results state changes
  // explaination of above:
  // In this code, the useEffect hook runs whenever the results state changes. It filters the results array to find images that are still compressing (where newFileSizeString is an empty string). If there are no compressing images and the results array is not empty, it means all images are done compressing, and setAllImagesDoneCompressing(true) is called. Otherwise, setAllImagesDoneCompressing(false) is set. This ensures that allImagesDoneCompressing reflects the correct state based on the compression status of all images.

  const checkIfTooManyFiles = (files: FileList) => {
    if (files.length > MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE) {
      setDropAreaInUse(false);
      return alert("Too many files! Please upload no more than 20 files at once.");
    }
  };

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

          // set results in such a way that the last result is not used for all of them
          setResults((prevResults) => {
            const newResults = [...prevResults];
            const resultIndex = newResults.findIndex((result) => result.fileName === fileName);

            newResults[resultIndex] = {
              fileName,
              newFile: compressedImageFile,
              newFileSizeString: getFileSizeString(newSize),
              originalFile: file,
              originalFileSizeString: getFileSizeString(orginalSize),
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
      if (file.size > MAX_FILE_SIZE) {
        return alert(
          `${file.name} is too large! The max file size is 4 MB. It will not be compressed.`
        );
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

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { files } = event.dataTransfer;

    if (files) {
      checkIfTooManyFiles(files);

      handleFiles(files);

      setDropAreaInUse(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { files } = event.target;

    if (files) {
      checkIfTooManyFiles(files);

      handleFiles(files);

      setDropAreaInUse(false);
    }
  };

  // reusable function to handle drag events
  const handleDragEvents = (event: DragEvent<HTMLFormElement>, dropAreaInUse: boolean) => {
    event.preventDefault();
    setDropAreaInUse(dropAreaInUse);
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

  const handleDownloadAll = () => {
    const zip = new JSZip();

    results.forEach((result) => {
      zip.file(result.fileName, result.newFile);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "tinified.zip");
    });
  };

  const handleSaveToDropbox = () => {
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

      {results.length ? (
        <section className="results">
          <ul id="results__list" className="results__list">
            {results.map((result) => {
              return (
                <li key={result.originalFile.name} className="results__list-item">
                  <div className="results__list-item-row">
                    <p className="results__title">{result.originalFile.name}</p>
                    <p className="results__size">{result.originalFileSizeString}</p>

                    <span
                      className={`results__bar results__bar--${
                        isCompressing ? "compressing" : "complete"
                      } ${failedToCompress ? "results__bar--error" : undefined}`}
                    >
                      {isCompressing ? "Compressing..." : "Complete!"}
                    </span>

                    <div className="results__compressed">
                      <p className="results__new-size">{result.newFileSizeString}</p>

                      {!isCompressing ? (
                        <p className="results__download">
                          <a href={URL.createObjectURL(result.newFile)} download={result.fileName}>
                            Download
                          </a>
                        </p>
                      ) : null}

                      <p className="results__percent-saved">{`-${result.percentSaved}%`}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {allImagesDoneCompressing ? (
        <section className="results__download-buttons">
          <button className="results__dropbox" onClick={handleSaveToDropbox}>
            <Box /> Save to Dropbox
          </button>

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
