import { Link } from "react-router-dom";
import type { Bib } from "../types";
import { BibQRCode } from "./QRCode";

interface Props {
  bib: Bib;
  onDelete?: (id: string) => void;
}

export default function BibCard({ bib, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition">
      <Link to={`/bib/${bib.id}`} className="block">
        <h3 className="text-lg font-bold text-sage-900">{bib.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{bib.location}</p>
        {bib.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bib.description}</p>
        )}
        <p className="text-sm text-sage-600 mt-3 font-medium">
          {bib.books.length} boek{bib.books.length !== 1 ? "en" : ""}
        </p>
      </Link>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <BibQRCode bibId={bib.id} bibName={bib.name} />
        {onDelete && (
          <button
            onClick={() => onDelete(bib.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Verwijder
          </button>
        )}
      </div>
    </div>
  );
}
