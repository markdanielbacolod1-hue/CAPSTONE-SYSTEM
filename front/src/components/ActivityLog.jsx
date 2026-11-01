import React, { useEffect, useState } from "react";
import { useArchive } from "../contexts/ArchiveContext";

export function ActivityLog() {
  const { fetchActivityLogs, activityLogs } = useArchive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchActivityLogs();
    } catch (e) {
      setError(e.message || "Unable to load activity records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-2xl border-2 border-[#f57696] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Persistent activity log</h2>
          <p className="text-sm text-neutral-600">
            Audit records saved in MySQL, not temporary browser state.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border-2 border-black px-3 py-2 text-sm font-bold"
        >
          Refresh
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-5">Loading activity…</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fbd2dd] text-xs uppercase">
              <tr>
                <th className="p-3">Date / time</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Record</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((row) => (
                <tr key={row.id} className="border-t border-[#fbd2dd]">
                  <td className="p-3 whitespace-nowrap">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="p-3">{row.fullName || "System"}</td>
                  <td className="p-3 font-bold">{row.action}</td>
                  <td className="p-3">
                    {row.entityType}
                    {row.entityId ? ` #${row.entityId}` : ""}
                  </td>
                  <td className="p-3">{row.description || "—"}</td>
                </tr>
              ))}
              {!activityLogs.length && (
                <tr>
                  <td colSpan="5" className="p-5 text-center">
                    No activity records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}