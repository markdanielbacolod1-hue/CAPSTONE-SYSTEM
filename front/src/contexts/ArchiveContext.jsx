import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  initialCategories,
  initialDuplicationLogs,
  initialEvents,
  initialIngredientCategories,
  initialIngredients,
  initialRecipeIngredients,
  initialRecipes,
  initialRecipeSteps,
} from "../data/recipes";
import { checkDuplicate } from "../lib/duplicates";
const displayNames = {
  student: "Maria Santos",
  faculty: "Jero Rey Sosa",
  admin: "System Administrator",
  member: "Community Member",
};
const ArchiveContext = createContext(null);
let sequence = 0;
const nextId = (prefix) => {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
};
const stamp = () =>
  new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
const nextNumber = (rows) => rows.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
const normalise = (text) => text.trim().toLowerCase().replace(/\s+/g, " ");
export function ArchiveProvider({ children }) {
  const [session, setSession] = useState(null);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [events, setEvents] = useState(initialEvents);
  const [categories] = useState(initialCategories);
  const [ingredientCategories] = useState(initialIngredientCategories);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [recipeIngredients, setRecipeIngredients] = useState(initialRecipeIngredients);
  const [recipeSteps, setRecipeSteps] = useState(initialRecipeSteps);
  const [duplicationLogs, setDuplicationLogs] = useState(initialDuplicationLogs);
  const pushEvent = useCallback((kind, recipeId, detail, actor) => {
    if (!actor) return;
    setEvents((current) => [
      {
        id: nextId("e"),
        kind,
        actor: actor.name,
        actorRole: actor.role,
        recipeId,
        detail,
        at: stamp(),
      },
      ...current,
    ]);
  }, []);
  const updateRecipe = useCallback((recipeId, updater) => {
    setRecipes((current) =>
      current.map((recipe) => (recipe.id === recipeId ? updater(recipe) : recipe)),
    );
  }, []);
  const signIn = useCallback((role) => setSession({ role, name: displayNames[role] }), []);
  const signOut = useCallback(() => setSession(null), []);
  /* ---------- relationship selectors ---------- */
  const categoryName = useCallback(
    (categoryId) =>
      categories.find((category) => category.id === categoryId)?.name ?? "Uncategorised",
    [categories],
  );
  const getRecipeIngredients = useCallback(
    (recipeId) =>
      recipeIngredients
        .filter((line) => line.recipeId === recipeId)
        .map((line) => {
          const ingredient = ingredients.find((entry) => entry.id === line.ingredientId);
          const category = ingredientCategories.find(
            (entry) => entry.id === ingredient?.ingredientCategoryId,
          );
          return {
            ...line,
            name: ingredient?.name ?? "Unknown ingredient",
            categoryName: category?.name ?? "—",
          };
        }),
    [ingredientCategories, ingredients, recipeIngredients],
  );
  const getRecipeSteps = useCallback(
    (recipeId) =>
      recipeSteps
        .filter((step) => step.recipeId === recipeId)
        .sort((a, b) => a.stepNumber - b.stepNumber),
    [recipeSteps],
  );
  const getDuplicationLog = useCallback(
    (recipeId) =>
      duplicationLogs.filter((log) => log.recipeId === recipeId).sort((a, b) => b.id - a.id)[0] ??
      null,
    [duplicationLogs],
  );
  const ingredientNamesFor = useCallback(
    (recipeId) => getRecipeIngredients(recipeId).map((line) => line.name),
    [getRecipeIngredients],
  );
  /* ---------- visibility ---------- */
  const isPublic = useCallback((recipe) => recipe.status === "Approved" && recipe.active, []);
  const moderate = session?.role === "faculty" || session?.role === "admin";
  const canSeeReview = useCallback(
    (recipe) =>
      Boolean(
        session && (moderate || (session.role === "student" && recipe.student === session.name)),
      ),
    [moderate, session],
  );
  const canView = useCallback(
    (recipe) => isPublic(recipe) || canSeeReview(recipe),
    [canSeeReview, isPublic],
  );
  /* ---------- engagement ---------- */
  const toggleLike = useCallback(
    (recipeId) => {
      if (!session) return;
      const name = session.name;
      let liked = false;
      updateRecipe(recipeId, (recipe) => {
        liked = !recipe.likedBy.includes(name);
        return {
          ...recipe,
          likedBy: liked
            ? [...recipe.likedBy, name]
            : recipe.likedBy.filter((entry) => entry !== name),
        };
      });
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (liked && recipe) pushEvent("like", recipeId, `liked ${recipe.title}`, session);
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  const toggleSave = useCallback(
    (recipeId) => {
      if (!session) return;
      const name = session.name;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        savedBy: recipe.savedBy.includes(name)
          ? recipe.savedBy.filter((entry) => entry !== name)
          : [...recipe.savedBy, name],
      }));
    },
    [session, updateRecipe],
  );
  const addComment = useCallback(
    (recipeId, text) => {
      if (!session || !text.trim()) return;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        comments: [
          ...recipe.comments,
          {
            id: nextId("c"),
            author: session.name,
            role: session.role,
            text: text.trim(),
            at: stamp(),
          },
        ],
      }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe) pushEvent("comment", recipeId, `commented on ${recipe.title}`, session);
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  /* ---------- review (faculty) ---------- */
  const gradeRecipe = useCallback(
    (recipeId, score, remark) => {
      if (!session || session.role !== "faculty") return;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        grade: { facultyName: session.name, score, remark: remark.trim(), at: stamp() },
      }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe) pushEvent("grade", recipeId, `graded ${recipe.title} at ${score}`, session);
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  /** Sets submission_status and review_remarks only. is_active is left alone. */
  const decide = useCallback(
    (recipeId, approved, note) => {
      if (!session || session.role !== "faculty") return;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        status: approved ? "Approved" : "Rejected",
        reviewRemarks: note.trim(),
        reviewedBy: session.name,
        reviewedAt: stamp(),
      }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe) {
        pushEvent(
          approved ? "approved" : "rejected",
          recipeId,
          approved ? `approved ${recipe.title}` : `rejected ${recipe.title}`,
          session,
        );
      }
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  const approveRecipe = useCallback((recipeId, note) => decide(recipeId, true, note), [decide]);
  const rejectRecipe = useCallback((recipeId, note) => decide(recipeId, false, note), [decide]);
  /** Sets is_active only. Faculty and administrators. */
  const setActive = useCallback(
    (recipeId, active) => {
      if (!moderate) return;
      updateRecipe(recipeId, (recipe) => ({ ...recipe, active }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe)
        pushEvent(
          "visibility",
          recipeId,
          `set ${recipe.title} to ${active ? "active" : "inactive"}`,
          session,
        );
    },
    [moderate, pushEvent, recipes, session, updateRecipe],
  );
  /* ---------- submission (students) ---------- */
  const previewDuplicateCheck = useCallback(
    (draft) =>
      session
        ? checkDuplicate({ ...draft, studentName: session.name }, recipes, ingredientNamesFor)
        : null,
    [ingredientNamesFor, recipes, session],
  );
  const addRecipe = useCallback(
    (input) => {
      if (!session || session.role !== "student")
        return {
          ok: false,
          message: "Only accounts with the student role can submit culinary outputs.",
        };
      const check = checkDuplicate(
        {
          title: input.title,
          categoryId: input.categoryId,
          ingredientNames: input.ingredients.map((line) => line.name),
          studentName: session.name,
          originalRecipeId: input.originalRecipeId,
        },
        recipes,
        ingredientNamesFor,
      );
      if (!check) return { ok: false, message: "Add a recipe title before submitting." };
      const logBase = {
        attemptedTitle: input.title,
        studentName: session.name,
        matchedRecipeId: check.match?.id ?? null,
        similarity: check.similarity,
        result: check.result,
        checkedAt: stamp(),
      };
      if (!check.allowed) {
        setDuplicationLogs((current) => [
          ...current,
          { id: nextNumber(current), recipeId: null, ...logBase },
        ]);
        return { ok: false, message: check.message };
      }
      const original = input.originalRecipeId
        ? (recipes.find((recipe) => recipe.id === input.originalRecipeId) ?? null)
        : null;
      const recipe = {
        id: nextId("r"),
        title: input.title.trim(),
        description: input.description.trim(),
        categoryId: input.categoryId,
        student: session.name,
        submittedAt: today(),
        dishPhoto: input.dishPhoto,
        pdfFile: input.pdfFile,
        pdfName: input.pdfName,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        totalDuration: input.prepTime + input.cookTime,
        status: "Pending",
        reviewRemarks: "",
        reviewedBy: null,
        reviewedAt: null,
        active: true,
        origin: input.origin,
        originNote: input.originNote.trim(),
        originalRecipeId: original ? (original.originalRecipeId ?? original.id) : null,
        version: original ? original.version + 1 : 1,
        likedBy: [],
        savedBy: [],
        comments: [],
        grade: null,
      };
      // ingredient: reuse a row with the same name, otherwise insert one.
      const knownIngredients = [...ingredients];
      const lines = [];
      let lineId = nextNumber(recipeIngredients);
      input.ingredients.forEach((draft) => {
        let ingredient = knownIngredients.find(
          (entry) => normalise(entry.name) === normalise(draft.name),
        );
        if (!ingredient) {
          ingredient = {
            id: nextNumber(knownIngredients),
            name: draft.name.trim(),
            ingredientCategoryId: draft.ingredientCategoryId,
          };
          knownIngredients.push(ingredient);
        }
        lines.push({
          id: lineId++,
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: Number(draft.quantity),
          unit: draft.unit,
        });
      });
      // recipe_step: step_number follows the order on the form.
      let stepId = nextNumber(recipeSteps);
      const stepRows = input.steps.map((step, index) => ({
        id: stepId++,
        recipeId: recipe.id,
        stepNumber: index + 1,
        instruction: step.instruction.trim(),
      }));
      setIngredients(knownIngredients);
      setRecipeIngredients((current) => [...current, ...lines]);
      setRecipeSteps((current) => [...current, ...stepRows]);
      setRecipes((current) => [recipe, ...current]);
      setDuplicationLogs((current) => [
        ...current,
        { id: nextNumber(current), recipeId: recipe.id, ...logBase },
      ]);
      pushEvent(
        "submitted",
        recipe.id,
        original
          ? `submitted version ${recipe.version} of ${recipe.title}`
          : `submitted ${recipe.title} for review`,
        session,
      );
      return { ok: true, recipe, check };
    },
    [ingredientNamesFor, ingredients, pushEvent, recipeIngredients, recipeSteps, recipes, session],
  );
  const value = useMemo(
    () => ({
      session,
      recipes,
      events,
      categories,
      ingredientCategories,
      ingredients,
      duplicationLogs,
      can: {
        post: session?.role === "student",
        engage: Boolean(session),
        grade: session?.role === "faculty",
        moderate,
      },
      signIn,
      signOut,
      toggleLike,
      toggleSave,
      addComment,
      gradeRecipe,
      approveRecipe,
      rejectRecipe,
      setActive,
      addRecipe,
      previewDuplicateCheck,
      isLiked: (recipe) => Boolean(session && recipe.likedBy.includes(session.name)),
      isSaved: (recipe) => Boolean(session && recipe.savedBy.includes(session.name)),
      isPublic,
      canView,
      canSeeReview,
      categoryName,
      getRecipeIngredients,
      getRecipeSteps,
      getDuplicationLog,
      findRecipe: (recipeId) =>
        recipeId ? (recipes.find((recipe) => recipe.id === recipeId) ?? null) : null,
    }),
    [
      addComment,
      addRecipe,
      approveRecipe,
      canSeeReview,
      canView,
      categories,
      categoryName,
      duplicationLogs,
      events,
      getDuplicationLog,
      getRecipeIngredients,
      getRecipeSteps,
      gradeRecipe,
      ingredientCategories,
      ingredients,
      isPublic,
      moderate,
      previewDuplicateCheck,
      recipes,
      rejectRecipe,
      session,
      setActive,
      signIn,
      signOut,
      toggleLike,
      toggleSave,
    ],
  );
  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}
export function useArchive() {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error("useArchive must be used inside ArchiveProvider");
  return context;
}
