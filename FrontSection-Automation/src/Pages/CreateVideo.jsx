import { useState } from "react";
import VideoForm from "../Components/Create-Video/VideoForm";
import ProductDropdown from "../Components/Create-Video/ProductDropdown";
import PresentationSettings from "../Components/Create-Video/PresentationSettings";
import Navbar from "../Components/Navbar";

const API_BASE_URL = "https://digi-ppt.digilateral.com/api";
const VIDEO_BASE_URL = "https://digilateral.com";

const CreateVideo = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    divisionName: "",
    individualName: "",
    projectName: "",
    productSlug: "",
    active: true,
    expiration: "no-expiration",
  });

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  // =========================
  // HANDLE FORM CHANGE
  // =========================

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // BUILD COMPLETE VIDEO URL
  // =========================

  const getVideoUrl = (url) => {
    if (!url) {
      return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      // If backend accidentally returns the API domain,
      // convert it to the public video domain.
      return url.replace(
        "https://digi-ppt.digilateral.com",
        VIDEO_BASE_URL,
      );
    }

    const cleanUrl = url.startsWith("/") ? url : `/${url}`;

    return `${VIDEO_BASE_URL}${cleanUrl}`;
  };

  // =========================
  // SUBMIT FORM
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.companyName.trim() ||
      !formData.divisionName.trim() ||
      !formData.individualName.trim() ||
      !formData.projectName.trim() ||
      !formData.productSlug
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setApiResponse(null);
      setCopied(false);

      const response = await fetch(`${API_BASE_URL}/video-products/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log("Generate Video Response:", result);

      // =====================================================
      // EXISTING LINK
      // =====================================================

      if (
        result?.success === false &&
        result?.message === "This video link already exists"
      ) {
        setApiResponse({
          ...result,
          fullUrl: getVideoUrl(result?.url),
        });

        setShowPopup(true);

        return;
      }

      // =====================================================
      // OTHER API ERRORS
      // =====================================================

      if (!response.ok) {
        throw new Error(result?.message || "Failed to generate video");
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      const completeVideoUrl = getVideoUrl(result?.url);

      console.log("Complete Video URL:", completeVideoUrl);

      setApiResponse({
        ...result,
        fullUrl: completeVideoUrl,
      });

      setShowPopup(true);
    } catch (error) {
      console.error("Generate video error:", error);

      setApiResponse({
        success: false,
        message: error.message || "Something went wrong",
      });

      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLOSE POPUP
  // =========================

  const closePopup = () => {
    setShowPopup(false);
    setCopied(false);
  };

  // =========================
  // COPY VIDEO URL
  // =========================

  const handleCopy = async (link = null) => {
    const urlToCopy = link || apiResponse?.fullUrl || getVideoUrl(apiResponse?.url);

    if (!urlToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy URL error:", error);
    }
  };

  // =========================
  // CHECK IF DUPLICATE LINK
  // =========================

  const isExistingLink =
    apiResponse?.success === false &&
    apiResponse?.message === "This video link already exists" &&
    apiResponse?.url;

  return (
    <>
      <Navbar />

      {/* =====================================================
          MAIN PAGE
      ===================================================== */}

      <div className="min-h-[calc(100vh-64px)] w-full bg-gray-50 px-5 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center gap-4 border-b border-gray-200 px-7 py-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <span className="text-xl">🎥</span>
              </div>

              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Create Video
                </h1>

                <p className="mt-1 text-xs text-gray-500">
                  Add the required details and select a product to create a
                  video.
                </p>
              </div>
            </div>

            {/* =====================================================
                FORM
            ===================================================== */}

            <form onSubmit={handleSubmit} className="px-7 py-7">
              <VideoForm
                formData={formData}
                handleChange={handleChange}
              />

              <ProductDropdown
                value={formData.productSlug}
                onChange={(value) =>
                  handleChange("productSlug", value)
                }
              />

              <div className="my-7 h-px bg-gray-200" />

              <PresentationSettings
                linkStatus={formData.active}
                expiration={formData.expiration}
                onLinkStatusChange={(value) =>
                  handleChange("active", value)
                }
                onExpirationChange={(value) =>
                  handleChange("expiration", value)
                }
              />

              {/* =====================================================
                  SUBMIT BUTTON
              ===================================================== */}

              <div className="mt-7 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 min-w-[160px] items-center justify-center gap-2.5 rounded-lg bg-orange-500 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Generating Video...
                    </>
                  ) : (
                    "Generate Video"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* =====================================================
          EXISTING LINK POPUP
      ===================================================== */}

      {showPopup && isExistingLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]"
          onClick={closePopup}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                  <span className="text-lg text-orange-500">
                    🔗
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Link Already Exists
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    This video link has already been created.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePopup}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* =====================================================
                BODY
            ===================================================== */}

            <div className="px-6 py-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Existing Video Link
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                <div className="min-w-0 flex-1 px-2">
                  <p className="break-all text-sm leading-6 text-gray-600">
                    {apiResponse.fullUrl}
                  </p>
                </div>

                {/* COPY */}

                <button
                  type="button"
                  onClick={() => handleCopy(apiResponse.fullUrl)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-white transition ${copied
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-500 hover:bg-orange-600"
                    }`}
                >
                  {copied ? (
                    <>
                      <span>✓</span>
                      Copied
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-5">
              {/* OPEN EXISTING VIDEO */}

              <a
                href={apiResponse.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Open
              </a>

              {/* CLOSE */}

              <button
                type="button"
                onClick={closePopup}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS / ERROR POPUP
      ===================================================== */}

      {showPopup && !isExistingLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]"
          onClick={closePopup}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* =====================================================
                POPUP HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-gray-200 px-7 py-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${apiResponse?.success
                    ? "bg-green-50"
                    : "bg-red-50"
                    }`}
                >
                  <span
                    className={`text-xl font-semibold ${apiResponse?.success
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {apiResponse?.success ? "✓" : "!"}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {apiResponse?.success
                      ? "Video Generated Successfully"
                      : "Video Generation Failed"}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {apiResponse?.success
                      ? "Your video is ready to view."
                      : "Something went wrong while generating the video."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePopup}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* =====================================================
                POPUP BODY
            ===================================================== */}

            <div className="max-h-[70vh] overflow-y-auto px-7 py-6">

              {/* =====================================================
                  SUCCESS
              ===================================================== */}

              {apiResponse?.success ? (
                <div>

                  {/* VIDEO PLACEHOLDER */}

                  <div className="mb-6 flex h-52 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                        <span className="text-2xl">🎥</span>
                      </div>

                      <p className="text-sm font-semibold text-gray-700">
                        Video Generated
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Your video is ready to view.
                      </p>
                    </div>
                  </div>

                  {/* VIDEO LINK */}

                  {apiResponse?.url && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-800">
                        Video Link
                      </p>

                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                        <div className="min-w-0 flex-1 px-2">
                          <p className="break-all text-sm leading-6 text-gray-600">
                            {apiResponse.fullUrl}
                          </p>
                        </div>

                        {/* COPY */}

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(apiResponse.fullUrl)
                          }
                          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-white transition ${copied
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-orange-500 hover:bg-orange-600"
                            }`}
                        >
                          {copied ? (
                            <>
                              <span>✓</span>
                              Copied
                            </>
                          ) : (
                            "Copy"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* =====================================================
                    GENERIC ERROR
                ===================================================== */

                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-600">
                      !
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-red-800">
                        Unable to generate video
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {apiResponse?.message ||
                          "Something went wrong while generating the video."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =====================================================
                POPUP FOOTER
            ===================================================== */}

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-7 py-5">

              {/* OPEN VIDEO */}

              {apiResponse?.success &&
                apiResponse?.fullUrl && (
                  <a
                    href={apiResponse.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    Open Video
                  </a>
                )}

              {/* CLOSE */}

              <button
                type="button"
                onClick={closePopup}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          COPY TOAST
      ===================================================== */}

      {copied && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs">
              ✓
            </span>

            Link copied successfully
          </div>
        </div>
      )}
    </>
  );
};

export default CreateVideo;