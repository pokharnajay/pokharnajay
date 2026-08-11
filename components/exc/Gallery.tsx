"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as store from "@/lib/exc/store-client";
import type { DiagramMeta } from "@/lib/exc/types";

export default function Gallery() {
  const router = useRouter();
  const [items, setItems] = useState<DiagramMeta[] | null>(null);
  const [mode, setMode] = useState<"cloud" | "local" | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setItems(await store.list());
  }
  useEffect(() => {
    store.storageMode().then(setMode);
    refresh();
  }, []);

  async function newDiagram() {
    setBusy(true);
    try {
      const d = await store.create("Untitled");
      router.push(`/exc/d/${d.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function rename(m: DiagramMeta) {
    const name = window.prompt("Rename diagram", m.name);
    if (name == null || name === m.name) return;
    await store.save(m.id, { name });
    refresh();
  }

  async function del(m: DiagramMeta) {
    if (!window.confirm(`Delete "${m.name}"? This can't be undone.`)) return;
    await store.remove(m.id);
    refresh();
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Excalidraw</h1>
        {mode && (
          <span
            title={
              mode === "cloud"
                ? "Diagrams are saved to your cloud store (Upstash)"
                : "No cloud store configured — diagrams are saved in this browser only"
            }
            style={{
              fontSize: 12,
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {mode === "cloud" ? "☁ cloud storage" : "🖥 local (this browser)"}
          </span>
        )}
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={newDiagram}
            disabled={busy}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            + New diagram
          </button>
        </div>
      </header>
      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 0 }}>
        {mode === "local"
          ? "Tip: add an Upstash Redis store (free) to save diagrams to the cloud — see the README."
          : "Your diagrams, saved to the cloud."}
      </p>

      {items === null ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : items.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 12,
            padding: 40,
            textAlign: "center",
            color: "var(--muted)",
          }}
        >
          No diagrams yet. Click <strong style={{ color: "var(--text)" }}>+ New diagram</strong> to start.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {items.map((m) => (
            <div
              key={m.id}
              onClick={() => router.push(`/exc/d/${m.id}`)}
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minHeight: 110,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15 }}>{m.name || "Untitled"}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>
                edited {new Date(m.updatedAt).toLocaleString()}
              </div>
              <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                <button onClick={(e) => (e.stopPropagation(), rename(m))} style={miniBtn}>
                  Rename
                </button>
                <button
                  onClick={(e) => (e.stopPropagation(), del(m))}
                  style={{ ...miniBtn, color: "var(--danger)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const miniBtn: React.CSSProperties = {
  background: "var(--panel-2)",
  color: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "5px 10px",
  fontSize: 12,
  cursor: "pointer",
};
