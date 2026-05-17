import { Outlet, Link, useLocation } from "react-router-dom";
import { getActiveBib } from "../lib/storage";
import { useState, useEffect } from "react";
import type { Bib } from "../types";

export default function Layout() {
  const location = useLocation();
  const [activeBib, setActiveBib] = useState<Bib | undefined>();

  useEffect(() => {
    getActiveBib().then(setActiveBib);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-sage-900 text-sage-50 border-b border-sage-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide hover:text-sage-200 transition">
            RuilBib
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:text-sage-200 transition">
              Home
            </Link>
            <Link to="/manage" className="hover:text-sage-200 transition">
              Bieb Beheren
            </Link>
            {activeBib && (
              <span className="text-sage-200 text-xs bg-sage-800 px-2 py-1 rounded">
                {activeBib.name}
              </span>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-sage-900 text-sage-200 text-xs text-center py-4 mt-12">
        RuilBib &mdash; Boeken Ruilbibliotheek
      </footer>
    </div>
  );
}
