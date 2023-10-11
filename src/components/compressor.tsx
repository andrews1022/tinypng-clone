"use client";

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

  // check if all images are done compressing
  useEffect(() => {
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
  // the useEffect hook runs whenever the results state changes
  // it filters the results array to find images that are still compressing (where newFileSizeString is an empty string)
  // if there are no compressing images and the results array is not empty, it means all images are done compressing, and setAllImagesDoneCompressing(true) is called
  // otherwise, setAllImagesDoneCompressing(false) is set
  // this ensures that allImagesDoneCompressing reflects the correct state based on the compression status of all images

  const checkIfTooManyFiles = (files: File[]) => {
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

  const handleFiles = (files: File[]) => {
    const filesArray = Array.from(files);

    filesArray.forEach((file) => {
      // check if the file is already in the results array (file has been compressed)
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

      setResults((prevResults) => {
        return [
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
        ];
      });

      uploadFile(file, fileName);
    });
  };

  const prepareFilesForUpload = (files: FileList) => {
    const filesArray = Array.from(files);

    checkIfTooManyFiles(filesArray);
    handleFiles(filesArray);
    setDropAreaInUse(false);
  };

  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { files } = event.dataTransfer;

    if (files) {
      prepareFilesForUpload(files);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const { files } = event.target;

    if (files) {
      prepareFilesForUpload(files);
    }
  };

  // reusable function to handle drag events
  const handleDragEvents = (event: DragEvent<HTMLFormElement>, dropAreaInUse: boolean) => {
    event.preventDefault();
    setDropAreaInUse(dropAreaInUse);
  };

  return (
    <div className="compressor">
      <DropArea
        dropAreaInUse={dropAreaInUse}
        handleChange={handleChange}
        handleDragEvents={handleDragEvents}
        handleDrop={handleDrop}
      />

      {results.length ? <ResultList failedToCompress={failedToCompress} results={results} /> : null}

      {allImagesDoneCompressing && results.length ? (
        <>
          <ButtonRow results={results} />

          <Totals results={results} />
        </>
      ) : null}
    </div>
  );
};

export { Compressor };
