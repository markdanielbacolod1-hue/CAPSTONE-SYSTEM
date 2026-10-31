import React from "react";
import { CircleAlertIcon, CircleCheckIcon, GitBranchIcon, OctagonXIcon } from "lucide-react";
const tone = {
  "No close match": {
    box: "border-[#1f7a4d] bg-[#f1fbf5]",
    icon: <CircleCheckIcon size={18} className="text-[#1f7a4d]" />,
    label: "No close match found",
  },
  "Possible duplicate": {
    box: "border-[#8a6d1f] bg-[#fdf6df]",
    icon: <CircleAlertIcon size={18} className="text-[#8a6d1f]" />,
    label: "Possible duplicate",
  },
  "Revision of own recipe": {
    box: "border-black bg-[#fff4f7]",
    icon: <GitBranchIcon size={18} />,
    label: "Revision of an earlier recipe",
  },
  "Blocked duplicate": {
    box: "border-[#a33] bg-[#ffe0e0]",
    icon: <OctagonXIcon size={18} className="text-[#a33]" />,
    label: "Duplicate — cannot be submitted",
  },
};
/** A recipe_duplication_log result. Deliberately says nothing about approval or originality. */
export function DuplicateResult({ result, similarity, match, caption, children }) {
  const style = tone[result];
  return (
    <div
      className={`rounded-xl border-2 p-4 ${style.box}`}
      role={result === "Blocked duplicate" ? "alert" : "status"}
    >
      <p className="flex items-center gap-2 text-sm font-black">
        {style.icon}
        Duplicate check: {style.label}
        {match && (
          <span className="ml-auto text-xs font-bold tabular-nums">{similarity}% similar</span>
        )}
      </p>
      {match && (
        <p className="mt-1 text-xs font-bold">
          Closest record: “{match.title}” by {match.student} · {match.submittedAt}
        </p>
      )}
      <p className="mt-1 text-xs text-neutral-700">{caption}</p>
      {children}
    </div>
  );
}