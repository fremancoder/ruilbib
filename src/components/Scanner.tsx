import { useState } from "react";

interface Props {
  onScan: (isbn: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: Props) {
  const [manualIsbn, setManualIsbn] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const startScanner = async () => {
    setError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("reader");

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.5 },
        (decoded) => {
          const match = decoded.match(/\b(97[89]\d{10})\b/);
          if (match) {
            onScan(match[1]);
            scanner.stop().catch(() => {});
            setScanning(false);
          }
        },
        () => {}
      );
    } catch {
      setError("Kon camera niet starten. Controleer of je camera beschikbaar is.");
      setScanning(false);
    }
  };

  const handleManual = () => {
    const cleaned = manualIsbn.replace(/[-\s]/g, "");
    if (cleaned.length < 10) {
      setError("Ongeldig ISBN nummer");
      return;
    }
    onScan(cleaned);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-sage-900">Scan Boek</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-sage-900 text-xl">
            &times;
          </button>
        </div>

        {scanning ? (
          <div>
            <div id="reader" className="w-full" style={{ maxWidth: "100%" }} />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Richt de camera op de barcode van het boek
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={startScanner}
              className="w-full bg-sage-600 text-white py-3 rounded-lg hover:bg-sage-800 transition font-semibold"
            >
              Start Camera Scanner
            </button>
            <div className="text-center text-gray-400 text-sm">of</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN handmatig invoeren
              </label>
              <input
                type="text"
                value={manualIsbn}
                onChange={(e) => setManualIsbn(e.target.value)}
                placeholder="978-3-16-148410-0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                onKeyDown={(e) => e.key === "Enter" && handleManual()}
              />
              <button
                onClick={handleManual}
                className="w-full mt-2 bg-sage-700 text-white py-2 rounded-lg hover:bg-sage-800 transition font-semibold text-sm"
              >
                ISBN Opzoeken
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-700 text-sm mt-3 bg-red-100 p-2 rounded">{error}</p>
        )}
      </div>
    </div>
  );
}
