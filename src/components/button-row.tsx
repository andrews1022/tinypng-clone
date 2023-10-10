import { Box, DownloadCloud } from "lucide-react";
import { handleDownloadAll, handleSaveToDropbox } from "@/lib/utils";
import type { Result } from "@/types";

type ButtonRowProps = {
  results: Result[];
};

const ButtonRow = ({ results }: ButtonRowProps) => {
  return (
    <section className="results__download-buttons">
      <button className="results__dropbox" onClick={() => handleSaveToDropbox(results)}>
        <Box /> Save to Dropbox
      </button>

      <button className="results__download-all" onClick={() => handleDownloadAll(results)}>
        <DownloadCloud /> Download All
      </button>
    </section>
  );
};

export { ButtonRow };
