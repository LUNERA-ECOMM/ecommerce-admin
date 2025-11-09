// Mock product data across categories
// Using placeholder images - replace with actual product images in production
const getPlaceholderImage = (category, id) =>
  `https://picsum.photos/seed/${category}${id}/400/500`;

export const products = [
  // Lingerie
  {
    id: 1,
    name: "Lace Bralette Set",
    price: 49.99,
    image: getPlaceholderImage("lingerie", 1),
    category: "lingerie",
  },
  {
    id: 2,
    name: "Silk Camisole & Shorts",
    price: 69.99,
    image: getPlaceholderImage("lingerie", 2),
    category: "lingerie",
  },
  {
    id: 3,
    name: "Floral Lace Teddy",
    price: 59.99,
    image: getPlaceholderImage("lingerie", 3),
    category: "lingerie",
  },
  {
    id: 4,
    name: "Satin Robe",
    price: 79.99,
    image: getPlaceholderImage("lingerie", 4),
    category: "lingerie",
  },
  {
    id: 5,
    name: "Boudoir Lingerie Set",
    price: 89.99,
    image: getPlaceholderImage("lingerie", 5),
    category: "lingerie",
  },
  // Underwear
  {
    id: 6,
    name: "Everyday Comfort Pack",
    price: 39.99,
    image: getPlaceholderImage("underwear", 1),
    category: "underwear",
  },
  {
    id: 7,
    name: "Seamless High-Waist Briefs",
    price: 34.99,
    image: getPlaceholderImage("underwear", 2),
    category: "underwear",
  },
  {
    id: 8,
    name: "Soft Modal Boyshorts",
    price: 29.99,
    image: getPlaceholderImage("underwear", 3),
    category: "underwear",
  },
  {
    id: 9,
    name: "Cotton Lounge Set",
    price: 44.99,
    image: getPlaceholderImage("underwear", 4),
    category: "underwear",
  },
  // Sports
  {
    id: 10,
    name: "Supportive Sports Bra",
    price: 54.99,
    image: getPlaceholderImage("sports", 1),
    category: "sports",
  },
  {
    id: 11,
    name: "Performance Leggings",
    price: 64.99,
    image: getPlaceholderImage("sports", 2),
    category: "sports",
  },
  {
    id: 12,
    name: "Breathable Tank & Shorts",
    price: 59.99,
    image: getPlaceholderImage("sports", 3),
    category: "sports",
  },
  {
    id: 13,
    name: "Studio Wrap Top",
    price: 49.99,
    image: getPlaceholderImage("sports", 4),
    category: "sports",
  },
  // Clothes
  {
    id: 14,
    name: "Relaxed Linen Shirt",
    price: 74.99,
    image: getPlaceholderImage("clothes", 1),
    category: "clothes",
  },
  {
    id: 15,
    name: "Soft Knit Cardigan",
    price: 89.99,
    image: getPlaceholderImage("clothes", 2),
    category: "clothes",
  },
  {
    id: 16,
    name: "Tailored Wide-Leg Pants",
    price: 94.99,
    image: getPlaceholderImage("clothes", 3),
    category: "clothes",
  },
  {
    id: 17,
    name: "Cozy Cashmere Pullover",
    price: 119.99,
    image: getPlaceholderImage("clothes", 4),
    category: "clothes",
  },
  // Dresses
  {
    id: 18,
    name: "Silk Slip Dress",
    price: 124.99,
    image: getPlaceholderImage("dresses", 1),
    category: "dresses",
  },
  {
    id: 19,
    name: "Chiffon Midi Dress",
    price: 109.99,
    image: getPlaceholderImage("dresses", 2),
    category: "dresses",
  },
  {
    id: 20,
    name: "Romantic Lace Gown",
    price: 149.99,
    image: getPlaceholderImage("dresses", 3),
    category: "dresses",
  },
  {
    id: 21,
    name: "Pleated Satin Mini",
    price: 99.99,
    image: getPlaceholderImage("dresses", 4),
    category: "dresses",
  },
];

