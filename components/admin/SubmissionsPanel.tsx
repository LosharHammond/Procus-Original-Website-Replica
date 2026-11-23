"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StoredSubmission } from "@/lib/submissions";
import { ConfirmButton } from "./fields";
import styles from "./admin.module.css";

const FORM_LABELS: Record<StoredSubmission["form"], string> = {
  contact: "Partner enquiry",
  careers: "Job application",
};

const FILTER_LABELS = {
  all: "All",
  unread: "Unread",
  contact: "Partner enquiries",
  careers: "Job applications",
};

const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  name: "Name",
  email: "Email",
  phone: "Contact number",
  specialisation: "Area of expertise",
  message: "Message",
};

type Filter = "all" | "unread" | "contact" | "careers";

function senderName(s: StoredSubmission) {
  return s.fields.name || [s.fields.first_name, s.fields.last_name].filter(Boolean).join(" ") || "No name";
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsv(items: StoredSubmission[]) {
  const keys = ["first_name", "last_name", "name", "email", "phone", "specialisation", "message"];
  const header = ["Received", "Form", "Page", ...keys.map((k) => FIELD_LABELS[k]), "Resume", "Read"];
  const rows = items.map((s) => [
    s.receivedAt,
    FORM_LABELS[s.form],
    s.page,
    ...keys.map((k) => s.fields[k] ?? ""),
    s.resumeName ?? "",
    s.read ? "Yes" : "No",
  ]);
  // The BOM makes Excel open the file with the right characters.
  return "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export default function SubmissionsPanel({ onUnreadChange }: { onUnreadChange: (count: number) => void }) {
  const [items, setItems] = useState<StoredSubmission[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const response = await fetch("/api/admin/submissions", { cache: "no-store" });
    if (response.status === 401) {
      window.location.reload();
      return;
    }
    if (!response.ok) {
      setError("Could not load the form submissions.");
      return;
    }
    setItems(await response.json());
  }, []);

  useEffect(() => {
    // Loading the list from the server once is the external sync this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setError("Could not reach the server."));
  }, [load]);

  useEffect(() => {
    if (items) onUnreadChange(items.filter((s) => !s.read).length);
  }, [items, onUnreadChange]);

  const shown = useMemo(
    () =>
      (items ?? []).filter((s) =>
        filter === "all" ? true : filter === "unread" ? !s.read : s.form === filter,
      ),
    [items, filter],
  );

  async function setRead(id: string, read: boolean) {
    setItems((list) => list?.map((s) => (s.id === id ? { ...s, read } : s)) ?? null);
    const response = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    if (!response.ok) setError("Could not update that submission. Please refresh the page.");
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete that submission. Please refresh the page.");
      return;
    }
    setItems((list) => list?.filter((s) => s.id !== id) ?? null);
    if (open === id) setOpen(null);
  }

  function toggle(s: StoredSubmission) {
    const next = open === s.id ? null : s.id;
    setOpen(next);
    if (next && !s.read) setRead(s.id, true);
  }

  function downloadCsv() {
    const blob = new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `procus-form-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const count = (f: Filter) =>
    (items ?? []).filter((s) => (f === "all" ? true : f === "unread" ? !s.read : s.form === f)).length;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Form submissions</h1>
        <div className={styles.rowActions}>
          <button type="button" className={styles.linkButton} onClick={() => load()}>
            Refresh
          </button>
          <button type="button" className={styles.secondaryButton} onClick={downloadCsv} disabled={!shown.length}>
            Download as spreadsheet
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        Every enquiry and job application sent through the website is kept here, including the attached resume.
        Changes on this screen (read, delete) happen straight away; there is no need to click Save.
      </p>

      <div className={styles.filterTabs} role="tablist" aria-label="Filter submissions">
        {(["all", "unread", "contact", "careers"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? styles.filterActive : styles.filterTab}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]} ({count(f)})
          </button>
        ))}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      {items === null && !error ? <p>Loading…</p> : null}
      {items !== null && shown.length === 0 ? <p className={styles.hint}>Nothing here yet.</p> : null}

      <ul className={styles.submissionList}>
        {shown.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className={s.read ? styles.submission : styles.submissionUnread}>
              <button type="button" className={styles.submissionSummary} onClick={() => toggle(s)} aria-expanded={isOpen}>
                <span className={s.form === "careers" ? styles.badgeCareers : styles.badgeContact}>{FORM_LABELS[s.form]}</span>
                <strong>{senderName(s)}</strong>
                <span className={styles.submissionPreview}>
                  {s.form === "careers" ? s.fields.specialisation : s.fields.message}
                </span>
                <time dateTime={s.receivedAt}>{formatWhen(s.receivedAt)}</time>
                {!s.read ? <span className={styles.newDot}>New</span> : null}
              </button>

              {isOpen ? (
                <div className={styles.submissionBody}>
                  <dl className={styles.submissionFields}>
                    {Object.entries(s.fields).map(([key, value]) => (
                      <div key={key} className={key === "message" ? styles.fullRow : undefined}>
                        <dt>{FIELD_LABELS[key] ?? key.replace(/[_-]/g, " ")}</dt>
                        <dd>
                          {key === "email" ? (
                            <a href={`mailto:${value}`}>{value}</a>
                          ) : key === "phone" ? (
                            <a href={`tel:${value.replace(/[^\d+]/g, "")}`}>{value}</a>
                          ) : (
                            value || "—"
                          )}
                        </dd>
                      </div>
                    ))}
                    {s.resumeName ? (
                      <div>
                        <dt>Resume</dt>
                        <dd>
                          <a href={`/api/admin/submissions/${s.id}/resume`} target="_blank" rel="noreferrer">
                            Open {s.resumeName}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>Sent from page</dt>
                      <dd>{s.page || "—"}</dd>
                    </div>
                    <div>
                      <dt>Email notification</dt>
                      <dd>{s.emailed ? "Sent by email" : "Not sent (only saved here)"}</dd>
                    </div>
                  </dl>
                  <div className={styles.rowActions}>
                    <a className={styles.secondaryButton} href={`mailto:${s.fields.email}`}>
                      Reply by email
                    </a>
                    <button type="button" className={styles.secondaryButton} onClick={() => setRead(s.id, !s.read)}>
                      Mark as {s.read ? "unread" : "read"}
                    </button>
                    <ConfirmButton warning="Delete this submission for good?" onConfirm={() => remove(s.id)}>
                      Delete
                    </ConfirmButton>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
