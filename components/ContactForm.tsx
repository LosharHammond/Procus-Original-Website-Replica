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
  title: string;
  description: string;
  rows: FieldConfig[][];
  message: FieldConfig;
  fileUpload?: { label: string; name: string };
  showContactDetails?: boolean;
  submitLabel?: string;
};

const FILE_SIZE_LIMIT = 500 * 1024; // 500KB

export default function ContactForm({
  id,
  title,
  description,
  rows,
  message,
  fileUpload,
  showContactDetails = true,
  submitLabel = "Submit",
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allFields = [...rows.flat(), message];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // Frontend-only for now: no data leaves the browser.
      // Wire this up to your email/CRM endpoint when ready — see README.md.
      setStatus("success");
      form.reset();
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

          <form className={styles.forms} onSubmit={handleSubmit} noValidate>
            {status === "success" ? (
              <div className={styles.successBox} role="status">
                Thanks — your message has been received. We&apos;ll be in touch soon.
              </div>
            ) : null}

            {rows.map((row, i) => (
              <div className={styles.fieldRow} key={i}>
                {row.map((field) => (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="srOnly">
                      {field.label}
                    </label>
                    <input id={field.name} name={field.name} type={field.type} placeholder={field.placeholder} />
                    {errors[field.name] ? <p className={styles.errorText}>{errors[field.name]}</p> : null}
                  </div>
                ))}
              </div>
            ))}

            <div className={styles.textArea}>
              <label htmlFor={message.name} className="srOnly">
                {message.label}
              </label>
              <textarea id={message.name} name={message.name} placeholder={message.placeholder} rows={5} />
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

            <Button type="submit">{submitLabel}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
