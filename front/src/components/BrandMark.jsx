import React from "react";
import { ChefHatIcon } from "lucide-react";

export function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-11 w-11 place-items-center bg-[url('/image-removebg-preview.png')] bg-cover bg-center rounded-full border-2 border-white bg-[#f57696] text-black shadow-[3px_3px_0_#fff]"
        aria-hidden="true"
      >
      </div>

      {!compact && (
        <div className="leading-tight text-white">
          <p className="text-xs font-black tracking-[0.16em]">
            UEP
          </p>
          <p className="text-sm font-extrabold">
            UEP CULINARY ARCHIVE
          </p>
        </div>
      )}
    </div>
  );
}
