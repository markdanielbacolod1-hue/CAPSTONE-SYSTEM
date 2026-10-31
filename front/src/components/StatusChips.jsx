import React from "react";
import { useArchive } from "../contexts/ArchiveContext";
const statusTone = {
  Pending: "bg-[#fdf0c9] border-[#8a6d1f]",
  Approved: "bg-[#d8f5e3] border-[#1f7a4d]",
  Rejected: "bg-[#ffe0e0] border-[#a33]",
};
/**
 * Category for everyone. Submission status and active/inactive only for the
 * owner, faculty and administrators — a public viewer only ever sees
 * approved, active recipes, so those chips would say nothing to them.
 */
export function StatusChips({ recipe, compact = false }) {
  const { categoryName, canSeeReview } = useArchive();
  const showReview = canSeeReview(recipe);
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "text-[10px]" : "text-xs"} font-bold`}
    >
      <span className="rounded-full bg-[#fbd2dd] px-2 py-1">{categoryName(recipe.categoryId)}</span>
      {showReview && (
        <>
          <span className={`rounded-full border px-2 py-1 ${statusTone[recipe.status]}`}>
            {recipe.status === "Pending" ? "Pending review" : recipe.status}
          </span>
          <span
            className={`rounded-full border px-2 py-1 ${recipe.active ? "border-[#1f7a4d] bg-[#d8f5e3]" : "border-neutral-500 bg-neutral-200"}`}
          >
            {recipe.active ? "Active" : "Inactive"}
          </span>
        </>
      )}
      {recipe.version > 1 && (
        <span className="rounded-full border border-black px-2 py-1">Version {recipe.version}</span>
      )}
    </div>
  );
}