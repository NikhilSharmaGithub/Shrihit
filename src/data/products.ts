import productThali from "@/assets/product-thali.jpg";
import productDiya from "@/assets/product-diya.jpg";
import productIncense from "@/assets/product-incense.jpg";
import productBell from "@/assets/product-bell.jpg";
import productDiwaliKit from "@/assets/product-diwali-kit.jpg";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  badge: string | null;
  category: string;
  popularity: number;
  createdAt: string;
  description: string;
  shortDescription: string;
  specifications: {
    material: string;
    dimensions: string;
    weight: string;
    origin: string;
  };
  features: string[];
  sizes?: string[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Royal Brass Aarti Thali Set",
    price: 2499,
    originalPrice: 2999,
    images: [productThali, productDiya, productBell],
    badge: "Bestseller",
    category: "brass",
    popularity: 98,
    createdAt: "2024-01-15",
    shortDescription: "जहां श्रद्धा है, वहीं पवित्रा है।",
    description: "Elevate your daily pooja rituals with this exquisite Royal Brass Aarti Thali Set. Handcrafted by skilled artisans from Moradabad, this complete set includes a beautifully engraved thali, diya holder, incense stand, and kumkum container. The intricate traditional motifs and premium brass finish make it perfect for daily worship or as a thoughtful gift for festivals.",
    specifications: {
      material: "Pure Brass (Pital)",
      dimensions: "12 inches diameter",
      weight: "850 grams",
      origin: "Moradabad, UP",
    },
    features: [
      "Complete 5-piece aarti set",
      "Hand-engraved traditional motifs",
      "Tarnish-resistant coating",
      "Ideal for daily pooja & festivals",
      "Gift-ready packaging",
    ],
    sizes: ["Small (8\")", "Medium (10\")", "Large (12\")"],
    inStock: true,
  },
  {
    id: 2,
    name: "Traditional Brass Diya Collection",
    price: 899,
    originalPrice: 1199,
    images: [productDiya, productThali, productIncense],
    badge: "New",
    category: "diyas",
    popularity: 85,
    createdAt: "2024-03-01",
    shortDescription: "Light up your prayers with divine radiance.",
    description: "Illuminate your sacred space with our Traditional Brass Diya Collection. This set of 5 handcrafted diyas features timeless designs that have graced Indian homes for generations. Each diya is carefully polished to achieve a radiant glow that enhances the spiritual ambiance of your pooja room.",
    specifications: {
      material: "Pure Brass",
      dimensions: "3-4 inches each",
      weight: "400 grams (set)",
      origin: "Moradabad, UP",
    },
    features: [
      "Set of 5 assorted designs",
      "Lead-free and eco-friendly",
      "Deep oil reservoir for longer burn",
      "Perfect for Diwali & daily aarti",
      "Easy to clean and maintain",
    ],
    inStock: true,
  },
  {
    id: 3,
    name: "Premium Sandalwood Agarbatti Set",
    price: 549,
    originalPrice: null,
    images: [productIncense, productDiya, productThali],
    badge: null,
    category: "incense",
    popularity: 72,
    createdAt: "2024-02-10",
    shortDescription: "Pure fragrance for pure devotion.",
    description: "Experience the calming essence of authentic Mysore sandalwood with our Premium Agarbatti Set. Made using traditional charcoal-free methods, these incense sticks release a pure, long-lasting fragrance that purifies your home and creates a serene atmosphere for meditation and prayer.",
    specifications: {
      material: "Natural Sandalwood & Herbs",
      dimensions: "9 inches stick length",
      weight: "250 grams (3 packs)",
      origin: "Mysore, Karnataka",
    },
    features: [
      "100% charcoal-free formula",
      "Burns for 45+ minutes",
      "Authentic Mysore sandalwood",
      "Low smoke, high fragrance",
      "Pack of 75 sticks",
    ],
    inStock: true,
  },
  {
    id: 4,
    name: "Sacred Temple Bell - Ghanti",
    price: 1299,
    originalPrice: 1599,
    images: [productBell, productThali, productDiya],
    badge: "Popular",
    category: "brass",
    popularity: 90,
    createdAt: "2024-01-20",
    shortDescription: "The divine sound that awakens the soul.",
    description: "Invite positive energy into your home with this Sacred Temple Bell (Ghanti). Crafted from a special alloy of five metals (panchdhatu), this bell produces a pure, resonant sound that is believed to ward off negative energy and invoke divine blessings. The ornate handle features traditional motifs.",
    specifications: {
      material: "Panchdhatu (5-metal alloy)",
      dimensions: "6 inches height",
      weight: "350 grams",
      origin: "Thanjavur, TN",
    },
    features: [
      "Authentic panchdhatu composition",
      "Crystal-clear resonating sound",
      "Ergonomic carved handle",
      "Ideal for daily aarti",
      "Handcrafted by temple artisans",
    ],
    sizes: ["Small", "Medium", "Large"],
    inStock: true,
  },
  {
    id: 5,
    name: "Complete Diwali Pooja Kit",
    price: 3999,
    originalPrice: 4999,
    images: [productDiwaliKit, productThali, productDiya, productIncense],
    badge: "Festival Special",
    category: "gift-sets",
    popularity: 95,
    createdAt: "2024-03-15",
    shortDescription: "Everything you need for a blessed Diwali.",
    description: "Celebrate the festival of lights with our comprehensive Diwali Pooja Kit. This thoughtfully curated gift set includes a brass aarti thali, decorated diyas, premium incense, roli-chawal, kumkum, coconut, and all essentials for Lakshmi-Ganesh puja. Beautifully packaged in a festive gift box.",
    specifications: {
      material: "Brass, Natural Ingredients",
      dimensions: "Gift box: 14 x 10 x 4 inches",
      weight: "1.5 kg",
      origin: "Handcrafted in India",
    },
    features: [
      "Complete 21-item pooja set",
      "Premium brass thali & diyas",
      "Festive gift-ready packaging",
      "Includes pooja vidhi guide",
      "Perfect for gifting",
    ],
    inStock: true,
  },
  {
    id: 6,
    name: "Brass Kalash with Coconut Stand",
    price: 1899,
    originalPrice: 2299,
    images: [productThali, productBell, productDiya],
    badge: null,
    category: "brass",
    popularity: 78,
    createdAt: "2024-02-05",
    shortDescription: "Symbol of abundance and prosperity.",
    description: "The sacred Kalash represents the universe and is an essential element of Hindu rituals. This beautifully crafted brass kalash comes with a matching coconut stand and features traditional engravings. Perfect for griha pravesh, Navratri, and other auspicious ceremonies.",
    specifications: {
      material: "Pure Brass",
      dimensions: "8 inches height",
      weight: "650 grams",
      origin: "Moradabad, UP",
    },
    features: [
      "Includes coconut holder stand",
      "Traditional engraved patterns",
      "Wide mouth for easy filling",
      "Stable flat base",
      "Auspicious for all rituals",
    ],
    sizes: ["Medium", "Large"],
    inStock: true,
  },
  {
    id: 7,
    name: "Five-Wick Brass Panch Diya",
    price: 1099,
    originalPrice: null,
    images: [productDiya, productThali, productBell],
    badge: "Handcrafted",
    category: "diyas",
    popularity: 82,
    createdAt: "2024-02-20",
    shortDescription: "Five flames, infinite blessings.",
    description: "The Panch Diya (five-wick lamp) holds special significance in Hindu rituals, representing the five elements. This handcrafted brass diya features a beautiful lotus base and five perfectly positioned wicks for an even, radiant glow during aarti.",
    specifications: {
      material: "Pure Brass",
      dimensions: "5 inches diameter",
      weight: "300 grams",
      origin: "Moradabad, UP",
    },
    features: [
      "Five-wick traditional design",
      "Lotus-shaped base",
      "Deep oil reservoir",
      "Elegant finger handle",
      "Perfect for aarti rituals",
    ],
    inStock: true,
  },
  {
    id: 8,
    name: "Rose & Jasmine Dhoop Cones",
    price: 399,
    originalPrice: 499,
    images: [productIncense, productThali, productDiya],
    badge: null,
    category: "incense",
    popularity: 65,
    createdAt: "2024-01-25",
    shortDescription: "Floral fragrance for divine moments.",
    description: "Create a heavenly atmosphere with our Rose & Jasmine Dhoop Cones. Made from natural flower extracts and pure cow ghee, these cones release a rich, long-lasting fragrance without any artificial additives. Ideal for daily pooja, meditation, or simply freshening your home.",
    specifications: {
      material: "Natural Herbs & Flower Extracts",
      dimensions: "1.5 inches cone height",
      weight: "200 grams (50 cones)",
      origin: "Bangalore, Karnataka",
    },
    features: [
      "100% natural ingredients",
      "Made with pure cow ghee",
      "Burns for 25+ minutes each",
      "Includes ceramic holder",
      "Pack of 50 cones",
    ],
    inStock: true,
  },
  {
    id: 9,
    name: "Premium Navratri Gift Box",
    price: 2999,
    originalPrice: 3499,
    images: [productDiwaliKit, productThali, productIncense],
    badge: "Limited Edition",
    category: "gift-sets",
    popularity: 88,
    createdAt: "2024-03-10",
    shortDescription: "Nine nights of divine celebration.",
    description: "Celebrate the nine auspicious nights of Navratri with this specially curated gift box. Includes a beautiful Durga idol, decorated kalash, chunri, coconut, and all essentials for the nine-day puja. Elegantly packaged for gifting to loved ones.",
    specifications: {
      material: "Brass, Fabric, Natural Items",
      dimensions: "Gift box: 12 x 12 x 6 inches",
      weight: "1.2 kg",
      origin: "Handcrafted in India",
    },
    features: [
      "Complete Navratri puja set",
      "Hand-painted Durga idol",
      "9 different color chunris",
      "Includes puja vidhi booklet",
      "Premium gift packaging",
    ],
    inStock: true,
  },
  {
    id: 10,
    name: "Antique Brass Shankh",
    price: 1599,
    originalPrice: 1999,
    images: [productBell, productThali, productDiya],
    badge: null,
    category: "brass",
    popularity: 75,
    createdAt: "2024-02-15",
    shortDescription: "The sacred sound of the ocean.",
    description: "This magnificent brass Shankh (conch shell) is a powerful symbol of victory and auspiciousness. The antique finish gives it a temple-like appearance. When blown, it produces a deep, resonant sound believed to purify the environment and ward off negative energies.",
    specifications: {
      material: "Pure Brass (Antique Finish)",
      dimensions: "7 inches length",
      weight: "400 grams",
      origin: "Thanjavur, TN",
    },
    features: [
      "Authentic antique patina finish",
      "Easy to blow with practice",
      "Deep resonating sound",
      "Includes wooden stand",
      "Perfect for Vishnu puja",
    ],
    inStock: true,
  },
  {
    id: 11,
    name: "Decorative Floating Diyas Set",
    price: 699,
    originalPrice: null,
    images: [productDiya, productDiwaliKit, productThali],
    badge: "Diwali Special",
    category: "diyas",
    popularity: 92,
    createdAt: "2024-03-05",
    shortDescription: "Float your prayers to the divine.",
    description: "Add magic to your Diwali celebrations with these beautiful Decorative Floating Diyas. Hand-painted with vibrant colors and traditional patterns, these diyas float gracefully on water, creating a mesmerizing display. Perfect for urlis, decorative bowls, or temple tanks.",
    specifications: {
      material: "Clay with waterproof coating",
      dimensions: "2.5 inches diameter each",
      weight: "250 grams (set of 12)",
      origin: "Kumartuli, Kolkata",
    },
    features: [
      "Set of 12 floating diyas",
      "Hand-painted floral designs",
      "Waterproof coating",
      "Includes cotton wicks",
      "Perfect for decoration",
    ],
    inStock: true,
  },
  {
    id: 12,
    name: "Mogra Fragrance Incense Sticks",
    price: 299,
    originalPrice: 349,
    images: [productIncense, productDiya, productThali],
    badge: null,
    category: "incense",
    popularity: 60,
    createdAt: "2024-01-30",
    shortDescription: "The queen of fragrances.",
    description: "Experience the intoxicating fragrance of fresh mogra (jasmine) with these premium incense sticks. The sweet, floral scent is traditionally associated with purity and is a favorite offering to deities. Made using natural mogra flower extracts for an authentic experience.",
    specifications: {
      material: "Natural Mogra Extract & Herbs",
      dimensions: "9 inches stick length",
      weight: "150 grams",
      origin: "Mysore, Karnataka",
    },
    features: [
      "Natural mogra flower extract",
      "Long-lasting fragrance",
      "Pack of 50 sticks",
      "Charcoal-free formula",
      "Ideal for daily puja",
    ],
    inStock: true,
  },
];

export const getProductById = (id: number): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getRelatedProducts = (productId: number, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};
