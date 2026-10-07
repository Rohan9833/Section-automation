import React, { useState, useRef, useEffect } from "react";
import { FileArchive, Plus, LoaderCircle, X, Copy, Check } from "lucide-react";

import CreateZipNavbar from "../Components/createZip/CreateZipNavbar";
import ZipFormFields from "../Components/createZip/ZipFormFields";
import ZipSettings from "../Components/createZip/ZipSettings";
import ZipFileUpload from "../Components/createZip/ZipFileUpload";
import ZipSuccessModal from "../Components/createZip/ZipSuccessModal";
import Navbar from "../Components/Navbar";

const BACKEND_BASE_URL = "http://localhost:2405";

const initialFormData = {
  companyName: "",
  divisionName: "",
  individualName: "",
  projectName: "",
  zipFileName: "",
};

const CreateZip = () => {
  /* ==========================================
     FORM STATE
  ========================================== */

  const [formData, setFormData] = useState(initialFormData);

  /* ==========================================
     FILE STATE
  ========================================== */

  const [files, setFiles] = useState([]);

  /* ==========================================
     ZIP SETTINGS STATE
  ========================================== */

  const [active, setActive] = useState(true);

  const [expiration, setExpiration] = useState("never");

  const [customExpiration, setCustomExpiration] = useState("");

  /* ==========================================
     UI STATE
  ========================================== */

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [successResult, setSuccessResult] = useState(null);

  /* ==========================================
     EXISTING LINK STATE
  ========================================== */

  const [existingLink, setExistingLink] = useState(null);
  const [checkingLink, setCheckingLink] = useState(false);
  const [showExistingPopup, setShowExistingPopup] = useState(false);
  const [existingCopied, setExistingCopied] = useState(false);

  /* ==========================================
     DEBOUNCE REFS
  ========================================== */

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  /* ==========================================
     FORM FIELD CHANGE
  ========================================== */

  const handleFormChange = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "projectName") {
      setExistingLink(null);
      setShowExistingPopup(false);
    }
  };

  /* ==========================================
     CHECK EXISTING ZIP LINK

     GET /api/zip/check
  ========================================== */

  useEffect(() => {
    const { companyName, divisionName, individualName, projectName } = formData;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (
      !companyName.trim() ||
      !divisionName.trim() ||
      !individualName.trim() ||
      !projectName.trim()
    ) {
      setExistingLink(null);
      setCheckingLink(false);
      setShowExistingPopup(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;

      setCheckingLink(true);

      try {
        const params = new URLSearchParams({
          companyName: companyName.trim(),
          divisionName: divisionName.trim(),
          individualName: individualName.trim(),
          projectName: projectName.trim(),
        });

        const response = await fetch(
          `${BACKEND_BASE_URL}/api/zip/check?${params.toString()}`,
          { method: "GET" },
        );

        let data;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!response.ok) {
          setExistingLink(null);
          setShowExistingPopup(false);
          return;
        }

        if (data?.exists) {
          setExistingLink({ url: data.url });
          setShowExistingPopup(true);
        } else {
          setExistingLink(null);
          setShowExistingPopup(false);
        }
      } catch (checkError) {
        console.error("Failed to check existing ZIP link:", checkError);
        setExistingLink(null);
        setShowExistingPopup(false);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setCheckingLink(false);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    formData.companyName,
    formData.divisionName,
    formData.individualName,
    formData.projectName,
  ]);

  /* ==========================================
     EXPIRATION CHANGE
  ========================================== */

  const handleExpirationChange = (value) => {
    setExpiration(value);

    if (value !== "custom") {
      setCustomExpiration("");
    }
  };

  /* ==========================================
     RESET FORM
  ========================================== */

  const resetForm = () => {
    setFormData(initialFormData);

    setFiles([]);

    setActive(true);

    setExpiration("never");

    setCustomExpiration("");

    setError("");
  };

  /* ==========================================
     VALIDATION
  ========================================== */

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return "Company name is required.";
    }

    if (!formData.divisionName.trim()) {
      return "Division name is required.";
    }

    if (!formData.individualName.trim()) {
      return "Individual name is required.";
    }

    if (!formData.projectName.trim()) {
      return "Project name is required.";
    }

    if (!formData.zipFileName.trim()) {
      return "ZIP file name is required.";
    }

    if (files.length === 0) {
      return "Please select at least one file.";
    }

    if (expiration === "custom" && !customExpiration) {
      return "Please select a custom expiration date.";
    }

    return null;
  };

  /* ==========================================
     CREATE FORMDATA
  ========================================== */

  const buildFormData = () => {
    const data = new FormData();

    /* ==========================================
       TEXT FIELDS
    ========================================== */

    data.append("companyName", formData.companyName.trim());

    data.append("divisionName", formData.divisionName.trim());

    data.append("individualName", formData.individualName.trim());

    data.append("projectName", formData.projectName.trim());

    data.append("zipFileName", formData.zipFileName.trim());

    /* ==========================================
       LINK STATUS
    ========================================== */

    data.append("active", String(active));

    /* ==========================================
       EXPIRATION
    ========================================== */

    data.append("expiration", expiration);

    data.append(
      "customExpiration",
      expiration === "custom" ? customExpiration : "",
    );

    /* ==========================================
       FILES
    ========================================== */

    files.forEach((file) => {
      data.append("files", file);
      data.append("relativePaths", file.relativePath || file.name);
    });

    return data;
  };

  /* ==========================================
     SUBMIT
  ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /* VALIDATE */

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const data = buildFormData();

      /* ==========================================
         API CALL
         
         Backend:
         POST /api/zip/upload
      ========================================== */

      const response = await fetch(`${BACKEND_BASE_URL}/api/zip/upload`, {
        method: "POST",
        body: data,
      });

      /* ==========================================
         RESPONSE
      ========================================== */

      let result = null;

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        result = {
          message: text || "Server returned an invalid response.",
        };
      }

      /* ==========================================
         API ERROR
      ========================================== */

      if (!response.ok) {
        throw new Error(result?.message || "Failed to create ZIP.");
      }

      /* ==========================================
         SUCCESS
      ========================================== */

      setSuccessResult(result);
      console.log("bhej rahe hai", result);

      setExistingLink(null);
      setShowExistingPopup(false);

      resetForm();
    } catch (submitError) {
      console.error("ZIP UPLOAD ERROR:", submitError);

      setError(
        submitError.message || "Something went wrong while creating ZIP.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     CLOSE SUCCESS MODAL
  ========================================== */

  const handleCloseSuccess = () => {
    setSuccessResult(null);
  };

  /* ==========================================
     CLOSE EXISTING POPUP
  ========================================== */

  const closeExistingPopup = () => {
    setShowExistingPopup(false);
    setExistingCopied(false);
  };

  /* ==========================================
     COPY EXISTING LINK
  ========================================== */

  const handleExistingCopy = async () => {
    if (!existingLink?.url) return;

    try {
      await navigator.clipboard.writeText(existingLink.url);
      setExistingCopied(true);
      setTimeout(() => setExistingCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy existing ZIP link:", copyError);
      try {
        const textarea = document.createElement("textarea");
        textarea.value = existingLink.url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setExistingCopied(true);
        setTimeout(() => setExistingCopied(false), 2000);
      } catch (fallbackError) {
        console.error("Copy fallback failed:", fallbackError);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#303238]">
      {/* NAVBAR */}

      <Navbar />

      {/* PAGE */}

      <main className="mx-auto max-w-[1000px] px-6 py-9 md:px-6">
        <div
          className="
            overflow-hidden
            rounded-[14px]
            border
            border-[#ececef]
            bg-white
            shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.035)]
          "
        >
          {/* CARD HEADER */}

          <div
            className="
              flex
              items-center
              gap-4
              border-b
              border-[#ececef]
              px-8
              py-7
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#fff3eb]
                text-[#f47a32]
              "
            >
              <FileArchive size={25} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-[24px] font-bold text-[#303238]">
                Create ZIP
              </h1>

              <p className="mt-1 text-[13px] leading-[1.5] text-[#777b82]">
                Add the required details and upload files to create a ZIP
                package.
              </p>
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="px-8 py-7">
            {/* ERROR */}

            {error && (
              <div
                className="
                  mb-6
                  rounded-lg
                  border
                  border-[#fcd8d4]
                  bg-[#fef2f0]
                  px-4
                  py-3
                  text-[13px]
                  text-[#b33a2e]
                "
              >
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* FORM FIELDS */}

            <ZipFormFields
              formData={formData}
              onChange={handleFormChange}
              disabled={loading}
            />

            {checkingLink && (
              <p className="mt-3 text-xs text-[#9a9da3]">
                Checking existing ZIP link...
              </p>
            )}

            {/* DIVIDER */}

            <div className="my-7 h-px bg-[#ececef]" />

            {/* ZIP SETTINGS */}

            <ZipSettings
              active={active}
              expiration={expiration}
              customExpiration={customExpiration}
              onActiveChange={setActive}
              onExpirationChange={handleExpirationChange}
              onCustomExpirationChange={setCustomExpiration}
              disabled={loading}
            />

            {/* FILE UPLOAD */}

            <ZipFileUpload
              files={files}
              onFilesChange={setFiles}
              disabled={loading}
            />

            {/* FOOTER */}

            <div
              className="
                mt-7
                flex
                justify-end
                border-t
                border-[#ececef]
                pt-6
              "
            >
              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex
                  h-11
                  min-w-[150px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#f47a32]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_2px_8px_rgba(244,122,50,0.2)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#e86d28]
                  hover:shadow-[0_8px_20px_rgba(244,122,50,0.22)]
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating ZIP...
                  </>
                ) : (
                  <>
                    <Plus size={18} strokeWidth={2.5} />
                    Create ZIP
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* SUCCESS MODAL */}

      <ZipSuccessModal result={successResult} onClose={handleCloseSuccess} />

      {/* ==================================================
          EXISTING LINK POPUP
      ================================================== */}

      {showExistingPopup && existingLink && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            backdrop-blur-[2px]
          "
          onClick={closeExistingPopup}
        >
          <div
            className="
              w-full
              max-w-[520px]
              rounded-2xl
              border
              border-[#ececef]
              bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#ececef]
                px-6
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#fff8f0]
                    text-[#d79a00]
                  "
                >
                  <FileArchive size={20} />
                </div>

                <h2 className="text-base font-semibold text-[#303238]">
                  ZIP link already exists
                </h2>
              </div>

              <button
                type="button"
                onClick={closeExistingPopup}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-[#9a9da3]
                  transition
                  hover:bg-[#f5f6f8]
                  hover:text-[#55585d]
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

            <div className="px-6 py-6">
              <p className="mb-2 text-[13px] text-[#777b82]">
                A ZIP link with this company, division, individual and project
                name already exists.
              </p>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#dfe1e5]
                  bg-[#f8f9fa]
                  p-2
                "
              >
                <div className="min-w-0 flex-1 px-2">
                  <p className="break-all text-[13px] leading-5 text-[#55585d]">
                    {existingLink.url}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExistingCopy}
                  className={`
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-lg
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    ${
                      existingCopied
                        ? "bg-[#3f9149] hover:bg-[#34803d]"
                        : "bg-[#f47a32] hover:bg-[#e86d28]"
                    }
                  `}
                >
                  {existingCopied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="
                flex
                gap-3
                justify-end
                border-t
                border-[#ececef]
                px-6
                py-4
              "
            >
              <button
                type="button"
                onClick={() => {
                  if (existingLink.url) {
                    window.open(
                      existingLink.url,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }
                }}
                className="
                  rounded-lg
                  bg-[#f47a32]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#e86d28]
                "
              >
                Open
              </button>

              <button
                type="button"
                onClick={closeExistingPopup}
                className="
                  rounded-lg
                  border
                  border-[#d5d7db]
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-[#55585d]
                  transition
                  hover:bg-[#f5f6f8]
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateZip;
