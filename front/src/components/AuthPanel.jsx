import React, { useState } from "react";
import {
  ArrowLeftIcon, EyeIcon, EyeOffIcon, HeartIcon, KeyRoundIcon,
  MailIcon, ShieldCheckIcon, UserRoundIcon,
} from "lucide-react";

const roleLabels = {
  student: "STUDENT PORTAL",
  faculty: "FACULTY PORTAL",
  admin: "ADMINISTRATOR",
  member: "COMMUNITY MEMBER",
};
const backendRoles = {
  student: "Student",
  member: "CommunityMember",
  faculty: "Faculty",
  admin: "Admin",
};

export function AuthPanel({ onClose, onComplete, busy = false }) {
  const [mode, setMode] = useState("choose");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "",
    studentNumber: "", course: "BSHM", yearLevel: "",
  });

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const selectRole = (nextRole) => {
    setRole(nextRole);
    setMode("login");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const payload = mode === "login"
      ? { mode, role, identifier: form.email.trim(), password: form.password }
      : {
          mode, role, backendRole: backendRoles[role],
          fullName: form.fullName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          ...(role === "student" ? {
            studentNumber: form.studentNumber.trim(),
            course: form.course.trim(),
            yearLevel: form.yearLevel,
          } : {}),
        };
    try {
      await onComplete(payload);
    } catch (err) {
      setError(err.message || "Unable to complete your request.");
    }
  };

  if (mode === "choose") {
    return (
      <div className="auth-stage">
        <section className="auth-card max-w-md">
          <button className="close-button" onClick={onClose} aria-label="Close sign in">
            <ArrowLeftIcon size={20} />
          </button>
          <div className="auth-seal"><UserRoundIcon size={38} /></div>
          <h1>Continue As:</h1>
          <p>Choose your account type to enter the archive.</p>
          <button className="auth-choice" onClick={() => selectRole("student")}><UserRoundIcon size={21} />Student</button>
          <button className="auth-choice" onClick={() => selectRole("faculty")}><KeyRoundIcon size={21} />Faculty / Instructor</button>
          <button className="auth-choice" onClick={() => selectRole("member")}><HeartIcon size={21} />Community member</button>
          <button className="auth-choice" onClick={() => selectRole("admin")}><ShieldCheckIcon size={21} />Administrator</button>
          <p className="relative z-10 mt-4 text-xs font-bold">
            Members can comment, like, and save recipes, but only students may post.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-stage">
      <section className="auth-card max-w-lg">
        <button className="close-button" onClick={() => { setMode("choose"); setError(""); }} aria-label="Back to account selection">
          <ArrowLeftIcon size={20} />
        </button>
        <div className="auth-seal">
          {role === "admin" ? <ShieldCheckIcon size={38} /> : role === "member" ? <HeartIcon size={38} /> : <UserRoundIcon size={38} />}
        </div>
        <p className="eyebrow">{roleLabels[role]}</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>{mode === "login" ? "Use your system credentials to continue." : role === "member" ? "Register to comment, like, and save recipes." : "Register to submit and manage culinary work."}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <label className="input-wrap"><UserRoundIcon size={18} /><input required value={form.fullName} onChange={update("fullName")} placeholder="Full name" /></label>
              <label className="input-wrap"><UserRoundIcon size={18} /><input required value={form.username} onChange={update("username")} placeholder="Username" /></label>
            </>
          )}
          <label className="input-wrap"><MailIcon size={18} /><input required type="text" value={form.email} onChange={update("email")} placeholder="Email address or username" autoComplete="username" /></label>
          <label className="input-wrap">
            <KeyRoundIcon size={18} />
            <input required minLength={mode === "signup" ? 8 : undefined} value={form.password} onChange={update("password")} type={showPassword ? "text" : "password"} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </label>
          {mode === "signup" && role === "student" && (
            <>
              <label className="input-wrap"><input required value={form.studentNumber} onChange={update("studentNumber")} placeholder="Student number" /></label>
              <label className="input-wrap"><input required value={form.course} onChange={update("course")} placeholder="Course (e.g. BSHM)" /></label>
              <label className="input-wrap"><input required type="number" min="1" max="5" value={form.yearLevel} onChange={update("yearLevel")} placeholder="Year level (1–5)" /></label>
            </>
          )}
          {mode === "login" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Use your registered username or email.</span>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
          <button className="primary-action" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        {role !== "admin" && role !== "faculty" && (
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="relative z-10 mt-4 w-full text-sm font-bold underline">
            {mode === "login" ? "New here? Sign up" : "Already have an account? Log in"}
          </button>
        )}
        {(role === "admin" || role === "faculty") && (
          <p className="mt-4 text-xs text-neutral-600">This account type is created by the system administrator.</p>
        )}
      </section>
    </div>
  );
}
