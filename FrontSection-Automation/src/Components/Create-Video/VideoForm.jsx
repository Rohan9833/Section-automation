const VideoForm = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">

      {/* =========================
          COMPANY
      ========================= */}

      <div className="flex flex-col">

        <label className="mb-2 text-sm font-medium text-gray-800">
          Company{" "}
          <span className="text-orange-500">*</span>
        </label>

        <input
          type="text"
          placeholder="Enter company name"
          value={formData.companyName}
          onChange={(e) =>
            handleChange(
              "companyName",
              e.target.value
            )
          }
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />

      </div>

      {/* =========================
          DIVISION
      ========================= */}

      <div className="flex flex-col">

        <label className="mb-2 text-sm font-medium text-gray-800">
          Division{" "}
          <span className="text-orange-500">*</span>
        </label>

        <input
          type="text"
          placeholder="Enter division"
          value={formData.divisionName}
          onChange={(e) =>
            handleChange(
              "divisionName",
              e.target.value
            )
          }
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />

      </div>

      {/* =========================
          INDIVIDUAL
      ========================= */}

      <div className="flex flex-col">

        <label className="mb-2 text-sm font-medium text-gray-800">
          Individual{" "}
          <span className="text-orange-500">*</span>
        </label>

        <input
          type="text"
          placeholder="Enter individual name"
          value={formData.individualName}
          onChange={(e) =>
            handleChange(
              "individualName",
              e.target.value
            )
          }
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />

      </div>

      {/* =========================
          PROJECT NAME
      ========================= */}

      <div className="flex flex-col">

        <label className="mb-2 text-sm font-medium text-gray-800">
          Project Name{" "}
          <span className="text-orange-500">*</span>
        </label>

        <input
          type="text"
          placeholder="Enter project name"
          value={formData.projectName}
          onChange={(e) =>
            handleChange(
              "projectName",
              e.target.value
            )
          }
          className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />

      </div>

    </div>
  );
};

export default VideoForm;