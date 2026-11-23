"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmButton } from "./fields";
import styles from "./admin.module.css";

type AccountState = {
  recoveryEmails: string[];
  emailReady: boolean;
  passwordSource: "changed" | "server" | "built-in";
  passwordChangedAt: string | null;
};

export default function AccountPanel() {
  const [state, setState] = useState<AccountState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMessage, setPwMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [changing, setChanging] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/account", { cache: "no-store" });
    if (response.status === 401) return window.location.reload();
    if (!response.ok) return setLoadError("Could not load the account settings. Please refresh the page.");
    setState(await response.json());
  }, []);

  useEffect(() => {
    // Loading the settings from the server once is the external sync this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch(() => setLoadError("Could not reach the server."));
  }, [load]);

  async function saveEmails(list: string[], success: string) {
    setSaving(true);
    setEmailMessage(null);
    try {
      const response = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryEmails: list }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setEmailMessage({ type: "error", text: data.error || "Could not save the list." });
        return false;
      }
      setState(data);
      setEmailMessage({ type: "ok", text: success });
      return true;
    } catch {
      setEmailMessage({ type: "error", text: "Could not reach the server. Try again." });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!state) return;
    const email = newEmail.trim().toLowerCase();
    if (state.recoveryEmails.includes(email)) {
      setEmailMessage({ type: "error", text: `${email} is already on the list.` });
      return;
    }
    if (await saveEmails([...state.recoveryEmails, email], `Added ${email}.`)) setNewEmail("");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setPwMessage(null);
    if (next.length < 8) return setPwMessage({ type: "error", text: "Use at least 8 characters for the new password." });
    if (next !== confirm) return setPwMessage({ type: "error", text: "The two new passwords don't match." });
    setChanging(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setPwMessage({ type: "error", text: data.error || "The password could not be changed." });
      setCurrent("");
      setNext("");
      setConfirm("");
      setPwMessage({
        type: "ok",
        text: "Password changed. Other browsers have been logged out, and the recovery list has been emailed about the change.",
      });
      load().catch(() => {});
    } catch {
      setPwMessage({ type: "error", text: "Could not reach the server. Try again." });
    } finally {
      setChanging(false);
    }
  }

  if (loadError) return <section className={styles.panel}><p className={styles.error}>{loadError}</p></section>;
  if (!state) return <section className={styles.panel}><p>Loading…</p></section>;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h1>Password &amp; recovery</h1>
      </div>
      <p className={styles.hint}>
        Changes on this screen happen straight away; there is no need to click Save.
      </p>

      {!state.emailReady ? (
        <div className={styles.errorBanner} style={{ margin: 0 }}>
          <p>
            Email isn&apos;t set up on the server yet, so reset links and alerts can&apos;t be sent. Ask the person who
            hosts the website to add the mailbox settings (SMTP), as described in the README.
          </p>
        </div>
      ) : null}

      <h2 className={styles.subTitle}>Recovery emails</h2>
      <p className={styles.hint}>
        If the password is forgotten, choose &ldquo;Forgot password?&rdquo; on the login screen and enter one of these
        addresses to get a reset link. Everyone on this list is also emailed whenever the password changes.
      </p>
      <ul className={styles.productList}>
        {state.recoveryEmails.map((email) => (
          <li key={email} className={styles.productRow}>
            <div className={styles.productSummary}>
              <strong className={styles.emailAddress}>{email}</strong>
              <div className={styles.rowActions}>
                {state.recoveryEmails.length > 1 ? (
                  <ConfirmButton
                    confirmText="Yes, remove"
                    warning={`Remove ${email}?`}
                    onConfirm={() =>
                      saveEmails(
                        state.recoveryEmails.filter((e) => e !== email),
                        `Removed ${email}.`,
                      )
                    }
                  >
                    Remove
                  </ConfirmButton>
                ) : (
                  <small className={styles.hint}>Keep at least one</small>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form className={styles.inlineForm} onSubmit={addEmail}>
        <label className={styles.field}>
          <span>Add a recovery email</span>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="name@procusghana.com"
            required
          />
        </label>
        <button type="submit" className={styles.secondaryButton} disabled={saving}>
          {saving ? "Saving…" : "Add email"}
        </button>
      </form>
      {emailMessage ? (
        <p className={emailMessage.type === "ok" ? styles.successNote : styles.error} role="status">
          {emailMessage.text}
        </p>
      ) : null}

      <h2 className={styles.subTitle}>Change password</h2>
      <p className={styles.hint}>
        {state.passwordChangedAt
          ? `Last changed ${new Date(state.passwordChangedAt).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}.`
          : state.passwordSource === "server"
            ? "The password currently comes from the server settings (ADMIN_PASSWORD). Changing it here replaces that."
            : "The password is still the original one built into the website."}
      </p>
      <form className={styles.passwordForm} onSubmit={changePassword}>
        <label className={styles.field}>
          <span>Current password</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className={styles.field}>
          <span>New password</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
          <small>At least 8 characters. A short sentence is easy to remember and hard to guess.</small>
        </label>
        <label className={styles.field}>
          <span>Type the new password again</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </label>
        {pwMessage ? (
          <p className={pwMessage.type === "ok" ? styles.successNote : styles.error} role="status">
            {pwMessage.text}
          </p>
        ) : null}
        <button type="submit" className={styles.primaryButton} disabled={changing}>
          {changing ? "Changing…" : "Change password"}
        </button>
      </form>
    </section>
  );
}
