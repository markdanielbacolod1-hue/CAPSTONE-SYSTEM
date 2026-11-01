import React, { useEffect, useState } from "react";
import { useArchive } from "../contexts/ArchiveContext";

export function IngredientManager() {
  const { ingredients, ingredientCategories, manageRecord, refreshArchive } = useArchive();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setCategoryId("");
    setEditing(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await manageRecord("ingredients", editing?.id, editing ? "PUT" : "POST", {
        name,
        categoryId: categoryId || null,
      });
      reset();
    } catch (err) {
      setError(err.message || "Unable to save ingredient.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete “${row.name}”?`)) return;
    setBusy(true);
    setError("");
    try {
      await manageRecord("ingredients", row.id, "DELETE");
    } catch (err) {
      setError(err.message || "Unable to delete ingredient. It may be used by a recipe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-[#f57696] bg-white p-6">
      <h2 className="text-xl font-black">Ingredient library</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Manage reusable ingredients and assign ingredient categories.
      </p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingredient name"
          className="rounded-lg border-2 border-[#f57696] p-3"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border-2 border-[#f57696] bg-white p-3"
        >
          <option value="">Uncategorised</option>
          {ingredientCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button disabled={busy} className="rounded-lg bg-black px-4 py-2 font-bold text-white">
            {busy ? "Saving…" : editing ? "Update" : "Add ingredient"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="rounded-lg border-2 border-black px-3">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fbd2dd] text-xs uppercase">
            <tr>
              <th className="p-3">Ingredient</th>
              <th className="p-3">Category</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((row) => (
              <tr key={row.id} className="border-t border-[#fbd2dd]">
                <td className="p-3 font-bold">{row.name}</td>
                <td className="p-3">
                  {ingredientCategories.find((c) => c.id === row.ingredientCategoryId)?.name || "Uncategorised"}
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditing(row);
                        setName(row.name);
                        setCategoryId(String(row.ingredientCategoryId || ""));
                      }}
                      className="font-bold underline"
                    >
                      Edit
                    </button>
                    <button disabled={busy} onClick={() => remove(row)} className="font-bold text-red-700 underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!ingredients.length && (
              <tr>
                <td colSpan="3" className="p-5 text-center">
                  No ingredients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}