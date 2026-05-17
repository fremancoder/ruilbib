import { useEffect, useRef, useState } from "react";

interface Props {
  bibId: string;
  bibName: string;
}

export function BibQRCode({ bibId, bibName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show && canvasRef.current) {
      import("qrcode").then((QRCode) => {
        const url = `${window.location.origin}/bib/${bibId}`;
        QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 });
      });
    }
  }, [show, bibId]);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-sage-600 hover:text-sage-900 text-sm underline"
      >
        Toon QR Code
      </button>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h3 className="font-semibold text-sage-900 mb-4">{bibName}</h3>
            <canvas ref={canvasRef} className="mx-auto" />
            <p className="text-xs text-gray-500 mt-2">
              Scan deze code om de bieb te bezoeken
            </p>
            <button
              onClick={() => setShow(false)}
              className="mt-4 bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-800 transition text-sm"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}
