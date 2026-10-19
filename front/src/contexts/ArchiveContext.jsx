import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { initialEvents, initialRecipes } from "../data/recipes";

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

export function ArchiveProvider({ children }) {
  const [session, setSession] = useState(null);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [events, setEvents] = useState(initialEvents);
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
      current.map((recipe) =>
        recipe.id === recipeId ? updater(recipe) : recipe,
      ),
    );
  }, []);
  const signIn = useCallback(
    (role) => setSession({ role, name: displayNames[role] }),
    [],
  );
  const signOut = useCallback(() => setSession(null), []);
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
      if (liked && recipe)
        pushEvent("like", recipeId, `liked ${recipe.title}`, session);
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
      if (recipe)
        pushEvent("comment", recipeId, `commented on ${recipe.title}`, session);
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  const gradeRecipe = useCallback(
    (recipeId, score, remark) => {
      if (!session || session.role !== "faculty") return;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        status: "Archived",
        grade: {
          facultyName: session.name,
          score,
          remark: remark.trim(),
          at: stamp(),
        },
      }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe)
        pushEvent(
          "grade",
          recipeId,
          `graded ${recipe.title} at ${score}`,
          session,
        );
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  const decide = useCallback(
    (recipeId, approved, note) => {
      if (!session || session.role !== "faculty") return;
      updateRecipe(recipeId, (recipe) => ({
        ...recipe,
        decision: approved ? "Approved" : "Rejected",
        decisionNote: note.trim(),
        decidedBy: session.name,
        decidedAt: stamp(),
        status: approved ? "Archived" : "Rejected",
        active: approved ? true : false,
      }));
      const recipe = recipes.find((entry) => entry.id === recipeId);
      if (recipe) {
        pushEvent(
          approved ? "approved" : "rejected",
          recipeId,
          approved
            ? `approved ${recipe.title} for the archive`
            : `rejected ${recipe.title}`,
          session,
        );
      }
    },
    [pushEvent, recipes, session, updateRecipe],
  );
  const approveRecipe = useCallback(
    (recipeId, note) => decide(recipeId, true, note),
    [decide],
  );
  const rejectRecipe = useCallback(
    (recipeId, note) => decide(recipeId, false, note),
    [decide],
  );
  const setActive = useCallback(
    (recipeId, active) => {
      if (!session) return;
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
    [pushEvent, recipes, session, updateRecipe],
  );
  const addRecipe = useCallback(
    (input) => {
      if (!session || session.role !== "student") return;
      const recipe = {
        id: nextId("r"),
        title: input.title,
        category: input.category,
        student: session.name,
        date: input.date,
        image: "",
        status: "Submitted",
        lab: input.lab,
        active: input.active,
        origin: input.origin,
        originNote: input.originNote,
        description: input.description,
        decision: "Pending",
        decisionNote: "",
        decidedBy: null,
        decidedAt: null,
        likedBy: [],
        savedBy: [],
        comments: [],
        grade: null,
      };
      setRecipes((current) => [recipe, ...current]);
      pushEvent(
        "submitted",
        recipe.id,
        `submitted ${recipe.title} for ${recipe.lab}`,
        session,
      );
    },
    [pushEvent, session],
  );
  const value = useMemo(
    () => ({
      session,
      recipes,
      events,
      can: {
        post: session?.role === "student",
        engage: Boolean(session),
        grade: session?.role === "faculty",
        moderate: session?.role === "faculty" || session?.role === "admin",
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
      isLiked: (recipe) =>
        Boolean(session && recipe.likedBy.includes(session.name)),
      isSaved: (recipe) =>
        Boolean(session && recipe.savedBy.includes(session.name)),
    }),
    [
      addComment,
      addRecipe,
      approveRecipe,
      events,
      gradeRecipe,
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
  return (
    <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>
  );
}

export function useArchive() {
  const context = useContext(ArchiveContext);
  if (!context)
    throw new Error("useArchive must be used inside ArchiveProvider");
  return context;
}