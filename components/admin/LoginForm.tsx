"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function post(url: string, body: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { response, data: await response.json().catch(() => ({})) };
  }

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { response, data } = await post("/api/admin/login", { password });
      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your internet connection.");
    } finally {
      setBusy(false);
    }
  }

  async function sendLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { response, data } = await post("/api/admin/forgot", { email });
      if (!response.ok) setError(data.error || "Something went wrong. Try again.");
      else setNotice(data.message);
    } catch {
      setError("Could not reach the server. Check your internet connection.");
    } finally {
      setBusy(false);
    }
  }

  function switchTo(next: "login" | "forgot") {
    setMode(next);
    setError("");
    setNotice("");
  }

  return (
    <div className={styles.centerScreen}>
      {mode === "login" ? (
        <form className={styles.loginCard} onSubmit={login}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/procus-logo.svg" alt="Procus" width={80} height={54} />
          <h1>Website admin</h1>
          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button type="submit" className={styles.primaryButton} disabled={busy}>
            {busy ? "Checking…" : "Log in"}
          </button>
          <button type="button" className={styles.linkButton} onClick={() => switchTo("forgot")}>
            Forgot password?
          </button>
        </form>
      ) : (
        <form className={styles.loginCard} onSubmit={sendLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/procus-logo.svg" alt="Procus" width={80} height={54} />
          <h1>Reset the password</h1>
          <p className={styles.hint}>
            Enter a recovery email address. We&apos;ll send it a link to choose a new password.
          </p>
          <label className={styles.field}>
            <span>Recovery email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus required />
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          {notice ? <p className={styles.successNote} role="status">{notice}</p> : null}
          <button type="submit" className={styles.primaryButton} disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
          <button type="button" className={styles.linkButton} onClick={() => switchTo("login")}>
            Back to log in
          </button>
        </form>
      )}
    </div>
  );
}
