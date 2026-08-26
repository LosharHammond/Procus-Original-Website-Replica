import Link from "next/link";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div style={{ marginTop: "130px", minHeight: "50vh", display: "grid", placeItems: "center", textAlign: "center", padding: "4rem 25px" }}>
      <div>
        <h1 className="gradientText">Page not found</h1>
        <p style={{ marginBottom: "1.5rem" }}>
          Sorry, we couldn&apos;t find the page you were looking for.
        </p>
        <Button href="/">Back to Home</Button>
        <p style={{ marginTop: "1.5rem" }}>
          Or visit our <Link href="/brands" style={{ textDecoration: "underline" }}>brands</Link> page.
        </p>
      </div>
    </div>
  );
}
