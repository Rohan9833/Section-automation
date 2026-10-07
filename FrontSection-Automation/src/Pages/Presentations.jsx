import React, { useEffect, useState } from "react";

import PresentationHeader from "../Components/presentation/PresentationHeader";
import PresentationStats from "../Components/presentation/PresentationStats";
import PresentationTable from "../Components/presentation/PresentationTable";
import PresentationSettingsModal from "../Components/presentation/PresentationSettingsModal";
import Navbar from "../Components/Navbar";

const Presentations = () => {
  const [presentations, setPresentations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selected presentation for settings popup
  const [selectedPresentation, setSelectedPresentation] =
    useState(null);

  /* ==========================================
     LOAD PRESENTATIONS
  ========================================== */

  useEffect(() => {
    const loadPresentations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/presentations", {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        console.log("STATUS:", response.status);
        console.log("URL:", response.url);

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Server returned an invalid response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load presentations."
          );
        }

        let presentationList = [];

        if (Array.isArray(data)) {
          presentationList = data;
        } else if (
          Array.isArray(data.presentations)
        ) {
          presentationList = data.presentations;
        } else if (Array.isArray(data.data)) {
          presentationList = data.data;
        }

        setPresentations(presentationList);
      } catch (loadError) {
        console.error(
          "Presentation loading error:",
          loadError
        );

        setError(
          loadError.message ||
            "Failed to load presentations."
        );

        setPresentations([]);
      } finally {
        setLoading(false);
      }
    };

    loadPresentations();
  }, []);

  /* ==========================================
     STATS
  ========================================== */

  const totalLinks = presentations.length;

  const viewedLinks = presentations.filter(
    (presentation) =>
      Boolean(presentation.lastSeenAt)
  ).length;

  const neverViewedLinks =
    totalLinks - viewedLinks;

  /* ==========================================
     OPEN SETTINGS
  ========================================== */

  const handleSettings = (presentation) => {
    console.log(
      "Opening presentation settings:",
      presentation
    );

    setSelectedPresentation(presentation);
  };

  /* ==========================================
     SAVE SETTINGS
  ========================================== */

  const handleSaved = (updatedPresentation) => {
    console.log(
      "Updated presentation:",
      updatedPresentation
    );

    setPresentations((previous) =>
      previous.map((presentation) =>
        String(presentation._id) ===
        String(updatedPresentation._id)
          ? updatedPresentation
          : presentation
      )
    );

    setSelectedPresentation(null);
  };

  /* ==========================================
     CLOSE SETTINGS
  ========================================== */

  const handleCloseSettings = () => {
    setSelectedPresentation(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#303238]">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <Navbar />

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-[1280px] px-6 py-9">

        {/* HEADER */}

        <PresentationHeader />

        {/* ====================================
            STATS
        ==================================== */}

        <PresentationStats
          totalLinks={totalLinks}
          viewedLinks={viewedLinks}
          neverViewedLinks={neverViewedLinks}
        />

        {/* ====================================
            TABLE
        ==================================== */}

        {loading ? (
          <div className="rounded-xl border border-[#ececef] bg-white p-12 text-center">
            <div className="text-sm font-medium text-[#777b82]">
              Loading presentations...
            </div>

            <div className="mt-1 text-xs text-[#9a9da3]">
              Please wait while we fetch your presentation links.
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#fcd8d4] bg-[#fef2f0] p-6 text-center">
            <p className="text-sm font-semibold text-[#b33a2e]">
              Failed to load presentations
            </p>

            <p className="mt-1 text-xs text-[#b33a2e]/80">
              {error}
            </p>
          </div>
        ) : (
          <PresentationTable
            presentations={presentations}
            onSettings={handleSettings}
          />
        )}
      </main>

      {/* ======================================
          PRESENTATION SETTINGS POPUP
      ====================================== */}

      {selectedPresentation && (
        <PresentationSettingsModal
          presentation={selectedPresentation}
          onClose={handleCloseSettings}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Presentations;