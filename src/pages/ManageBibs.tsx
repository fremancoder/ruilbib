import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBibs, addBib, deleteBib, setActiveBibId } from "../lib/storage";
import type { Bib } from "../types";
import BibCard from "../components/BibCard";

export default function ManageBibs() {
  const navigate = useNavigate();
  const [bibs, setBibs] = useState<Bib[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", description: "" });

  const load = async () => {
    setBibs(await getBibs());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.location) return;
    await addBib(form);
    await load();
    setForm({ name: "", location: "", description: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBib(id);
    await load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="text-sage-600 hover:text-sage-900 text-sm">
        &larr; Home
      </Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-3xl font-bold text-sage-900 font-serif">Ruilbieb Beheren</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
        >
          {showForm ? "Annuleren" : "+ Nieuwe Bieb"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Nieuwe Ruilbieb</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bijv. Buurtbieb Parkstraat"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Bijv. Parkstraat 12, Amsterdam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving (optioneel)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bijv. Openingstijden, regels..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.location}
              className="bg-sage-600 text-white px-6 py-2 rounded-lg hover:bg-sage-800 transition font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Bieb Aanmaken
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : bibs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nog geen ruilbiebs. Maak er een aan!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bibs.map((bib) => (
            <BibCard key={bib.id} bib={bib} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
