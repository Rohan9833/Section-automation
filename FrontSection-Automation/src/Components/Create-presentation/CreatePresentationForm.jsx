import { useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  FilePlus2,
  LoaderCircle,
  ExternalLink,
  X,
  Copy,
  Check,
} from "lucide-react";

import PresentationSettings from "./PresentationSettings";
import PresentationSections from "./PresentationSections";

const API_BASE_URL = "http://digilateral.com";

const inputClass = `
  h-11
  w-full
  rounded-lg
  border
  border-[#d5d7db]
  bg-white
  px-3.5
  text-[13px]
  text-[#303238]
  outline-none
  transition
  placeholder:text-[#a3a6ad]
  hover:border-[#c6c9ce]
  focus:border-[#f47a32]
  focus:ring-4
  focus:ring-[#f47a32]/10
`;

const initialFormData = {
  companyName: "",
  divisionName: "",
  userName: "",
  projectName: "",
};

const initialSettings = {
  isActive: true,
  expirationType: "never",
  customExpiration: "",
};

const CreatePresentationForm = () => {
  /* ==========================================
     BASIC FORM DATA
  ========================================== */

  const [formData, setFormData] = useState(initialFormData);

  /* ==========================================
     PRESENTATION SETTINGS
  ========================================== */

  const [settings, setSettings] = useState(initialSettings);

  /* ==========================================
     SELECTED SECTIONS
  ========================================== */

  const [selectedSections, setSelectedSections] = useState([]);

  /* ==========================================
     SELECTED SLIDES
  ========================================== */

  const [selectedSlides, setSelectedSlides] = useState({});

  /* ==========================================
     EXISTING LINK
  ========================================== */

  const [existingLink, setExistingLink] = useState(null);

  const [checkingLink, setCheckingLink] = useState(false);

  /* ==========================================
     SUBMIT STATE
  ========================================== */

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================
     SUCCESS POPUP
  ========================================== */

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [createdLink, setCreatedLink] = useState("");

  /* ==========================================
     COPY STATE
  ========================================== */

  const [copied, setCopied] = useState(false);

  /* ==========================================
     EXISTING LINK POPUP STATE
  ========================================== */

  const [showExistingPopup, setShowExistingPopup] = useState(false);
  const [existingCopied, setExistingCopied] = useState(false);

  /* ==========================================
     DEBOUNCE
  ========================================== */

  const debounceRef = useRef(null);

  const requestIdRef = useRef(0);

  /* ==========================================
     FORM CHANGE
  ========================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "projectName") {
      setExistingLink(null);
      setShowExistingPopup(false);
    }
  };

  /* ==========================================
     CHECK EXISTING PRESENTATION

     GET /api/url/check
  ========================================== */

  useEffect(() => {
    const { companyName, divisionName, userName, projectName } = formData;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (
      !companyName.trim() ||
      !divisionName.trim() ||
      !userName.trim() ||
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

          userName: userName.trim(),

          projectName: projectName.trim(),
        });

        const response = await fetch(`/api/url/check?${params.toString()}`, {
          method: "GET",
        });

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
          setExistingLink({
            url: `https://digilateral.com${data.url}`
          });
          setShowExistingPopup(true);
        } else {
          setExistingLink(null);
          setShowExistingPopup(false);
        }
      } catch (checkError) {
        console.error(
          "Failed to check existing presentation link:",
          checkError,
        );

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
    formData.userName,
    formData.projectName,
  ]);

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

    if (!formData.userName.trim()) {
      return "Individual name is required.";
    }

    if (!formData.projectName.trim()) {
      return "Project name is required.";
    }

    if (selectedSections.length === 0) {
      return "Please select at least one presentation section.";
    }

    if (Object.keys(selectedSlides).length === 0) {
      return "Please select at least one slide.";
    }

    if (settings.expirationType === "custom" && !settings.customExpiration) {
      return "Please select a custom expiration date.";
    }

    if (settings.expirationType === "custom") {
      const date = new Date(settings.customExpiration);

      if (Number.isNaN(date.getTime())) {
        return "Invalid expiration date.";
      }

      if (date <= new Date()) {
        return "Expiration must be in the future.";
      }
    }

    return null;
  };

  /* ==========================================
     GET COMPLETE LINK

     IMPORTANT:
     localhost:5173 will NOT be used.
  ========================================== */

  const getCompleteLink = (url) => {
    if (!url) {
      return "";
    }

    // Backend already returned a complete URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Ensure URL starts with /
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;

    // Use backend/API base URL instead of frontend origin
    return `${API_BASE_URL}${cleanUrl}`;
  };

  /* ==========================================
     SUBMIT

     POST /api/url/generate
  ========================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userName: formData.userName.trim(),

        companyName: formData.companyName.trim(),

        divisionName: formData.divisionName.trim(),

        projectName: formData.projectName.trim(),

        section: selectedSections,

        slides: selectedSlides,

        active: settings.isActive,

        expiration: settings.expirationType,

        customExpiration:
          settings.expirationType === "custom"
            ? settings.customExpiration
            : null,
      };

      console.log("CREATE PRESENTATION PAYLOAD:", payload);

      /*
        IMPORTANT:
        Existing API call remains exactly the same.
        We are NOT changing the generate endpoint.
      */

      const response = await fetch("/api/url/generate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      let data = null;

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = {
          message: await response.text(),
        };
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to generate presentation.");
      }

      console.log("PRESENTATION CREATED:", data);

      /* =====================================
         GET CREATED LINK
      ===================================== */
      console.log("d", data);
      const generatedUrl =
        data?.url ||
        // data?.link ||
        // data?.presentationUrl ||
        // data?.data?.url ||
        // data?.data?.link ||
        "";

      const completeLink = getCompleteLink(generatedUrl);

      if (!completeLink) {
        throw new Error(
          "Presentation was created, but no link was returned by the API.",
        );
      }

      /* =====================================
         SHOW SUCCESS POPUP
      ===================================== */

      setCreatedLink(completeLink);

      setCopied(false);

      setShowSuccessPopup(true);

      /* =====================================
         RESET FORM
      ===================================== */

      setFormData(initialFormData);

      setSettings(initialSettings);

      setSelectedSections([]);

      setSelectedSlides({});

      setExistingLink(null);

      setShowExistingPopup(false);
    } catch (submitError) {
      console.error("Presentation generation error:", submitError);

      setError(
        submitError.message ||
          "Something went wrong while generating the presentation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================
     CLOSE SUCCESS POPUP
  ========================================== */

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setCopied(false);
  };

  /* ==========================================
     COPY LINK
  ========================================== */

  const handleCopy = async () => {
    if (!createdLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error("Failed to copy link:", copyError);

      /*
        Fallback for browsers where
        navigator.clipboard is unavailable.
      */

      try {
        const textarea = document.createElement("textarea");

        textarea.value = createdLink;

        textarea.style.position = "fixed";

        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();

        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error("Copy fallback failed:", fallbackError);
      }
    }
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
    const fullLink = getCompleteLink(existingLink.url);
    try {
      await navigator.clipboard.writeText(fullLink);
      setExistingCopied(true);
      setTimeout(() => setExistingCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy existing link:", copyError);
      try {
        const textarea = document.createElement("textarea");
        textarea.value = fullLink;
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
    <>
      {/* ======================================
          FORM
      ====================================== */}

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
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
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* ======================================
            BASIC DETAILS
        ====================================== */}

        <section>
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-[#fff0e7]
                text-[#f47a32]
              "
            >
              <FilePlus2 size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#303238]">
                Presentation Details
              </h2>

              <p className="mt-0.5 text-xs text-[#9a9da3]">
                Enter the information used to create your presentation link.
              </p>
            </div>
          </div>

          {/* ====================================
              ROW 1
          ==================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* COMPANY */}

            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-[13px] font-semibold text-[#303238]"
              >
                Company Name
                <span className="ml-1 text-[#f47a32]">*</span>
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                disabled={submitting}
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
                className={inputClass}
              />
            </div>

            {/* DIVISION */}

            <div>
              <label
                htmlFor="divisionName"
                className="mb-2 block text-[13px] font-semibold text-[#303238]"
              >
                Division
                <span className="ml-1 text-[#f47a32]">*</span>
              </label>

              <input
                id="divisionName"
                name="divisionName"
                type="text"
                required
                disabled={submitting}
                value={formData.divisionName}
                onChange={handleChange}
                placeholder="Enter division"
                className={inputClass}
              />
            </div>
          </div>

          {/* ====================================
              ROW 2
          ==================================== */}

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* INDIVIDUAL */}

            <div>
              <label
                htmlFor="userName"
                className="mb-2 block text-[13px] font-semibold text-[#303238]"
              >
                Individual
                <span className="ml-1 text-[#f47a32]">*</span>
              </label>

              <input
                id="userName"
                name="userName"
                type="text"
                required
                disabled={submitting}
                value={formData.userName}
                onChange={handleChange}
                placeholder="Enter individual name"
                className={inputClass}
              />
            </div>

            {/* PROJECT */}

            <div>
              <label
                htmlFor="projectName"
                className="mb-2 block text-[13px] font-semibold text-[#303238]"
              >
                Project Name
                <span className="ml-1 text-[#f47a32]">*</span>
              </label>

              <div className="relative">
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  required
                  disabled={submitting}
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className={`
                    ${inputClass}
                    ${existingLink ? "border-[#e0a000] pr-10" : "pr-3.5"}
                  `}
                />

                {existingLink && (
                  <span
                    title="A presentation with this project name already exists"
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-[#d79a00]
                    "
                  >
                    <AlertTriangle size={18} />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CHECKING */}

          {checkingLink && (
            <p className="mt-3 text-xs text-[#9a9da3]">
              Checking existing presentation link...
            </p>
          )}

          {/* EXISTING LINK */}

          {existingLink && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-[#f1dfaa]
                bg-[#fffaf0]
                px-4
                py-3
              "
            >
              <AlertTriangle size={17} className="shrink-0 text-[#d79a00]" />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#55585d]">
                  Link already exists
                </p>

                <a
                  href={existingLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-0.5
                    flex
                    items-center
                    gap-1
                    truncate
                    text-xs
                    text-[#f47a32]
                    hover:underline
                  "
                >
                  <span className="truncate">{existingLink.url}</span>

                  <ExternalLink size={12} className="shrink-0" />
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ======================================
            DIVIDER
        ====================================== */}

        <div className="h-px bg-[#ececef]" />

        {/* ======================================
            SETTINGS
        ====================================== */}

        <PresentationSettings
          settings={settings}
          setSettings={setSettings}
          disabled={submitting}
        />

        {/* ======================================
            DIVIDER
        ====================================== */}

        <div className="h-px bg-[#ececef]" />

        {/* ======================================
            SECTIONS + SLIDES

            IMPORTANT:
            This component is untouched.
        ====================================== */}

        <PresentationSections
          selectedSections={selectedSections}
          setSelectedSections={setSelectedSections}
          selectedSlides={selectedSlides}
          setSelectedSlides={setSelectedSlides}
          disabled={submitting}
        />

        {/* ======================================
            SUBMIT
        ====================================== */}

        <div
          className="
            flex
            justify-end
            border-t
            border-[#ececef]
            pt-6
          "
        >
          <button
            type="submit"
            disabled={submitting}
            className="
              inline-flex
              min-w-[210px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#f47a32]
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_2px_8px_rgba(244,122,50,0.2)]
              transition
              hover:-translate-y-px
              hover:bg-[#e86d28]
              hover:shadow-[0_8px_20px_rgba(244,122,50,0.22)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FilePlus2 size={18} />
                Generate Presentation
              </>
            )}
          </button>
        </div>
      </form>

      {/* ==================================================
          SUCCESS POPUP
      ================================================== */}

      {showSuccessPopup && (
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
          onClick={closeSuccessPopup}
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
                    bg-[#f0faf2]
                    text-[#3f9149]
                  "
                >
                  <Check size={21} strokeWidth={2.5} />
                </div>

                <h2 className="text-base font-semibold text-[#303238]">
                  Your link is created
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSuccessPopup}
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
              <p className="mb-2 text-[13px] font-semibold text-[#303238]">
                Presentation Link
              </p>

              <div
                className="
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
                {/* LINK */}

                <div className="min-w-0 flex-1 px-2">
                  <p
                    className="
                      break-all
                      text-[13px]
                      leading-5
                      text-[#55585d]
                    "
                  >
                    {createdLink}
                  </p>
                </div>

                {/* COPY */}

                <button
                  type="button"
                  onClick={handleCopy}
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
                      copied
                        ? "bg-[#3f9149] hover:bg-[#34803d]"
                        : "bg-[#f47a32] hover:bg-[#e86d28]"
                    }
                  `}
                >
                  {copied ? (
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
              {/* OPEN */}
              <button
                type="button"
                onClick={() => {
                  if (createdLink) {
                    window.open(createdLink, "_blank", "noopener,noreferrer");
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
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                disabled={!createdLink}
              >
                Open
              </button>
              <br />
              <button
                type="button"
                onClick={closeSuccessPopup}
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
                  <AlertTriangle size={21} strokeWidth={2} />
                </div>

                <h2 className="text-base font-semibold text-[#303238]">
                  Link already exists
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
              <p className="mb-2 text-[13px] font-semibold text-[#303238]">
                Existing Presentation Link
              </p>

              <div
                className="
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
                {/* LINK */}

                <div className="min-w-0 flex-1 px-2">
                  <p
                    className="
                      break-all
                      text-[13px]
                      leading-5
                      text-[#55585d]
                    "
                  >
                    {getCompleteLink(existingLink.url)}
                  </p>
                </div>

                {/* COPY */}

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
              {/* OPEN */}
              <button
                type="button"
                onClick={() => {
                  const fullLink = getCompleteLink(existingLink.url);
                  if (fullLink) {
                    window.open(fullLink, "_blank", "noopener,noreferrer");
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
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                disabled={!existingLink?.url}
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

      {/* ==================================================
          COPY TOAST
      ================================================== */}

      {copied && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            z-[120]
            -translate-x-1/2
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-[#303238]
              px-4
              py-2.5
              text-xs
              font-medium
              text-white
              shadow-lg
            "
          >
            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-[#3f9149]
              "
            >
              <Check size={12} />
            </span>
            Link copied
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePresentationForm;
