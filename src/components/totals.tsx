import { getFileSizeString } from "@/lib/utils";
import type { Result } from "@/types";

type TotalsProps = {
  results: Result[];
};

const Totals = ({ results }: TotalsProps) => {
  // totalPercentSaved is calculated by using the reduce function on the results array
  // it adds up the individual percentSaved values for each image and formats the result to have 2 decimal places
  const totalPercentSaved = results
    .reduce((total, result) => total + result.percentSaved, 0)
    .toFixed(2);

  // totalSizeSaved is calculated by using the reduce function similarly to the total percent saved
  // it adds up the differences in file sizes (in bytes) for each image
  const totalSizeSaved = results.reduce((total, result) => {
    const originalSize = result.originalFile.size;
    const newSize = result.newFile.size;
    const sizeDifference = originalSize - newSize;

    return total + sizeDifference;
  }, 0);

  return (
    <section className="totals">
      <p className="totals__message">
        We just saved you <span className="totals__percent">{totalPercentSaved}%</span>
        <span className="totals__size-saved">{getFileSizeString(totalSizeSaved)} total</span>
      </p>
    </section>
  );
};

export { Totals };
