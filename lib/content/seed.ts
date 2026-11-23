// Starting content for the admin panel, built from the original lib/siteData.ts.
// Used until an admin saves for the first time; after that, the saved file wins.

import { ambassador, brands, eventPost } from "@/lib/siteData";
import type { SiteContent } from "./types";

function smallestPackWeight(sizes: string) {
  const weights = Array.from(sizes.matchAll(/(\d+(?:\.\d+)?)\s*g\b/gi), (match) => Number(match[1]));
  return weights.length ? Math.min(...weights) : Number.POSITIVE_INFINITY;
}

export const KUDUS_POST_SLUG = "kivo-signs-mohammed-kudus-as-brand-ambassador";

export function buildSeedContent(): SiteContent {
  return {
    version: 1,
    updatedAt: "1970-01-01T00:00:00.000Z",
    brandsPage: {
      title: "Our Brands",
      heading: "The brands you know and love.",
      intro:
        "We bring great-tasting foods to markets around the world through a variety of brands that celebrate an assortment of tastes and preferences. We are the official manufacturers of Kivo Hot pepper, Kivo 4-in-1 Gari Soaking Mix, Kivo Non-dairy Creamer, Kivo Ginger powder, Kivo Curry Powder. The new products on the market are Kivo 100% Natural Curry Plus, Kivo 100% Natural Ginger, Garlic and Onion Powder. Additionally, we distribute Kivo Baked Beans and Mutlu Spaghetti.",
    },
    // The brand pages used to sort products by pack weight at render time.
    // Store them in that order so the site looks the same, and admins can reorder from there.
    brands: brands.map((brand) => ({
      ...structuredClone(brand),
      categories: brand.categories.map((category) => ({
        name: category.name,
        products: [...structuredClone(category.products)].sort(
          (left, right) => smallestPackWeight(left.sizes) - smallestPackWeight(right.sizes),
        ),
      })),
    })),
    eventsPage: {
      title: "Events and News",
      intro: "",
    },
    posts: [
      {
        slug: KUDUS_POST_SLUG,
        label: eventPost.eyebrow,
        title: eventPost.title,
        date: "",
        image: eventPost.image,
        imageAlt: "Mohammed Kudus signs as Kivo brand ambassador",
        summary:
          "Procus Ghana Limited announces Ghanaian star footballer Mohammed Kudus as brand ambassador for Kivo.",
        blocks: structuredClone(eventPost.paragraphs),
        published: true,
      },
    ],
    ambassadors: [
      {
        name: ambassador.name,
        role: "Professional footballer",
        image: ambassador.image,
        blurb: ambassador.blurb,
        link: ambassador.href,
      },
      {
        name: "Nana Ama McBrown",
        role: "Actress and TV host",
        image: "/assets/ambassadors/nana-ama-mcbrown.jpg",
        blurb:
          "Actress and Onua Showtime host Nana Ama McBrown joined the Kivo family in 2024 as the face of Kivo Gari, Kivo Non-Dairy Creamer and Kivo Baked Beans.",
        link: "",
      },
      {
        name: "Chef Abbys",
        role: "Chef and food creator",
        image: "/assets/ambassadors/chef-abbys.jpg",
        blurb:
          "Ghanaian chef Abena Amoakoa Sintim-Aboagye, known as Chef Abbys, joined Kivo in 2025 to champion natural Ghanaian cuisine.",
        link: "",
      },
      {
        name: "Dr Likee",
        role: "Actor and content creator",
        image: "/assets/ambassadors/dr-likee.jpg",
        blurb:
          "Actor and content creator Dr Likee brings everyday Ghanaian humour and storytelling to Kivo 4-in-1 Gari Soaking Mix, Kivo Hot Shito and Kivo natural spices.",
        link: "",
      },
    ],
    featured: [
      { brand: "kivo", product: "kivo-4-in-1-gari-soaking-mix" },
      { brand: "kivo", product: "kivo-100-natural-hot-pepper-powder" },
      { brand: "kivo", product: "kivo-3-in-1-chocolate-drink" },
    ],
  };
}
