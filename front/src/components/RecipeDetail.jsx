import React, { useState } from "react";
import {
  BookmarkIcon,
  ChefHatIcon,
  HeartIcon,
  LockIcon,
  MessageCircleIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
import { ReviewActions } from "./ReviewActions";
import { StatusChips } from "./StatusChips";

export function RecipeDetail({ recipe, onClose, onRequestSignIn }) {
  const {
    session,
    can,
    isLiked,
    isSaved,
    toggleLike,
    toggleSave,
    addComment,
    gradeRecipe,
    setActive,
  } = useArchive();
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(
    recipe.grade ? String(recipe.grade.score) : "",
  );
  const [remark, setRemark] = useState(recipe.grade?.remark ?? "");
  const liked = isLiked(recipe);
  const saved = isSaved(recipe);
  const submitComment = (event) => {
    event.preventDefault();
    addComment(recipe.id, comment);
    setComment("");
  };
  const submitGrade = (event) => {
    event.preventDefault();
    const numeric = Number(score);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) return;
    gradeRecipe(recipe.id, numeric, remark);
  };
  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-black/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={recipe.title}
    >
      <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[10px_10px_0_#f57696]">
        <div className="relative">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-56 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="grid h-56 w-full place-items-center bg-[#fbd2dd] sm:h-72">
              <ChefHatIcon size={64} strokeWidth={1.5} />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-black bg-white"
            aria-label="Close recipe"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-6">
          <StatusChips recipe={recipe} />
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            {recipe.title}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {recipe.student} · {recipe.lab} · {recipe.date}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-700">
            {recipe.description}
          </p>
          <p className="mt-3 max-w-2xl rounded-xl bg-[#fff4f7] p-3 text-xs font-bold">
            Originality: {recipe.origin} — {recipe.originNote}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <EngageButton
              active={liked}
              disabled={!can.engage}
              onClick={() =>
                can.engage ? toggleLike(recipe.id) : onRequestSignIn()
              }
              label={`${liked ? "Liked" : "Like"} · ${recipe.likedBy.length}`}
              icon={
                <HeartIcon size={16} className={liked ? "fill-current" : ""} />
              }
            />
            <EngageButton
              active={saved}
              disabled={!can.engage}
              onClick={() =>
                can.engage ? toggleSave(recipe.id) : onRequestSignIn()
              }
              label={saved ? "Saved" : "Save"}
              icon={
                <BookmarkIcon
                  size={16}
                  className={saved ? "fill-current" : ""}
                />
              }
            />
            <span className="flex items-center gap-1 text-sm font-bold text-neutral-600">
              <MessageCircleIcon size={16} />
              {recipe.comments.length} comments
            </span>
            {can.moderate && (
              <button
                onClick={() => setActive(recipe.id, !recipe.active)}
                className="ml-auto rounded-xl border-2 border-black px-4 py-2 text-xs font-black"
              >
                {recipe.active ? "Set inactive" : "Set active"}
              </button>
            )}
          </div>

          {recipe.decision !== "Pending" && (
            <section
              className={`mt-6 rounded-2xl border-2 p-4 ${recipe.decision === "Approved" ? "border-[#1f7a4d] bg-[#d8f5e3]" : "border-[#a33] bg-[#ffe0e0]"}`}
            >
              <p className="text-sm font-black">
                {recipe.decision === "Approved"
                  ? "Approved for the archive"
                  : "Returned for revision"}
              </p>
              {recipe.decisionNote && (
                <p className="mt-1 text-sm">{recipe.decisionNote}</p>
              )}
              <p className="mt-1 text-xs text-neutral-700">
                {recipe.decidedBy} · {recipe.decidedAt}
              </p>
            </section>
          )}

          <ReviewActions recipe={recipe} />

          {recipe.grade && (
            <section className="mt-6 rounded-2xl border-2 border-[#f57696] bg-[#fff4f7] p-4">
              <p className="flex items-center gap-2 text-sm font-black">
                <StarIcon size={16} className="fill-current" />
                Faculty grade: {recipe.grade.score}/100
              </p>
              <p className="mt-1 text-sm">{recipe.grade.remark}</p>
              <p className="mt-1 text-xs text-neutral-600">
                {recipe.grade.facultyName} · {recipe.grade.at}
              </p>
            </section>
          )}

          {can.grade && (
            <form
              onSubmit={submitGrade}
              className="mt-6 rounded-2xl border-2 border-black bg-white p-4"
            >
              <h3 className="text-sm font-black">
                {recipe.grade ? "Update grade" : "Grade this recipe"}
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="text-xs font-bold">
                  Score (0–100)
                  <input
                    value={score}
                    onChange={(event) => setScore(event.target.value)}
                    required
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 block w-28 rounded-lg border-2 border-[#f57696] p-2 text-sm font-normal outline-hidden focus:border-black"
                  />
                </label>
                <label className="min-w-56 flex-1 text-xs font-bold">
                  Remark
                  <input
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)}
                    required
                    className="mt-1 block w-full rounded-lg border-2 border-[#f57696] p-2 text-sm font-normal outline-hidden focus:border-black"
                    placeholder="Assessment note for the student"
                  />
                </label>
              </div>
              <button className="primary-action mt-3 w-auto! px-5!">
                Save grade
              </button>
            </form>
          )}

          <section className="mt-7">
            <h3 className="text-lg font-black">Comments</h3>
            <div className="mt-3 space-y-3">
              {recipe.comments.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-[#f57696] p-5 text-sm">
                  No comments yet.
                </p>
              )}
              {recipe.comments.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-xl border border-[#fbd2dd] bg-[#fffafb] p-3"
                >
                  <p className="text-sm font-bold">
                    {entry.author}{" "}
                    <span className="ml-1 rounded-full bg-[#fbd2dd] px-2 py-0.5 text-[10px] uppercase">
                      {entry.role}
                    </span>
                  </p>
                  <p className="mt-1 text-sm">{entry.text}</p>
                  <p className="mt-1 text-xs text-neutral-500">{entry.at}</p>
                </article>
              ))}
            </div>

            {can.engage ? (
              <form onSubmit={submitComment} className="mt-4">
                <label className="text-xs font-bold" htmlFor="comment-input">
                  Add a comment as {session?.name}
                </label>
                <textarea
                  id="comment-input"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  required
                  className="mt-1 min-h-20 w-full rounded-xl border-2 border-[#f57696] p-3 text-sm outline-hidden focus:border-black"
                  placeholder="Share feedback on this recipe"
                />
                <button className="primary-action mt-2 w-auto! px-5!">
                  Post comment
                </button>
              </form>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-black bg-[#fbd2dd] p-4">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <LockIcon size={16} />
                  Log in to like, save, and comment on recipes.
                </p>
                <button
                  onClick={onRequestSignIn}
                  className="rounded-xl bg-black px-4 py-2 text-xs font-black text-white"
                >
                  Log in
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function EngageButton({ active, disabled, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-xl border-2 border-black px-4 py-2 text-sm font-black transition-colors duration-150 ease-out ${active ? "bg-black text-white" : "bg-white hover:bg-[#fff4f7]"} ${disabled ? "opacity-60" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}
