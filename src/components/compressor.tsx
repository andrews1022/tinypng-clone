"use client";

import { compressFile } from "@/lib/utils";
import { Download } from "lucide-react";
import { useState } from "react";

import { type DragEvent } from "react";

type Result = {
  file: File;
  fileName: string;
  originalFileSizeString: string;
  newFileSizeString: string;
  percentSaved: string;
};

const Compressor = () => {
  // state
  const [isCompressing, setIsCompressing] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [failedToCompress, setFailedToCompress] = useState(false);

  const getFileSizeString = (fileSize: number) => {
    const sizeInKB = fileSize / 1024;
    const sizeInMB = sizeInKB / 1024;
    return sizeInKB > 1024 ? `${sizeInMB.toFixed(1)} MB` : `${sizeInKB.toFixed(1)} KB`;
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

          setResults((previousResults) => {
            const fileIndex = previousResults.findIndex((result) => result.fileName === fileName);
            const newResults = [...previousResults];
            newResults[fileIndex] = {
              file,
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

  // const createResult = (file: File, fileID: number) => {
  //   const originalFileSizeString = getFileSizeString(file.size);
  // };

  // const updateProgressBar = (file: File, fileID: number, imgJson: any) => {};

  // const handleFileError = (fileID: number) => {
  // const progress = document.getElementById(`progress_${filename}_${fileID}`);
  // progress.value = 10;
  // progress.classList.add("error");
  // select the file from the results array and update error to true
  // const resultsCopy = [...results];
  // const fileIndex = resultsCopy.findIndex((result) => result.fileID === fileID);
  // resultsCopy[fileIndex].hasError = true;
  // setResults(resultsCopy);
  // };

  // const uploadFile = (file: File, fileID: number) => {
  //   const reader = new FileReader();

  //   reader.addEventListener("loadend", async (event) => {
  //     if (event.target) {
  //       // const filename = file.name;
  //       // const base64String = event.target.result;
  //       // const extension = filename.split(".").pop()!;
  //       // const name = filename.slice(0, filename.length - (extension.length + 1));
  //       // const body = { base64String, name, extension };

  //       try {
  //         // console.log("file: ", file);
  //         console.log("file size: ", file.size);

  //         const compressedImageFile = await compressFile(file);

  //         if (!compressedImageFile) {
  //           return setFailedToCompress(true);
  //         }

  //         console.log("compressed file size: ", compressedImageFile.size);

  //         const orginalSize = file.size;
  //         const newSize = compressedImageFile.size;
  //         const reduction = ((orginalSize - newSize) / orginalSize) * 100;
  //         console.log("reduction: ", reduction);
  //         setPercentSaved(reduction);

  //         // const reduction =

  //         // setNewFileSize(getFileSizeString(compressedImageFile.size));

  //         // setPercentSaved(getPercentSaved(file.size, compressedImageFile.size));

  //         // console.log("percentSaved: ", percentSaved);

  //         // const response = await fetch("/api/upload", {
  //         //   method: "POST",
  //         //   body: JSON.stringify(file)
  //         // });

  //         // if (!response.ok) {
  //         //   // return handleFileError(fileID);
  //         //   setFailedToCompress(true);
  //         //   return;
  //         // }

  //         // const imgJson = await response.json();

  //         // console.log("imgJson: ", imgJson);

  //         setIsCompressing(false);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     }
  //   });

  //   reader.readAsDataURL(file);
  // };

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
          file,
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

    if (images) {
      if (images.length > 20) {
        setIsActive(false);

        return alert("Too many files!");
      }

      handleFiles(images);
    }

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
                <li key={result.file.name}>
                  <div>
                    <p className="results__title">{result.file.name}</p>
                    <p className="results__size">{result.originalFileSizeString}</p>
                  </div>

                  <span
                    className={`results__bar results__bar--${
                      isCompressing ? "compressing" : "complete"
                    } ${failedToCompress ? "results__bar--error" : undefined}`}
                  />

                  <div>
                    {/* <p>{newFileSize}</p> */}
                    <p>{result.newFileSizeString}</p>

                    <div className="divDL">
                      <p>DOWNLOAD</p>

                      {/* display percentSaved with up to 2 decimal points */}
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
