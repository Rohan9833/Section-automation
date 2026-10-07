import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

const PresentationSettingsModal = ({ presentation, onClose, onSaved }) => {
  const BACKEND_URL = "http://localhost:2405";
  const [active, setActive] = useState(true);

  const [expiration, setExpiration] = useState("never");

  const [customDate, setCustomDate] = useState("");

  const [saving, setSaving] = useState(false);

  /* ==========================================
     LOAD EXISTING SETTINGS
  ========================================== */

  useEffect(() => {
    if (!presentation) {
      return;
    }

    /*
     * Support different possible backend field names.
     */

    const existingActive = presentation.active ?? presentation.isActive ?? true;

    setActive(Boolean(existingActive));

    /*
     * If backend already has expiresAt,
     * try to determine the expiration option.
     */

    if (!presentation.expiresAt) {
      setExpiration("never");
      setCustomDate("");
      return;
    }

    const expiresAt = new Date(presentation.expiresAt);

    if (Number.isNaN(expiresAt.getTime())) {
      setExpiration("never");
      setCustomDate("");
      return;
    }

    setExpiration("custom");

    /*
     * Convert date to datetime-local format.
     */

    const year = expiresAt.getFullYear();

    const month = String(expiresAt.getMonth() + 1).padStart(2, "0");

    const day = String(expiresAt.getDate()).padStart(2, "0");

    const hours = String(expiresAt.getHours()).padStart(2, "0");

    const minutes = String(expiresAt.getMinutes()).padStart(2, "0");

    setCustomDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, [presentation]);

  /* ==========================================
     SAVE SETTINGS
  ========================================== */

  const handleSave = async (e) => {
    e.preventDefault();

    if (!presentation) {
      return;
    }

    setSaving(true);

    try {
      let expiresAt = null;

      /* ================================
       EXPIRATION
    ================================= */

      if (expiration === "1d") {
        const date = new Date();

        date.setDate(date.getDate() + 1);

        expiresAt = date.toISOString();
      }

      if (expiration === "7d") {
        const date = new Date();

        date.setDate(date.getDate() + 7);

        expiresAt = date.toISOString();
      }

      if (expiration === "30d") {
        const date = new Date();

        date.setDate(date.getDate() + 30);

        expiresAt = date.toISOString();
      }

      if (expiration === "90d") {
        const date = new Date();

        date.setDate(date.getDate() + 90);

        expiresAt = date.toISOString();
      }

      if (expiration === "custom") {
        if (!customDate) {
          alert("Please select a custom expiration date.");

          setSaving(false);

          return;
        }

        expiresAt = new Date(customDate).toISOString();
      }

      /* =================================
       SAVE SETTINGS API
    ================================= */

      const response = await fetch(
        `${BACKEND_URL}/api/presentations/${presentation._id}/settings`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            isActive: active,
            expirationType: expiration,
            expiresAt,
          }),
        },
      );

      /* =================================
       RESPONSE
    ================================= */

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save presentation settings.",
        );
      }

      /* =================================
       SUCCESS
    ================================= */

      onSaved?.(data.presentation || data.data || data);
    } catch (error) {
      console.error("Settings save error:", error);

      alert(error.message || "Failed to save presentation settings.");
    } finally {
      setSaving(false);
    }
  };
  /* ==========================================
     NO PRESENTATION
  ========================================== */

  if (!presentation) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-black/40
        px-4
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      {/* ======================================
          MODAL
      ====================================== */}

      <div
        className="
          w-full
          max-w-[560px]
          rounded-[18px]
          border
          border-[#ececef]
          bg-white
          p-8
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          animate-[settingsModalEnter_0.18s_ease-out]
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* ====================================
            HEADER
        ==================================== */}

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[21px] font-semibold text-[#303238]">
              Presentation Settings
            </h2>

            <p className="mt-1 text-sm text-[#777b82]">
              Configure link status and expiration.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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
            <X size={21} />
          </button>
        </div>

        {/* ====================================
            FORM
        ==================================== */}

        <form onSubmit={handleSave} className="mt-7">
          {/* ==================================
              LINK STATUS
          ================================== */}

          <div className="mb-7">
            <label className="mb-2 block text-[13px] font-semibold text-[#303238]">
              Link Status
            </label>

            <button
              type="button"
              onClick={() => setActive(!active)}
              className="flex items-center gap-3"
            >
              {/* Toggle */}

              <div
                className={`
                  relative
                  h-6
                  w-11
                  rounded-full
                  transition-colors
                  duration-200
                  ${active ? "bg-[#f47a32]" : "bg-[#d5d7db]"}
                `}
              >
                <div
                  className={`
                    absolute
                    top-[3px]
                    h-[18px]
                    w-[18px]
                    rounded-full
                    bg-white
                    shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                    transition-all
                    duration-200
                    ${active ? "left-[23px]" : "left-[3px]"}
                  `}
                />
              </div>

              <span
                className={`
                  text-[13px]
                  font-semibold
                  ${active ? "text-[#f47a32]" : "text-[#777b82]"}
                `}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </button>

            <p className="mt-2 text-[12px] leading-5 text-[#9a9da3]">
              When inactive, the link will show as expired/inactive to users.
            </p>
          </div>

          {/* ==================================
              EXPIRATION
          ================================== */}

          <div className="mb-7">
            <label
              htmlFor="expiration"
              className="mb-2 block text-[13px] font-semibold text-[#303238]"
            >
              Expiration
            </label>

            <select
              id="expiration"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="
                h-[46px]
                w-full
                rounded-[10px]
                border
                border-[#d5d7db]
                bg-white
                px-4
                text-sm
                text-[#55585d]
                outline-none
                transition
                focus:border-[#f47a32]
                focus:ring-4
                focus:ring-[#f47a32]/10
              "
            >
              <option value="never">No expiration</option>

              <option value="1d">1 day</option>

              <option value="7d">7 days</option>

              <option value="30d">30 days</option>

              <option value="90d">90 days</option>

              <option value="custom">Custom date</option>
            </select>

            <p className="mt-2 text-[12px] text-[#9a9da3]">
              Set when this presentation link should expire.
            </p>
          </div>

          {/* ==================================
              CUSTOM DATE
          ================================== */}

          {expiration === "custom" && (
            <div className="mb-7">
              <label
                htmlFor="customDate"
                className="mb-2 block text-[13px] font-semibold text-[#303238]"
              >
                Custom expiration date
              </label>

              <input
                id="customDate"
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="
                  h-[46px]
                  w-full
                  rounded-[10px]
                  border
                  border-[#d5d7db]
                  bg-white
                  px-4
                  text-sm
                  text-[#55585d]
                  outline-none
                  transition
                  focus:border-[#f47a32]
                  focus:ring-4
                  focus:ring-[#f47a32]/10
                "
              />

              <p className="mt-2 text-[12px] text-[#9a9da3]">
                Select a specific date and time for expiration.
              </p>
            </div>
          )}

          {/* ==================================
              ACTIONS
          ================================== */}

          <div className="flex items-center justify-end gap-3">
            {/* CANCEL */}

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                h-11
                rounded-[10px]
                bg-[#f5f6f8]
                px-5
                text-sm
                font-semibold
                text-[#55585d]
                transition
                hover:bg-[#ececef]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[#f47a32]
                px-5
                text-sm
                font-semibold
                text-white
                shadow-[0_2px_8px_rgba(244,122,50,0.2)]
                transition
                hover:bg-[#e86d28]
                hover:shadow-[0_8px_20px_rgba(244,122,50,0.22)]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================
          ANIMATION
      ====================================== */}

      <style>{`
        @keyframes settingsModalEnter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PresentationSettingsModal;
