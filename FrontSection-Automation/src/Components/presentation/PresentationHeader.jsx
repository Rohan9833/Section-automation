import React from "react";
import { Plus } from "lucide-react";

const PresentationHeader = () => {
  return (
    <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
      {/* ======================================
          TITLE
      ====================================== */}

      <div>
        <h1 className="m-0 text-[28px] font-bold tracking-[-0.4px] text-[#303238]">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-[#777b82]">
          Manage your presentations and
          shareable links.
        </p>
      </div>

      {/* ======================================
          CREATE BUTTON
      ====================================== */}

      <a
        href="/urlForm"
        className="
          inline-flex
          h-[42px]
          items-center
          gap-2
          rounded-lg
          bg-[#f47a32]
          px-6
          text-sm
          font-semibold
          text-white
          shadow-[0_2px_8px_rgba(244,122,50,0.2)]
          transition
          hover:-translate-y-0.5
          hover:bg-[#e86d28]
          hover:shadow-[0_8px_20px_rgba(244,122,50,0.22)]
          active:translate-y-0
        "
      >
        <Plus
          size={18}
          strokeWidth={2.5}
        />

        Create presentation
      </a>
    </div>
  );
};

export default PresentationHeader;