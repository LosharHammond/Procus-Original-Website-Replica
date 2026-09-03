// Central content model for the Procus Ghana site.
// Edit this file to change nav links, footer info, brand/product data, and testimonials.

export const siteInfo = {
  name: "Procus Ghana Limited",
  shortName: "Procus",
  tagline: "Enhancing Lives Through Novel Food Solutions",
  phone: "+233 596912898",
  phoneHref: "tel:233596912898",
  email: "info@procusghana.com",
  addressNote: "Accra, Ghana",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Our Company", href: "/about" },
  { label: "Our brands", href: "/brands" },
  { label: "Careers", href: "/careers" },
  { label: "Events", href: "/events" },
];

export const socialLinks = {
  facebook: "https://www.facebook.com/KivoHotPepper?mibextid=LQQJ4d",
  instagram: "https://www.instagram.com/kivoproducts/",
  linkedin: "https://www.linkedin.com/company/procus-ghana-ltd/",
  youtube: "https://youtu.be/n9Eo381pC74",
};

export const footerColumns = {
  consumers: { label: "Consumers", linkLabel: "Download Catalogue", href: "/eCATALOGUE-2026.pdf" },
  media: { label: "Media", linkLabel: "Adverts", href: "/media" },
  careers: {
    label: "Career Seekers",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Join the team", href: "/careers#resume-form" },
    ],
  },
};

// The two forms on the live site (partner enquiry vs. job application) always use
// this exact field set/order/grouping. Defined once here and spread into every
// <ContactForm> call so every page stays in sync.
export const reachFormFields = {
  rows: [
    [
      { name: "first_name", label: "First Name", type: "text" as const, placeholder: "First Name", required: true },
      { name: "last_name", label: "Last Name", type: "text" as const, placeholder: "Last Name", required: true },
    ],
    [
      { name: "email", label: "Email Address", type: "email" as const, placeholder: "Email Address", required: true },
      { name: "phone", label: "Contact Number", type: "tel" as const, placeholder: "Contact Number", required: true },
    ],
  ],
  message: {
    name: "message",
    label: "Message",
    type: "textarea" as const,
    placeholder: "Your Message",
    required: true,
  },
};

export const resumeFormFields = {
  rows: [
    [
      { name: "name", label: "Name", type: "text" as const, placeholder: "Name", required: true },
      {
        name: "specialisation",
        label: "Area of Expertise",
        type: "text" as const,
        placeholder: "Your functional / managerial expertise area",
        required: true,
      },
    ],
    [
      { name: "email", label: "Email Address", type: "email" as const, placeholder: "Email Address", required: true },
      { name: "phone", label: "Contact Number", type: "tel" as const, placeholder: "Contact Number", required: true },
    ],
  ],
  message: {
    name: "message",
    label: "Message",
    type: "textarea" as const,
    placeholder: "Your Message",
    required: false,
  },
  fileUpload: { label: "Upload Resume (Only PDFs accepted, 500KB Limit)", name: "resume" },
};

export type Product = {
  slug: string;
  name: string;
  image: string;
  images?: string[];
  imageAlt: string;
  description?: string;
  sizes: string;
};

export type Brand = {
  slug: "kivo" | "mutlu";
  name: string;
  logo: string;
  cover: string;
  tagline: string;
  description: string;
  categories: {
    name: string;
    products: Product[];
  }[];
};

export const brands: Brand[] = [
  {
    slug: "kivo",
    name: "Kivo",
    logo: "/assets/brands/kivo-logo.svg",
    cover: "/assets/brands/kivo-cover.png",
    tagline: "100% natural spices, gari mixes and pantry staples",
    description:
      "We are the official manufacturers of Kivo Hot pepper, Kivo 4-in-1 Gari Soaking Mix, Kivo Non-dairy Creamer, Kivo Ginger powder, Kivo Curry Powder. The new products on the market are Kivo 100% Natural Curry Plus, Kivo 100% Natural Ginger, Garlic and Onion Powder. Additionally, we distribute Kivo Baked Beans.",
    categories: [
      {
        name: "Spice Powders",
        products: [
          {
            slug: "kivo-100-natural-hot-pepper-powder",
            name: "KIVO 100% NATURAL HOT PEPPER POWDER",
            image: "/assets/products/kivo/hot-pepper-powder-2026.png",
            imageAlt: "KIVO 100% NATURAL HOT PEPPER POWDER",
            description:
              "KIVO HOT PEPPER POWDER has the perfect combination of sizzling spiciness and natural red color to meet the needs of consumers who like it red and spicy hot. Hygienically packed in a variety of grammages to suit every purse, it is a 100% natural product, with a consistent quality that you can depend on day after day.",
            sizes: "6g, 50g, 180g & 400g",
          },
          {
            slug: "kivo-100-natural-ginger-powder",
            name: "KIVO 100% NATURAL GINGER POWDER",
            image: "/assets/products/kivo/ginger-powder.png",
            imageAlt: "KIVO 100% NATURAL GINGER POWDER",
            description:
              "Kivo 100% NATURAL GINGER Powder is freshly ground and packed from the dried ginger rhizomes grown in West Africa. The aromatic and spicy KIVO GINGER POWDER is an essential ingredient whether for steaming your meat, for your Stew, Shito, Kebab or for your healthy Tea.",
            sizes: "5g",
          },
          {
            slug: "kivo-100-natural-curry-powder",
            name: "KIVO 100% NATURAL CURRY POWDER",
            image: "/assets/products/kivo/curry-powder-2026.png",
            imageAlt: "KIVO 100% NATURAL CURRY POWDER",
            description:
              "KIVO CURRY POWDER is made from the choicest of spices and herbs sourced from across the orient and lends that extra color, flavor and aroma to your favorite Stew and Jollof.",
            sizes: "3.5g & 250g",
          },
          {
            slug: "kivo-100-natural-ginger-garlic-and-onion-powder",
            name: "KIVO 100% NATURAL GINGER, GARLIC AND ONION POWDER",
            image: "/assets/products/kivo/ginger-garlic-onion-powder.png",
            images: [
              "/assets/products/kivo/ginger-garlic-onion-powder.png",
              "/assets/products/kivo/ginger-garlic-onion-powder-5g.jpg",
              "/assets/products/kivo/ginger-garlic-onion-powder-50g.png",
            ],
            imageAlt: "KIVO 100% NATURAL GINGER, GARLIC AND ONION POWDER",
            description:
              "KIVO 100% NATURAL GINGER, GARLIC, and ONION POWDER combines three essential spices in one convenient blend. It does not contain salt or MSG, is perfect for steaming fish, meat and chicken. It can also be used as a base for soups, stir-fries, and more. Each batch is carefully processed and packaged to maintain freshness and ensure you get the best quality seasoning for your dishes.",
            sizes: "5g & 50g",
          },
          {
            slug: "kivo-100-natural-curry-plus",
            name: "KIVO 100% NATURAL CURRY PLUS",
            image: "/assets/products/kivo/curry-plus.png",
            images: [
              "/assets/products/kivo/curry-plus.png",
              "/assets/products/kivo/curry-plus-5g.png",
            ],
            imageAlt: "KIVO 100% NATURAL CURRY PLUS",
            description:
              "KIVO 100% NATURAL CURRY PLUS is a masterful blend of 16 spices plus Rosemary, carefully selected to add depth and warmth to your dishes. It is perfect for jollof rice, stews, fried rice, grilled meats, and roasted vegetables. No artificial preservatives or additives, just pure, natural flavor.",
            sizes: "3.5g, 50g & 250g",
          },
          {
            slug: "kivo-100-natural-rosemary",
            name: "KIVO 100% NATURAL ROSEMARY",
            image: "/assets/products/kivo/rosemary.jpg",
            imageAlt: "KIVO 100% NATURAL ROSEMARY",
            description:
              "The KIVO 100% NATURAL ROSEMARY is harvested and processed with the highest hygiene standards. This aromatic herb is perfect for roasting meats, seasoning vegetables, and cooking your other meals. Experience the fresh, fragrant taste of our rosemary in your cooking.",
            sizes: "3.5g and 50g",
          },
          {
            slug: "kivo-100-natural-soup-spice-powder",
            name: "KIVO 100% NATURAL SOUP SPICE POWDER",
            image: "/assets/products/kivo/soup-spice-powder-5g.png",
            imageAlt: "KIVO 100% NATURAL SOUP SPICE POWDER",
            description:
              "KIVO 100% NATURAL SOUP SPICE POWDER is a convenient seasoning blend made without preservatives, salt, artificial colour or MSG, created to add rich flavour and aroma to soups.",
            sizes: "5g",
          },
          {
            slug: "kivo-100-natural-stew-spice-powder",
            name: "KIVO 100% NATURAL STEW SPICE POWDER",
            image: "/assets/products/kivo/stew-spice-powder-5g.png",
            imageAlt: "KIVO 100% NATURAL STEW SPICE POWDER",
            description:
              "KIVO 100% NATURAL STEW SPICE POWDER is a convenient seasoning blend made without preservatives, salt, artificial colour or MSG, created to bring depth and flavour to stews.",
            sizes: "5g",
          },
        ],
      },
      {
        name: "Gari Soaking Mixes",
        products: [
          {
            slug: "kivo-4-in-1-gari-soaking-mix",
            name: "KIVO 4-IN-1 GARI SOAKING MIX",
            image: "/assets/products/kivo/4-in-1-gari-soaking-mix-2026.png",
            images: [
              "/assets/products/kivo/4-in-1-gari-soaking-mix-2026.png",
              "/assets/products/kivo/4-in-1-gari-soaking-mix-45g.png",
            ],
            imageAlt: "KIVO 4-IN-1 GARI SOAKING MIX",
            description:
              "KIVO GARI SOAKING MIX has captured the hearts and minds of Ghanaians with a perfect blend of Crispy Gari, Creamy Creamer, Roasted groundnuts and Sugar. It is the ideal option for a quick snack or to satisfy your late-night hunger pangs.",
            sizes: "45g, 70g & 140g",
          },
          {
            slug: "kivo-4-in-1-gari-mix-low-sugar",
            name: "KIVO 4 IN 1 GARI MIX LOW SUGAR",
            image: "/assets/products/kivo/4-in-1-gari-mix-low-sugar.png",
            imageAlt: "KIVO 4 IN 1 GARI MIX LOW SUGAR",
            description:
              "Kivo 4 in 1 Gari Mix Low Sugar has the perfect blend of taste and nutrition. This delicious mix combines the natural goodness of Gari with a rich creamy taste. Enjoy a treat that's Low on Sugar and High on Taste!",
            sizes: "125g",
          },
          {
            slug: "kivo-3-in-1-gari-mix-zero-nut",
            name: "KIVO 3 IN 1 GARI MIX ZERO NUT",
            image: "/assets/products/kivo/3-in-1-gari-mix-zero-nut.png",
            imageAlt: "KIVO 3 IN 1 GARI MIX ZERO NUT",
            description:
              "Enjoy the ultimate crunchiness of Gari with Kivo 3 in 1 Gari Mix Zero Nut. It is loaded with Gari and packed with flavor, but without any nuts. Perfect for those with dietary restrictions or preferences, this mix is a game-changer for Gari lovers. Savor the taste, minus the nuts!",
            sizes: "125g",
          },
          {
            slug: "kivo-4-in-1-coconut-gari-soaking-mix",
            name: "KIVO 4 IN 1 COCONUT GARI SOAKING MIX",
            image: "/assets/products/kivo/coconut-gari-soaking-mix.png",
            imageAlt: "KIVO 4 IN 1 COCONUT GARI SOAKING MIX",
            description:
              "KIVO 4 IN 1 COCONUT GARI SOAKING MIX combines crispy gari, creamy creamer, toasted coconut and sugar in a convenient ready-to-enjoy mix fortified with Vitamin A, iron and zinc.",
            sizes: "120g",
          },
          {
            slug: "kivo-4-in-1-strawberry-gari-soaking-mix",
            name: "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX",
            image: "/assets/products/kivo/strawberry-gari-soaking-mix.png",
            images: [
              "/assets/products/kivo/strawberry-gari-soaking-mix.png",
              "/assets/products/kivo/strawberry-gari-soaking-mix-60g.png",
            ],
            imageAlt: "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX",
            description:
              "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX blends gari, creamer, strawberry and sugar for a fruity, creamy snack fortified with Vitamin A, iron and zinc.",
            sizes: "60g",
          },
          {
            slug: "kivo-4-in-1-tutti-frutti-gari-soaking-mix",
            name: "KIVO 4 IN 1 TUTTI FRUTTI GARI SOAKING MIX",
            image: "/assets/products/kivo/tutti-frutti-gari-soaking-mix.jpg",
            imageAlt: "KIVO 4 IN 1 TUTTI FRUTTI GARI SOAKING MIX",
            description:
              "KIVO 4 IN 1 TUTTI FRUTTI GARI SOAKING MIX combines gari, creamer, tutti frutti pieces and sugar in a colourful ready-to-enjoy mix fortified with Vitamin A, iron and zinc.",
            sizes: "120g sachet",
          },
        ],
      },
      {
        name: "Cup Products",
        products: [
          {
            slug: "kivo-4-in-1-coconut-gari-soaking-mix-cup",
            name: "KIVO 4 IN 1 COCONUT GARI SOAKING MIX CUP",
            image: "/assets/products/kivo/coconut-gari-soaking-mix-cup.jpeg",
            imageAlt: "KIVO 4 IN 1 COCONUT GARI SOAKING MIX CUP",
            description:
              "KIVO 4 IN 1 COCONUT GARI SOAKING MIX CUP combines crispy gari, creamy creamer, toasted coconut and sugar in a convenient ready-to-enjoy cup fortified with Vitamin A, iron and zinc.",
            sizes: "cup format",
          },
          {
            slug: "kivo-4-in-1-strawberry-gari-soaking-mix-cup",
            name: "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX CUP",
            image: "/assets/products/kivo/strawberry-gari-soaking-mix-cup.jpeg",
            imageAlt: "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX CUP",
            description:
              "KIVO 4 IN 1 STRAWBERRY GARI SOAKING MIX CUP blends gari, creamer, strawberry and sugar in a convenient fruity cup fortified with Vitamin A, iron and zinc.",
            sizes: "cup format",
          },
        ],
      },
      {
        name: "Creamers",
        products: [
          {
            slug: "kivo-non-dairy-creamer",
            name: "KIVO NON DAIRY CREAMER",
            image: "/assets/products/kivo/non-dairy-creamer.png",
            imageAlt: "KIVO NON DAIRY CREAMER",
            description:
              "KIVO NON-DAIRY CREAMER is your go to creamer to add milky creaminess and delicious taste to your Beverages, Cereals, Gari soakings and Porridge. It is available in affordable single serve sachets and larger pouch packing for your cakes, bakes and iced kenkeys.",
            sizes: "20g & 250g",
          },
        ],
      },
      {
        name: "Convenience Foods",
        products: [
          {
            slug: "kivo-baked-beans",
            name: "KIVO BAKED BEANS",
            image: "/assets/products/kivo/baked-beans.png",
            imageAlt: "KIVO BAKED BEANS",
            description:
              "KIVO BAKED BEANS is made from the choicest selection of North American White Navy beans and rich tomato sauce. It is a tasty and nutritious supplement for any meal of the day, be it breakfast, lunch or dinner. Use it along with your toast and eggs, toss it into your salad or add it to complement your noodles, spaghetti or rice dishes.",
            sizes: "400g",
          },
          {
            slug: "kivo-gari-with-shito",
            name: "KIVO GARI WITH SHITO",
            image: "/assets/products/kivo/gari-with-shito.jpeg",
            imageAlt: "KIVO GARI WITH SHITO",
            description:
              "KIVO GARI WITH SHITO pairs ready-to-eat gari with rich Ghanaian shito for a convenient, satisfying local meal.",
            sizes: "125g",
          },
        ],
      },
    ],
  },
  {
    slug: "mutlu",
    name: "Mutlu",
    logo: "/assets/brands/mutlu-logo.svg",
    cover: "/assets/brands/mutlu-cover.png",
    tagline: "Distributed pasta, made for every Ghanaian kitchen",
    description:
      "Additionally, we distribute Mutlu Spaghetti and a range of Mutlu pasta shapes across Ghana.",
    categories: [
      {
        name: "Pasta",
        products: [
          {
            slug: "big-elbow",
            name: "Big Elbow",
            image: "/assets/products/mutlu/big-elbow.png",
            imageAlt: "Big Elbow",
            sizes: "450g",
          },
          {
            slug: "burgu",
            name: "Burgu",
            image: "/assets/products/mutlu/burgu.png",
            imageAlt: "Burgu",
            sizes: "450g",
          },
          {
            slug: "penne",
            name: "Penne",
            image: "/assets/products/mutlu/penne.png",
            imageAlt: "Penne",
            sizes: "450g",
          },
          {
            slug: "carlislon",
            name: "Carlislon",
            image: "/assets/products/mutlu/carlislon.png",
            imageAlt: "Carlislon",
            sizes: "450g",
          },
          {
            slug: "spaghetti",
            name: "Spaghetti",
            image: "/assets/products/mutlu/spaghetti.png",
            imageAlt: "Spaghetti",
            sizes: "400g & 450g",
          },
        ],
      },
    ],
  },
];

export function getBrand(slug: string) {
  return brands.find((b) => b.slug === slug);
}

export function getProduct(brandSlug: string, productSlug: string) {
  const brand = getBrand(brandSlug);
  if (!brand) return undefined;
  for (const category of brand.categories) {
    const product = category.products.find((p) => p.slug === productSlug);
    if (product) return { brand, product };
  }
  return undefined;
}

export function getAllProducts() {
  return brands.flatMap((brand) =>
    brand.categories.flatMap((category) =>
      category.products.map((product) => ({ brand, product }))
    )
  );
}

export const featuredProducts: Product[] = [
  brands[0].categories[1].products[0], // Kivo 4-in-1 Gari Soaking Mix
  brands[0].categories[0].products[0], // Kivo Hot Pepper Powder
];

export type Testimonial = {
  handle: string;
  quote: string;
  platform: "instagram" | "facebook";
};

export const testimonials: Testimonial[] = [
  {
    handle: "@ackumeyawushie",
    platform: "instagram",
    quote:
      "This is the hottest pepper you can ever find in town . . . Real hot. I love it. Try it and you will not go wrong.",
  },
  {
    handle: "@gracy_arabella",
    platform: "instagram",
    quote: "Did not know it was this hot, just a little made my jollof very hot, the quality is also dope",
  },
  {
    handle: "@Ekua Ampoma",
    platform: "facebook",
    quote:
      "I love your products; I sell noodles and ever since I switched to Kivo Hot pepper I have never regretted it.",
  },
  {
    handle: "@Abena Maggie",
    platform: "facebook",
    quote: "I love everything about Kivo, their Baked Beans are the best.",
  },
];

export const ambassador = {
  name: "Mohammed Kudus",
  image: "/assets/ambassadors/mohammed-kudus.jpg",
  blurb:
    "Kivo's partners with Mohammed Kudus to reinforce its position as a leader in the manufacturing industry in Ghana and beyond.",
  href: "/events",
};

export type EventParagraph =
  | { type: "text"; text: string }
  | { type: "quote"; before: string; quote: string; after?: string }
  | { type: "highlight"; before: string; highlight: string; after?: string };

export const eventPost = {
  title: "Procus Ghana Ltd (Kivo) Signs Star Footballer Mohammed Kudus as Brand Ambassador",
  eyebrow: "Press Release",
  image: "/assets/events/kudus-signing.jpg",
  paragraphs: [
    {
      type: "text",
      text: "Procus Ghana Limited is delighted to announce Mohammed Kudus, the internationally sought-after Ghanaian star footballer as brand ambassador for Kivo. The company is renowned for Kivo 4 in 1 Gari Mix and Kivo 100% natural spices such as Kivo Hot Pepper, Kivo Ginger Powder and their new additions Kivo Curry Plus and Kivo Garlic Ginger and Onion powder.",
    },
    {
      type: "text",
      text: '"Mohammed Kudus exemplifies what the Kivo brand is about: high quality, authenticity, hard work and the Ghanaian spirit that aims to be at the heart of every household. We are incredibly excited to welcome Kudus to the Kivo family" said Shanmukha Rao, Business Head at Procus Ghana Ltd.',
    },
    {
      type: "quote",
      before: "Evans Kwofie, Marketing Manager at Procus Ghana Ltd added that ",
      quote:
        "As a global champion, Kudus will play a key role in promoting Kivo's innovative products and engaging with its growing community in Ghana and beyond. We believe that Kudus will inspire our customers and help us further connect with them. We look forward to a successful relationship between Kudus and Kivo.",
    },
    {
      type: "highlight",
      before:
        'Kudus also expressed his enthusiasm about the partnership stating, "Kivo has built a strong reputation for delivering innovative and high-quality food products, and I am proud to represent such a respected brand with a Ghana-made range of products. I love the Kivo Gari Mix so much and I\'m even taking it along to the UK." He ended his comment saying "',
      highlight: "Kivo Products, Champion Taste!",
      after: '".',
    },
    {
      type: "text",
      text: "Kudus, was recently crowned the Footballer of the Year at the 2024 Ghana Football Awards second time running. Kivo's partnership with Mohammed Kudus signifies a bold step forward in the brand's journey, reinforcing its position as a leader in the manufacturing industry in Ghana and beyond.",
    },
  ] satisfies EventParagraph[],
};

export type Advert = {
  slug: string;
  title: string;
  thumbnail: string;
  youtubeId?: string;
};

export const adverts: Advert[] = [
  {
    slug: "kivo-hot-pepper-commercial",
    title: "Kivo Hot Pepper Commercial",
    thumbnail: "/assets/adverts/pepper-ad-thumb.jpg",
    youtubeId: "n9Eo381pC74",
  },
  {
    slug: "kivo-baked-beans-commercial",
    title: "Kivo Baked Beans Commercial",
    thumbnail: "/assets/adverts/beans-ad-thumb.jpg",
    youtubeId: "ymMuQlk4k8A",
  },
];

export type HeroSlide = {
  id: string;
  media: { type: "mp4"; src: string } | { type: "youtube"; id: string };
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "more-kivo-inside",
    media: { type: "mp4", src: "/assets/hero/kivo-more-inside-tvc.mp4" },
    heading: "More Kivo Inside Every Single Pack",
    subheading: "Enhancing Lives Through Novel Food Solutions",
    ctaLabel: "Explore",
    ctaHref: "/brands/kivo",
  },
  {
    id: "strawberry-gari-mix",
    media: { type: "mp4", src: "/assets/hero/strawberry-gari-mix-tvc.mp4" },
    heading: "Introducing Kivo Strawberry Gari Mix",
    subheading: "A sweet new twist on a Ghanaian favourite",
    ctaLabel: "Explore",
    ctaHref: "/brands/kivo",
  },
];
