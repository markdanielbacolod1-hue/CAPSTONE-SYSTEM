import React from "react";
import { ChefHatIcon } from "lucide-react";

export function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-[#f57696] text-black shadow-[3px_3px_0_#fff]"
        aria-hidden="true"
      >
        <ChefHatIcon size={24} strokeWidth={2.6} />
      </div>
      {!compact && (
        <div className="leading-tight text-white">
          <p className="text-xs font-black tracking-[0.16em]">UUP</p>
          <p className="text-sm font-extrabold">CULINARY ARCHIVE</p>
        </div>
      )}
    </div>
  );
}


src/components/AuthPanel.jsx

import { useState } from "react";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  KeyRoundIcon,
  MailIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";

const roleLabels = {
  student: "STUDENT PORTAL",
  faculty: "FACULTY PORTAL",
  admin: "ADMINISTRATOR",
  member: "COMMUNITY MEMBER",
};

export function AuthPanel({ onClose, onComplete }) {
  const [mode, setMode] = useState("choose");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    onComplete(role);
  };
  const selectRole = (nextRole) => {
    setRole(nextRole);
    setMode("login");
  };
  if (mode === "choose")
    return (
      <div className="auth-stage">
        <section className="auth-card max-w-md">
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close sign in"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div className="auth-seal">
            <UserRoundIcon size={38} />
          </div>
          <h1>Continue As:</h1>
          <p>Choose your account type to enter the archive.</p>
          <button className="auth-choice" onClick={() => selectRole("student")}>
            <UserRoundIcon size={21} />
            Student
          </button>
          <button className="auth-choice" onClick={() => selectRole("faculty")}>
            <KeyRoundIcon size={21} />
            Faculty / Instructor
          </button>
          <button className="auth-choice" onClick={() => selectRole("member")}>
            <HeartIcon size={21} />
            Community member
          </button>
          <button className="auth-choice" onClick={() => selectRole("admin")}>
            <ShieldCheckIcon size={21} />
            Administrator
          </button>
          <p className="relative z-10 mt-4 text-xs font-bold">
            Members can comment, like, and save recipes, but only students may
            post.
          </p>
        </section>
      </div>
    );
  return (
    <div className="auth-stage">
      <section className="auth-card max-w-lg">
        <button
          className="close-button"
          onClick={() => setMode("choose")}
          aria-label="Back to account selection"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div className="auth-seal">
          {role === "admin" ? (
            <ShieldCheckIcon size={38} />
          ) : role === "member" ? (
            <HeartIcon size={38} />
          ) : (
            <UserRoundIcon size={38} />
          )}
        </div>
        <p className="eyebrow">{roleLabels[role]}</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>
          {mode === "login"
            ? "Use your system credentials to continue."
            : role === "member"
              ? "Register to comment, like, and save recipes."
              : "Register to submit and manage culinary work."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && role !== "admin" && (
            <label className="input-wrap">
              <UserRoundIcon size={18} />
              <input required placeholder="Full name" />
            </label>
          )}
          <label className="input-wrap">
            <MailIcon size={18} />
            <input
              required
              type="email"
              placeholder="Email address or username"
            />
          </label>
          <label className="input-wrap">
            <KeyRoundIcon size={18} />
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </label>
          {mode === "login" && (
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-black" />
                Remember me
              </label>
              <button type="button" className="underline">
                Forgot password?
              </button>
            </div>
          )}
          <button className="primary-action" type="submit">
            {mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>
        {role !== "admin" && (
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="relative z-10 mt-4 w-full text-sm font-bold underline"
          >
            {mode === "login"
              ? "New here? Sign up"
              : "Already have an account? Log in"}
          </button>
        )}
      </section>
    </div>
  );
}
