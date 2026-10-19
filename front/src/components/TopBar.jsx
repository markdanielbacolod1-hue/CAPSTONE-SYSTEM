import React from "react";
import { LayoutDashboardIcon, LogOutIcon, UserRoundIcon } from "lucide-react";
import { BrandMark } from "./BrandMark";

export function TopBar({
  view,
  signedIn,
  accountName,
  workspaceView,
  onNavigate,
  onLogin,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#111] px-4 py-3 text-white shadow-md sm:px-7">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <button
          onClick={() => onNavigate("home")}
          className="rounded-md focus:outline-hidden focus:ring-2 focus:ring-white"
          aria-label="Go to homepage"
        >
          <BrandMark />
        </button>
        <nav
          className="hidden items-center gap-7 text-sm font-bold md:flex"
          aria-label="Main navigation"
        >
          <button
            className={view === "home" ? "text-[#f57696]" : ""}
            onClick={() => onNavigate("home")}
          >
            HOME
          </button>
          <button
            className={view === "archive" ? "text-[#f57696]" : ""}
            onClick={() => onNavigate("archive")}
          >
            RECIPES
          </button>
          {signedIn && workspaceView && (
            <button
              className={view === workspaceView ? "text-[#f57696]" : ""}
              onClick={() => onNavigate(workspaceView)}
            >
              <LayoutDashboardIcon className="mr-1 inline" size={15} />
              WORKSPACE
            </button>
          )}
        </nav>
        {signedIn ? (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-bold sm:flex">
              <UserRoundIcon size={17} />
              {accountName}
            </span>
            <button
              onClick={onLogout}
              className="rounded-xl bg-white px-3 py-2 text-xs font-black text-black focus:outline-hidden focus:ring-2 focus:ring-[#f57696]"
            >
              <LogOutIcon className="mr-1 inline" size={14} />
              LOG OUT
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="rounded-xl bg-white px-5 py-2 text-sm font-black text-black shadow-[2px_2px_0_#f57696] focus:outline-hidden focus:ring-2 focus:ring-[#f57696]"
          >
            LOG IN
          </button>
        )}
      </div>
    </header>
  );
}