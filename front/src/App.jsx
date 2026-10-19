import React, { useState } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChefHatIcon,
  ClipboardCheckIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ArchiveProvider, useArchive } from "./contexts/ArchiveContext";
import { AuthPanel } from "./components/AuthPanel";
import { Archive } from "./components/Archive";
import { Dashboard } from "./components/Dashboard";
import { RecipeDetail } from "./components/RecipeDetail";
import { TopBar } from "./components/TopBar";

export function App() {
  return (
    <ArchiveProvider>
      <AppShell />
    </ArchiveProvider>
  );
}

function AppShell() {
  const { session, recipes, signIn, signOut } = useArchive();
  const [view, setView] = useState("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const openRecipe = openRecipeId
    ? (recipes.find((recipe) => recipe.id === openRecipeId) ?? null)
    : null;
  const completeAuth = (role) => {
    signIn(role);
    setAuthOpen(false);
    setView(role);
  };
  const handleSignOut = () => {
    signOut();
    setView("home");
  };
  return (
    <div className="min-h-screen w-full bg-[#fffafb] text-black">
      <TopBar
        view={view}
        signedIn={Boolean(session)}
        accountName={session?.name}
        workspaceView={session?.role}
        onNavigate={setView}
        onLogin={() => setAuthOpen(true)}
        onLogout={handleSignOut}
      />

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Home
              onContinue={() =>
                session ? setView(session.role) : setAuthOpen(true)
              }
              onBrowse={() => setView("archive")}
              signedIn={Boolean(session)}
            />
          </motion.div>
        )}
        {view === "archive" && (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Archive onOpenRecipe={setOpenRecipeId} />
          </motion.div>
        )}
        {(view === "student" ||
          view === "faculty" ||
          view === "admin" ||
          view === "member") && (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard
              role={view}
              onSignOut={handleSignOut}
              onOpenRecipe={setOpenRecipeId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {openRecipe && (
        <RecipeDetail
          recipe={openRecipe}
          onClose={() => setOpenRecipeId(null)}
          onRequestSignIn={() => {
            setOpenRecipeId(null);
            setAuthOpen(true);
          }}
        />
      )}
      {authOpen && (
        <AuthPanel
          onClose={() => setAuthOpen(false)}
          onComplete={completeAuth}
        />
      )}
    </div>
  );
}

function Home({ onContinue, onBrowse, signedIn }) {
  return (
    <main>
      <section className="relative isolate overflow-hidden bg-[#f57696] px-5 py-14 sm:px-10 lg:min-h-[570px] lg:px-16 lg:py-20">
        <div className="absolute bottom-0 right-0 -z-10 h-[62%] w-[25%] bg-white [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <p className="eyebrow">UUP HOSPITALITY MANAGEMENT</p>
            <h1 className="mt-3 max-w-xl text-5xl font-black leading-[.92] tracking-[-.06em] sm:text-7xl">
              Welcome!
              <br />
              HM <span className="text-white">STUDENTS</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm font-bold sm:text-base">
              Web-based Culinary Archive and Recipe Repository System for the
              UUP Hospitality Management program.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={onContinue}
                className="primary-action w-auto! px-6!"
              >
                {signedIn ? "GO TO WORKSPACE" : "CONTINUE"}{" "}
                <ArrowRightIcon size={17} />
              </button>
              <button
                onClick={onBrowse}
                className="rounded-xl border-2 border-black bg-white px-5 py-3 text-sm font-black shadow-[4px_4px_0_#111]"
              >
                BROWSE RECIPES
              </button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-square rounded-full border-10 border-[#e62e87] bg-[#ffadd0] p-7 shadow-[8px_8px_0_#111]">
              <div className="grid h-full place-items-center rounded-full border-4 border-dashed border-white bg-[#f57696]">
                <ChefHatIcon size={110} strokeWidth={1.4} />
              </div>
            </div>
            <img
              src="https://cdn.magicpatterns.com/patterns/generated-images/4e0cccee-eb2f-42be-92fd-76503c809bee.jpg"
              alt="Freshly baked pastries"
              className="absolute -bottom-6 -right-4 h-32 w-48 border-4 border-black object-cover shadow-[7px_7px_0_#111] sm:h-40 sm:w-56"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f57696] px-5 pb-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-black">ACCESS NOTICE</p>
          <div className="grid gap-4 md:grid-cols-3">
            <Notice
              icon={<ShieldCheckIcon />}
              text="Only Hospitality Management students may post recipes and lab outputs."
            />
            <Notice
              icon={<BookOpenIcon />}
              text="Community members can log in to comment, like, and save recipes."
            />
            <Notice
              icon={<ClipboardCheckIcon />}
              text="Without an account you can browse and view recipes only."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-10 lg:px-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">ONE SHARED WORKFLOW</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">
              From kitchen work
              <br />
              to lasting knowledge.
            </h2>
            <p className="mt-4 max-w-md text-neutral-600">
              Students submit their lab recipes, faculty review and grade the
              work, and the wider community discovers, discusses, and saves the
              results.
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
              text="Faculty comment, grade, and archive."
            />
            <FlowStep
              number="03"
              label="Engage"
              text="Members like, save, and discuss recipes."
            />
          </div>
        </div>
      </section>

      <section className="border-y-2 border-black bg-[#111] px-5 py-12 text-white sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="eyebrow text-[#f57696]!">EXPLORE THE COLLECTION</p>
            <h2 className="mt-2 text-3xl font-black">
              Find recipes made by your community.
            </h2>
          </div>
          <button
            onClick={onBrowse}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-black"
          >
            Search the archive <SearchIcon size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

function Notice({ icon, text }) {
  return (
    <article className="flex min-h-28 flex-col justify-between rounded-2xl bg-black p-5 text-white shadow-[5px_5px_0_#ffb0c3]">
      <div className="text-[#f57696]">{icon}</div>
      <p className="mt-4 text-sm font-bold leading-snug">{text}</p>
    </article>
  );
}

function FlowStep({ number, label, text }) {
  return (
    <article className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#f57696]">
      <p className="text-xs font-black text-[#d65075]">{number}</p>
      <h3 className="mt-6 font-black">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-neutral-600">{text}</p>
    </article>
  );
}