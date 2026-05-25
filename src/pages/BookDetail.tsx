import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getBib, removeBookFromBib, updateBook, uploadCover } from "../lib/storage";
import type { Book } from "../types";

function RawDataViewer({ rawData }: { rawData: string }) {
  const [open, setOpen] = useState(false);

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (!parsed || Object.keys(parsed).length === 0) return null;

  const renderValue = (val: unknown): string => {
    if (val === null || val === undefined) return "\u2014";
    if (typeof val === "string") return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    if (Array.isArray(val)) {
      return val
        .map((v) => {
          if (typeof v === "object" && v !== null) {
            const obj = v as Record<string, unknown>;
            return obj.name || obj.text || JSON.stringify(obj);
          }
          return String(v);
        })
        .join(", ");
    }
    return JSON.stringify(val);
  };

  const ignoreKeys = new Set(["key", "url", "cover", "identifiers", "classifications"]);

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sage-600 hover:text-sage-900 text-sm font-semibold"
      >
        <span className="text-lg">{open ? "\u25BE" : "\u25B8"}</span>
        Alle Open Library Data
      </button>
      {open && (
        <div className="mt-3 bg-vintage-beige border border-gray-200 rounded-lg p-4 text-xs font-mono space-y-2 max-h-96 overflow-auto">
          {Object.entries(parsed)
            .filter(([k]) => !ignoreKeys.has(k))
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <span className="text-sage-500 font-semibold whitespace-nowrap min-w-[100px]">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-gray-700 break-words flex-1">
                  {renderValue(val)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function compressCover(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 200;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("empty blob"))),
          "image/jpeg",
          0.4
        );
      };
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BookDetail() {
  const { bibId, bookId } = useParams<{ bibId: string; bookId: string }>();
  const [book, setBook] = useState<Book | undefined>();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ title: "", author: "", description: "", genre: "" });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bibId && bookId) {
      getBib(bibId).then((bib) => {
        const b = bib?.books.find((b) => b.id === bookId);
        setBook(b);
        if (b) setEdit({ title: b.title, author: b.author, description: b.description, genre: b.genre });
        setLoading(false);
      });
    }
  }, [bibId, bookId]);

  const getOpenLibraryUrl = (rawData?: string): string | null => {
    if (!rawData) return null;
    try {
      const parsed = JSON.parse(rawData) as Record<string, unknown>;
      const key = parsed.key;
      if (typeof key === "string" && key.startsWith("/")) return `https://openlibrary.org${key}`;
    } catch { /* ignore */ }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Boek niet gevonden.</p>
        <Link to={`/bib/${bibId}`} className="text-sage-600 hover:text-sage-900 mt-4 inline-block">
          Terug naar bieb
        </Link>
      </div>
    );
  }

  const handleRemove = async () => {
    if (bibId) {
      await removeBookFromBib(bibId, book.id);
      window.location.href = `/bib/${bibId}`;
    }
  };

  const startEdit = () => {
    setEdit({ title: book.title, author: book.author, description: book.description, genre: book.genre });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEdit({ title: book.title, author: book.author, description: book.description, genre: book.genre });
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateBook(book.id, {
      title: edit.title,
      author: edit.author,
      description: edit.description,
      genre: edit.genre,
    });
    setBook({ ...book, title: edit.title, author: edit.author, description: edit.description, genre: edit.genre });
    setEditing(false);
    setSaving(false);
  };

  const handleCoverPhoto = () => {
    fileRef.current?.click();
  };

  const onCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bibId) return;
    const blob = await compressCover(file);
    const coverUrl = await uploadCover(bibId, book.id, blob);
    await updateBook(book.id, { coverUrl });
    setBook({ ...book, coverUrl });
    e.target.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/bib/${bibId}`} className="text-sage-600 hover:text-sage-900 text-sm">
        &larr; Terug naar bieb
      </Link>

      <div className="mt-6 flex flex-wrap gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full object-contain rounded"
                style={{ maxHeight: "400px" }}
              />
            ) : (
              <div className="h-80 bg-gray-100 flex items-center justify-center rounded">
                <span className="text-gray-400 text-5xl font-serif">?</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onCoverFile}
              className="hidden"
            />
            <button
              onClick={handleCoverPhoto}
              className="mt-3 w-full bg-sage-700 text-white px-3 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
            >
              Maak coverfoto
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {book.isNew && (
            <span className="inline-block bg-sage-600 text-white text-xs px-2 py-1 rounded-full mb-3">
              Nieuw in de bieb!
            </span>
          )}

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                placeholder="Titel"
                className="w-full text-2xl font-bold text-sage-900 font-serif bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <input
                type="text"
                value={edit.author}
                onChange={(e) => setEdit({ ...edit, author: e.target.value })}
                placeholder="Auteur"
                className="w-full text-lg text-gray-600 bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-sage-900 font-serif">
                {book.title || "Onbekende Titel"}
              </h1>
              <p className="text-gray-600 mt-1 text-lg">{book.author || "Onbekende Auteur"}</p>
            </>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">ISBN</span>
              <p className="text-sm text-gray-700">{book.isbn}</p>
            </div>
            {!editing && (() => {
              const olUrl = getOpenLibraryUrl(book.rawData);
              return olUrl ? (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Open Library</span>
                  <a
                    href={olUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-sm text-sage-600 hover:text-sage-800 font-semibold underline"
                  >
                    Bekijk op Open Library &rarr;
                  </a>
                </div>
              ) : null;
            })()}

            {editing ? (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wide">Genre</span>
                <input
                  type="text"
                  value={edit.genre}
                  onChange={(e) => setEdit({ ...edit, genre: e.target.value })}
                  placeholder="Bijv. Thriller, Roman"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>
            ) : (
              book.genre ? (
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Genre</span>
                  <p className="text-sm text-gray-700">{book.genre}</p>
                </div>
              ) : null
            )}

            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">Toegevoegd</span>
              <p className="text-sm text-gray-700">
                {new Date(book.addedAt).toLocaleDateString("nl-NL")}
              </p>
            </div>
          </div>

          {editing ? (
            <div className="mt-6">
              <span className="text-sm font-semibold text-sage-900">Beschrijving</span>
              <textarea
                value={edit.description}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                placeholder="Beschrijving van het boek..."
                rows={4}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          ) : (
            book.description ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-sage-900 mb-2">Beschrijving</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            ) : null
          )}

          {!editing && book.rawData && <RawDataViewer rawData={book.rawData} />}

          <div className="mt-6 flex flex-wrap gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold disabled:opacity-50"
                >
                  {saving ? "Opslaan..." : "Opslaan"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm font-semibold"
                >
                  Annuleren
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm font-semibold"
              >
                Bewerken
              </button>
            )}
            <button
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              Verwijder uit bieb
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
