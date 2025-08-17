// List 1: Pet Types
export const PET_CATEGORY = [
  { id: 'dog', name: 'Dog' },
  { id: 'cat', name: 'Cat' },
  { id: 'fish', name: 'Fish' },
  { id: 'bird', name: 'Bird' },
  { id: 'reptile', name: 'Reptile' },
  { id: 'small-pet', name: 'Small Pets' },
];

export const PET_CATEGORY_TYPE = [
  { id: 'dog', name: 'Dog' },
  { id: 'cat', name: 'Cat' },
  { id: 'fish', name: 'Fish' },
  { id: 'bird', name: 'Bird' },
  { id: 'reptile', name: 'Reptile' },
  { id: 'small-pet', name: 'Small Pets' },
] as const;

export type PetType = (typeof PET_CATEGORY)[number]['id'];

// List 2: Product Types
export const PRODUCT_CATEGORY = [
  { id: 'food-treats', name: 'Food & Treats' },
  { id: 'toys-chews', name: 'Toys & Chews' },
  { id: 'grooming-care', name: 'Grooming & Care' },
  { id: 'health-supplements', name: 'Health & Supplements' },
  { id: 'beds-furniture', name: 'Beds & Furniture' },
  { id: 'collars-leashes-accessories', name: 'Collars, Leashes & Accessories' },
  { id: 'training-behavior', name: 'Training & Behavior' },
  { id: 'apparel', name: 'Apparel & Clothing' },
  { id: 'travel-carriers', name: 'Travel & Carriers' },
];

export type ProductType = (typeof PRODUCT_CATEGORY)[number]['id'];
