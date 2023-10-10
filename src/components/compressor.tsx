"use client";

import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useEffect, useState } from "react";

import { ButtonRow } from "@/components/button-row";
import { DropArea } from "@/components/drop-area";
import { ResultList } from "@/components/result-list";
import { Totals } from "@/components/totals";

import { MAX_NUMBER_OF_FILES_UPLOADED_AT_ONCE, MAX_FILE_SIZE } from "@/constants";

import { compressFile, getFileSizeString } from "@/lib/utils";

import type { ChangeEvent, DragEvent } from "react";
import type { Result } from "@/types";

declare global {
  interface Window {
    Dropbox: any;
  }
}

const Compressor = () => {
  // state
  const [failedToCompress, setFailedToCompress] = useState(false);
  const [dropAreaInUse, setDropAreaInUse] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [allImagesDoneCompressing, setAllImagesDoneCompressing] = useState(false);

  useEffect(() => {
    // check if all images are done compressing
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
  // explaination of useEffect above:
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
              percentSaved: parseFloat(reduction.toFixed(2)),
              isCompressing: false
            };

            return newResults;
          });
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
      // check if the file is already in the results array (has been compressed)
      const isAlreadyCompressed = results.some((result) => result.fileName === file.name);

      // skip files that have already been compressed
      if (isAlreadyCompressed) {
        return;
      }

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
          percentSaved: 0,
          isCompressing: true // set isCompressing to true for newly added files
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
      return total + result.percentSaved;
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
      <DropArea
        dropAreaInUse={dropAreaInUse}
        handleChange={handleChange}
        handleDragEvents={handleDragEvents}
        handleDrop={handleDrop}
      />

      {results.length ? <ResultList failedToCompress={failedToCompress} results={results} /> : null}

      {allImagesDoneCompressing && results.length ? (
        <>
          <ButtonRow
            handleDownloadAll={handleDownloadAll}
            handleSaveToDropbox={handleSaveToDropbox}
          />

          <Totals totalPercentSaved={totalPercentSaved} totalSizeSaved={totalSizeSaved} />
        </>
      ) : null}
    </>
  );
};

export { Compressor };
