import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";
import AdminApp from "@/components/admin/AdminApp";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await adminConfigured())) {
    return (
      <div className={styles.centerScreen}>
        <div className={styles.loginCard}>
          <h1>Admin panel not available</h1>
          <p>
            The <code>ADMIN_PASSWORD</code> set on the server is shorter than 8 characters. Make it longer, or remove
            it to use the built-in password, then restart the site.
          </p>
        </div>
      </div>
    );
  }

  if (!(await isAdmin())) return <LoginForm />;
  return <AdminApp />;
}
