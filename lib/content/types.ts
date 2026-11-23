// Shapes of the content that the admin panel can edit.
// Shared by the public pages, the admin API and the admin editor.

export type ProductContent = {
  slug: string;
  name: string;
  image: string;
  /** Pictures shown on the product page. If empty, the card image (`image`) is used. */
  images?: string[];
  imageAlt: string;
  description?: string;
  sizes: string;
};

export type CategoryContent = {
  name: string;
  products: ProductContent[];
};

export type BrandContent = {
  slug: string;
  name: string;
  logo: string;
  cover: string;
  tagline: string;
  description: string;
  categories: CategoryContent[];
};

export type PostBlock =
  | { type: "text"; text: string }
  | { type: "quote"; before: string; quote: string; after?: string }
  | { type: "highlight"; before: string; highlight: string; after?: string };

export type PostContent = {
  slug: string;
  /** Small label above the title, e.g. "Press Release", "News", "Event". */
  label: string;
  title: string;
  /** Optional ISO date, YYYY-MM-DD, shown on the page. Posts appear in the order they are listed. */
  date: string;
  image: string;
  imageAlt: string;
  /** Short text for the listing card. */
  summary: string;
  blocks: PostBlock[];
  published: boolean;
};

export type AmbassadorContent = {
  name: string;
  /** Short description of who they are, e.g. "Actress and TV host". */
  role: string;
  /** Photo. If empty, a placeholder with their initials is shown. */
  image: string;
  blurb: string;
  /** Optional "Read more" link, e.g. to their announcement on the Events and News page. */
  link: string;
};

/** A product shown in the homepage "Featured Products" tabs, by brand and product web address. */
export type FeaturedRef = {
  brand: string;
  product: string;
};

export type SiteContent = {
  version: 1;
  /** ISO timestamp of the last save; used to stop two admins overwriting each other. */
  updatedAt: string;
  brandsPage: {
    title: string;
    heading: string;
    intro: string;
  };
  brands: BrandContent[];
  eventsPage: {
    title: string;
    intro: string;
  };
  posts: PostContent[];
  /** Brand ambassadors shown on the homepage. */
  ambassadors: AmbassadorContent[];
  /** Products shown under "Featured Products" on the homepage, in this order. */
  featured: FeaturedRef[];
};
