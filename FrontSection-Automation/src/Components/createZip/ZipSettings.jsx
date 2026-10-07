import React from "react";

const ZipSettings = ({
  active,
  expiration,
  customExpiration,
  onActiveChange,
  onExpirationChange,
  onCustomExpirationChange,
  disabled = false,
}) => {
  const getPreviewDate = () => {
    if (expiration === "never") {
      return null;
    }

    if (expiration === "custom") {
      if (!customExpiration) {
        return null;
      }

      return new Date(customExpiration);
    }

    const daysMap = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days = daysMap[expiration];

    if (!days) {
      return null;
    }

    const date = new Date();

    date.setDate(date.getDate() + days);

    return date;
  };

  const previewDate = getPreviewDate();

  return (
    <div className="mb-6 rounded-xl border border-[#ececef] bg-white p-6">
      {/* HEADER */}

      <div className="mb-[22px]">
        <h2 className="text-base font-semibold text-[#303238]">
          Presentation Settings
        </h2>

        <p className="mt-1 text-[13px] leading-[1.5] text-[#777b82]">
          Configure link status and expiration.
        </p>
      </div>

      {/* LINK STATUS */}

      <div className="mb-[22px]">
        <label className="mb-[9px] block text-[13px] font-semibold text-[#303238]">
          Link Status
        </label>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onActiveChange(!active)
            }
            aria-label="Toggle link status"
            className={`
              relative
              h-6
              w-11
              shrink-0
              rounded-full
              transition-colors
              disabled:cursor-not-allowed
              disabled:opacity-60
              ${
                active
                  ? "bg-[#f47a32]"
                  : "bg-[#dc3545]"
              }
            `}
          >
            <span
              className={`
                absolute
                top-[3px]
                h-[18px]
                w-[18px]
                rounded-full
                bg-white
                shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                transition-[left]
                ${
                  active
                    ? "left-[23px]"
                    : "left-[3px]"
                }
              `}
            />
          </button>

          <span
            className={`
              text-[13px]
              font-semibold
              ${
                active
                  ? "text-[#f47a32]"
                  : "text-[#dc3545]"
              }
            `}
          >
            {active
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        <p className="mt-[7px] text-xs leading-[1.5] text-[#9a9da3]">
          When inactive, the link will
          show as expired/inactive to
          users.
        </p>
      </div>

      {/* EXPIRATION */}

      <div className="mb-[22px]">
        <label
          htmlFor="expirationSelect"
          className="mb-[9px] block text-[13px] font-semibold text-[#303238]"
        >
          Expiration
        </label>

        <select
          id="expirationSelect"
          value={expiration}
          onChange={(event) =>
            onExpirationChange(
              event.target.value,
            )
          }
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border
            border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        >
          <option value="never">
            No expiration
          </option>

          <option value="1d">
            1 day
          </option>

          <option value="7d">
            7 days
          </option>

          <option value="30d">
            30 days
          </option>

          <option value="90d">
            90 days
          </option>

          <option value="custom">
            Custom date
          </option>
        </select>

        <p className="mt-[7px] text-xs leading-[1.5] text-[#9a9da3]">
          Set when this presentation
          link should expire.
        </p>
      </div>

      {/* CUSTOM DATE */}

      {expiration === "custom" && (
        <div className="mb-[22px]">
          <label
            htmlFor="customDateInput"
            className="mb-[9px] block text-[13px] font-semibold text-[#303238]"
          >
            Custom expiration date
          </label>

          <input
            id="customDateInput"
            type="datetime-local"
            value={customExpiration}
            onChange={(event) =>
              onCustomExpirationChange(
                event.target.value,
              )
            }
            disabled={disabled}
            className="
              h-11
              w-full
              rounded-[9px]
              border
              border-[#d5d7db]
              bg-white
              px-[13px]
              text-[13px]
              text-[#303238]
              outline-none
              transition
              focus:border-[#f47a32]
              focus:ring-4
              focus:ring-[#f47a32]/10
              disabled:cursor-not-allowed
              disabled:bg-[#f5f6f8]
            "
          />

          <p className="mt-[7px] text-xs leading-[1.5] text-[#9a9da3]">
            Select a specific date and
            time for expiration.
          </p>
        </div>
      )}

      {/* PREVIEW */}

      {previewDate &&
        !Number.isNaN(
          previewDate.getTime(),
        ) && (
          <div className="rounded-lg border border-[#ececef] bg-[#fafafa] px-4 py-3 text-[13px] text-[#55585d]">
            <strong className="text-[#303238]">
              Will expire:
            </strong>{" "}
            {previewDate.toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </div>
        )}
    </div>
  );
};

export default ZipSettings;