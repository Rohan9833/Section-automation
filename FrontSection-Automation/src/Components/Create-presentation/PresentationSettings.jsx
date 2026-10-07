import { CheckCircle2, Clock3 } from "lucide-react";

const PresentationSettings = ({
  settings,
  setSettings,
  disabled = false,
}) => {
  const {
    isActive,
    expirationType,
    customExpiration,
  } = settings;

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const getExpirationPreview = () => {
    if (expirationType === "never") {
      return null;
    }

    if (expirationType === "custom") {
      if (!customExpiration) {
        return null;
      }

      const date = new Date(
        customExpiration,
      );

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    }

    const daysMap = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days =
      daysMap[expirationType];

    if (!days) {
      return null;
    }

    const date = new Date();

    date.setDate(
      date.getDate() + days,
    );

    return date;
  };

  const expirationPreview =
    getExpirationPreview();

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return date.toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const handleExpirationChange = (
    value,
  ) => {
    setSettings((current) => ({
      ...current,
      expirationType: value,
      customExpiration:
        value === "custom"
          ? current.customExpiration
          : "",
    }));
  };

  return (
    <section
      className="
        rounded-xl
        border
        border-[#ececef]
        bg-[#fafbfc]
        p-5
        sm:p-6
      "
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#303238]">
          Presentation Settings
        </h2>

        <p className="mt-1 text-[13px] text-[#777b82]">
          Configure link status and expiration.
        </p>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-[13px] font-semibold text-[#303238]">
          Link Status
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              updateSetting(
                "isActive",
                !isActive,
              )
            }
            aria-label="Toggle presentation status"
            className={`
              relative
              h-6
              w-11
              rounded-full
              transition-colors
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                isActive
                  ? "bg-[#f47a32]"
                  : "bg-[#b8bcc2]"
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
                shadow-sm
                transition-all
                ${
                  isActive
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
                isActive
                  ? "text-[#f47a32]"
                  : "text-[#777b82]"
              }
            `}
          >
            {isActive
              ? "Active"
              : "Inactive"}
          </span>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-[#9a9da3]">
          When inactive, the link will
          show as expired/inactive to
          users.
        </p>
      </div>

      <div>
        <label
          htmlFor="expirationType"
          className="mb-2 block text-[13px] font-semibold text-[#303238]"
        >
          Expiration
        </label>

        <select
          id="expirationType"
          value={expirationType}
          disabled={disabled}
          onChange={(event) =>
            handleExpirationChange(
              event.target.value,
            )
          }
          className="
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

        <p className="mt-1.5 text-xs text-[#9a9da3]">
          Set when this presentation link
          should expire.
        </p>
      </div>

      {expirationType === "custom" && (
        <div className="mt-5">
          <label
            htmlFor="customExpiration"
            className="mb-2 block text-[13px] font-semibold text-[#303238]"
          >
            Custom expiration date
          </label>

          <input
            id="customExpiration"
            type="datetime-local"
            value={customExpiration}
            disabled={disabled}
            onChange={(event) =>
              updateSetting(
                "customExpiration",
                event.target.value,
              )
            }
            className="
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
              focus:border-[#f47a32]
              focus:ring-4
              focus:ring-[#f47a32]/10
              disabled:cursor-not-allowed
              disabled:bg-[#f5f6f8]
            "
          />

          <p className="mt-1.5 text-xs text-[#9a9da3]">
            Select a specific date and time
            for expiration.
          </p>
        </div>
      )}

      {expirationPreview && (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-lg
            border
            border-[#d8eadb]
            bg-[#f3faf4]
            px-4
            py-3
          "
        >
          <Clock3
            size={17}
            className="mt-0.5 shrink-0 text-[#3f9149]"
          />

          <div>
            <p className="text-xs font-semibold text-[#303238]">
              Will expire
            </p>

            <p className="mt-0.5 text-xs text-[#3f9149]">
              {formatDate(
                expirationPreview,
              )}
            </p>
          </div>

          <CheckCircle2
            size={16}
            className="ml-auto mt-0.5 text-[#3f9149]"
          />
        </div>
      )}
    </section>
  );
};

export default PresentationSettings;