import React, { useState } from "react";
import { Check, Copy, Download, X } from "lucide-react";

const ZipSuccessModal = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "";

  if (!result) {
    return null;
  }

  const zipLink = result.url || "";
  const fullUrl =
    result.url?.startsWith("http://") ||
    result.url?.startsWith("https://")
      ? result.url
      : backendUrl +
        (result.url?.startsWith("/") ? "" : "/") +
        (result.url || "");
  console.log("ziplink", zipLink);
  console.log("ziplisddsdng", fullUrl);

  const zipName = result.fileName || result.zipFileName || "ZIP file";

  const copyLink = async () => {
    if (!fullUrl) {
      return;
    }
    console.log(fullUrl);
    try {
      await navigator.clipboard.writeText(fullUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      try {
        const textarea = document.createElement("textarea");

        textarea.value = fullUrl;

        textarea.style.position = "fixed";

        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error("Copy failed:", fallbackError);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-2xl bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5"
          aria-label="Close"
        >
          <X size={20} className="text-[#777b82]" />
        </button>

        {/* SUCCESS ICON */}

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5e9] text-[#2e7d32]">
          <Check size={30} strokeWidth={2.5} />
        </div>

        {/* TITLE */}

        <h2 className="mt-5 text-center text-xl font-bold text-[#303238]">
          ZIP Created Successfully
        </h2>

        {/* DESCRIPTION */}

        <p className="mt-2 text-center text-[13px] leading-[1.5] text-[#777b82]">
          Your files have been compressed successfully.
        </p>

        {/* FILE NAME */}

        <div className="mt-6 rounded-lg border border-[#ececef] bg-[#fafafa] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#9a9da3]">
            ZIP File
          </div>

          <div className="mt-1 break-all text-sm font-semibold text-[#303238]">
            {zipName}
          </div>
        </div>

        {/* LINK */}

        <div className="mt-4 rounded-lg border border-[#ececef] bg-[#fafafa] p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#9a9da3]">
            Download Link
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fullUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 break-all text-xs font-medium text-[#f47a32] hover:underline"
            >
              {fullUrl || "Download link was not returned by server."}
            </a>

            {fullUrl && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={copyLink}
                  title="Copy ZIP link"
                  className="
                    flex
                    h-[38px]
                    w-[38px]
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-[#d5d7db]
                    bg-white
                    text-[#777b82]
                    transition
                    hover:border-[#f47a32]
                    hover:bg-[#fff5ef]
                    hover:text-[#f47a32]
                  "
                >
                  <Copy size={17} />
                </button>

                {copied && (
                  <span className="absolute right-0 top-[43px] whitespace-nowrap rounded-md bg-[#303238] px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
                    Copied!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex gap-2.5">
          {fullUrl && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="
                flex
                h-[42px]
                flex-1
                items-center
                justify-center
                gap-2
                rounded-[9px]
                bg-[#f47a32]
                text-[13px]
                font-semibold
                text-white
                transition
                hover:-translate-y-px
                hover:bg-[#e86d28]
              "
            >
              <Download size={17} />
              Download ZIP
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="
              h-[42px]
              rounded-[9px]
              border
              border-[#d5d7db]
              bg-white
              px-[18px]
              text-[13px]
              font-semibold
              text-[#55585d]
              transition
              hover:border-[#f47a32]
              hover:bg-[#fffaf7]
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZipSuccessModal;
