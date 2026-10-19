import React from "react";
import {
  BookmarkIcon,
  CircleCheckIcon,
  CircleXIcon,
  EyeOffIcon,
  HeartIcon,
  MessageCircleIcon,
  StarIcon,
  UploadIcon,
} from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";

const eventIcon = {
  submitted: <UploadIcon size={16} />,
  comment: <MessageCircleIcon size={16} />,
  grade: <StarIcon size={16} />,
  like: <HeartIcon size={16} />,
  status: <BookmarkIcon size={16} />,
  visibility: <EyeOffIcon size={16} />,
  approved: <CircleCheckIcon size={16} />,
  rejected: <CircleXIcon size={16} />,
};

export function Feed({ scope, onOpenRecipe }) {
  const { events, recipes, session } = useArchive();
  const visible = events.filter((event) => {
    const recipe = recipes.find((entry) => entry.id === event.recipeId);
    if (!recipe) return false;
    if (scope === "student")
      return recipe.student === session?.name || recipe.active;
    if (scope === "member") return recipe.active && event.kind !== "visibility";
    return true;
  });
  const heading =
    scope === "faculty"
      ? "Class activity"
      : scope === "member"
        ? "Community activity"
        : "My activity feed";
  const caption =
    scope === "faculty"
      ? "Submissions, comments, and grading activity across your sections."
      : scope === "member"
        ? "What the culinary community is publishing and discussing."
        : "Updates on your submissions and the recipes you follow.";
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-black">{heading}</h2>
        <p className="text-sm text-neutral-600">{caption}</p>
      </div>
      <ol className="space-y-3">
        {visible.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-[#f57696] p-8 text-center text-sm font-bold">
            No activity yet.
          </li>
        )}
        {visible.map((event) => (
          <FeedRow key={event.id} event={event} onOpenRecipe={onOpenRecipe} />
        ))}
      </ol>
    </section>
  );
}

function FeedRow({ event, onOpenRecipe }) {
  const { recipes } = useArchive();
  const recipe = recipes.find((entry) => entry.id === event.recipeId);
  return (
    <li className="flex items-start gap-3 rounded-2xl border-2 border-[#f57696] bg-white p-4">
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fbd2dd]"
        aria-hidden="true"
      >
        {eventIcon[event.kind]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-black">{event.actor}</span> {event.detail}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          {event.at} · {event.actorRole}
        </p>
      </div>
      {recipe && (
        <button
          onClick={() => onOpenRecipe(recipe.id)}
          className="shrink-0 text-xs font-black underline"
        >
          View
        </button>
      )}
    </li>
  );
}