"use client";

import { useRef, useState, type ReactNode } from "react";
import styles from "./admin.module.css";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/%/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  required,
  type = "text",
  list,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  required?: boolean;
  type?: "text" | "date";
  list?: string;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {required ? <em className={styles.required}> *</em> : null}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} list={list} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  rows?: number;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function SlugField({
  label = "Web address",
  prefix,
  value,
  onChange,
}: {
  label?: string;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        <em className={styles.required}> *</em>
      </span>
      <div className={styles.slugRow}>
        <code>{prefix}</code>
        <input
          value={value}
          onChange={(e) =>
            // Gentle clean-up while typing (a trailing dash is allowed until saving).
            onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+/, ""))
          }
        />
      </div>
      <small>Lowercase letters, numbers and dashes only. Changing it breaks old links to this page.</small>
    </label>
  );
}

/** Image picker: shows a preview, lets the admin upload a new file or paste a path. */
export function ImageField({
  label,
  value,
  onChange,
  required,
  compact,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={`${styles.field} ${compact ? styles.imageFieldCompact : ""}`}>
      <span>
        {label}
        {required ? <em className={styles.required}> *</em> : null}
      </span>
      <div className={styles.imageField}>
        <div className={styles.imagePreview}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div className={styles.imageControls}>
          <button type="button" className={styles.secondaryButton} onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <input
            className={styles.pathInput}
            value={value}
            placeholder="/assets/… or uploaded image"
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} path`}
          />
          {error ? <small className={styles.error}>{error}</small> : null}
        </div>
      </div>
    </div>
  );
}

/** Two-step delete button, so nothing is removed by a single slip of the mouse. */
export function ConfirmButton({
  children,
  confirmText = "Yes, delete",
  onConfirm,
  warning,
}: {
  children: ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  warning?: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className={styles.dangerButton} onClick={() => setAsking(true)}>
        {children}
      </button>
    );
  }
  return (
    <span className={styles.confirmBox}>
      {warning ? <span>{warning}</span> : <span>Are you sure?</span>}
      <button
        type="button"
        className={styles.dangerSolidButton}
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
      >
        {confirmText}
      </button>
      <button type="button" className={styles.linkButton} onClick={() => setAsking(false)}>
        Cancel
      </button>
    </span>
  );
}

export function MoveButtons({
  index,
  length,
  onMove,
  label,
}: {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  label: string;
}) {
  return (
    <span className={styles.moveButtons}>
      <button
        type="button"
        className={styles.iconButton}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label={`Move ${label} up`}
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        className={styles.iconButton}
        disabled={index === length - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={`Move ${label} down`}
        title="Move down"
      >
        ↓
      </button>
    </span>
  );
}

export function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
