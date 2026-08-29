import type { Food } from '../models'

// A small starter catalog so search works offline; users can also add custom foods.
export const foodCatalog: Food[] = [
  { id: 'skyr-plain', name: 'Skyr yoghurt', servingLabel: '1 pot · 150 g', servingGrams: 150, nutrientsPer100g: { kcal: 63, proteinG: 11, carbohydrateG: 4, fatG: 0.2, sugarG: 4 }, source: 'custom', estimated: false },
  { id: 'oats', name: 'Rolled oats', servingLabel: '1 serving · 50 g', servingGrams: 50, nutrientsPer100g: { kcal: 379, proteinG: 13, carbohydrateG: 67, fatG: 7, fiberG: 10 }, source: 'custom', estimated: false },
  { id: 'banana', name: 'Banana', servingLabel: '1 medium · 118 g', servingGrams: 118, nutrientsPer100g: { kcal: 89, proteinG: 1.1, carbohydrateG: 23, fatG: 0.3, sugarG: 12, fiberG: 2.6 }, source: 'custom', estimated: false },
  { id: 'egg', name: 'Egg, boiled', servingLabel: '1 large · 50 g', servingGrams: 50, nutrientsPer100g: { kcal: 155, proteinG: 13, carbohydrateG: 1.1, fatG: 11 }, source: 'custom', estimated: false },
  { id: 'chicken-breast', name: 'Chicken breast, grilled', servingLabel: '1 fillet · 150 g', servingGrams: 150, nutrientsPer100g: { kcal: 165, proteinG: 31, carbohydrateG: 0, fatG: 3.6 }, source: 'custom', estimated: false },
  { id: 'white-rice', name: 'White rice, cooked', servingLabel: '1 cup · 158 g', servingGrams: 158, nutrientsPer100g: { kcal: 130, proteinG: 2.7, carbohydrateG: 28, fatG: 0.3 }, source: 'custom', estimated: false },
  { id: 'whey', name: 'Whey protein', servingLabel: '1 scoop · 30 g', servingGrams: 30, nutrientsPer100g: { kcal: 400, proteinG: 80, carbohydrateG: 8, fatG: 6 }, source: 'custom', estimated: false },
  { id: 'apple', name: 'Apple', servingLabel: '1 medium · 182 g', servingGrams: 182, nutrientsPer100g: { kcal: 52, proteinG: 0.3, carbohydrateG: 14, fatG: 0.2, fiberG: 2.4, sugarG: 10 }, source: 'custom', estimated: false },
  { id: 'almonds', name: 'Almonds', servingLabel: '1 handful · 28 g', servingGrams: 28, nutrientsPer100g: { kcal: 579, proteinG: 21, carbohydrateG: 22, fatG: 50, fiberG: 12 }, source: 'custom', estimated: false },
  { id: 'olive-oil', name: 'Olive oil', servingLabel: '1 tbsp · 14 g', servingGrams: 14, nutrientsPer100g: { kcal: 884, proteinG: 0, carbohydrateG: 0, fatG: 100 }, source: 'custom', estimated: false },
  { id: 'salmon', name: 'Salmon, cooked', servingLabel: '1 fillet · 150 g', servingGrams: 150, nutrientsPer100g: { kcal: 208, proteinG: 20, carbohydrateG: 0, fatG: 13 }, source: 'custom', estimated: false },
  { id: 'sweet-potato', name: 'Sweet potato, baked', servingLabel: '1 medium · 130 g', servingGrams: 130, nutrientsPer100g: { kcal: 90, proteinG: 2, carbohydrateG: 21, fatG: 0.1, fiberG: 3.3 }, source: 'custom', estimated: false },
  { id: 'greek-yoghurt', name: 'Greek yoghurt', servingLabel: '1 serving · 170 g', servingGrams: 170, nutrientsPer100g: { kcal: 59, proteinG: 10, carbohydrateG: 3.6, fatG: 0.4 }, source: 'custom', estimated: false },
  { id: 'coffee-milk', name: 'Cappuccino', servingLabel: '1 cup · 220 ml', servingGrams: 220, nutrientsPer100g: { kcal: 57, proteinG: 3, carbohydrateG: 4.6, fatG: 3 }, source: 'custom', estimated: false },
]
