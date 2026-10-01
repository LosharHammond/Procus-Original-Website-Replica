"use client";

import { useState, type FormEvent } from "react";
import Heading from "./Heading";
import Button from "./Button";
import { siteInfo, socialLinks } from "@/lib/siteData";
import styles from "./ContactForm.module.css";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder: string;
  required?: boolean;
};

type ContactFormProps = {
  id?: string;
  formName?: "contact" | "careers";
  title: string;
  description: string;
  rows: FieldConfig[][];
  message: FieldConfig;
  fileUpload?: { label: string; name: string };
  showContactDetails?: boolean;
  submitLabel?: string;
};

const FILE_SIZE_LIMIT = 500 * 1024; // 500KB
const FORM_RECIPIENT = "Skthakur10@gmail.com";

async function fileToBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

export default function ContactForm({
  id,
  formName = "contact",
  title,
  description,
  rows,
  message,
  fileUpload,
  showContactDetails = true,
  submitLabel = "Submit",
}: ContactFormProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allFields = [...rows.flat(), message];
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};

    for (const field of allFields) {
      if (field.required) {
        const value = (formData.get(field.name) as string | null)?.trim();
        if (!value) {
          nextErrors[field.name] = `${field.label} is required`;
        }
      }
    }

    if (fileUpload) {
      const file = formData.get(fileUpload.name) as File | null;
      if (file && file.size > 0) {
        if (file.type !== "application/pdf") {
          nextErrors[fileUpload.name] = "Only PDF files are accepted";
        } else if (file.size > FILE_SIZE_LIMIT) {
          nextErrors[fileUpload.name] = "File must be under 500KB";
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const fields: Record<string, string> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string" && key !== "_honey") fields[key] = value.trim();
      }

      const selectedFile = fileUpload ? (formData.get(fileUpload.name) as File | null) : null;
      const attachment = selectedFile && selectedFile.size > 0
        ? { name: selectedFile.name, content: await fileToBase64(selectedFile) }
        : undefined;

      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          formName,
          fields,
          honeypot: formData.get("_honey"),
          attachment,
        }),
      });
      const result = (await response.json()) as {
        accepted?: boolean;
        message?: string;
      };

      if (!response.ok || !result.accepted) {
        throw new Error(result.message || "The form submission was not accepted.");
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.section} id={id}>
      <div className="container">
        <div className={styles.intro}>
          <Heading title={title} />
          <p>{description}</p>
        </div>

        <div className={[styles.grid, showContactDetails ? styles.sideBySide : styles.stacked].join(" ")}>
          {showContactDetails ? (
            <div className={styles.contactDetails}>
              <span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/phone.svg" alt="" />
                {siteInfo.phone}
              </span>
              <span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/icons/mail.svg" alt="" />
                {siteInfo.email}
              </span>
              <div className={styles.social}>
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/facebook-dark.svg" alt="" />
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/social/instagram-dark.svg" alt="" />
                </a>
              </div>
            </div>
          ) : null}

          <form
            className={styles.forms}
            name={formName}
            onSubmit={handleSubmit}
            noValidate
          >
            <p className={styles.honeypot} aria-hidden="true">
              <label>
                Do not fill this out if you are human:
                <input name="_honey" tabIndex={-1} autoComplete="off" />
              </label>
            </p>
            {status === "success" ? (
              <div className={styles.successBox} role="status">
                Thanks — your message has been sent.
              </div>
            ) : null}

            {status === "error" ? (
              <div className={styles.errorBox} role="alert">
                Sorry, your message could not be sent. Please email us directly at{" "}
                <a href={`mailto:${FORM_RECIPIENT}`}>{FORM_RECIPIENT}</a>.
              </div>
            ) : null}

            {rows.map((row, i) => (
              <div className={styles.fieldRow} key={i}>
                {row.map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="srOnly">
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      aria-invalid={Boolean(errors[field.name])}
                    />
                    {errors[field.name] ? <p className={styles.errorText}>{errors[field.name]}</p> : null}
                  </div>
                ))}
              </div>
            ))}

            <div className={styles.textArea}>
              <label htmlFor={message.name} className="srOnly">
                {message.label}
              </label>
              <textarea
                id={message.name}
                name={message.name}
                placeholder={message.placeholder}
                rows={5}
                required={message.required}
                aria-invalid={Boolean(errors[message.name])}
              />
              {errors[message.name] ? <p className={styles.errorText}>{errors[message.name]}</p> : null}
            </div>

            {fileUpload ? (
              <div className={styles.fieldRow}>
                <div>
                  <label htmlFor={fileUpload.name}>{fileUpload.label}</label>
                  <input id={fileUpload.name} name={fileUpload.name} type="file" accept="application/pdf" />
                  {errors[fileUpload.name] ? <p className={styles.errorText}>{errors[fileUpload.name]}</p> : null}
                </div>
              </div>
            ) : null}

            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : submitLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
