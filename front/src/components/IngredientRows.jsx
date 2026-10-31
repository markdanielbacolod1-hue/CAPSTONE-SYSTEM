import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
export const UNITS = ["g", "kg", "ml", "L", "tsp", "tbsp", "cup", "pc", "can", "pinch", "clove"];
/** Each row becomes an `ingredient` (reused by name, or inserted) plus a `recipe_ingredient` row. */
export function IngredientRows({ rows, onChange, onAdd }) {
  const { ingredients, ingredientCategories } = useArchive();
  const reduceMotion = useReducedMotion();
  const update = (key, patch) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const changeName = (key, name) => {
    const known = ingredients.find(
      (entry) => entry.name.toLowerCase() === name.trim().toLowerCase(),
    );
    update(key, known ? { name, ingredientCategoryId: known.ingredientCategoryId } : { name });
  };
  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_5.5rem_6rem_2.5rem] gap-2 px-1 pb-1 text-[11px] font-black uppercase text-neutral-600 sm:grid">
        <span>Ingredient name</span>
        <span>Ingredient category</span>
        <span>Quantity</span>
        <span>Unit</span>
        <span className="sr-only">Remove</span>
      </div>

      <datalist id="known-ingredients">
        {ingredients.map((entry) => (
          <option key={entry.id} value={entry.name} />
        ))}
      </datalist>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {rows.map((row, index) => (
            <motion.li
              key={row.key}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-2 gap-2 rounded-xl border border-[#fbd2dd] bg-[#fffafb] p-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_5.5rem_6rem_2.5rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
            >
              <label className="col-span-2 text-xs font-bold sm:col-span-1">
                <span className="sm:sr-only">Ingredient {index + 1} name</span>
                <input
                  required
                  list="known-ingredients"
                  value={row.name}
                  onChange={(event) => changeName(row.key, event.target.value)}
                  className="field sm:mt-0!"
                  placeholder="e.g. Bread flour"
                  aria-label={`Ingredient ${index + 1} name`}
                />
              </label>
              <label className="col-span-2 text-xs font-bold sm:col-span-1">
                <span className="sm:sr-only">Ingredient category</span>
                <select
                  value={row.ingredientCategoryId}
                  onChange={(event) =>
                    update(row.key, { ingredientCategoryId: Number(event.target.value) })
                  }
                  className="field sm:mt-0!"
                  aria-label={`Ingredient ${index + 1} category`}
                >
                  {ingredientCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold">
                <span className="sm:sr-only">Quantity</span>
                <input
                  required
                  type="number"
                  min={0.01}
                  step="any"
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(event) => update(row.key, { quantity: event.target.value })}
                  className="field sm:mt-0!"
                  placeholder="0"
                  aria-label={`Ingredient ${index + 1} quantity`}
                />
              </label>
              <label className="text-xs font-bold">
                <span className="sm:sr-only">Unit</span>
                <select
                  value={row.unit}
                  onChange={(event) => update(row.key, { unit: event.target.value })}
                  className="field sm:mt-0!"
                  aria-label={`Ingredient ${index + 1} unit`}
                >
                  {UNITS.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => onChange(rows.filter((entry) => entry.key !== row.key))}
                disabled={rows.length === 1}
                className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-black text-xs font-black transition-colors duration-150 ease-out hover:bg-[#ffe0e0] disabled:cursor-not-allowed disabled:opacity-30 sm:col-span-1 sm:w-10"
                aria-label={`Remove ingredient ${index + 1}`}
              >
                <Trash2Icon size={15} />
                <span className="sm:hidden">Remove</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 rounded-xl border-2 border-dashed border-black px-4 py-2 text-sm font-black transition-colors duration-150 ease-out hover:bg-[#fff4f7]"
      >
        <PlusIcon size={16} />
        Add ingredient
      </button>
    </div>
  );
}