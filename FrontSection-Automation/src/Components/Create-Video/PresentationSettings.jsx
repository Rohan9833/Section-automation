const PresentationSettings = ({
  linkStatus,
  expiration,
  onLinkStatusChange,
  onExpirationChange,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">

      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h3 className="text-base font-semibold text-gray-800">
          Video Settings
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Configure link status and expiration.
        </p>
      </div>

      {/* =========================
          LINK STATUS
      ========================= */}

      <div className="mt-6">

        <label className="text-sm font-medium text-gray-800">
          Link Status
        </label>

        <div className="mt-3 flex items-center gap-3">

          {/* Toggle */}

          <button
            type="button"
            onClick={() =>
              onLinkStatusChange(
                !linkStatus
              )
            }
            className={`relative h-6 w-11 rounded-full p-1 transition-colors ${
              linkStatus
                ? "bg-orange-500"
                : "bg-gray-300"
            }`}
          >

            <span
              className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                linkStatus
                  ? "translate-x-5"
                  : "translate-x-0"
              }`}
            />

          </button>

          {/* Status */}

          <span
            className={`text-sm font-medium ${
              linkStatus
                ? "text-orange-500"
                : "text-gray-500"
            }`}
          >
            {linkStatus
              ? "Active"
              : "Inactive"}
          </span>

        </div>

        <p className="mt-2 text-xs text-gray-400">
          When inactive, the video link will show
          as expired/inactive to users.
        </p>

      </div>

      {/* =========================
          EXPIRATION
      ========================= */}

      <div className="mt-6">

        <label
          htmlFor="expiration"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Expiration
        </label>

        <select
          id="expiration"
          value={expiration}
          onChange={(e) =>
            onExpirationChange(
              e.target.value
            )
          }
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        >

          <option value="no-expiration">
            No expiration
          </option>

          <option value="1-day">
            1 Day
          </option>

          <option value="7-days">
            7 Days
          </option>

          <option value="30-days">
            30 Days
          </option>

        </select>

        <p className="mt-2 text-xs text-gray-400">
          Set when this video link should expire.
        </p>

      </div>

    </div>
  );
};

export default PresentationSettings;