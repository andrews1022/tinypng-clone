import { Result } from "@/types";

type ResultListProps = {
  failedToCompress: boolean;
  results: Result[];
};

const ResultList = ({ failedToCompress, results }: ResultListProps) => {
  return (
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
                    result.isCompressing ? "compressing" : "complete"
                  } ${failedToCompress ? "results__bar--error" : undefined}`}
                >
                  {result.isCompressing ? "Compressing..." : "Complete!"}
                </span>

                <div className="results__compressed">
                  <p className="results__new-size">{result.newFileSizeString}</p>

                  {!result.isCompressing ? (
                    <a
                      href={URL.createObjectURL(result.newFile)}
                      download={result.fileName}
                      className="results__download"
                    >
                      Download
                    </a>
                  ) : null}

                  <p className="results__percent-saved">{`-${result.percentSaved}%`}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export { ResultList };
