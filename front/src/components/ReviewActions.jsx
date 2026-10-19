import React, { useState } from "react";
import { CircleCheckIcon, CircleXIcon } from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";

export function ReviewActions({ recipe, layout = "panel" }) {
  const { can, approveRecipe, rejectRecipe } = useArchive();
  const [note, setNote] = useState(recipe.decisionNote);
  const [error, setError] = useState("");
  if (!can.grade) return null;
  const reject = () => {
    if (!note.trim()) {
      setError("Add a short reason so the student knows what to fix.");
      return;
    }
    setError("");
    rejectRecipe(recipe.id, note);
  };
  if (layout === "inline") {
    return (
      <div className="mt-3 flex gap-2">
        <button
          onClick={() =>
            approveRecipe(recipe.id, "Approved from the review queue.")
          }
          className="flex-1 rounded-lg border-2 border-[#1f7a4d] bg-[#d8f5e3] px-2 py-1.5 text-xs font-black"
        >
          Approve
        </button>
        <button
          onClick={() =>
            rejectRecipe(
              recipe.id,
              "Returned for revision from the review queue.",
            )
          }
          className="flex-1 rounded-lg border-2 border-[#a33] bg-[#ffe0e0] px-2 py-1.5 text-xs font-black"
        >
          Reject
        </button>
      </div>
    );
  }
  return (
    <section className="mt-6 rounded-2xl border-2 border-black bg-white p-4">
      <h3 className="text-sm font-black">Review decision</h3>
      <p className="mt-1 text-xs text-neutral-600">
        Approving publishes this output to the archive. Rejecting returns it to
        the student and sets it inactive.
      </p>
      <label className="mt-3 block text-xs font-bold">
        Decision note
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="field min-h-20"
          placeholder="Explain what to improve, or leave an approval remark."
        />
      </label>
      {error && <p className="mt-1 text-xs font-bold text-[#a33]">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={() => approveRecipe(recipe.id, note)}
          className="flex items-center gap-2 rounded-xl border-2 border-[#1f7a4d] bg-[#d8f5e3] px-5 py-2 text-sm font-black"
        >
          <CircleCheckIcon size={16} />
          Approve recipe
        </button>
        <button
          onClick={reject}
          className="flex items-center gap-2 rounded-xl border-2 border-[#a33] bg-[#ffe0e0] px-5 py-2 text-sm font-black"
        >
          <CircleXIcon size={16} />
          Reject recipe
        </button>
      </div>
    </section>
  );
}
