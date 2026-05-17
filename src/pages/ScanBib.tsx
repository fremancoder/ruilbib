import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBib, rescanBib, updateBookData } from "../lib/storage";
import { lookupISBN } from "../lib/isbn";
import type { Bib } from "../types";

export default function ScanBib() {
  const { bibId } = useParams<{ bibId: string }>();
  const navigate = useNavigate();
  const [bib, setBib] = useState<Bib | undefined>();
  const [bibLoading, setBibLoading] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [scannedIsbns, setScannedIsbns] = useState<string[]>([]);
  const [manualIsbn, setManualIsbn] = useState("");
  const [results, setResults] = useState<{
    added: string[];
    removed: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const startScanning = useCallback(async () => {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("reader");

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.5 },
        (decoded) => {
          const match = decoded.match(/\b(97[89]\d{10})\b/);
          if (match && !scannedIsbns.includes(match[1])) {
            setScannedIsbns((prev) => [...prev, match[1]]);
          }
        },
        () => {}
      );
    } catch {
      setScanning(false);
    }
  }, [scannedIsbns]);

  const stopScanning = () => {
    setScanning(false);
  };

  const addManual = () => {
    const cleaned = manualIsbn.replace(/[-\s]/g, "");
    if (cleaned && !scannedIsbns.includes(cleaned)) {
      setScannedIsbns((prev) => [...prev, cleaned]);
      setManualIsbn("");
    }
  };

  useEffect(() => {
    if (bibId) {
      getBib(bibId).then((b) => {
        setBib(b);
        setBibLoading(false);
      });
    }
  }, [bibId]);

  const handleFinish = async () => {
    if (!bibId) return;
    setLoading(true);
    const result = await rescanBib(bibId, scannedIsbns);
    const addedTitles: string[] = [];

    for (const added of result.added) {
      try {
        const info = await lookupISBN(added.isbn);
        await updateBookData(added.id, {
          title: info.title || added.isbn,
          author: info.author || "Onbekende Auteur",
          coverUrl: info.coverUrl || "",
          description: info.description || "",
          genre: info.genre || "",
          rawData: info.rawData || "",
        });
        addedTitles.push(info.title || added.isbn);
      } catch {
        addedTitles.push(added.isbn);
      }
    }

    setResults({
      added: addedTitles,
      removed: result.removed.map((b) => b.title || b.isbn),
    });
    setLoading(false);
  };

  if (bibLoading) {
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

  if (results) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-sage-900 font-serif mb-6">Herscan Resultaat</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-semibold text-green-700">
              Toegevoegd ({results.added.length})
            </h2>
            {results.added.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                {results.added.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Geen nieuwe boeken.</p>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-red-700">
              Verwijderd ({results.removed.length})
            </h2>
            {results.removed.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                {results.removed.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-1">Geen boeken verwijderd.</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/bib/${bibId}`)}
            className="bg-sage-600 text-white px-6 py-2 rounded-lg hover:bg-sage-800 transition font-semibold text-sm"
          >
            Terug naar Bieb
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/bib/${bibId}`} className="text-sage-600 hover:text-sage-900 text-sm">
        &larr; Terug naar bieb
      </Link>
      <h1 className="text-3xl font-bold text-sage-900 font-serif mt-2 mb-2">Herscan Bieb</h1>
      <p className="text-gray-600 text-sm mb-6">
        Scan alle boeken in de kast. Nieuwe boeken krijgen een "Nieuw" label. Boeken die niet
        gescand worden, worden verwijderd uit de online bieb.
      </p>

      {scanning ? (
        <div className="mb-6">
          <div id="reader" className="w-full max-w-md mx-auto" />
          <div className="text-center mt-4">
            <button
              onClick={stopScanning}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              Stop Scanner
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-6">
          <button
            onClick={startScanning}
            className="bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-800 transition font-semibold"
          >
            Start Camera Scanner
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-sage-900 mb-3">
          Gescande ISBN's ({scannedIsbns.length})
        </h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={manualIsbn}
            onChange={(e) => setManualIsbn(e.target.value)}
            placeholder="Voer ISBN handmatig in..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            onKeyDown={(e) => e.key === "Enter" && addManual()}
          />
          <button
            onClick={addManual}
            className="bg-sage-700 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm"
          >
            Toevoegen
          </button>
        </div>
        {scannedIsbns.length > 0 && (
          <ul className="space-y-1 max-h-48 overflow-auto">
            {scannedIsbns.map((isbn, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-gray-700 py-1 border-b border-gray-100"
              >
                {isbn}
                <button
                  onClick={() =>
                    setScannedIsbns((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleFinish}
        disabled={loading}
        className="w-full bg-sage-900 text-white py-3 rounded-lg hover:bg-sage-800 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "Verwerken..." : "Herscan Afronden & Opslaan"}
      </button>
    </div>
  );
}
