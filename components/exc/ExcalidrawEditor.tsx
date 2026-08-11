"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import "@excalidraw/excalidraw/index.css";
import * as store from "@/lib/exc/store-client";
import type { Scene } from "@/lib/exc/types";

// Excalidraw touches `window`, so it must render client-side only.
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <Centered>Loading editor…</Centered> }
);

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--muted)" }}>
      {children}
    </div>
  );
}

export default function ExcalidrawEditor({ id }: { id: string }) {
  const [initialData, setInitialData] = useState<any | undefined>(undefined);
  const [name, setName] = useState("Untitled");
  const [notFound, setNotFound] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const apiRef = useRef<any>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameRef = useRef(name);
  nameRef.current = name;

  useEffect(() => {
    let alive = true;
    store.get(id).then((d) => {
      if (!alive) return;
      if (!d) {
        setNotFound(true);
        return;
      }
      setName(d.name);
      setInitialData({
        elements: d.scene?.elements || [],
        appState: {
          ...(d.scene?.appState || {}),
          theme: d.scene?.appState?.theme || "dark",
          collaborators: undefined,
        },
        files: d.scene?.files || {},
        scrollToContent: true,
      });
    });
    return () => {
      alive = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [id]);

  const doSave = useCallback(async () => {
    const api = apiRef.current;
    if (!api) return;
    const as = api.getAppState();
    const scene: Scene = {
      elements: api.getSceneElements(),
      appState: {
        viewBackgroundColor: as.viewBackgroundColor,
        theme: as.theme,
        gridModeEnabled: as.gridModeEnabled,
      },
      files: api.getFiles(),
    };
    await store.save(id, { name: nameRef.current, scene });
    setSavedAt(Date.now());
  }, [id]);

  const onChange = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 1200);
  }, [doSave]);

  const commitName = useCallback(() => void doSave(), [doSave]);

  if (notFound) {
    return (
      <Centered>
        <div style={{ textAlign: "center" }}>
          <p>Diagram not found.</p>
          <Link href="/exc" style={{ color: "var(--primary)" }}>
            ← Back to gallery
          </Link>
        </div>
      </Centered>
    );
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--panel)",
        }}
      >
        <Link href="/exc" style={{ color: "var(--muted)", fontSize: 14 }} title="Back to gallery">
          ← Gallery
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), commitName())}
          spellCheck={false}
          style={{
            background: "transparent",
            border: "1px solid transparent",
            color: "var(--text)",
            fontSize: 15,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 6,
            minWidth: 160,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = "transparent")}
        />
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>
          {savedAt ? `saved ${new Date(savedAt).toLocaleTimeString()}` : " "}
        </span>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        {initialData === undefined ? (
          <Centered>Loading…</Centered>
        ) : (
          <Excalidraw
            initialData={initialData}
            excalidrawAPI={(api: any) => (apiRef.current = api)}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}
