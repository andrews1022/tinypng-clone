import { Download } from "lucide-react";

import type { ChangeEvent, DragEvent } from "react";

type DropAreaProps = {
  dropAreaInUse: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDragEvents: (event: DragEvent<HTMLFormElement>, dropAreaInUse: boolean) => void;
  handleDrop: (event: DragEvent<HTMLFormElement>) => void;
};

const DropArea = ({ dropAreaInUse, handleChange, handleDragEvents, handleDrop }: DropAreaProps) => {
  return (
    <form
      className={`droparea ${dropAreaInUse ? "droparea--in-use" : ""}`}
      onDrop={handleDrop}
      onDragEnter={(event) => handleDragEvents(event, true)}
      onDragOver={(event) => handleDragEvents(event, true)}
      onDragLeave={(event) => handleDragEvents(event, false)}
    >
      <Download size={55} />

      <label htmlFor="select-images">
        Drag and drop or <span className="text-amber-500 font-semibold">click here to browse</span>
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
  );
};

export { DropArea };
