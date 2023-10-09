"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { type DragEvent } from "react";

type Result = {
  file: File;
  fileID: number;
  originalFileSizeString: string;
  hasError: boolean;
};

const Compressor = () => {
  // state
  const [counter, setCounter] = useState(0);
  // const [files, setFiles] = useState<FileList | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const getFileSizeString = (filesize: number) => {
    const sizeInKB = filesize / 1024;
    const sizeInMB = sizeInKB / 1024;
    return sizeInKB > 1024 ? `${sizeInMB.toFixed(1)} MB` : `${sizeInKB.toFixed(1)} KB`;
  };

  // const createResult = (file: File, fileID: number) => {
  //   const originalFileSizeString = getFileSizeString(file.size);
  // };

  const updateProgressBar = (file: File, fileID: number, imgJson: any) => {};

  const handleFileError = (fileID: number) => {
    // const progress = document.getElementById(`progress_${filename}_${fileID}`);
    // progress.value = 10;
    // progress.classList.add("error");

    // select the file from the results array and update error to true
    const resultsCopy = [...results];
    const fileIndex = resultsCopy.findIndex((result) => result.fileID === fileID);
    resultsCopy[fileIndex].hasError = true;
    setResults(resultsCopy);
  };

  const uploadFile = (file: File, fileID: number) => {
    const reader = new FileReader();

    reader.addEventListener("loadend", async (event) => {
      if (event.target) {
        const filename = file.name;
        const base64String = event.target.result;
        const extension = filename.split(".").pop()!;
        const name = filename.slice(0, filename.length - (extension.length + 1));
        const body = { base64String, name, extension };

        try {
          const fileStream = await fetch("/api/upload", {
            method: "POST",
            body: JSON.stringify(body)
          });

          const imgJson = await fileStream.json();

          if (imgJson.error) {
            return handleFileError(fileID);
          }

          updateProgressBar(file, fileID, imgJson);
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
      const fileID = counter;
      setCounter((prevCounter) => (prevCounter += 1));

      if (file.size > 4 * 1024 * 1024) {
        return alert("File over 4 MB");
      }

      // createResult(file, fileID);
      // add file to results
      setResults((prevResults) => [
        ...prevResults,
        {
          file,
          fileID,
          originalFileSizeString: getFileSizeString(file.size),
          hasError: false
        }
      ]);

      uploadFile(file, fileID);
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const images = event.dataTransfer.files;
    // console.log("images: ", images);

    // setFiles(images);

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

                  <progress
                    id={`progress_${result.file.name}_${result.fileID}`}
                    className="results__bar"
                    max="10"
                    value="0"
                  />

                  <div></div>
                </li>
              );
            })}

            {/* <li>
            <div>
              <p className="results__title">Screenshot from 2023-08-28 11-11-18.png</p>
              <p className="results__size">1.3 MB</p>
            </div>
            <progress
              id="progress_Screenshot from 2023-08-28 11-11-18.png_2"
              className="results__bar"
              max="10"
              value="0"
            />
            <div>
              <p
                id="new_size_Screenshot from 2023-08-28 11-11-18.png_2"
                className="results__size"
              ></p>
              <div className="divDL">
                <p
                  id="download_Screenshot from 2023-08-28 11-11-18.png_2"
                  className="results__download"
                ></p>
                <p
                  id="saved_Screenshot from 2023-08-28 11-11-18.png_2"
                  className="results__saved"
                ></p>
              </div>
            </div>
          </li> */}
          </ul>
        </section>
      ) : null}
    </>
  );
};

export { Compressor };
