"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/ops/AdminShell";

export function AdminTable({
  title,
  endpoint,
  columns,
}: {
  title: string;
  endpoint: string;
  columns: { key: string; label: string }[];
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((json) => {
        const firstArray = Object.values(json).find((v) => Array.isArray(v));
        setRows((firstArray as Record<string, unknown>[]) || []);
        if (json.error) setError(json.error);
      })
      .catch(() => setError("Falha ao carregar"));
  }, [endpoint]);

  return (
    <AdminShell title={title}>
      {error && <p className="text-red">{error}</p>}
      {!error && rows.length === 0 && <p className="text-gray">Nenhum registro.</p>}
      {rows.length > 0 && (
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-gray">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap py-2 pr-4">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={String(row.id || i)} className="border-t border-white/10">
                  {columns.map((c) => (
                    <td key={c.key} className="py-3 pr-4">{String(row[c.key] ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
