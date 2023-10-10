import { getFileSizeString } from "@/lib/utils";

type TotalsProps = {
  totalPercentSaved: string;
  totalSizeSaved: number;
};

const Totals = ({ totalPercentSaved, totalSizeSaved }: TotalsProps) => {
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
