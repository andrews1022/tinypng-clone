import { Download } from "lucide-react";

const DropArea = () => {
  return (
    <section className="droparea">
      <Download size={55} />
      <p>Drop your .png or .jpg files here!</p>
      <small>Up to 20 images, max 4 MB each.</small>
    </section>
  );
};

export { DropArea };
