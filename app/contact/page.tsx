import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { reachFormFields } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Procus Ghana Limited to partner with us as a supplier, distributor or collaborator.",
};

export default function ContactPage() {
  return (
    <div style={{ paddingTop: "80px" }}>
      <ContactForm
        title="Partner with us"
        description="If you are interested in partnering with us as a supplier, distributor or want to collaborate with us, reach out to us below:"
        {...reachFormFields}
      />
    </div>
  );
}
