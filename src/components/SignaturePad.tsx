"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  onSign: (base64Image: string) => void;
}

export function SignaturePad({ onSign }: SignaturePadProps) {
  const sigPad = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigPad.current?.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigPad.current?.isEmpty()) {
      alert("Por favor, dibuje su firma antes de continuar.");
      return;
    }
    const dataUrl = sigPad.current?.getTrimmedCanvas().toDataURL("image/png");
    if (dataUrl) {
      onSign(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full bg-white border-2 border-dashed border-[var(--color-brand-navy)] rounded-xl overflow-hidden touch-none">
        <SignatureCanvas
          ref={sigPad}
          penColor="black"
          canvasProps={{
            className: "w-full h-48 sm:h-64 cursor-crosshair",
          }}
          onBegin={() => setIsEmpty(false)}
        />
      </div>
      
      <div className="flex justify-between w-full mt-4 space-x-4">
        <button
          onClick={clear}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Borrar
        </button>
        <button
          onClick={save}
          className="flex-1 py-3 px-4 bg-[var(--color-brand-navy)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-navy-dark)] transition-colors shadow-md disabled:opacity-50"
          disabled={isEmpty}
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  );
}
