import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { addBookToBib } from "../lib/storage";
import { lookupISBN } from "../lib/isbn";
import Scanner from "../components/Scanner";

export default function AddBook() {
  const { bibId } = useParams<{ bibId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(true);

  const handleIsbn = async (isbn: string) => {
    if (!bibId) return;
    setShowScanner(false);
    setLoading(true);
    setError("");

      try {
        const info = await lookupISBN(isbn);
        await addBookToBib(bibId, {
          isbn,
          title: info.title || `ISBN: ${isbn}`,
          author: info.author || "Onbekende Auteur",
          coverUrl: info.coverUrl,
          description: info.description,
          genre: info.genre,
          rawData: info.rawData,
        });
        navigate(`/bib/${bibId}`);
      } catch {
        setError("Kon boekgegevens niet ophalen. Het boek is toegevoegd met basis ISBN.");
        await addBookToBib(bibId, {
          isbn,
          title: `ISBN: ${isbn}`,
          author: "Onbekende Auteur",
          coverUrl: "",
          description: "",
          genre: "",
        });
      setTimeout(() => navigate(`/bib/${bibId}`), 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/bib/${bibId}`} className="text-sage-600 hover:text-sage-900 text-sm">
        &larr; Terug naar bieb
      </Link>
      <h1 className="text-3xl font-bold text-sage-900 font-serif mt-2 mb-6">Boek Toevoegen</h1>

      {showScanner ? (
        <Scanner onScan={handleIsbn} onClose={() => navigate(`/bib/${bibId}`)} />
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Boekgegevens ophalen...</p>
        </div>
      ) : null}

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mt-4">
          {error}
        </div>
      )}
    </div>
  );
}
