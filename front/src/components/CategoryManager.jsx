import React, { useEffect, useState } from "react";
import { useArchive } from "../contexts/ArchiveContext";

export function CategoryManager({ ingredient = false, onUpdate }) {
  const { categories, ingredientCategories, ingredients, recipes, manageRecord } = useArchive();
  const resource = ingredient ? "ingredient-categories" : "categories";
  const rows = ingredient ? ingredientCategories : categories;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const countFor = (row) =>
    ingredient
      ? ingredients.filter((item) => item.ingredientCategoryId === row.id).length
      : recipes.filter((item) => item.categoryId === row.id).length;

  const reset = () => {
    setName("");
    setDescription("");
    setEditing(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await manageRecord(resource, editing?.id, editing ? "PUT" : "POST", { name, description });
      onUpdate?.(`${ingredient ? "Ingredient category" : "Recipe category"} ${editing ? "updated" : "created"}.`);
      reset();
    } catch (err) {
      setError(err.message || "Unable to save this category.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete “${row.name}”? This may be blocked if records use it.`)) return;
    setBusy(true);
    setError("");
    try {
      await manageRecord(resource, row.id, "DELETE");
      onUpdate?.(`${row.name} deleted.`);
    } catch (err) {
      setError(err.message || "Unable to delete this category. It may be in use.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-[#f57696] bg-white p-6">
      <h2 className="text-xl font-black">{ingredient ? "Ingredient categories" : "Recipe categories"}</h2>
      <p className="mt-1 text-sm text-neutral-600">Manage categories stored in the database.</p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="rounded-lg border-2 border-[#f57696] p-3"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="rounded-lg border-2 border-[#f57696] p-3"
        />
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-lg bg-black px-4 py-2 font-bold text-white">
            {busy ? "Saving…" : editing ? "Update" : "Add category"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="rounded-lg border-2 border-black px-3">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-5 divide-y divide-[#fbd2dd]">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-bold">{row.name}</p>
              <p className="text-xs text-neutral-500">
                {row.description || "No description"} · {countFor(row)} linked records
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(row);
                  setName(row.name);
                  setDescription(row.description || "");
                }}
                className="text-sm font-bold underline"
              >
                Edit
              </button>
              <button disabled={busy} onClick={() => remove(row)} className="text-sm font-bold text-red-700 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!rows.length && <p className="py-5 text-sm text-neutral-500">No categories found.</p>}
      </div>
    </section>
  );
}