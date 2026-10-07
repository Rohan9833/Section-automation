import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const navItems = [
    {
      name: "Dashboard",
      path: "/presentations",
    },
    {
      name: "Create PPT",
      path: "/urlForm",
    },
    {
      name: "Create Zip",
      path: "/create-zip",
    },
    {
      name: "Create Video",
      path: "/create-video",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    // Clear authentication data if stored
    localStorage.removeItem("token");

    // Redirect to login
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[#ececef] bg-white px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* ================= LEFT ================= */}

      <div className="flex items-center gap-6">
        {/* Logo */}

        <div className="flex items-center gap-1 text-[22px] font-bold tracking-[-0.5px]">
          <span className="text-[#f47a32]">
            digi
          </span>

          <span className="text-[#55585d]">
            LATERAL
          </span>
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-md px-4 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-[#fff3eb] font-semibold text-[#f47a32]"
                    : "font-medium text-[#777b82] hover:-translate-y-[1px] hover:bg-[#f5f6f8]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* ================= RIGHT ================= */}

      <div className="flex items-center gap-4">
        {/* Notification */}

        {/* <button className="text-[#777b82] transition hover:text-[#f47a32]">
          <Bell size={20} />
        </button> */}

        {/* ================= USER PROFILE ================= */}

        <div
          ref={profileRef}
          className="relative"
        >
          {/* Profile Button */}

          <button
            type="button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
            className="
              flex
              items-center
              gap-2.5
              rounded-lg
              px-2
              py-1.5
              transition
              hover:bg-[#f5f6f8]
            "
          >
            {/* Avatar */}

            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f47a32] text-[13px] font-semibold text-white">
              D
            </div>

            {/* Username */}

            <span className="text-sm font-medium text-[#303238]">
              DigiLateral
            </span>

            {/* Arrow */}

            <ChevronDown
              size={12}
              className={`text-[#9a9da3] transition-transform duration-200 ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {/* ================= DROPDOWN ================= */}

          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-[52px]
                w-[180px]
                overflow-hidden
                rounded-[10px]
                border
                border-[#ececef]
                bg-white
                p-1.5
                shadow-[0_8px_24px_rgba(0,0,0,0.10)]
                animate-[profileDropdown_0.15s_ease-out]
              "
            >
              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-medium
                  text-[#55585d]
                  transition
                  hover:bg-[#fef2f0]
                  hover:text-[#d9534f]
                "
              >
                <LogOut size={17} />

                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= ANIMATION ================= */}

      <style>{`
        @keyframes profileDropdown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;