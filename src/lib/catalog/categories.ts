export const SHOP_CATALOG_PATH = "/collections/sarees";
export const CATEGORY_COLLECTION_PATH = "/collections";

export const PRODUCT_CATEGORY_OPTIONS = [
  {
    value: "sarees",
    label: "Sarees",
    description:
      "Draped occasionwear and everyday elegance, curated with fluid silhouettes, luminous textiles, and artisanal finish.",
  },
  {
    value: "kurties",
    label: "Kurties",
    description:
      "Refined kurties shaped for modern wardrobes, balancing breathable comfort, elevated tailoring, and versatile detailing.",
  },
  {
    value: "kids-wear",
    label: "Kids Wear",
    description:
      "Playful ceremonial dressing and easy festive layers, crafted with softness, movement, and boutique-level finishing.",
  },
] as const;

export type ProductCategoryValue = (typeof PRODUCT_CATEGORY_OPTIONS)[number]["value"];

export const DEFAULT_PRODUCT_CATEGORY: ProductCategoryValue = PRODUCT_CATEGORY_OPTIONS[0].value;
export const UNKNOWN_PRODUCT_CATEGORY_LABEL = "Unsorted";

const PRODUCT_CATEGORY_LABELS = new Map<string, string>(
  PRODUCT_CATEGORY_OPTIONS.map((category) => [category.value, category.label])
);
const PRODUCT_CATEGORY_CONFIGS = new Map(
  PRODUCT_CATEGORY_OPTIONS.map((category) => [category.value, category])
);
const PRODUCT_CATEGORY_ALIASES = new Map<string, ProductCategoryValue>([
  ["saree", "sarees"],
  ["sarees", "sarees"],
  ["kurti", "kurties"],
  ["kurtis", "kurties"],
  ["kurties", "kurties"],
  ["kids", "kids-wear"],
  ["kidswear", "kids-wear"],
  ["kids-wear", "kids-wear"],
]);

export function isKnownProductCategory(
  value: string | null | undefined
): value is ProductCategoryValue {
  if (!value) {
    return false;
  }

  return PRODUCT_CATEGORY_LABELS.has(value);
}

export function formatProductCategory(value: string | null | undefined) {
  if (!value) {
    return UNKNOWN_PRODUCT_CATEGORY_LABEL;
  }

  return PRODUCT_CATEGORY_LABELS.get(value) ?? UNKNOWN_PRODUCT_CATEGORY_LABEL;
}

export function resolveProductCategorySlug(slug: string | null | undefined) {
  if (!slug) {
    return null;
  }

  return PRODUCT_CATEGORY_ALIASES.get(slug.toLowerCase()) ?? null;
}

export function getProductCategoryConfig(category: ProductCategoryValue) {
  return PRODUCT_CATEGORY_CONFIGS.get(category) ?? PRODUCT_CATEGORY_OPTIONS[0];
}

export function getCategoryHref(category: ProductCategoryValue) {
  return `${CATEGORY_COLLECTION_PATH}/${category}`;
}
