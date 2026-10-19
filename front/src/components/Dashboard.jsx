import React, { useState } from "react";
import {
  ActivityIcon,
  BookOpenCheckIcon,
  BookmarkIcon,
  CheckIcon,
  ClipboardListIcon,
  FilePlus2Icon,
  HeartIcon,
  LayoutDashboardIcon,
  TagsIcon,
  UserCogIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useArchive } from "../contexts/ArchiveContext";
import { Archive } from "./Archive";
import { Feed } from "./feed";
import { SubmissionForm } from "./SubmissionForm";

export function Dashboard({ role, onSignOut, onOpenRecipe }) {
  const { recipes, session, events } = useArchive();
  const nav = getNavigation(role);
  const [tab, setTab] = useState(nav[0].id);
  const [notice, setNotice] = useState("");
  const student = role === "student";
  const admin = role === "admin";
  const member = role === "member";
  const myName = session?.name ?? "";
  const mine = recipes.filter((recipe) => recipe.student === myName);
  const saved = recipes.filter((recipe) => recipe.savedBy.includes(myName));
  const liked = recipes.filter((recipe) => recipe.likedBy.includes(myName));
  const heading = admin
    ? "System administration"
    : student
      ? "Student dashboard"
      : member
        ? "My culinary space"
        : "Instructor dashboard";
  const workspace = admin
    ? "ADMINISTRATION"
    : student
      ? "STUDENT WORKSPACE"
      : member
        ? "MEMBER ACCOUNT"
        : "FACULTY WORKSPACE";
  const subtitle = admin
    ? "Maintain system access, academic roles, recipe categories, and activity records."
    : student
      ? "AY 2024–2025 · BSHM 3A · Second semester"
      : member
        ? "You can browse, like, save, and comment. Only enrolled students can post recipes."
        : "Review, grade, and archive student culinary work.";
  return (
    <main className="min-h-screen bg-[#fffafb]">
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden min-h-[calc(100vh-68px)] w-64 shrink-0 border-r-2 border-[#f57696] bg-white p-5 lg:block">
          <p className="mb-5 text-xs font-black tracking-widest text-neutral-500">
            {admin
              ? "SYSTEM CONTROL"
              : member
                ? "MY ACTIVITY"
                : student
                  ? "MY WORK"
                  : "OVERVIEW"}
          </p>
          <nav className="space-y-1" aria-label="Dashboard navigation">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold ${tab === item.id ? "border-l-4 border-[#f57696] bg-[#fbd2dd]" : "hover:bg-neutral-100"}`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-10 border-t pt-5">
            <p className="mb-2 text-xs font-black tracking-widest text-neutral-500">
              SYSTEM
            </p>
            <button
              onClick={onSignOut}
              className="px-3 text-sm font-bold underline"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-8">
          {notice && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border-2 border-black bg-[#fbd2dd] p-3 text-sm font-bold">
              <CheckIcon size={18} />
              {notice}
            </div>
          )}

          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{workspace}</p>
              <h1 className="page-title">{heading}</h1>
              <p className="text-sm text-neutral-600">{subtitle}</p>
            </div>
            {student && (
              <button
                onClick={() => setTab("submit")}
                className="primary-action w-auto! px-4!"
              >
                <FilePlus2Icon size={18} />
                Submit new output
              </button>
            )}
          </div>

          <nav
            className="mb-6 flex flex-wrap gap-2 lg:hidden"
            aria-label="Section tabs"
          >
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id}
                className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold ${tab === item.id ? "bg-black text-white" : "bg-white"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {tab === "overview" && (
            <Overview
              role={role}
              counts={{
                mine: mine.length,
                saved: saved.length,
                liked: liked.length,
                pending: recipes.filter(
                  (recipe) => recipe.decision === "Pending",
                ).length,
                events: events.length,
              }}
              onViewAll={() => setTab(admin ? "recipes" : "submissions")}
              onOpenRecipe={onOpenRecipe}
            />
          )}
          {tab === "submissions" && (
            <Archive
              title={student ? "My submissions" : "Recipe reviews"}
              caption={
                student
                  ? "Every output you have submitted this term."
                  : "Approve or reject student submissions, then grade the approved work."
              }
              source={student ? mine : recipes}
              visibility="all"
              onOpenRecipe={onOpenRecipe}
            />
          )}
          {tab === "submit" &&
            (student ? (
              <SubmissionForm onSubmitted={setNotice} />
            ) : (
              <FacultyStudents />
            ))}
          {tab === "saved" && (
            <Archive
              title="Saved recipes"
              caption="Recipes you bookmarked for later."
              source={saved}
              onOpenRecipe={onOpenRecipe}
            />
          )}
          {tab === "liked" && (
            <Archive
              title="Liked recipes"
              caption="Recipes you have liked."
              source={liked}
              onOpenRecipe={onOpenRecipe}
            />
          )}
          {tab === "users" && (
            <ManagementList
              title="User management"
              description="Create, verify, deactivate, and search accounts."
              rows={[
                ["Maria Santos", "Student · BSHM 3A", "Active"],
                ["Jero Rey Sosa", "Faculty · Hospitality", "Active"],
                ["Community Member", "Member · Read and engage", "Active"],
                ["Ana Villanueva", "Faculty · Hospitality", "Pending"],
              ]}
              onUpdate={setNotice}
            />
          )}
          {tab === "recipes" && (
            <Archive
              title={member ? "Recipes" : "Recipe management"}
              caption={
                member
                  ? "Browse active recipes, then like, save, or comment."
                  : "Every record in the archive, including inactive entries."
              }
              visibility={member ? "public" : "all"}
              onOpenRecipe={onOpenRecipe}
            />
          )}
          {tab === "categories" && (
            <ManagementList
              title="Category management"
              description="Maintain the taxonomy used across the culinary archive."
              rows={[
                ["Bread", "12 recipe records", "Active"],
                ["Pastry", "21 recipe records", "Active"],
                ["Cookies", "8 recipe records", "Active"],
                ["Quick bread", "6 recipe records", "Active"],
              ]}
              onUpdate={setNotice}
            />
          )}
          {tab === "roles" && (
            <ManagementList
              title="Role management"
              description="Control permissions for each account type."
              rows={[
                ["Student", "Post, comment, like, and save", "Enabled"],
                ["Faculty", "Review, grade, and archive recipes", "Enabled"],
                ["Member", "Comment, like, and save only", "Enabled"],
                [
                  "Administrator",
                  "Manage users, roles, categories, logs",
                  "Enabled",
                ],
              ]}
              onUpdate={setNotice}
            />
          )}
          {tab === "activity" && (
            <Feed scope="admin" onOpenRecipe={onOpenRecipe} />
          )}
        </div>
      </div>
    </main>
  );
}

function getNavigation(role) {
  if (role === "admin")
    return [
      { id: "overview", label: "Dashboard", icon: LayoutDashboardIcon },
      { id: "users", label: "User management", icon: UsersRoundIcon },
      { id: "recipes", label: "Recipe management", icon: BookOpenCheckIcon },
      { id: "categories", label: "Category management", icon: TagsIcon },
      { id: "roles", label: "Role management", icon: UserCogIcon },
      { id: "activity", label: "Activity log", icon: ActivityIcon },
    ];
  if (role === "member")
    return [
      { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
      { id: "recipes", label: "Recipes", icon: BookOpenCheckIcon },
      { id: "saved", label: "Saved recipes", icon: BookmarkIcon },
      { id: "liked", label: "Liked recipes", icon: HeartIcon },
    ];
  return [
    { id: "overview", label: "Dashboard", icon: LayoutDashboardIcon },
    {
      id: "submissions",
      label: role === "student" ? "My submissions" : "Recipe reviews",
      icon: ClipboardListIcon,
    },
    {
      id: "submit",
      label: role === "student" ? "Submit output" : "Student management",
      icon: role === "student" ? FilePlus2Icon : UsersRoundIcon,
    },
    ...(role === "student"
      ? [{ id: "saved", label: "Saved recipes", icon: BookmarkIcon }]
      : []),
  ];
}

function Overview({ role, counts, onViewAll, onOpenRecipe }) {
  const { recipes } = useArchive();
  const stats =
    role === "admin"
      ? [
          ["ACTIVE USERS", "64", "58 verified this term"],
          ["FACULTY", "6", "all accounts active"],
          [
            "RECIPES",
            String(recipes.length),
            `${recipes.filter((recipe) => !recipe.active).length} inactive`,
          ],
          ["AUDIT EVENTS", String(counts.events), "recorded activity"],
        ]
      : role === "student"
        ? [
            ["MY SUBMISSIONS", String(counts.mine), "this semester"],
            ["SAVED", String(counts.saved), "bookmarked recipes"],
            ["LIKED", String(counts.liked), "recipes you liked"],
          ]
        : role === "member"
          ? [
              ["SAVED", String(counts.saved), "bookmarked recipes"],
              ["LIKED", String(counts.liked), "recipes you liked"],
              [
                "ACTIVE RECIPES",
                String(recipes.filter((recipe) => recipe.active).length),
                "available to browse",
              ],
            ]
          : [
              ["TOTAL RECIPES", String(recipes.length), "in the archive"],
              [
                "AWAITING DECISION",
                String(counts.pending),
                "approve or reject",
              ],
              [
                "APPROVED",
                String(
                  recipes.filter((recipe) => recipe.decision === "Approved")
                    .length,
                ),
                "published to archive",
              ],
              [
                "REJECTED",
                String(
                  recipes.filter((recipe) => recipe.decision === "Rejected")
                    .length,
                ),
                "returned to students",
              ],
            ];
  return (
    <>
      <section className="mb-6 rounded-2xl border-2 border-[#f57696] bg-[#fbd2dd] p-5">
        <h2 className="text-xl font-extrabold">Welcome back</h2>
        <p className="mt-1 text-sm">
          {role === "faculty"
            ? `${counts.pending} submissions are still waiting for review or grading.`
            : role === "member"
              ? "Browse the archive, then like, save, or comment on the recipes you follow."
              : role === "admin"
                ? "Two accounts and one category update require your attention."
                : "Track your submissions and the feedback your instructor leaves."}
        </p>
      </section>

      <div
        className={`grid gap-4 ${stats.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}
      >
        {stats.map(([label, value, caption]) => (
          <article key={label} className="rounded-2xl bg-[#fbd2dd] p-5">
            <p className="text-xs font-black">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
            <p className="mt-3 text-xs">{caption}</p>
          </article>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Recent recipes</h2>
          <button onClick={onViewAll} className="text-sm font-black underline">
            View all
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#f57696] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fbd2dd] text-xs uppercase">
              <tr>
                <th className="p-3">Recipe title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Student</th>
                <th className="p-3">Status</th>
                <th className="p-3">Visibility</th>
                <th className="p-3">Origin</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recipes.slice(0, 5).map((recipe) => (
                <tr key={recipe.id} className="border-t border-[#fbd2dd]">
                  <td className="p-3 font-bold">
                    {recipe.title}
                    <span className="block text-[11px] font-normal">
                      {recipe.lab}
                    </span>
                  </td>
                  <td className="p-3">{recipe.category}</td>
                  <td className="p-3">{recipe.student}</td>
                  <td className="p-3">{recipe.status}</td>
                  <td className="p-3">
                    {recipe.active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-3">{recipe.origin}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onOpenRecipe(recipe.id)}
                      className="text-xs font-black underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function FacultyStudents() {
  return (
    <ManagementList
      title="Student management"
      description="Manage class access and student accounts."
      rows={[
        ["Maria Santos", "BSHM 3A", "Active"],
        ["Juan Dela Cruz", "BSHM 3A", "Active"],
        ["Anna Reyes", "BSHM 3B", "Pending"],
      ]}
    />
  );
}

function ManagementList({ title, description, rows, onUpdate }) {
  return (
    <section className="rounded-2xl border-2 border-[#f57696] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        {onUpdate && (
          <button
            onClick={() =>
              onUpdate(`New record created in ${title.toLowerCase()}.`)
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white"
          >
            Add record
          </button>
        )}
      </div>
      <div className="mt-5 divide-y divide-[#fbd2dd]">
        {rows.map(([name, detail, status]) => (
          <div
            key={name}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p className="font-bold">{name}</p>
              <p className="text-xs text-neutral-600">{detail}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#fbd2dd] px-3 py-1 text-xs font-bold">
                {status}
              </span>
              {onUpdate && (
                <button
                  onClick={() => onUpdate(`${name} was updated.`)}
                  className="text-xs font-black underline"
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}