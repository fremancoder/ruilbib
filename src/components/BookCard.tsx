import { Link } from "react-router-dom";
import type { Book } from "../types";

interface Props {
  book: Book;
  bibId: string;
  onRemove?: (id: string) => void;
}

export default function BookCard({ book, bibId, onRemove }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition group relative">
      <Link to={`/bib/${bibId}/book/${book.id}`} className="block">
        <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <div className="text-gray-400 text-6xl font-serif">?</div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sage-900 text-sm line-clamp-2">
            {book.title || "Onbekende Titel"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{book.author || "Onbekende Auteur"}</p>
          {book.genre && (
            <p className="text-xs text-sage-500 mt-1 truncate">{book.genre}</p>
          )}
        </div>
      </Link>
      {book.isNew && (
        <span className="absolute top-2 left-2 bg-sage-600 text-white text-xs px-2 py-1 rounded-full">
          Nieuw!
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(book.id);
          }}
          className="absolute top-2 right-2 bg-white bg-opacity-80 text-red-700 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-opacity-100"
          title="Verwijder boek"
        >
          &times;
        </button>
      )}
    </div>
  );
}
