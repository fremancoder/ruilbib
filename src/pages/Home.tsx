import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBibs, getActiveBibId, setActiveBibId, deleteBib } from "../lib/storage";
import type { Bib } from "../types";
import BibCard from "../components/BibCard";

export default function Home() {
  const [bibs, setBibs] = useState<Bib[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setBibs(await getBibs());
    setActiveId(getActiveBibId());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteBib(id);
    await load();
  };

  const handleSelect = (id: string) => {
    setActiveBibId(id);
    setActiveId(id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-sage-900 font-serif">RuilBib</h1>
        <p className="text-gray-600 mt-2 text-lg">Boeken Ruilbibliotheek</p>
        <p className="text-gray-500 mt-1 max-w-2xl mx-auto text-sm leading-relaxed">
          Neem een boek mee, laat een boek achter. Selecteer of scan een ruilbieb om te beginnen.
        </p>
      </div>

      {bibs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Nog geen ruilbiebs gevonden.</p>
          <Link
            to="/manage"
            className="inline-block bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-800 transition font-semibold"
          >
            Maak je eerste RuilBieb aan
          </Link>
        </div>
      ) : (
        <>
          {activeId && (
            <div className="mb-6 flex items-center justify-between bg-sage-50 border border-sage-200 rounded-lg px-4 py-3">
              <span className="text-sage-800 text-sm">
                Actieve bieb:{" "}
                <strong>{bibs.find((b) => b.id === activeId)?.name}</strong>
              </span>
              <Link
                to={`/bib/${activeId}`}
                className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
              >
                Open Bieb
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bibs.map((bib) => (
              <div key={bib.id} className="relative">
                {activeId === bib.id ? (
                  <span className="absolute -top-2 -right-2 bg-sage-600 text-white text-xs px-2 py-1 rounded-full z-10">
                    Actief
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelect(bib.id)}
                    className="absolute -top-2 -right-2 bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full z-10 hover:bg-sage-100 transition"
                  >
                    Selecteer
                  </button>
                )}
                <BibCard bib={bib} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
