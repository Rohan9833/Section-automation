import React from "react";

const ZipFormFields = ({
  formData,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange(name, value);
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* COMPANY */}

      <div>
        <label
          htmlFor="companyName"
          className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
        >
          Company
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <input
          id="companyName"
          name="companyName"
          type="text"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Enter company name"
          required
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            placeholder:text-[#a3a6ad]
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        />
      </div>

      {/* DIVISION */}

      <div>
        <label
          htmlFor="division"
          className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
        >
          Division
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <input
          id="division"
          name="divisionName"
          type="text"
          value={formData.divisionName}
          onChange={handleChange}
          placeholder="Enter division"
          required
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            placeholder:text-[#a3a6ad]
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        />
      </div>

      {/* INDIVIDUAL */}

      <div>
        <label
          htmlFor="individual"
          className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
        >
          Individual
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <input
          id="individual"
          name="individualName"
          type="text"
          value={formData.individualName}
          onChange={handleChange}
          placeholder="Enter individual name"
          required
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            placeholder:text-[#a3a6ad]
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        />
      </div>

      {/* PROJECT */}

      <div>
        <label
          htmlFor="projectName"
          className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
        >
          Project Name
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <input
          id="projectName"
          name="projectName"
          type="text"
          value={formData.projectName}
          onChange={handleChange}
          placeholder="Enter project name"
          required
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            placeholder:text-[#a3a6ad]
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        />
      </div>

      {/* ZIP FILE NAME */}

      <div className="md:col-span-2">
        <label
          htmlFor="fileName"
          className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
        >
          File Name
          <span className="ml-1 text-[#f47a32]">*</span>
        </label>

        <input
          id="fileName"
          name="zipFileName"
          type="text"
          value={formData.zipFileName}
          onChange={handleChange}
          placeholder="Enter ZIP file name"
          required
          disabled={disabled}
          className="
            h-11
            w-full
            rounded-[9px]
            border border-[#d5d7db]
            bg-white
            px-[13px]
            text-[13px]
            text-[#303238]
            outline-none
            transition
            placeholder:text-[#a3a6ad]
            focus:border-[#f47a32]
            focus:ring-4
            focus:ring-[#f47a32]/10
            disabled:cursor-not-allowed
            disabled:bg-[#f5f6f8]
          "
        />
      </div>
    </div>
  );
};

export default ZipFormFields;