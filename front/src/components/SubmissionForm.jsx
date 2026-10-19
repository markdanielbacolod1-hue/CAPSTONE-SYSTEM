import React, { useState } from "react";
import { useArchive } from "../contexts/ArchiveContext";

const origins = ["Original", "Adapted", "Copied"];

export function SubmissionForm({ onSubmitted }) {
  const { addRecipe } = useArchive();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Bread");
  const [lab, setLab] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("Original");
  const [originNote, setOriginNote] = useState("");
  const [active, setActive] = useState(true);
  const submit = (event) => {
    event.preventDefault();
    addRecipe({
      title,
      category,
      lab,
      date,
      description,
      origin,
      originNote,
      active,
    });
    onSubmitted(`${title} was submitted for instructor review.`);
  };
  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-3xl rounded-2xl border-2 border-[#f57696] bg-white p-6 shadow-[7px_7px_0_#fbd2dd]"
    >
      <h2 className="text-xl font-black">New lab output submission</h2>
      <p className="mb-6 text-sm text-neutral-600">
        Share your recipe for faculty review, then declare how the recipe was
        sourced.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          Recipe / output title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field"
            placeholder="e.g. Chicken Tinola"
          />
        </label>
        <label className="text-sm font-bold">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="field"
          >
            {["Bread", "Pastry", "Cookies", "Quick bread", "Main dish"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </label>
        <label className="text-sm font-bold">
          Lab output no.
          <input
            required
            value={lab}
            onChange={(event) => setLab(event.target.value)}
            className="field"
            placeholder="Lab output 6"
          />
        </label>
        <label className="text-sm font-bold">
          Date prepared
          <input
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="field"
            placeholder="Apr 22, 2025"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-bold">
        Brief description
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="field min-h-28"
          placeholder="Describe your preparation, ingredients, and key learning."
        />
      </label>

      <fieldset className="mt-5 rounded-xl border-2 border-black p-4">
        <legend className="px-2 text-sm font-black">Recipe originality</legend>
        <div className="flex flex-wrap gap-2">
          {origins.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setOrigin(item)}
              aria-pressed={origin === item}
              className={`rounded-full border-2 border-black px-4 py-1.5 text-sm font-bold ${origin === item ? "bg-black text-white" : "bg-white"}`}
            >
              {item}
            </button>
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

      <label className="mt-4 flex items-center gap-3 text-sm font-bold">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 accent-black"
        />
        Publish as active in the archive
      </label>

      <label className="mt-4 block rounded-xl border-2 border-dashed border-[#f57696] p-7 text-center text-sm font-bold">
        Attach recipe / output file
        <input
          className="mt-2 block w-full text-xs font-normal"
          type="file"
          accept=".pdf,.doc,.docx,image/*"
        />
      </label>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          className="rounded-xl border-2 border-black px-5 py-2 text-sm font-bold"
        >
          Save draft
        </button>
        <button className="primary-action w-auto! px-5!">Submit output</button>
      </div>
    </form>
  );
}