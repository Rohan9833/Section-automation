import React, { useState } from "react";
import { Check, ChevronDown, RotateCcw } from "lucide-react";

const SECTION_SLIDES = [
  {
    key: "intro",
    label: "Introduction",
    slideIds: [1, 2, 3, 4],
  },
  {
    key: "brand",
    label: "Brand Communication",
    slideIds: [5, 6, 7],
  },
  {
    key: "videos",
    label: "Videos & Animation",
    slideIds: [8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    key: "personalized",
    label: "Personalized Video",
    slideIds: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  {
    key: "rxpl",
    label: "RxPL",
    slideIds: [30, 31],
  },
  {
    key: "websites",
    label: "Websites",
    slideIds: [32, 33],
  },
  {
    key: "qr",
    label: "QR Generation",
    slideIds: [34, 35, 36, 37, 38, 39, 40],
  },
  {
    key: "games",
    label: "Games",
    slideIds: [41, 42, 43, 44],
  },
  {
    key: "ai",
    label: "Ai Activities",
    slideIds: [99], // These IDs must match your image filenames: 57.png, 58.png, 59.png
  },
  {
    key: "product-advertisement",
    label: "Product Advertisement",
    slideIds: [100],
  },
  {
    key: "field-motivation",
    label: "Field Motivation",
    slideIds: [101],
  },
  {
    key: "doc-talk",
    label: "DocTalk",
    slideIds: [102],
  },
  {
    key: "doc-talk-show",
    label: "DocTalk Show",
    slideIds: [103],
  },
  {
    key: "doc-talk-quiz",
    label: "DocTalkQuiz",
    slideIds: [104],
  },
];

const PresentationSections = ({
  selectedSections,
  setSelectedSections,
  selectedSlides,
  setSelectedSlides,
  disabled = false,
}) => {
  const [expandedSections, setExpandedSections] = useState([]);

  const selectedSlideCount = Object.values(selectedSlides).reduce(
    (total, slides) => total + slides.length,
    0,
  );

  const imagePath = (slideId) => {
    return `/thumbnail/${slideId}.png`;
  };

  /* ==========================================
     EXPAND / COLLAPSE
  ========================================== */

  const toggleExpanded = (sectionKey) => {
    setExpandedSections((current) =>
      current.includes(sectionKey)
        ? current.filter((key) => key !== sectionKey)
        : [...current, sectionKey],
    );
  };

  /* ==========================================
     SECTION STATUS
  ========================================== */

  const getSectionSlides = (section) => {
    return selectedSlides[section.key] || [];
  };

  const areAllSlidesSelected = (section) => {
    const slides = getSectionSlides(section);

    return slides.length === section.slideIds.length;
  };

  const areSomeSlidesSelected = (section) => {
    const slides = getSectionSlides(section);

    return slides.length > 0 && slides.length < section.slideIds.length;
  };

  /* ==========================================
     UPDATE SECTION
  ========================================== */

  const updateSectionSelection = (section, slides) => {
    setSelectedSlides((current) => {
      const next = {
        ...current,
      };

      if (slides.length === 0) {
        delete next[section.key];
      } else {
        next[section.key] = slides;
      }

      return next;
    });

    setSelectedSections((current) => {
      const exists = current.includes(section.key);

      if (slides.length > 0 && !exists) {
        return [...current, section.key];
      }

      if (slides.length === 0 && exists) {
        return current.filter((key) => key !== section.key);
      }

      return current;
    });
  };

  /* ==========================================
     TOGGLE SECTION
  ========================================== */

  const toggleSection = (section) => {
    const allSelected = areAllSlidesSelected(section);

    updateSectionSelection(section, allSelected ? [] : [...section.slideIds]);
  };

  /* ==========================================
     TOGGLE SLIDE
  ========================================== */

  const toggleSlide = (section, slideId) => {
    const currentSlides = getSectionSlides(section);

    const isSelected = currentSlides.includes(slideId);

    const updatedSlides = isSelected
      ? currentSlides.filter((id) => id !== slideId)
      : [...currentSlides, slideId];

    updateSectionSelection(section, updatedSlides);
  };

  /* ==========================================
     SELECT ALL
  ========================================== */

  const selectAll = () => {
    const allSlides = {};

    SECTION_SLIDES.forEach((section) => {
      allSlides[section.key] = [...section.slideIds];
    });

    setSelectedSlides(allSlides);

    setSelectedSections(SECTION_SLIDES.map((section) => section.key));
  };

  /* ==========================================
     RESET ALL
  ========================================== */

  const resetAll = () => {
    setSelectedSlides({});

    setSelectedSections([]);
  };

  /* ==========================================
     SECTION SELECT ALL
  ========================================== */

  const selectAllSlides = (section) => {
    updateSectionSelection(section, [...section.slideIds]);
  };

  /* ==========================================
     SECTION RESET
  ========================================== */

  const resetSlides = (section) => {
    updateSectionSelection(section, []);
  };

  const allSectionsSelected = selectedSections.length === SECTION_SLIDES.length;

  return (
    <section>
      {/* HEADER */}

      <div
        className="
          mb-4
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-[#303238]">
              Select Presentation Sections
            </h2>

            <span
              className="
                rounded-full
                bg-[#fff3eb]
                px-2
                py-0.5
                text-[11px]
                font-semibold
                text-[#f47a32]
              "
            >
              {selectedSlideCount} slides selected
            </span>
          </div>

          <p className="mt-1 text-xs text-[#9a9da3]">
            Select sections and choose individual slides for your presentation.
          </p>
        </div>

        {/* GLOBAL ACTIONS */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || allSectionsSelected}
            onClick={selectAll}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              border
              border-[#f47a32]
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-[#f47a32]
              transition
              hover:bg-[#fff3eb]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Check size={14} />
            Select All
          </button>

          <button
            type="button"
            disabled={disabled || selectedSlideCount === 0}
            onClick={resetAll}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              border
              border-[#d5d7db]
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-[#777b82]
              transition
              hover:bg-[#f5f6f8]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <RotateCcw size={13} />
            Reset All
          </button>
        </div>
      </div>

      {/* SECTION LIST */}

      <div className="space-y-2">
        {SECTION_SLIDES.map((section) => {
          const expanded = expandedSections.includes(section.key);

          const allSelected = areAllSlidesSelected(section);

          const someSelected = areSomeSlidesSelected(section);

          const selected = selectedSections.includes(section.key);

          const sectionSelectedSlides = getSectionSlides(section);

          return (
            <div
              key={section.key}
              className={`
                overflow-hidden
                rounded-xl
                border
                transition
                ${
                  selected
                    ? "border-[#f47a32] bg-[#fffaf6]"
                    : "border-[#ececef] bg-white"
                }
              `}
            >
              {/* SECTION HEADER */}

              <div
                className="
                  relative
                  min-h-[72px]
                  cursor-pointer
                  px-4
                  py-3
                  pr-14
                  transition
                  hover:bg-[#fafbfc]
                "
                onClick={() => toggleExpanded(section.key)}
              >
                {/* TOP RIGHT CHECKBOX */}

                <button
                  type="button"
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleSection(section);
                  }}
                  aria-label={`Select ${section.label}`}
                  className="
                    absolute
                    right-4
                    top-3
                    z-10
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    disabled:cursor-not-allowed
                  "
                >
                  <span
                    className={`
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      rounded-md
                      border
                      transition
                      ${
                        allSelected || someSelected
                          ? "border-[#f47a32] bg-[#f47a32]"
                          : "border-[#cdd0d5] bg-white"
                      }
                    `}
                  >
                    {allSelected && (
                      <Check size={13} strokeWidth={3} className="text-white" />
                    )}

                    {someSelected && !allSelected && (
                      <span
                        className="
                            h-[2px]
                            w-[9px]
                            rounded-full
                            bg-white
                          "
                      />
                    )}
                  </span>
                </button>

                {/* SECTION INFO */}

                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-sm
                        font-medium
                        ${selected ? "text-[#f47a32]" : "text-[#37383c]"}
                      `}
                    >
                      {section.label}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#9a9da3]">
                      {section.slideIds.length} slides
                      {sectionSelectedSlides.length > 0 && (
                        <> • {sectionSelectedSlides.length} selected</>
                      )}
                    </p>
                  </div>
                </div>

                {/* CHEVRON */}

                <span
                  className={`
                    absolute
                    bottom-3
                    right-3
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    text-[#9a9da3]
                    transition-all
                    ${
                      expanded
                        ? "rotate-180 bg-[#fff0e7] text-[#f47a32]"
                        : "hover:bg-[#f5f6f8]"
                    }
                  `}
                >
                  <ChevronDown size={17} strokeWidth={2.5} />
                </span>
              </div>

              {/* EXPANDED */}

              {expanded && (
                <div
                  className="
                    border-t
                    border-dashed
                    border-[#e0e2e5]
                    bg-[#fafbfc]
                    px-3
                    pb-3
                  "
                >
                  {/* SECTION ACTIONS */}

                  <div
                    className="
                      flex
                      items-center
                      justify-end
                      gap-2
                      px-1
                      py-3
                    "
                  >
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => selectAllSlides(section)}
                      className="
                        rounded-full
                        border
                        border-[#d5d7db]
                        bg-white
                        px-3
                        py-1
                        text-[11px]
                        font-semibold
                        text-[#55585d]
                        transition
                        hover:border-[#f47a32]
                        hover:bg-[#fff3eb]
                        hover:text-[#f47a32]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span className="mr-1">✓</span>
                      Select All
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => resetSlides(section)}
                      className="
                        rounded-full
                        border
                        border-[#d5d7db]
                        bg-white
                        px-3
                        py-1
                        text-[11px]
                        font-semibold
                        text-[#55585d]
                        transition
                        hover:border-[#f47a32]
                        hover:bg-[#fff3eb]
                        hover:text-[#f47a32]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <span className="mr-1">×</span>
                      Reset
                    </button>
                  </div>

                  {/* THUMBNAILS */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                      sm:grid-cols-3
                      md:grid-cols-4
                      lg:grid-cols-5
                      xl:grid-cols-6
                    "
                  >
                    {section.slideIds.map((slideId, index) => {
                      const slideSelected =
                        sectionSelectedSlides.includes(slideId);

                      return (
                        <button
                          key={slideId}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleSlide(section, slideId)}
                          className={`
                              group
                              relative
                              rounded-lg
                              border
                              p-1.5
                              text-left
                              transition-all
                              disabled:cursor-not-allowed
                              ${
                                slideSelected
                                  ? "border-[#f47a32] bg-[#fff3eb] shadow-[0_2px_8px_rgba(244,122,50,0.12)]"
                                  : "border-transparent bg-transparent hover:border-[#e2e4e7] hover:bg-white"
                              }
                            `}
                        >
                          <div
                            className={`
                                relative
                                aspect-[4/3]
                                w-full
                                overflow-hidden
                                rounded-md
                                border
                                bg-[#eceef0]
                                ${
                                  slideSelected
                                    ? "border-[#f47a32] ring-2 ring-[#f47a32]/20"
                                    : "border-[#e2e4e7]"
                                }
                              `}
                          >
                            <img
                              src={imagePath(slideId)}
                              alt={`${section.label} slide ${index + 1}`}
                              loading="lazy"
                              className="
                                  block
                                  h-full
                                  w-full
                                  object-contain
                                "
                              onError={(event) => {
                                event.currentTarget.style.display = "none";

                                const fallback =
                                  event.currentTarget.nextSibling;

                                if (fallback) {
                                  fallback.classList.remove("hidden");

                                  fallback.classList.add("flex");
                                }
                              }}
                            />

                            {/* FALLBACK */}

                            <div
                              className="
                                  absolute
                                  inset-0
                                  hidden
                                  items-center
                                  justify-center
                                  bg-[#f1f2f4]
                                  text-[10px]
                                  font-semibold
                                  text-[#9a9da3]
                                "
                            >
                              Slide {index + 1}
                            </div>

                            {/* SLIDE CHECKBOX */}

                            <span
                              className={`
                                  absolute
                                  right-1.5
                                  top-1.5
                                  z-20
                                  flex
                                  h-5
                                  w-5
                                  items-center
                                  justify-center
                                  rounded-md
                                  border
                                  shadow-sm
                                  ${
                                    slideSelected
                                      ? "border-[#f47a32] bg-[#f47a32]"
                                      : "border-[#d5d7db] bg-white"
                                  }
                                `}
                            >
                              {slideSelected && (
                                <Check
                                  size={12}
                                  strokeWidth={3}
                                  className="text-white"
                                />
                              )}
                            </span>
                          </div>

                          <p
                            className={`
                                mt-1.5
                                text-center
                                text-[10px]
                                font-semibold
                                ${
                                  slideSelected
                                    ? "text-[#f47a32]"
                                    : "text-[#777b82]"
                                }
                              `}
                          >
                            Slide {index + 1}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PresentationSections;
