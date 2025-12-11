/**
 * Merchant Categorization Utility
 * Automatically categorizes transactions based on merchant names
 */

/**
 * Merchant patterns for automatic categorization
 * Each category has an array of keywords/patterns to match
 */
const merchantPatterns = {
  Groceries: [
    "walmart",
    "target",
    "kroger",
    "safeway",
    "whole foods",
    "trader joe",
    "aldi",
    "costco",
    "sam's club",
    "publix",
    "wegmans",
    "albertsons",
    "food lion",
    "giant",
    "stop & shop",
    "harris teeter",
    "sprouts",
    "fresh market",
    "grocery",
    "supermarket",
    "market",
  ],

  Dining: [
    "mcdonald",
    "burger king",
    "wendy",
    "taco bell",
    "chipotle",
    "subway",
    "starbucks",
    "dunkin",
    "panera",
    "chick-fil-a",
    "kfc",
    "pizza hut",
    "domino",
    "papa john",
    "olive garden",
    "applebee",
    "chili",
    "red lobster",
    "outback",
    "texas roadhouse",
    "restaurant",
    "cafe",
    "coffee",
    "diner",
    "bistro",
    "grill",
    "bar & grill",
    "eatery",
    "food court",
  ],

  Transportation: [
    "shell",
    "exxon",
    "chevron",
    "bp",
    "mobil",
    "texaco",
    "citgo",
    "sunoco",
    "uber",
    "lyft",
    "taxi",
    "metro",
    "transit",
    "parking",
    "gas station",
    "fuel",
    "auto",
    "car wash",
    "toll",
    "bus",
    "train",
    "subway",
  ],

  Entertainment: [
    "netflix",
    "hulu",
    "disney",
    "spotify",
    "apple music",
    "amazon prime",
    "hbo",
    "cinema",
    "theater",
    "amc",
    "regal",
    "movie",
    "concert",
    "ticketmaster",
    "steam",
    "playstation",
    "xbox",
    "nintendo",
    "game",
    "entertainment",
    "museum",
    "zoo",
    "aquarium",
    "park",
  ],

  Shopping: [
    "amazon",
    "ebay",
    "etsy",
    "best buy",
    "apple store",
    "microsoft store",
    "macy",
    "nordstrom",
    "kohl",
    "jcpenney",
    "tj maxx",
    "marshalls",
    "ross",
    "gap",
    "old navy",
    "h&m",
    "zara",
    "forever 21",
    "victoria's secret",
    "bath & body",
    "bed bath",
    "home depot",
    "lowe",
    "ikea",
    "wayfair",
    "clothing",
    "apparel",
    "fashion",
  ],

  Utilities: [
    "electric",
    "power",
    "gas company",
    "water",
    "internet",
    "cable",
    "phone",
    "verizon",
    "at&t",
    "t-mobile",
    "sprint",
    "comcast",
    "spectrum",
    "utility",
    "energy",
    "pg&e",
    "duke energy",
    "con edison",
  ],

  Healthcare: [
    "cvs",
    "walgreens",
    "rite aid",
    "pharmacy",
    "hospital",
    "clinic",
    "medical",
    "doctor",
    "dentist",
    "dental",
    "health",
    "urgent care",
    "lab",
    "imaging",
    "prescription",
    "medicine",
  ],
};

/**
 * Categorize merchant based on name
 * @param {string} merchantName - Name of merchant
 * @returns {string|null} Category name or null if no match
 */
export const categorizeMerchant = (merchantName) => {
  if (!merchantName || typeof merchantName !== "string") {
    return null;
  }

  const normalizedName = merchantName.toLowerCase().trim();

  // Check each category's patterns
  for (const [category, patterns] of Object.entries(merchantPatterns)) {
    for (const pattern of patterns) {
      if (normalizedName.includes(pattern.toLowerCase())) {
        return category;
      }
    }
  }

  // Default to "Other" if no match found
  return "Other";
};

/**
 * Get category suggestions based on merchant name
 * Returns multiple possible categories ranked by confidence
 * @param {string} merchantName - Name of merchant
 * @returns {Array} Array of {category, confidence} objects
 */
export const getCategorySuggestions = (merchantName) => {
  if (!merchantName || typeof merchantName !== "string") {
    return [];
  }

  const normalizedName = merchantName.toLowerCase().trim();
  const suggestions = [];

  // Check each category and count matches
  for (const [category, patterns] of Object.entries(merchantPatterns)) {
    let matchCount = 0;
    let bestMatchLength = 0;

    for (const pattern of patterns) {
      if (normalizedName.includes(pattern.toLowerCase())) {
        matchCount++;
        bestMatchLength = Math.max(bestMatchLength, pattern.length);
      }
    }

    if (matchCount > 0) {
      // Calculate confidence based on match count and pattern length
      const confidence = Math.min(
        100,
        (matchCount * 30 + bestMatchLength * 5)
      );
      suggestions.push({ category, confidence });
    }
  }

  // Sort by confidence (highest first)
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return suggestions;
};

/**
 * Add custom merchant pattern
 * @param {string} category - Category name
 * @param {string} pattern - Pattern to add
 */
export const addMerchantPattern = (category, pattern) => {
  if (!merchantPatterns[category]) {
    merchantPatterns[category] = [];
  }

  const normalizedPattern = pattern.toLowerCase().trim();
  if (!merchantPatterns[category].includes(normalizedPattern)) {
    merchantPatterns[category].push(normalizedPattern);
  }
};

/**
 * Get all available categories
 * @returns {string[]} Array of category names
 */
export const getAvailableCategories = () => {
  return Object.keys(merchantPatterns);
};

export default {
  categorizeMerchant,
  getCategorySuggestions,
  addMerchantPattern,
  getAvailableCategories,
};

