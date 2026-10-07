import React from "react";
import { FilePlus2 } from "lucide-react";

import CreatePresentationForm from "../Components/Create-presentation/CreatePresentationForm";
import Navbar from "../Components/Navbar";

const CreatePresentation = () => {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-[#303238]">
      {/* NAVBAR */}

      <Navbar />

      {/* PAGE */}

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">

          {/* PAGE HEADER */}

          <div className="mb-6">
            <div className="flex items-start gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#fff0e7]
                  text-[#f47a32]
                "
              >
                <FilePlus2 size={22} />
              </div>

              <div>
                <h1
                  className="
                    text-[28px]
                    font-bold
                    leading-tight
                    tracking-[-0.4px]
                    text-[#303238]
                  "
                >
                  Create Presentation
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-[#777b82]
                  "
                >
                  Configure your presentation and
                  generate a shareable presentation link.
                </p>
              </div>

            </div>
          </div>

          {/* FORM CARD */}

          <div
            className="
              rounded-2xl
              border
              border-[#ececef]
              bg-white
              p-5
              shadow-[0_8px_30px_rgba(0,0,0,0.04)]
              sm:p-7
            "
          >
            <CreatePresentationForm />
          </div>

        </div>
      </main>
    </div>
  );
};

export default CreatePresentation;