import React from "react";
import {
  Bell,
  ChevronDown,
} from "lucide-react";

const PresentationNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[#ececef] bg-white px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* LEFT */}
      <div className="flex items-center gap-6">
        {/* LOGO */}
        <div className="flex items-center gap-1 text-[22px] font-bold tracking-[-0.5px]">
          <span className="text-[#f47a32]">
            digi
          </span>

          <span className="text-[#55585d]">
            LATERAL
          </span>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-1">
          <a
            href="/presentations"
            className="
              rounded-lg
              px-3.5
              py-[9px]
              text-sm
              font-medium
              text-[#777b82]
              transition
              hover:bg-[#fff5ef]
              hover:text-[#f47a32]
            "
          >
            Dashboard
          </a>

          <a
            href="/urlForm"
            className="
              rounded-lg
              bg-[#fff3eb]
              px-3.5
              py-[9px]
              text-sm
              font-semibold
              text-[#f47a32]
            "
          >
            Create PPT
          </a>

          <a
            href="/create-zip"
            className="
              rounded-lg
              px-3.5
              py-[9px]
              text-sm
              font-medium
              text-[#777b82]
              transition
              hover:bg-[#fff5ef]
              hover:text-[#f47a32]
            "
          >
            Create Zip
          </a>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-[#777b82] transition hover:text-[#f47a32]"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-[34px]
              w-[34px]
              items-center
              justify-center
              rounded-full
              bg-[#f47a32]
              text-[13px]
              font-semibold
              text-white
            "
          >
            D
          </div>

          <span className="text-sm font-medium text-[#303238]">
            DigiLateral
          </span>

          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className="text-[#9a9da3]"
          />
        </div>
      </div>
    </nav>
  );
};

export default PresentationNavbar;