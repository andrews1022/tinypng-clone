import { Box, DownloadCloud } from "lucide-react";

type ButtonRowProps = {
  handleDownloadAll: () => void;
  handleSaveToDropbox: () => void;
};

const ButtonRow = ({ handleDownloadAll, handleSaveToDropbox }: ButtonRowProps) => {
  return (
    <section className="results__download-buttons">
      <button className="results__dropbox" onClick={handleSaveToDropbox}>
        <Box /> Save to Dropbox
      </button>

      <button className="results__download-all" onClick={handleDownloadAll}>
        <DownloadCloud /> Download All
      </button>
    </section>
  );
};

export { ButtonRow };
