import React, { useEffect, useState } from "react";

import {
  Search,
  Globe,
  Copy,
  Settings,
  Download,
  CheckCircle2,
  XCircle,
  Video,
} from "lucide-react";

import PresentationSettingsVideoModal from "./PresentationSettingsVideoModal";

const BACKEND_BASE_URL = "https://digi-ppt.digilateral.com";
const BACKEND_BASE_URL_zip = "https://digilateral.com";

const API_BASE_URL = `${BACKEND_BASE_URL}/api`;

const PresentationTable = ({ presentations = [], onSettings }) => {
  /* ==========================================
     ACTIVE TAB
  ========================================== */

  const [activeTab, setActiveTab] = useState("links");
  const [VIDEO_URL, setVIDEO_URL] = useState("links");


  /* ==========================================
     SEARCH
  ========================================== */

  const [search, setSearch] = useState("");

  /* ==========================================
     ZIP STATE
  ========================================== */

  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");
  const [zipData, setZipData] = useState([]);
  const [zipLoaded, setZipLoaded] = useState(false);

  /* ==========================================
     VIDEO STATE
  ========================================== */

  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoData, setVideoData] = useState([]);
  const [videoLoaded, setVideoLoaded] = useState(false);

  /* ==========================================
     VIDEO SETTINGS POPUP STATE
  ========================================== */

  const [settingsVideo, setSettingsVideo] = useState(null);

  /* ==========================================
     COPY TOAST
  ========================================== */

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };



  /* ==========================================
     CREATE PRESENTATION FULL URL
  ========================================== */

  const getFullUrl = (url) => {
    if (!url) {
      return "";
    }

    const path = url.replace("https://digi-ppt.digilateral.com", "");

    return `https://digilateral.com${path}`;
  };

  /* ==========================================
     CREATE ZIP URL
  ========================================== */

  const getZipUrl = (zip) => {
    if (!zip) {
      return "";
    }

    const company = encodeURIComponent(zip.companyName || "");
    const division = encodeURIComponent(zip.divisionName || "");
    const individual = encodeURIComponent(zip.individualName || "");
    const project = encodeURIComponent(zip.projectName || "");

    return (
      `${BACKEND_BASE_URL_zip}/zip/` +
      `${company}/${division}/${individual}/${project}`
    );
  };

  /* ==========================================
     CREATE VIDEO URL
  ========================================== */

  const getVideoUrl = (video) => {
    if (!video?.url) {
      return "";
    }

    const url = video.url.trim();

    // Convert digi-ppt domain to the public domain
    if (url.startsWith("https://digi-ppt.digilateral.com")) {
      return url.replace(
        "https://digi-ppt.digilateral.com",
        "https://digilateral.com",
      );
    }

    // Other full URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Relative URL
    return `https://digilateral.com${url.startsWith("/") ? "" : "/"}${url}`;
  };

  /* ==========================================
     COPY PRESENTATION LINK
  ========================================== */

  const copyLink = async (url) => {
    const fullUrl = getFullUrl(url);

    if (!fullUrl) {
      showToast("Link not available.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast("Link copied successfully!", "success");
    } catch (error) {
      console.error("Copy failed:", error);
      showToast("Failed to copy link.", "error");
    }
  };

  /* ==========================================
     COPY ZIP LINK
  ========================================== */

  const copyZipLink = async (zip) => {
    const zipUrl = getZipUrl(zip);

    if (!zipUrl) {
      showToast("ZIP link not available.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(zipUrl);
      showToast("ZIP link copied successfully!", "success");
    } catch (error) {
      console.error("ZIP copy failed:", error);
      showToast("Failed to copy ZIP link.", "error");
    }
  };

  /* ==========================================
     COPY VIDEO LINK
  ========================================== */

  const copyVideoLink = async (video) => {
    const videoUrl = getVideoUrl(video);

    if (!videoUrl) {
      showToast("Video link not available.", "error");
      return;
    }

    console.log("Copying URL:", videoUrl);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(videoUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = videoUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      showToast("Link copied successfully!", "success");
    } catch (error) {
      console.error("Video link copy failed:", error);
      showToast("Failed to copy video link.", "error");
    }
  };

  /* ==========================================
     SEARCH QUERY
  ========================================== */

  const query = search.toLowerCase().trim();

  /* ==========================================
     FILTER PRESENTATIONS
  ========================================== */

  const filteredPresentations = presentations.filter((presentation) => {
    if (!query) {
      return true;
    }

    return [
      presentation.projectName,
      presentation.companyName,
      presentation.divisionName,
      presentation.userName,
      presentation.individualName,
      presentation.viewUrl,
      presentation.url,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  /* ==========================================
     LOAD ZIP DASHBOARD
  ========================================== */

  const loadZipDashboard = async () => {
    if (zipLoaded) {
      return;
    }

    try {
      setZipLoading(true);
      setZipError("");

      const response = await fetch(`${API_BASE_URL}/zip/dashboard`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load ZIP files.");
      }

      if (!data.success || !Array.isArray(data.fileShares)) {
        throw new Error("Invalid ZIP dashboard response.");
      }

      setZipData(data.fileShares);
      setZipLoaded(true);
    } catch (error) {
      console.error("ZIP DASHBOARD ERROR:", error);
      setZipError(error.message || "Failed to load ZIP files.");
    } finally {
      setZipLoading(false);
    }
  };

  /* ==========================================
     LOAD VIDEO LINKS
  ========================================== */

  const loadVideoLinks = async () => {
    if (videoLoaded) {
      return;
    }

    try {
      setVideoLoading(true);
      setVideoError("");

      const response = await fetch(`${API_BASE_URL}/video-links`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      let data;

      try {
        data = await response.json();
        console.log("video data ", data);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load video links.");
      }

      if (!data.success || !Array.isArray(data.videoLinks)) {
        throw new Error("Invalid video links response.");
      }

      setVideoData(data.videoLinks);
      setVideoLoaded(true);
    } catch (error) {
      console.error("VIDEO LINKS ERROR:", error);
      setVideoError(error.message || "Failed to load video links.");
    } finally {
      setVideoLoading(false);
    }
  };

  /* ==========================================
     TAB SWITCH
  ========================================== */

  const switchTab = (type) => {
    setActiveTab(type);

    /*
     * Clear search when changing tab.
     */
    setSearch("");

    if (type === "zips") {
      loadZipDashboard();
    }

    if (type === "videos") {
      loadVideoLinks();
    }
  };

  /* ==========================================
     FILTER ZIPs
  ========================================== */

  const filteredZips = zipData.filter((zip) => {
    if (!query) {
      return true;
    }

    return [
      zip.companyName,
      zip.divisionName,
      zip.individualName,
      zip.projectName,
      zip.zipFileName,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  /* ==========================================
     FILTER VIDEOS
  ========================================== */

  const filteredVideos = videoData.filter((video) => {
    if (!query) {
      return true;
    }

    return [video.productName, video.productSlug, video.url].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query),
    );
  });

  /* ==========================================
     FORMAT DATE
  ========================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Never";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Never";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ==========================================
     OPEN SETTINGS POPUP
  ========================================== */

  const openSettings = (video) => {
    setSettingsVideo(video);
  };

  /* ==========================================
     CLOSE SETTINGS POPUP
  ========================================== */

  const closeSettings = () => {
    setSettingsVideo(null);
  };

  /* ==========================================
     HANDLE VIDEO SAVED
  ========================================== */

  const handleVideoSaved = (updatedVideo) => {
    setVideoData((prev) =>
      prev.map((video) =>
        video._id === updatedVideo.id
          ? {
            ...video,
            active: updatedVideo.active,
            expiresAt: updatedVideo.expiresAt,
          }
          : video,
      ),
    );

    setSettingsVideo(null);
  };

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[14px]
        border
        border-[#ececef]
        bg-white
        shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_24px_rgba(0,0,0,0.035)]
      "
    >
      {/* ======================================
          COPY TOAST
      ====================================== */}

      {toast && (
        <div
          className="
            fixed
            right-5
            top-5
            z-[9999]
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-[#d8eadb]
            bg-white
            px-3.5
            py-2.5
            text-[13px]
            font-medium
            text-[#303238]
            shadow-[0_8px_25px_rgba(0,0,0,0.12)]
          "
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 text-[#2e7d32]" />
          ) : (
            <XCircle size={16} className="shrink-0 text-[#dc3545]" />
          )}

          <span>{toast.message}</span>
        </div>
      )}

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="px-5 pt-5">
        <div className="relative">
          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-[#9a9da3]
            "
          />

          <input
            type="text"
            placeholder={
              activeTab === "links"
                ? "Search presentations..."
                : activeTab === "zips"
                  ? "Search ZIP files..."
                  : "Search video links..."
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="
              h-11
              w-full
              rounded-[11px]
              border
              border-[#d5d7db]
              bg-white
              pl-[46px]
              pr-4
              text-sm
              text-[#303238]
              outline-none
              transition
              placeholder:text-[#9a9da3]
              hover:border-[#c5c8cd]
              focus:border-[#f47a32]
              focus:ring-4
              focus:ring-[#f47a32]/10
            "
          />
        </div>
      </div>

      {/* ======================================
          THREE TAB TOGGLE
      ====================================== */}

      <div className="mt-5 flex items-center justify-between border-b border-[#ececef] bg-white px-5 py-4">
        <div
          className="
            inline-flex
            items-center
            gap-[3px]
            rounded-[10px]
            border
            border-[#ececef]
            bg-[#f5f6f8]
            p-2
          "
        >
          {/* PRESENTATIONS */}

          <button
            type="button"
            onClick={() => switchTab("links")}
            className={`
              rounded-[7px]
              px-[18px]
              py-2
              text-[13px]
              transition
              ${activeTab === "links"
                ? "bg-[#f47a32] font-semibold text-white"
                : "bg-transparent font-medium text-[#777b82] hover:bg-white"
              }
            `}
          >
            Presentations
          </button>

          {/* ZIPS */}

          <button
            type="button"
            onClick={() => switchTab("zips")}
            className={`
              rounded-[7px]
              px-[18px]
              py-2
              text-[13px]
              transition
              ${activeTab === "zips"
                ? "bg-[#f47a32] font-semibold text-white"
                : "bg-transparent font-medium text-[#777b82] hover:bg-white"
              }
            `}
          >
            ZIPs
          </button>

          {/* VIDEOS */}

          <button
            type="button"
            onClick={() => switchTab("videos")}
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-[7px]
              px-[18px]
              py-2
              text-[13px]
              transition
              ${activeTab === "videos"
                ? "bg-[#f47a32] font-semibold text-white"
                : "bg-transparent font-medium text-[#777b82] hover:bg-white"
              }
            `}
          >
            <Video size={14} />
            Videos
          </button>
        </div>
      </div>

      {/* ======================================
          PRESENTATIONS TABLE
      ====================================== */}

      {activeTab === "links" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-sm">
            <thead>
              <tr>
                {[
                  "Link",
                  "Created",
                  "Last Viewed",
                  "View Count",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`
                      border-b
                      border-[#ececef]
                      bg-[#fafafa]
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.7px]
                      text-[#8b8f96]
                      ${heading === "Actions" ? "text-right" : ""}
                    `}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredPresentations.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="
                      px-6
                      py-12
                      text-center
                      text-[13px]
                      text-[#9a9da3]
                    "
                  >
                    {presentations.length === 0
                      ? "No presentations found."
                      : "No presentations match your search."}
                  </td>
                </tr>
              ) : (
                filteredPresentations.map((presentation) => {
                  const isExpired =
                    presentation.expiresAt &&
                    new Date(presentation.expiresAt) < new Date();

                  const fullUrl = getFullUrl(
                    presentation.viewUrl || presentation.url,
                  );

                  return (
                    <tr
                      key={presentation._id}
                      className="
                          border-b
                          border-[#f0f0f2]
                          transition
                          hover:bg-[#fafbfc]
                        "
                    >
                      {/* LINK */}

                      <td className="px-5 py-[18px]">
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                              flex
                              max-w-[320px]
                              items-center
                              gap-2
                              text-[13px]
                              font-medium
                              text-[#303238]
                              hover:text-[#f47a32]
                            "
                        >
                          <Globe
                            size={17}
                            className="shrink-0 text-[#f47a32]"
                          />

                          <span className="truncate">
                            {fullUrl || "Link unavailable"}
                          </span>
                        </a>
                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {formatDate(presentation.createdAt)}
                      </td>

                      {/* LAST VIEWED */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {formatDate(presentation.lastSeenAt)}
                      </td>

                      {/* VIEW COUNT */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {presentation.viewCount ?? 0}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-[18px]">
                        {isExpired ? (
                          <StatusBadge type="expired">Expired</StatusBadge>
                        ) : presentation.active ? (
                          <StatusBadge type="active">Active</StatusBadge>
                        ) : (
                          <StatusBadge type="inactive">Inactive</StatusBadge>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-[18px]">
                        <div className="flex justify-end gap-2">
                          {/* VISIT button - must stay exactly as is */}
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Visit"
                            className="
                                flex
                                h-[34px]
                                w-[34px]
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-[#d5d7db]
                                text-[#55585d]
                                transition
                                hover:border-[#f47a32]
                                hover:text-[#f47a32]
                              "
                          >
                            <Globe size={18} />
                          </a>

                          <button
                            type="button"
                            title="Copy"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(fullUrl);
                                showToast(
                                  "Link copied successfully!",
                                  "success",
                                );
                              } catch (error) {
                                console.error("Copy failed:", error);
                                showToast("Failed to copy link.", "error");
                              }
                            }}
                            className="
                                flex
                                h-[34px]
                                w-[34px]
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-[#d5d7db]
                                text-[#55585d]
                                transition
                                hover:border-[#f47a32]
                                hover:text-[#f47a32]
                              "
                          >
                            <Copy size={18} />
                          </button>

                          <button
                            type="button"
                            title="Settings"
                            onClick={() => onSettings?.(presentation)}
                            className="
                                flex
                                h-[34px]
                                w-[34px]
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-[#d5d7db]
                                text-[#55585d]
                                transition
                                hover:border-[#f47a32]
                                hover:text-[#f47a32]
                              "
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          ZIP TABLE
      ====================================== */}

      {activeTab === "zips" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-sm">
            <thead>
              <tr>
                {[
                  "Link",
                  "Created",
                  "Last Downloaded",
                  "Download Count",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`
                      border-b
                      border-[#ececef]
                      bg-[#fafafa]
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.7px]
                      text-[#8b8f96]
                      ${heading === "Actions" ? "text-right" : ""}
                    `}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {zipLoading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-[13px] text-[#9a9da3]"
                  >
                    Loading ZIP files...
                  </td>
                </tr>
              )}

              {zipError && !zipLoading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-[13px] text-[#dc3545]"
                  >
                    {zipError}
                  </td>
                </tr>
              )}

              {!zipLoading && !zipError && filteredZips.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-[13px] text-[#9a9da3]"
                  >
                    {zipData.length === 0
                      ? "No ZIP files found."
                      : "No ZIP files match your search."}
                  </td>
                </tr>
              )}

              {!zipLoading &&
                !zipError &&
                filteredZips.map((zip) => {
                  const zipUrl = getZipUrl(zip);
                  const isExpired =
                    zip.expiresAt && new Date(zip.expiresAt) < new Date();

                  return (
                    <tr
                      key={zip._id}
                      className="
                        border-b
                        border-[#f0f0f2]
                        transition
                        hover:bg-[#fafbfc]
                      "
                    >
                      {/* LINK */}

                      <td className="px-5 py-[18px]">
                        <a
                          href={zipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            flex
                            max-w-[320px]
                            items-center
                            gap-2
                            text-[13px]
                            font-medium
                            text-[#303238]
                            hover:text-[#f47a32]
                          "
                        >
                          <Download
                            size={17}
                            className="shrink-0 text-[#f47a32]"
                          />

                          <span className="truncate">
                            {zipUrl || "Link unavailable"}
                          </span>
                        </a>
                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {formatDate(zip.createdAt)}
                      </td>

                      {/* LAST DOWNLOADED */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {formatDate(zip.lastDownloadedAt)}
                      </td>

                      {/* DOWNLOAD COUNT */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {zip.downloadCount ?? 0}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-[18px]">
                        {isExpired ? (
                          <StatusBadge type="expired">Expired</StatusBadge>
                        ) : zip.active ? (
                          <StatusBadge type="active">Active</StatusBadge>
                        ) : (
                          <StatusBadge type="inactive">Inactive</StatusBadge>
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-[18px]">
                        <div className="flex justify-end gap-2">
                          <a
                            href={zipUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open ZIP"
                            className="
                              flex
                              h-[34px]
                              w-[34px]
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#d5d7db]
                              text-[#55585d]
                              transition
                              hover:border-[#f47a32]
                              hover:text-[#f47a32]
                            "
                          >
                            <Download size={18} />
                          </a>

                          <button
                            type="button"
                            title="Copy ZIP link"
                            onClick={() => copyZipLink(zip)}
                            className="
                              flex
                              h-[34px]
                              w-[34px]
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#d5d7db]
                              text-[#55585d]
                              transition
                              hover:border-[#f47a32]
                              hover:text-[#f47a32]
                            "
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          VIDEO TABLE
      ====================================== */}
      {activeTab === "videos" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-sm">
            <thead>
              <tr>
                {[
                  "Links",
                  "Products",
                  "Created",
                  "Last Viewed",
                  "View Count",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`
                border-b
                border-[#ececef]
                bg-[#fafafa]
                px-5
                py-3.5
                text-left
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.7px]
                text-[#8b8f96]
                ${heading === "Actions" ? "text-right" : ""}
              `}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* ======================================
            LOADING
        ====================================== */}

              {videoLoading && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-[13px] text-[#9a9da3]">
                      <span
                        className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-[#e5e7eb]
                    border-t-[#f47a32]
                  "
                      />
                      Loading video links...
                    </div>
                  </td>
                </tr>
              )}

              {/* ======================================
            ERROR
        ====================================== */}

              {videoError && !videoLoading && (
                <tr>
                  <td
                    colSpan="7"
                    className="
                px-6
                py-12
                text-center
                text-[13px]
                text-[#dc3545]
              "
                  >
                    {videoError}
                  </td>
                </tr>
              )}

              {/* ======================================
            EMPTY
        ====================================== */}

              {!videoLoading && !videoError && filteredVideos.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="
                  px-6
                  py-12
                  text-center
                  text-[13px]
                  text-[#9a9da3]
                "
                  >
                    {videoData.length === 0
                      ? "No video links found."
                      : "No video links match your search."}
                  </td>
                </tr>
              )}

              {/* ======================================
            DATA
        ====================================== */}

              {!videoLoading &&
                !videoError &&
                filteredVideos.map((video) => {
                  const videoUrl = getVideoUrl(video);

                  const isExpired =
                    video.expiresAt && new Date(video.expiresAt) < new Date();

                  return (
                    <tr
                      key={video._id}
                      className="
                  border-b
                  border-[#f0f0f2]
                  transition
                  hover:bg-[#fafbfc]
                "
                    >
                      {/* ==================================
                    LINKS
                ================================== */}

                      <td className="px-5 py-[18px]">
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="
                      flex
                      max-w-[320px]
                      items-center
                      gap-2
                      text-[13px]
                      font-medium
                      text-[#303238]
                      hover:text-[#f47a32]
                    "
                        >
                          <Video
                            size={17}
                            className="shrink-0 text-[#f47a32]"
                          />

                          <span className="truncate">
                            {videoUrl || "Link unavailable"}
                          </span>
                        </a>
                      </td>

                      {/* ==================================
                    PRODUCTS
                ================================== */}

                      <td className="px-5 py-[18px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#303238]">
                            {video.productName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* ==================================
                    CREATED
                ================================== */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {formatDate(video.createdAt)}
                      </td>

                      {/* ==================================
                    LAST VIEWED
                ================================== */}

                      <td className="px-5 py-[18px] text-[12px] text-[#777b82]">
                        {video.lastSeenAt
                          ? formatDate(video.lastSeenAt)
                          : "Never"}
                      </td>

                      {/* ==================================
                    VIEW COUNT
                ================================== */}

                      <td className="px-5 py-[18px]">
                        <span
                          className="
                      inline-flex
                      min-w-[32px]
                      items-center
                      justify-center
                      rounded-md
                      bg-[#f5f6f8]
                      px-2
                      py-1
                      text-[12px]
                      font-semibold
                      text-[#55585d]
                    "
                        >
                          {video.viewCount ?? 0}
                        </span>
                      </td>

                      {/* ==================================
                    STATUS
                ================================== */}

                      <td className="px-5 py-[18px]">
                        {isExpired ? (
                          <StatusBadge type="expired">Expired</StatusBadge>
                        ) : video.active ? (
                          <StatusBadge type="active">Active</StatusBadge>
                        ) : (
                          <StatusBadge type="inactive">Inactive</StatusBadge>
                        )}
                      </td>

                      {/* ==================================
                    ACTIONS
                ================================== */}

                      <td className="px-5 py-[18px]">
                        <div className="flex justify-end gap-2">
                          {/* VISIT */}

                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Visit"
                            className="
                                flex
                                h-[34px]
                                w-[34px]
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-[#d5d7db]
                                text-[#55585d]
                                transition
                                hover:border-[#f47a32]
                                hover:text-[#f47a32]
                              "
                          >
                            <Globe size={18} />
                          </a>


                          {/* COPY */}


                          <button
                            type="button"
                            title="Copy video link"
                            onClick={() => copyVideoLink(video)}
                            className="
                        flex
                        h-[34px]
                        w-[34px]
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#d5d7db]
                        text-[#55585d]
                        transition
                        hover:border-[#f47a32]
                        hover:text-[#f47a32]
                      "
                          >
                            <Copy size={18} />
                          </button>

                          {/* SETTINGS */}

                          <button
                            type="button"
                            title="Settings"
                            onClick={() => openSettings(video)}
                            className="
                        flex
                        h-[34px]
                        w-[34px]
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[#d5d7db]
                        text-[#55585d]
                        transition
                        hover:border-[#f47a32]
                        hover:text-[#f47a32]
                      "
                          >
                            <Settings size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          VIDEO SETTINGS MODAL
      ====================================== */}

      {settingsVideo && (
        <PresentationSettingsVideoModal
          video={settingsVideo}
          onClose={closeSettings}
          onSaved={handleVideoSaved}
        />
      )}
    </div>
  );
};

/* ==========================================
   STATUS BADGE
========================================== */

const StatusBadge = ({ type, children }) => {
  const styles = {
    active: "bg-[#eef8f0] text-[#287a32]",
    inactive: "bg-[#fef2f0] text-[#b33a2e]",
    expired: "bg-[#fff3eb] text-[#d97706]",
  };

  return (
    <span
      className={`
        inline-flex
        h-7
        items-center
        gap-1.5
        rounded-lg
        px-2.5
        text-[11px]
        font-semibold
        ${styles[type] || styles.active}
      `}
    >
      {(type === "active" || type === "expired") && (
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${type === "active" ? "animate-pulse bg-[#2e7d32]" : "bg-[#d97706]"}
          `}
        />
      )}

      {children}
    </span>
  );
};

export default PresentationTable;
