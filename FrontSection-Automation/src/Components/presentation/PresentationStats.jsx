import React from "react";
import {
  Circle,
  Check,
  Minus,
} from "lucide-react";

const PresentationStats = ({
  totalLinks = 0,
  viewedLinks = 0,
  neverViewedLinks = 0,
}) => {
  const viewedPercentage =
    totalLinks > 0
      ? Math.round(
          (viewedLinks / totalLinks) * 100,
        )
      : 0;

  const stats = [
    {
      label: "Total",
      number: totalLinks,
      sub: "All generated presentations",
      icon: <Circle size={18} />,
      iconClass:
        "bg-[#fff3eb] text-[#f47a32]",
    },

    {
      label: "Viewed",
      number: viewedLinks,
      sub: `${viewedPercentage}% of total`,
      icon: <Check size={18} />,
      iconClass:
        "bg-[#e8f5e9] text-[#2e7d32]",
    },

    {
      label: "Never seen",
      number: neverViewedLinks,
      sub: "Needs attention",
      icon: <Minus size={18} />,
      iconClass:
        "bg-[#f5f5f5] text-[#9a9da3]",
    },
  ];

  return (
    <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            flex
            items-start
            gap-3.5
            rounded-xl
            border
            border-[#ececef]
            bg-white
            px-6
            py-5
            shadow-[0_1px_3px_rgba(0,0,0,0.03)]
            transition
            duration-200
            hover:-translate-y-1
            hover:border-[#e4e5e8]
            hover:shadow-[0_10px_28px_rgba(0,0,0,0.07)]
          "
        >
          {/* ICON */}

          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[10px]
              ${stat.iconClass}
            `}
          >
            {stat.icon}
          </div>

          {/* CONTENT */}

          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-[#777b82]">
              {stat.label}
            </div>

            <div className="my-0.5 text-[32px] font-bold tracking-[-1px] text-[#303238]">
              {stat.number}
            </div>

            <div className="text-xs text-[#9a9da3]">
              {stat.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PresentationStats;