import React, { useState } from "react";
import {
  BookmarkIcon,
  ChefHatIcon,
  FileTextIcon,
  GitBranchIcon,
  HeartIcon,
  LockIcon,
  MessageCircleIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
import { formatMinutes, formatQuantity } from "../lib/format";
import { DuplicateResult } from "./DuplicateResult";
import { ReviewActions } from "./ReviewActions";
import { StatusChips } from "./StatusChips";
export function RecipeDetail({ recipe, onClose, onRequestSignIn }) {
  const {
    session,
    can,
    isLiked,
    isSaved,
    isPublic,
    canView,
    canSeeReview,
    toggleLike,
    toggleSave,
    addComment,
    gradeRecipe,
    setActive,
    categoryName,
    getRecipeIngredients,
    getRecipeSteps,
    getDuplicationLog,
    findRecipe,
  } = useArchive();
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(recipe.grade ? String(recipe.grade.score) : "");
  const [remark, setRemark] = useState(recipe.grade?.remark ?? "");
  const liked = isLiked(recipe);
  const saved = isSaved(recipe);
  const publicRecipe = isPublic(recipe);
  const showReview = canSeeReview(recipe);
  // Joined through recipe_ingredient and recipe_step on this recipe_id only.
  const ingredientLines = recipe.ingredients?.length ? recipe.ingredients : getRecipeIngredients(recipe.id);
  const steps = recipe.steps?.length ? recipe.steps : getRecipeSteps(recipe.id);
  const duplicationLog = showReview ? getDuplicationLog(recipe.id) : null;
  const original = findRecipe(recipe.originalRecipeId);
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
  if (!canView(recipe)) {
    return (
      <div
        className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label="Recipe unavailable"
      >
        <div className="max-w-md rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[10px_10px_0_#f57696]">
          <LockIcon className="mx-auto" />
          <h2 className="mt-3 text-xl font-black">This recipe is not public</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Only approved, active recipes appear in the archive.
          </p>
          <button onClick={onClose} className="primary-action mt-5">
            Close
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-black/70 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={recipe.title}
    >
      <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[10px_10px_0_#f57696]">
        <div className="relative">
          {recipe.dishPhoto ? (
            <img
              src={recipe.dishPhoto}
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
          <h2 className="mt-3 text-3xl font-black tracking-tight">{recipe.title}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {categoryName(recipe.categoryId)} · by {recipe.student} · Submitted {recipe.submittedAt}
          </p>
          {original && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold">
              <GitBranchIcon size={14} />
              Version {recipe.version}, revised from “{original.title}”
            </p>
          )}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-700">
            {recipe.description}
          </p>

          <div className="mt-5 flex flex-wrap items-stretch gap-y-3 border-y-2 border-[#fbd2dd] py-4">
            <TimeFact label="Preparation" value={formatMinutes(recipe.prepTime)} />
            <TimeFact label="Cooking" value={formatMinutes(recipe.cookTime)} />
            <TimeFact label="Total duration" value={formatMinutes(recipe.totalDuration)} strong />
            {recipe.pdfFile && (
              <a
                href={recipe.pdfFile}
                target="_blank"
                rel="noreferrer"
                download={recipe.pdfName}
                className="ml-auto flex items-center gap-2 self-center rounded-xl border-2 border-black px-4 py-2 text-xs font-black transition-colors duration-150 ease-out hover:bg-[#fff4f7]"
              >
                <FileTextIcon size={16} />
                Recipe PDF
                <span className="hidden max-w-40 truncate font-normal text-neutral-600 sm:inline">
                  {recipe.pdfName}
                </span>
              </a>
            )}
          </div>

          <p className="mt-3 max-w-2xl rounded-xl bg-[#fff4f7] p-3 text-xs font-bold">
            Declared by the student: {recipe.origin} — {recipe.originNote}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {publicRecipe && (
              <>
                <EngageButton
                  active={liked}
                  disabled={!can.engage}
                  onClick={() => (can.engage ? toggleLike(recipe.id) : onRequestSignIn())}
                  label={`${liked ? "Liked" : "Like"} · ${recipe.likedBy.length}`}
                  icon={<HeartIcon size={16} className={liked ? "fill-current" : ""} />}
                />
                <EngageButton
                  active={saved}
                  disabled={!can.engage}
                  onClick={() => (can.engage ? toggleSave(recipe.id) : onRequestSignIn())}
                  label={saved ? "Saved" : "Save"}
                  icon={<BookmarkIcon size={16} className={saved ? "fill-current" : ""} />}
                />
              </>
            )}
            <span className="flex items-center gap-1 text-sm font-bold text-neutral-600">
              <MessageCircleIcon size={16} />
              {recipe.comments.length} comments
            </span>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <section>
              <h3 className="text-lg font-black">
                Ingredients{" "}
                <span className="text-sm font-bold text-neutral-500">
                  ({ingredientLines.length})
                </span>
              </h3>
              {ingredientLines.length === 0 ? (
                <p className="mt-3 rounded-xl border-2 border-dashed border-[#f57696] p-5 text-sm">
                  No ingredients recorded.
                </p>
              ) : (
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-[11px] uppercase text-neutral-600">
                    <tr className="border-b-2 border-black">
                      <th className="py-2 pr-2 font-black">Ingredient</th>
                      <th className="py-2 pr-2 text-right font-black">Qty</th>
                      <th className="py-2 font-black">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientLines.map((line) => (
                      <tr key={line.id} className="border-b border-[#fbd2dd] align-top">
                        <td className="py-2 pr-2">
                          <span className="font-bold">{line.name}</span>
                          <span className="block text-[11px] text-neutral-600">
                            {line.categoryName}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-right font-bold tabular-nums">
                          {formatQuantity(line.quantity)}
                        </td>
                        <td className="py-2">{line.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section>
              <h3 className="text-lg font-black">Preparation procedure</h3>
              {steps.length === 0 ? (
                <p className="mt-3 rounded-xl border-2 border-dashed border-[#f57696] p-5 text-sm">
                  No steps recorded.
                </p>
              ) : (
                <ol className="mt-3 space-y-4">
                  {steps.map((step) => (
                    <li key={step.id} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-xs font-black text-white">
                        {step.stepNumber}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {showReview && (
            <section className="mt-8 rounded-2xl border-2 border-black p-4">
              <h3 className="text-sm font-black">Recipe status</h3>
              <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-neutral-600">Submission status</dt>
                  <dd
                    className={`mt-1 font-black ${recipe.status === "Approved" ? "text-[#1f7a4d]" : recipe.status === "Rejected" ? "text-[#a33]" : "text-[#8a6d1f]"}`}
                  >
                    {recipe.status === "Pending" ? "Pending review" : recipe.status}
                  </dd>
                  {recipe.reviewedBy && (
                    <dd className="text-xs text-neutral-600">
                      {recipe.reviewedBy} · {recipe.reviewedAt}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-bold text-neutral-600">Visibility</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="font-black">{recipe.active ? "Active" : "Inactive"}</span>
                    {can.moderate && (
                      <button
                        onClick={() => setActive(recipe.id, !recipe.active)}
                        className="rounded-lg border-2 border-black px-3 py-1 text-xs font-black"
                      >
                        {recipe.active ? "Set inactive" : "Set active"}
                      </button>
                    )}
                  </dd>
                  <dd className="text-xs text-neutral-600">
                    {publicRecipe
                      ? "Shown in the public archive."
                      : "Hidden from the public archive."}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold text-neutral-600">Review remarks</dt>
                  <dd className="mt-1">
                    {recipe.reviewRemarks || (
                      <span className="text-neutral-600">No remarks yet.</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {duplicationLog && (
            <section className="mt-4">
              <DuplicateResult
                result={duplicationLog.result}
                similarity={duplicationLog.similarity}
                match={findRecipe(duplicationLog.matchedRecipeId)}
                caption={`Checked ${duplicationLog.checkedAt}. This is an automated repository check, not a faculty decision or proof of originality.`}
              />
            </section>
          )}

          <ReviewActions recipe={recipe} />

          {recipe.grade && (showReview || publicRecipe) && (
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
              <button className="primary-action mt-3 w-auto! px-5!">Save grade</button>
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
                <button className="primary-action mt-2 w-auto! px-5!">Post comment</button>
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
function TimeFact({ label, value, strong = false }) {
  return (
    <div className="min-w-28 border-r border-[#fbd2dd] pr-5 mr-5 last:border-0">
      <p className="text-[11px] font-bold uppercase text-neutral-600">{label}</p>
      <p className={`mt-0.5 font-black ${strong ? "text-xl" : "text-base"}`}>{value}</p>
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
