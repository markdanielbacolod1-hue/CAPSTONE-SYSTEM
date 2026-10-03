import { useState } from "react";

export default function LoginModal({ onClose }) {
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    {
      value: "student",
      label: "Student",
      icon: "♙",
    },
    {
      value: "faculty",
      label: "Faculty / Instructor",
      icon: "◆",
    },
    {
      value: "member",
      label: "Community Member",
      icon: "♡",
    },
    {
      value: "admin",
      label: "Administrator",
      icon: "✓",
    },
  ];

  function handleSubmit(event) {
    event.preventDefault();

    alert(`Logging in as ${role}`);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-5 backdrop-blur-sm">

      <section className="relative w-full max-w-lg border-2 border-black bg-[#f57696] p-9 text-center shadow-[12px_12px_0_#fff]">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center border-2 border-black bg-white text-lg font-black"
        >
          ×
        </button>

        {/* LOGIN ICON */}
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-[#e62e87] bg-[#ffadd0] text-3xl shadow-[3px_3px_0_#111]">
          ♙
        </div>

        <p className="mt-5 text-xs font-black tracking-[0.13em]">
          CULINARY ARCHIVE
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Log In
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm">
          Select your account type and enter your credentials
          to continue.
        </p>

        {/* ACCOUNT TYPES */}
        <div className="mt-6 grid gap-3">

          {roles.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRole(item.value)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black px-4 py-3 text-sm font-black transition ${
                role === item.value
                  ? "bg-white text-black"
                  : "bg-black text-white hover:bg-neutral-800"
              }`}
            >
              <span className="text-lg">
                {item.icon}
              </span>

              {item.label}
            </button>
          ))}

        </div>

        {/* LOGIN FORM */}
        {role && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-3 text-left"
          >

            {/* USERNAME */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">

              <span>✉</span>

              <input
                required
                type="text"
                placeholder="Email address or username"
                className="w-full bg-transparent text-sm outline-none"
              />

            </div>

            {/* PASSWORD */}
            <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">

              <span>◆</span>

              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-transparent text-sm outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="font-bold"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {/* REMEMBER / FORGOT */}
            <div className="flex items-center justify-between text-xs font-bold">

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-black"
                />
                Remember me
              </label>

              <button
                type="button"
                className="underline"
              >
                Forgot password?
              </button>

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full rounded-xl border-2 border-black bg-black px-4 py-3 text-sm font-black text-white shadow-[4px_4px_0_#fff] transition hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              LOG IN
            </button>

          </form>
        )}

        {!role && (
          <p className="mt-5 text-xs font-bold">
            Select an account type above to continue.
          </p>
        )}

      </section>
    </div>
  );
}