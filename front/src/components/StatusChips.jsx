import React from "react";

const originTone = {
  Original: "bg-[#d8f5e3] border-[#1f7a4d]",
  Adapted: "bg-[#fdf0c9] border-[#8a6d1f]",
  Copied: "bg-[#ffe0e0] border-[#a33]",
};

const decisionTone = {
  Pending: "bg-[#fdf0c9] border-[#8a6d1f]",
  Approved: "bg-[#d8f5e3] border-[#1f7a4d]",
  Rejected: "bg-[#ffe0e0] border-[#a33]",
};

export function StatusChips({ recipe, compact = false }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "text-[10px]" : "text-xs"} font-bold`}
    >
      <span className="rounded-full bg-[#fbd2dd] px-2 py-1">
        {recipe.category}
      </span>
      <span className="rounded-full border border-black px-2 py-1">
        {recipe.status}
      </span>
      <span
        className={`rounded-full border px-2 py-1 ${decisionTone[recipe.decision]}`}
      >
        {recipe.decision === "Pending" ? "Awaiting review" : recipe.decision}
      </span>
      <span
        className={`rounded-full border px-2 py-1 ${recipe.active ? "border-[#1f7a4d] bg-[#d8f5e3]" : "border-neutral-500 bg-neutral-200"}`}
      >
        {recipe.active ? "Active" : "Inactive"}
      </span>
      <span
        className={`rounded-full border px-2 py-1 ${originTone[recipe.origin]}`}
      >
        {recipe.origin}
      </span>
    </div>
  );
}