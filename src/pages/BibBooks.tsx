import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBib, removeBookFromBib, markBooksNotNew } from "../lib/storage";
import type { Bib } from "../types";
import BookCard from "../components/BookCard";
import SearchBar from "../components/SearchBar";
import { BibQRCode } from "../components/QRCode";

export default function BibBooks() {
  const { bibId } = useParams<{ bibId: string }>();
  const [bib, setBib] = useState<Bib | undefined>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (bibId) {
      getBib(bibId).then((b) => {
        setBib(b);
        setLoading(false);
      });
    }
  }, [bibId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!bib) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Bieb niet gevonden.</p>
        <Link to="/" className="text-sage-600 hover:text-sage-900 mt-4 inline-block">
          Terug naar home
        </Link>
      </div>
    );
  }

  const filtered = bib.books.filter((book) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q) ||
      book.isbn.includes(q)
    );
  });

  const handleRemove = async (bookId: string) => {
    await removeBookFromBib(bib.id, bookId);
    setBib(await getBib(bib.id));
  };

  const handleClearNew = async () => {
    await markBooksNotNew(bib.id);
    setBib(await getBib(bib.id));
  };

  const newCount = bib.books.filter((b) => b.isNew).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/" className="text-sage-600 hover:text-sage-900 text-sm">
            &larr; Home
          </Link>
          <h1 className="text-3xl font-bold text-sage-900 font-serif mt-1">{bib.name}</h1>
          <p className="text-gray-500 text-sm">{bib.location}</p>
        </div>
        <div className="flex items-center gap-3">
          <BibQRCode bibId={bib.id} bibName={bib.name} />
          <Link
            to={`/bib/${bib.id}/scan`}
            className="bg-sage-700 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
          >
            Herscan
          </Link>
          <Link
            to={`/bib/${bib.id}/add`}
            className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
          >
            + Boek Toevoegen
          </Link>
        </div>
      </div>

      {bib.description && (
        <p className="text-gray-600 text-sm mb-6 bg-sage-50 p-4 rounded-lg border border-sage-200">
          {bib.description}
        </p>
      )}

      {newCount > 0 && (
        <div className="mb-4 flex items-center gap-3 bg-sage-100 border border-sage-300 rounded-lg px-4 py-2">
          <span className="text-sage-800 text-sm">
            {newCount} nieuw boek{newCount !== 1 ? "en" : ""} gescand
          </span>
          <button
            onClick={handleClearNew}
            className="text-sage-600 hover:text-sage-900 text-sm underline"
          >
            Markeer als gezien
          </button>
        </div>
      )}

      <div className="mb-6">
        <SearchBar onSearch={setSearch} placeholder="Zoek op titel, auteur, genre, ISBN..." />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {bib.books.length === 0
              ? "Deze bieb is nog leeg."
              : "Geen boeken gevonden voor deze zoekopdracht."}
          </p>
          <Link
            to={`/bib/${bib.id}/add`}
            className="inline-block bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-800 transition font-semibold"
          >
            Voeg een boek toe
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              bibId={bib.id}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
