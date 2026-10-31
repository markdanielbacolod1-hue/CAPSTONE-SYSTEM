import React, { useMemo, useState } from "react";
import { CircleAlertIcon, FileTextIcon, ImageIcon, LockIcon } from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
import { formatMinutes } from "../lib/format";
import { DuplicateResult } from "./DuplicateResult";
import { IngredientRows } from "./IngredientRows";
import { StepRows } from "./StepRows";
const origins = ["Original", "Adapted", "Copied"];
let keySeed = 0;
const key = () => `row-${++keySeed}`;
const blankIngredient = () => ({
  key: key(),
  name: "",
  ingredientCategoryId: 1,
  quantity: "",
  unit: "g",
});
const blankStep = () => ({ key: key(), instruction: "" });
export function SubmissionForm({ onSubmitted }) {
  const { session, can, categories, recipes, addRecipe, previewDuplicateCheck } = useArchive();
  const activeCategories = categories.filter((category) => category.active);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(activeCategories[0]?.id ?? 1);
  const [photo, setPhoto] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState(() => [
    blankIngredient(),
    blankIngredient(),
    blankIngredient(),
  ]);
  const [steps, setSteps] = useState(() => [blankStep(), blankStep()]);
  const [origin, setOrigin] = useState("Original");
  const [originNote, setOriginNote] = useState("");
  const [originalRecipeId, setOriginalRecipeId] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const prep = Math.max(0, Number(prepTime) || 0);
  const cook = Math.max(0, Number(cookTime) || 0);
  const ingredientNames = ingredients.map((row) => row.name).filter((name) => name.trim());
  const check = useMemo(
    () => previewDuplicateCheck({ title, categoryId, ingredientNames, originalRecipeId }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewDuplicateCheck, title, categoryId, ingredientNames.join("|"), originalRecipeId],
  );
  // A student may revise their own recipe once it has a decision.
  const revisable = recipes.filter(
    (recipe) => recipe.student === session?.name && recipe.status !== "Pending",
  );
  if (!can.post) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border-2 border-[#f57696] bg-white p-6 text-center">
        <LockIcon className="mx-auto" />
        <h2 className="mt-3 text-xl font-black">Only students can submit culinary outputs</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Your account can browse, like, save, and comment on approved recipes.
        </p>
      </section>
    );
  }
  const pickFile = (setter) => (event) => {
    const file = event.target.files?.[0];
    setter(file ? { url: URL.createObjectURL(file), name: file.name } : null);
  };
  const reset = () => {
    setTitle("");
    setDescription("");
    setPhoto(null);
    setPdf(null);
    setPrepTime("");
    setCookTime("");
    setIngredients([blankIngredient(), blankIngredient(), blankIngredient()]);
    setSteps([blankStep(), blankStep()]);
    setOrigin("Original");
    setOriginNote("");
    setOriginalRecipeId(null);
    setAcknowledged(false);
    setError("");
  };
  const submit = (event) => {
    event.preventDefault();
    if (!photo || !pdf) return setError("Attach both the dish photo and the recipe PDF.");
    if (check?.result === "Possible duplicate" && !acknowledged)
      return setError("Confirm that you have reviewed the possible duplicate before submitting.");
    const result = addRecipe({
      title,
      description,
      categoryId,
      dishPhoto: photo.url,
      pdfFile: pdf.url,
      pdfName: pdf.name,
      prepTime: prep,
      cookTime: cook,
      origin,
      originNote,
      originalRecipeId,
      ingredients: ingredients.filter((row) => row.name.trim()),
      steps: steps.filter((step) => step.instruction.trim()),
    });
    if (!result.ok) return setError(result.message);
    onSubmitted(
      `${result.recipe.title} was submitted and is pending faculty review. Duplicate check: ${result.check.result.toLowerCase()}.`,
    );
    reset();
  };
  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-4xl rounded-2xl border-2 border-[#f57696] bg-white p-6 shadow-[7px_7px_0_#fbd2dd]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">New lab output submission</h2>
          <p className="text-sm text-neutral-600">
            Share your recipe for faculty review. It stays private until it is approved.
          </p>
        </div>
        <p className="rounded-lg bg-[#fff4f7] px-3 py-2 text-xs">
          Submitting as <span className="font-black">{session?.name}</span> ·{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* A · recipe */}
      <FormSection title="Recipe information">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Recipe title
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
              placeholder="e.g. Chicken Tinola"
            />
          </label>
          <label className="text-sm font-bold">
            Recipe category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              className="field"
            >
              {activeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-bold">
          Recipe description
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field min-h-24"
            placeholder="Describe the dish, the method, and what makes it work."
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_minmax(0,1.1fr)]">
          <label className="text-sm font-bold">
            Preparation time
            <span className="relative block">
              <input
                required
                type="number"
                min={0}
                value={prepTime}
                onChange={(event) => setPrepTime(event.target.value)}
                className="field pr-12"
                placeholder="0"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs font-bold text-neutral-500">
                min
              </span>
            </span>
          </label>
          <label className="text-sm font-bold">
            Cooking time
            <span className="relative block">
              <input
                required
                type="number"
                min={0}
                value={cookTime}
                onChange={(event) => setCookTime(event.target.value)}
                className="field pr-12"
                placeholder="0"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs font-bold text-neutral-500">
                min
              </span>
            </span>
          </label>
          <div className="text-sm font-bold">
            Total duration
            <p className="mt-1 rounded-lg bg-black px-3 py-3 text-white" aria-live="polite">
              <span className="font-black">{formatMinutes(prep + cook)}</span>
              <span className="ml-2 text-xs font-normal text-neutral-300">
                {prep + cook} min, calculated
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FilePick
            icon={<ImageIcon size={20} />}
            label="Dish photo"
            hint="JPG or PNG"
            accept="image/*"
            file={photo}
            onChange={pickFile(setPhoto)}
            preview={photo?.url}
          />
          <FilePick
            icon={<FileTextIcon size={20} />}
            label="Recipe PDF file"
            hint="PDF only"
            accept="application/pdf,.pdf"
            file={pdf}
            onChange={pickFile(setPdf)}
          />
        </div>
      </FormSection>

      {/* B · ingredients */}
      <FormSection title="Ingredients" count={`${ingredientNames.length} added`}>
        <IngredientRows
          rows={ingredients}
          onChange={setIngredients}
          onAdd={() => setIngredients((rows) => [...rows, blankIngredient()])}
        />
      </FormSection>

      {/* C · steps */}
      <FormSection
        title="Preparation procedure"
        count={`${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
      >
        <StepRows
          steps={steps}
          onChange={setSteps}
          onAdd={() => setSteps((rows) => [...rows, blankStep()])}
        />
      </FormSection>

      {/* D · originality */}
      <FormSection title="Originality and duplicate check">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold">Submission type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill pressed={originalRecipeId === null} onClick={() => setOriginalRecipeId(null)}>
                New recipe
              </Pill>
              <Pill
                pressed={originalRecipeId !== null}
                disabled={revisable.length === 0}
                onClick={() => setOriginalRecipeId(revisable[0]?.id ?? null)}
              >
                Revised version
              </Pill>
            </div>
            {originalRecipeId !== null && (
              <label className="mt-3 block text-xs font-bold">
                Original recipe being revised
                <select
                  value={originalRecipeId}
                  onChange={(event) => setOriginalRecipeId(event.target.value)}
                  className="field"
                >
                  {revisable.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title} · v{recipe.version} · {recipe.status}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {revisable.length === 0 && (
              <p className="mt-2 text-xs text-neutral-600">
                Revisions are available once one of your recipes has been reviewed.
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-bold">Originality declaration</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {origins.map((item) => (
                <Pill key={item} pressed={origin === item} onClick={() => setOrigin(item)}>
                  {item}
                </Pill>
              ))}
            </div>
            <label className="mt-3 block text-xs font-bold">
              {origin === "Original"
                ? "How did you develop this recipe?"
                : "Source or reference being credited"}
              <input
                required
                value={originNote}
                onChange={(event) => setOriginNote(event.target.value)}
                className="field"
                placeholder={
                  origin === "Original"
                    ? "Developed during our lamination lab"
                    : "Credit the original author or publication"
                }
              />
            </label>
          </fieldset>
        </div>

        <div className="mt-5">
          {check ? (
            <DuplicateResult
              result={check.result}
              similarity={check.similarity}
              match={check.match}
              caption={check.message}
            >
              {check.result === "Revision of own recipe" && !originalRecipeId && check.match && (
                <button
                  type="button"
                  onClick={() => setOriginalRecipeId(check.match.id)}
                  className="mt-3 rounded-lg bg-black px-3 py-2 text-xs font-black text-white"
                >
                  Submit as a revision of “{check.match.title}”
                </button>
              )}
              {check.result === "Possible duplicate" && (
                <label className="mt-3 flex items-start gap-2 text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-black"
                  />
                  I have compared my recipe with this record and credited any shared source in my
                  declaration.
                </label>
              )}
            </DuplicateResult>
          ) : (
            <p className="rounded-xl border-2 border-dashed border-[#f57696] p-4 text-xs text-neutral-600">
              The repository is checked for duplicates as you enter the title and ingredients.
            </p>
          )}
          <p className="mt-2 text-xs text-neutral-600">
            The duplicate check is recorded separately and is not a faculty approval.
          </p>
        </div>
      </FormSection>

      {error && (
        <p
          className="mt-5 flex items-start gap-2 rounded-xl border-2 border-[#a33] bg-[#ffe0e0] p-3 text-sm font-bold"
          role="alert"
        >
          <CircleAlertIcon size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t-2 border-[#fbd2dd] pt-5">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border-2 border-black px-5 py-2 text-sm font-bold"
        >
          Clear form
        </button>
        <button className="primary-action w-auto! px-5!">Submit for review</button>
      </div>
    </form>
  );
}
function FormSection({ title, count, children }) {
  return (
    <section className="mt-7 border-t-2 border-[#fbd2dd] pt-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-black">{title}</h3>
        {count && <span className="text-xs font-bold text-neutral-600">{count}</span>}
      </div>
      {children}
    </section>
  );
}
function Pill({ pressed, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`whitespace-nowrap rounded-full border-2 border-black px-4 py-1.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${pressed ? "bg-black text-white" : "bg-white"}`}
    >
      {children}
    </button>
  );
}
function FilePick({ icon, label, hint, accept, file, preview, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-[#f57696] p-4 text-sm font-bold transition-colors duration-150 ease-out hover:bg-[#fff4f7]">
      {preview ? (
        <img
          src={preview}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg border-2 border-black object-cover"
        />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#fbd2dd]">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {label}
        <span className="block truncate text-xs font-normal text-neutral-600">
          {file ? file.name : `${hint} · click to upload`}
        </span>
      </span>
      <input className="sr-only" type="file" accept={accept} onChange={onChange} />
    </label>
  );
}
