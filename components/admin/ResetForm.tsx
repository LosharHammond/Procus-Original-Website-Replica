"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

export default function ResetForm({ token }: { token: string }) {
  const [checked, setChecked] = useState<"checking" | "ok" | "bad">(token ? "checking" : "bad");
  const [badReason, setBadReason] = useState("This reset link is incomplete. Go back to the login page and ask for a new one.");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/admin/reset?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) setChecked("ok");
        else {
          setBadReason((await response.json().catch(() => ({}))).error || badReason);
          setChecked("bad");
        }
      })
      .catch(() => {
        setBadReason("Could not reach the server. Check your internet connection and reload this page.");
        setChecked("bad");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setError(data.error || "The password could not be changed.");
      else setDone(true);
    } catch {
      setError("Could not reach the server. Check your internet connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.centerScreen}>
      <form className={styles.loginCard} onSubmit={submit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo/procus-logo.svg" alt="Procus" width={80} height={54} />
        <h1>Choose a new password</h1>

        {done ? (
          <>
            <p className={styles.successNote} role="status">
              Password changed. Everyone on the recovery list has been emailed about the change.
            </p>
            <a href="/admin" className={styles.primaryButton}>
              Log in with the new password
            </a>
          </>
        ) : checked === "checking" ? (
          <p>Checking the link…</p>
        ) : checked === "bad" ? (
          <>
            <p className={styles.error} role="alert">{badReason}</p>
            <a href="/admin" className={styles.secondaryButton}>
              Go to the login page
            </a>
          </>
        ) : (
          <>
            <label className={styles.field}>
              <span>New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                required
              />
              <small>At least 8 characters. A short sentence is easy to remember and hard to guess.</small>
            </label>
            <label className={styles.field}>
              <span>Type it again</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <button type="submit" className={styles.primaryButton} disabled={busy}>
              {busy ? "Saving…" : "Save new password"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
