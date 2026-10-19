import React, { useMemo, useState } from "react";
import {
  BookOpenIcon,
  ChefHatIcon,
  Clock3Icon,
  HeartIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
import { ReviewActions } from "./ReviewActions";
import { StatusChips } from "./StatusChips";

export function Archive({
  title = "Recipe archive",
  caption = "Browse student work, culinary outputs, and archived recipes.",
  source,
  visibility = "public",
  onOpenRecipe,
}) {
  const { recipes } = useArchive();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const pool = source ?? recipes;
  const filtered = useMemo(
    () =>
      pool
        .filter((recipe) => (visibility === "public" ? recipe.active : true))
        .filter((recipe) => filter === "All" || recipe.status === filter)
        .filter((recipe) =>
          `${recipe.title} ${recipe.category} ${recipe.student}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [filter, pool, query, visibility],
  );
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-7">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">CULINARY REPOSITORY</p>
          <h1 className="page-title">{title}</h1>
          <p className="mt-1 text-sm text-neutral-600">{caption}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_#f57696]">
          <SearchIcon size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-52 bg-transparent text-sm outline-hidden"
            placeholder="Search the archive"
            aria-label="Search recipes"
          />
        </div>
      </div>

      <div
        className="mb-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Recipe status filter"
      >
        {["All", "Submitted", "In Review", "Archived", "Rejected"].map(
          (item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`rounded-full border border-[#f57696] px-4 py-1.5 text-sm font-bold ${filter === item ? "bg-[#fbd2dd]" : "bg-white"}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onOpenRecipe={onOpenRecipe}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-[#f57696] p-12 text-center">
          <BookOpenIcon className="mx-auto mb-3" />
          <p className="font-bold">No recipes found</p>
        </div>
      )}
    </section>
  );
}

function RecipeCard({ recipe, onOpenRecipe }) {
  const { isLiked, can } = useArchive();
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border-2 border-[#f57696] bg-white shadow-[5px_5px_0_#111] ${recipe.active ? "" : "opacity-80"}`}
    >
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="grid h-40 w-full place-items-center bg-[#fbd2dd]">
          <ChefHatIcon size={44} strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <StatusChips recipe={recipe} compact />
        <h2 className="mt-3 font-extrabold">{recipe.title}</h2>
        <p className="mt-1 text-xs text-neutral-600">
          {recipe.student} · {recipe.lab}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-600">
          <span className="flex items-center gap-1">
            <HeartIcon
              size={13}
              className={isLiked(recipe) ? "fill-current" : ""}
            />
            {recipe.likedBy.length}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircleIcon size={13} />
            {recipe.comments.length}
          </span>
          {recipe.grade && (
            <span className="font-bold">Grade {recipe.grade.score}</span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="flex items-center gap-1">
            <Clock3Icon size={13} />
            {recipe.date}
          </span>
          <button
            onClick={() => onOpenRecipe(recipe.id)}
            className="rounded-lg border-2 border-black px-3 py-1.5 font-black transition-colors duration-150 ease-out hover:bg-[#fbd2dd]"
          >
            VIEW
          </button>
        </div>
        {can.grade && recipe.decision === "Pending" && (
          <ReviewActions recipe={recipe} layout="inline" />
        )}
      </div>
    </article>
  );
}
