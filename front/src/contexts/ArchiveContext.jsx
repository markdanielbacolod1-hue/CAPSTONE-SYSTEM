import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { checkDuplicate } from "../lib/duplicates";
import { api, authApi, getStoredUser, getToken } from "../lib/api";
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
  const [session, setSession] = useState(() => {
    const user = getStoredUser();
    if (!getToken() || !user) return null;
    const roleMap = { Student: "student", Faculty: "faculty", Admin: "admin", CommunityMember: "member" };
    return { role: roleMap[user.Role] || "student", name: user.FullName, userId: user.UserID, username: user.Username, email: user.Email };
  });
  const [recipes, setRecipes] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredientCategories, setIngredientCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeSteps, setRecipeSteps] = useState([]);
  const [duplicationLogs, setDuplicationLogs] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState("");
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
  const signIn = useCallback(async (identifier, password) => {
    const data = await authApi.login(identifier, password);
    const roleMap = { Student: "student", Faculty: "faculty", Admin: "admin", CommunityMember: "member" };
    const user = data.user;
    const nextSession = {
      role: roleMap[user.Role] || "student",
      name: user.FullName,
      userId: user.UserID,
      username: user.Username,
      email: user.Email,
    };
    setSession(nextSession);
    return nextSession;
  }, []);
  const signUp = useCallback(async (payload) => authApi.register(payload), []);
  const signOut = useCallback(() => {
    authApi.logout();
    setSession(null);
  }, []);
  const toAssetUrl = useCallback((value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(String(value))) return value;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const origin = apiUrl.replace(/\/api\/?$/, "");
    return `${origin}/${String(value).replace(/^\/+/, "")}`;
  }, []);
  const mapRecipe = useCallback((row) => ({
    ...row,
    id: Number(row.id),
    categoryId: Number(row.categoryId),
    prepTime: Number(row.prepTime || 0),
    cookTime: Number(row.cookTime || 0),
    totalDuration: Number(row.totalDuration || 0),
    dishPhoto: toAssetUrl(row.dishPhoto),
    pdfFile: toAssetUrl(row.pdfFile),
    pdfName: row.pdfFile ? String(row.pdfFile).split("/").pop() : "",
    submittedAt: row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "",
    active: Boolean(row.active),
    student: row.student || "Unknown contributor",
    likedBy: [],
    savedBy: [],
    comments: [],
    grade: null,
    origin: row.isCopy ? "Adapted" : "Original",
    originNote: row.reviewRemarks || "No additional source note is stored in the database.",
    version: row.isCopy ? 2 : 1,
    ingredients: (row.ingredients || []).map((item) => ({
      ...item, id: Number(item.id), quantity: Number(item.quantity || 0),
    })),
    steps: (row.steps || []).map((item) => ({
      ...item, id: Number(item.id), stepNumber: Number(item.stepNumber),
    })),
  }), [toAssetUrl]);
  const refreshArchive = useCallback(async () => {
    setArchiveLoading(true);
    setArchiveError("");
    try {
      const [recipeRows, categoryRows, ingredientRows, ingredientCategoryRows] = await Promise.all([
        api("/recipes"),
        api("/categories"),
        api("/ingredients"),
        api("/ingredients/categories/list"),
      ]);
      setRecipes(recipeRows.map(mapRecipe));
      setCategories(categoryRows.map((row) => ({ ...row, id: Number(row.id), active: true })));
      setIngredients(ingredientRows.map((row) => ({
        ...row, id: Number(row.id),
        ingredientCategoryId: row.categoryId == null ? 1 : Number(row.categoryId),
      })));
      setIngredientCategories(ingredientCategoryRows.map((row) => ({ ...row, id: Number(row.id) })));
    } catch (error) {
      setRecipes([]);
      setCategories([]);
      setArchiveError(error.message || "Unable to load archive data from the database.");
    } finally {
      setArchiveLoading(false);
    }
  }, [mapRecipe]);
  const fetchRecipe = useCallback(async (recipeId) => {
    const row = await api(`/recipes/${recipeId}`);
    const detail = mapRecipe(row);
    setRecipes((current) => {
      const exists = current.some((recipe) => recipe.id === detail.id);
      return exists
        ? current.map((recipe) => recipe.id === detail.id ? detail : recipe)
        : [detail, ...current];
    });
    return detail;
  }, [mapRecipe]);
  React.useEffect(() => {
    refreshArchive();
  }, [refreshArchive, session?.userId]);
  React.useEffect(() => {
    if (!getToken()) return;
    let active = true;
    authApi.me().then(({ user, student }) => {
      if (!active) return;
      const roleMap = { Student: "student", Faculty: "faculty", Admin: "admin", CommunityMember: "member" };
      setSession({
        role: roleMap[user.Role] || "student",
        name: user.FullName,
        userId: user.UserID,
        username: user.Username,
        email: user.Email,
        student,
      });
    }).catch(() => {
      authApi.logout();
      if (active) setSession(null);
    });
    return () => { active = false; };
  }, []);
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
  const addRecipe = useCallback(async (input) => {
    if (!session || session.role !== "student") {
      return { ok: false, message: "Only student accounts can submit culinary outputs." };
    }
    const check = checkDuplicate({
      title: input.title,
      categoryId: input.categoryId,
      ingredientNames: input.ingredients.map((line) => line.name),
      studentName: session.name,
      originalRecipeId: input.originalRecipeId,
    }, recipes, ingredientNamesFor);
    if (!check) return { ok: false, message: "Add a recipe title before submitting." };
    if (!check.allowed) return { ok: false, message: check.message };
    const form = new FormData();
    form.append("title", input.title.trim());
    form.append("description", input.description.trim());
    form.append("categoryId", String(input.categoryId));
    form.append("prepTime", String(input.prepTime || 0));
    form.append("cookTime", String(input.cookTime || 0));
    form.append("ingredients", JSON.stringify(input.ingredients.map((line) => ({
      name: line.name.trim(),
      categoryId: Number(line.ingredientCategoryId) || null,
      quantity: Number(line.quantity),
      unit: line.unit,
    }))));
    form.append("steps", JSON.stringify(input.steps.map((step) => ({
      instruction: step.instruction.trim(),
    }))));
    if (input.originalRecipeId) form.append("originalRecipeId", String(input.originalRecipeId));
    form.append("dishPhoto", input.dishPhoto);
    form.append("pdfFile", input.pdfFile);
    try {
      const response = await api("/recipes", { method: "POST", body: form });
      const created = mapRecipe(response.recipe);
      setRecipes((current) => [created, ...current.filter((recipe) => recipe.id !== created.id)]);
      return { ok: true, recipe: created, check };
    } catch (error) {
      return { ok: false, message: error.message || "Recipe submission failed." };
    }
  }, [ingredientNamesFor, mapRecipe, recipes, session]);
  const value = useMemo(
    () => ({
      session,
      recipes,
      events,
      categories,
      archiveLoading,
      archiveError,
      refreshArchive,
      fetchRecipe,
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
      signUp,
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
      archiveError,
      archiveLoading,
      refreshArchive,
      fetchRecipe,
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
      signUp,
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
