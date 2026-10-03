import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  ClipboardCheck,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Mail,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffafb] text-black">
      <Header onLogin={() => setLoginOpen(true)} />

      <Home
        onLogin={() => setLoginOpen(true)}
        onBrowse={() => alert("Recipe archive coming soon.")}
      />

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}
    </div>
  );
}

/* =========================
   HEADER
========================= */

function Header({ onLogin }) {
  return (
    <header className="border-b-2 border-black bg-[#111] px-5 py-4 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 bg-[url('/image-removebg-preview.png')] bg-cover bg-center place-items-center rounded-full border-2 border-white bg-[#f57696] text-black shadow-[3px_3px_0_#fff]">
            
          </div>

          <div className="leading-tight">
            <p className="text-xs font-black tracking-[0.16em]">
              UEP
            </p>
            <p className="text-sm font-extrabold">
              CULINARY ARCHIVE
            </p>
          </div>
        </div>

        <button
          onClick={onLogin}
          className="rounded-lg border-2 border-white bg-white px-5 py-2 text-sm font-black text-black transition hover:bg-[#f57696]"
        >
          LOG IN
        </button>
      </div>
    </header>
  );
}

/* =========================
   HOMEPAGE
========================= */

function Home({ onLogin, onBrowse }) {
  return (
    <main>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#f57696] px-5 py-14 sm:px-10 lg:min-h-[570px] lg:px-16 lg:py-20">
        <div className="absolute bottom-0 right-0 -z-10 h-[62%] w-[25%] bg-white [clip-path:polygon(100%_0,100%_100%,0_100%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="text-xs font-black tracking-[0.13em]">
              UEP HOSPITALITY MANAGEMENT
            </p>

            <h1 className="mt-3 max-w-xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl">
              Welcome!
              <br />
              HM <span className="text-white">STUDENTS</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm font-bold sm:text-base">
              Web-Based Culinary Archive and Recipe Repository
              System for the UEP Hospitality Management program.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onLogin}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-black px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#fbd2dd] transition hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                CONTINUE
                <ArrowRight size={17} />
              </button>

              <button
                onClick={onBrowse}
                className="rounded-xl border-2 border-black bg-white px-5 py-3 text-sm font-black shadow-[4px_4px_0_#111] transition hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                BROWSE RECIPES
              </button>
            </div>
          </div>

          {/* HERO IMAGE / ICON */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square rounded-full border-[10px] border-[#e62e87] bg-[#ffadd0] p-7 shadow-[8px_8px_0_#111]">
              <div className="grid bg-[url('/image-removebg-preview.png')] bg-cover bg-center h-full place-items-center rounded-full border-4 border-dashed border-white bg-[#f57696]">
                
              </div>
            </div>

            <div className="absolute bg-[url('coverfood.jpg')] bg-cover bg-center -bottom-6 -right-4 flex h-32 w-48 items-center justify-center border-4 border-black bg-white text-center shadow-[7px_7px_0_#111] sm:h-40 sm:w-56">
              <div className="">
                
                <p className="mt-2 text-xs font-black">
                  
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCESS NOTICE */}
      <section className="bg-[#f57696] px-5 pb-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black">
            ACCESS NOTICE
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Notice
              icon={<ShieldCheck />}
              text="Only Hospitality Management students may post recipes and lab outputs."
            />

            <Notice
              icon={<BookOpen />}
              text="Community members can log in to comment, like, and save recipes."
            />

            <Notice
              icon={<ClipboardCheck />}
              text="Without an account you can browse and view recipes only."
            />
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-black tracking-[0.13em]">
              ONE SHARED WORKFLOW
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-tight">
              From kitchen work
              <br />
              to lasting knowledge.
            </h2>

            <p className="mt-4 max-w-md text-neutral-600">
              Students submit their lab recipes, faculty review
              the work, and the wider community discovers,
              discusses, and saves the results.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FlowStep
              number="01"
              label="Submit"
              text="Students post outputs and declare originality."
            />

            <FlowStep
              number="02"
              label="Review"
              text="Faculty review and archive culinary outputs."
            />

            <FlowStep
              number="03"
              label="Engage"
              text="Members like, save, and discuss recipes."
            />
          </div>
        </div>
      </section>

      {/* BROWSE */}
      <section className="border-y-2 border-black bg-[#111] px-5 py-12 text-white sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black tracking-[0.13em] text-[#f57696]">
              EXPLORE THE COLLECTION
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Find recipes made by your community.
            </h2>
          </div>

          <button
            onClick={onBrowse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-[#f57696]"
          >
            Search the archive
            <Search size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================
   NOTICE CARD
========================= */

function Notice({ icon, text }) {
  return (
    <article className="flex min-h-28 flex-col justify-between rounded-2xl bg-black p-5 text-white shadow-[5px_5px_0_#ffb0c3]">
      <div className="text-[#f57696]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-bold leading-snug">
        {text}
      </p>
    </article>
  );
}

/* =========================
   FLOW CARD
========================= */

function FlowStep({ number, label, text }) {
  return (
    <article className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#f57696]">
      <p className="text-xs font-black text-[#d65075]">
        {number}
      </p>

      <h3 className="mt-6 font-black">
        {label}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-neutral-600">
        {text}
      </p>
    </article>
  );
}

/* =========================
   LOGIN MODAL
========================= */

function LoginModal({ onClose }) {
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    {
      value: "student",
      label: "Student",
      icon: <User size={21} />,
    },
    {
      value: "faculty",
      label: "Faculty / Instructor",
      icon: <KeyRound size={21} />,
    },
    {
      value: "member",
      label: "Community Member",
      icon: <Heart size={21} />,
    },
    {
      value: "admin",
      label: "Administrator",
      icon: <ShieldCheck size={21} />,
    },
  ];

  function handleSubmit(e) {
    e.preventDefault();

    alert(`Logging in as ${role}`);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-5 backdrop-blur-sm">
      <section className="relative w-full max-w-lg border-2 border-black bg-[#f57696] p-9 text-center shadow-[12px_12px_0_#fff]">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 grid h-9 w-9 place-items-center border-2 border-black bg-white"
        >
          <X size={20} />
        </button>

        {/* ICON */}
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border-4 border-[#e62e87] bg-[#ffadd0] shadow-[3px_3px_0_#111]">
          <User size={38} />
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

        {/* ACCOUNT TYPE */}
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
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* LOGIN FORM */}
        {role && (
          <form
            onSubmit={handleSubmit}
            className="relative z-10 mt-6 space-y-3 text-left"
          >
            <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">
              <Mail size={18} />

              <input
                required
                type="text"
                placeholder="Email address or username"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border-2 border-black bg-white px-4 py-3">
              <KeyRound size={18} />

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
                className="grid place-items-center"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

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