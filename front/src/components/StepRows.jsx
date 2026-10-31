import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
/** Saved as `recipe_step` rows; step_number is always the row's position, so it renumbers itself. */
export function StepRows({ steps, onChange, onAdd }) {
  const reduceMotion = useReducedMotion();
  const move = (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div>
      <ol className="space-y-3">
        <AnimatePresence initial={false}>
          {steps.map((step, index) => (
            <motion.li
              key={step.key}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex gap-3"
            >
              <span
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-xs font-black text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <label className="min-w-0 flex-1 text-xs font-bold">
                <span className="sr-only">Step {index + 1} instruction</span>
                <textarea
                  required
                  value={step.instruction}
                  onChange={(event) =>
                    onChange(
                      steps.map((entry) =>
                        entry.key === step.key
                          ? { ...entry, instruction: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="field mt-0! min-h-20"
                  placeholder={
                    index === 0
                      ? "e.g. Dissolve the sugar in lukewarm water and stir in the yeast."
                      : "Describe the next step"
                  }
                />
              </label>
              <div className="flex shrink-0 flex-col gap-1">
                <IconButton
                  label={`Move step ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUpIcon size={15} />
                </IconButton>
                <IconButton
                  label={`Move step ${index + 1} down`}
                  disabled={index === steps.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDownIcon size={15} />
                </IconButton>
                <IconButton
                  label={`Remove step ${index + 1}`}
                  disabled={steps.length === 1}
                  onClick={() => onChange(steps.filter((entry) => entry.key !== step.key))}
                  danger
                >
                  <Trash2Icon size={15} />
                </IconButton>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 rounded-xl border-2 border-dashed border-black px-4 py-2 text-sm font-black transition-colors duration-150 ease-out hover:bg-[#fff4f7]"
      >
        <PlusIcon size={16} />
        Add step
      </button>
    </div>
  );
}
function IconButton({ label, disabled, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-md border-2 border-black bg-white transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-30 ${danger ? "hover:bg-[#ffe0e0]" : "hover:bg-[#fff4f7]"}`}
    >
      {children}
    </button>
  );
}
