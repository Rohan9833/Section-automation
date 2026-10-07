import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid username or password.");
      }

      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      window.location.href = "/presentations";
    } catch (err) {
      console.error("Login error:", err);

      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-6 py-6 text-[#303238]">
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center">
        <div
          className="
            w-full max-w-[420px]
            rounded-[20px]
            border border-[#ececef]
            bg-white
            px-10 pb-10 pt-12
            shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02)]
            transition-all duration-200
            hover:shadow-[0_20px_56px_rgba(0,0,0,0.08)]
            animate-[loginEnter_0.45s_ease-out]
          "
        >
          {/* BRAND */}

          <div className="mb-2 flex items-center justify-center gap-[6px] text-[28px] font-bold tracking-[-0.5px]">
            <span className="text-[#f47a32]">digi</span>

            <span className="text-[#55585d]">LATERAL</span>
          </div>

          {/* SUBHEADING */}

          <p className="mb-8 text-center text-[15px] text-[#777b82]">
            Sign in to your account
          </p>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-lg border border-[#fcd8d4] bg-[#fef2f0] px-4 py-3 text-[13px] text-[#b33a2e]">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>
            {/* USERNAME */}

            <div className="mb-5">
              <label
                htmlFor="loginId"
                className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
              >
                Username
              </label>

              <input
                type="text"
                id="loginId"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                required
                disabled={loading}
                className="
                  h-[46px]
                  w-full
                  rounded-[10px]
                  border border-[#d5d7db]
                  bg-white
                  px-4
                  text-sm
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

            {/* PASSWORD */}

            <div className="mb-5">
              <label
                htmlFor="loginPassword"
                className="mb-1.5 block text-[13px] font-semibold text-[#303238]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="loginPassword"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="
                    h-[46px]
                    w-full
                    rounded-[10px]
                    border border-[#d5d7db]
                    bg-white
                    px-4
                    pr-12
                    text-sm
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

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    flex
                    items-center
                    justify-center
                    rounded-md
                    p-1.5
                    text-[#777b82]
                    transition
                    hover:text-[#f47a32]
                    disabled:cursor-not-allowed
                  "
                >
                  {showPassword ? (
                    /* EYE OFF */

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />

                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />

                      <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9 4 10 8a10.2 10.2 0 0 1-2.02 3.64" />

                      <path d="M6.61 6.61A10.25 10.25 0 0 0 2 12c1 4 5 8 10 8a9.77 9.77 0 0 0 4.12-.88" />
                    </svg>
                  ) : (
                    /* EYE */

                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />

                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-2
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[#f47a32]
                text-[15px]
                font-semibold
                text-white
                shadow-[0_2px_8px_rgba(244,122,50,0.2)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[#e86d28]
                hover:shadow-[0_8px_20px_rgba(244,122,50,0.22)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {loading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4M12 22v-4M4 12H2M22 12h-2M19.07 4.93l-2.83 2.83M6.34 17.66l-2.83 2.83M17.66 6.34l2.83-2.83M4.93 19.07l-2.83-2.83" />

                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes loginEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
