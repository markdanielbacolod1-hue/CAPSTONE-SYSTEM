/**
 * Duplication rules, applied before a recipe row is written. Every check is
 * written to recipe_duplication_log, including attempts that were blocked.
 *
 * - Similarity mixes title words (55%) and ingredient names (45%), plus 10
 *   points when the category matches.
 * - Another student's recipe at 80% or more blocks the submission.
 * - Another student's recipe between 50% and 79% is a possible duplicate: the
 *   student may submit after acknowledging it, and faculty see the flag.
 * - The student's own earlier recipe at 50% or more must be submitted as a
 *   revised version, which records original_recipe_id and bumps version_no.
 *   A recipe still pending review cannot be revised yet.
 * - Rejected recipes by other students are not compared.
 * - Passing the check never marks a recipe original; that stays the
 *   student's declaration and the faculty's decision.
 */
export const BLOCK_AT = 80;
export const WARN_AT = 50;
export function checkDuplicate(draft, recipes, ingredientNamesFor) {
  if (draft.title.trim().length < 3) return null;
  const pool = recipes.filter(
    (recipe) => recipe.student === draft.studentName || recipe.status !== "Rejected",
  );
  const scored = pool
    .map((recipe) => ({ recipe, score: similarity(draft, recipe, ingredientNamesFor(recipe.id)) }))
    .sort((a, b) => b.score - a.score);
  const bestOther = scored.find((entry) => entry.recipe.student !== draft.studentName);
  const bestOwn = scored.find((entry) => entry.recipe.student === draft.studentName);
  if (bestOther && bestOther.score >= BLOCK_AT) {
    return {
      result: "Blocked duplicate",
      match: bestOther.recipe,
      similarity: bestOther.score,
      allowed: false,
      message: `This closely matches “${bestOther.recipe.title}” by ${bestOther.recipe.student} (${bestOther.score}% similar). A duplicate of another student's recipe cannot be submitted.`,
    };
  }
  const revisionTarget = draft.originalRecipeId
    ? (recipes.find((recipe) => recipe.id === draft.originalRecipeId) ?? null)
    : null;
  const ownMatch = revisionTarget ?? (bestOwn && bestOwn.score >= WARN_AT ? bestOwn.recipe : null);
  if (ownMatch) {
    const score = scored.find((entry) => entry.recipe.id === ownMatch.id)?.score ?? 0;
    if (ownMatch.status === "Pending") {
      return {
        result: "Blocked duplicate",
        match: ownMatch,
        similarity: score,
        allowed: false,
        message: `“${ownMatch.title}” is still pending review. Wait for the faculty decision before submitting a revised version.`,
      };
    }
    if (revisionTarget) {
      return {
        result: "Revision of own recipe",
        match: ownMatch,
        similarity: score,
        allowed: true,
        message: `Will be saved as version ${ownMatch.version + 1} of “${ownMatch.title}”, with it recorded as the original recipe.`,
      };
    }
    return {
      result: "Revision of own recipe",
      match: ownMatch,
      similarity: score,
      allowed: false,
      message: `This matches your earlier recipe “${ownMatch.title}” (${score}% similar). Submit it as a revised version to continue.`,
    };
  }
  if (bestOther && bestOther.score >= WARN_AT) {
    return {
      result: "Possible duplicate",
      match: bestOther.recipe,
      similarity: bestOther.score,
      allowed: true,
      message: `Shares much of “${bestOther.recipe.title}” by ${bestOther.recipe.student} (${bestOther.score}% similar). You may still submit; faculty will see this flag during review.`,
    };
  }
  return {
    result: "No close match",
    match: null,
    similarity: bestOther?.score ?? 0,
    allowed: true,
    message:
      "No close match in the repository. This does not confirm the recipe is original — your declaration and the faculty review still apply.",
  };
}
function similarity(draft, recipe, names) {
  const title = jaccard(words(draft.title), words(recipe.title));
  const titleScore = normalise(draft.title) === normalise(recipe.title) ? 1 : title;
  const draftNames = draft.ingredientNames.map(normalise).filter(Boolean);
  const hasIngredients = draftNames.length >= 2;
  const ingredientScore = hasIngredients ? jaccard(draftNames, names.map(normalise)) : 0;
  const base = hasIngredients ? titleScore * 0.55 + ingredientScore * 0.45 : titleScore * 0.8;
  const category = draft.categoryId === recipe.categoryId && titleScore > 0 ? 0.1 : 0;
  return Math.round(Math.min(1, base + category) * 100);
}
const STOP = new Set(["the", "a", "an", "and", "with", "of", "my", "classic", "soft", "homemade"]);
function words(text) {
  return normalise(text)
    .split(" ")
    .map((word) => (word.endsWith("s") && word.length > 3 ? word.slice(0, -1) : word))
    .map((word) => (word === "choco" ? "chocolate" : word))
    .filter((word) => word && !STOP.has(word));
}
function normalise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function jaccard(a, b) {
  const left = new Set(a);
  const right = new Set(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  left.forEach((item) => {
    if (right.has(item)) shared += 1;
  });
  return shared / (left.size + right.size - shared);
}
