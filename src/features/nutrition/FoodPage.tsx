import { useMemo, useState } from 'react'
import { Barcode, Camera, ChevronRight, Plus, Search, Trash2, X } from 'lucide-react'
import { Button } from '../../design/components/Button'
import { Card } from '../../design/components/Card'
import { foodCatalog } from '../../domain/catalog/foods'
import { sumNutrition } from '../../domain/nutrition/calculateNutrition'
import type { Food, MealEntry } from '../../domain/models'
import type { FoodPhotoItem } from '../../integrations/ai/types'
import { useRepository } from '../../data/useRepository'
import { useMeals, useProfile } from '../../data/hooks'
import { BarcodeScanner } from './BarcodeScanner'
import { NutritionSummary } from './NutritionSummary'
import { PhotoFoodReview } from './PhotoFoodReview'
import './nutrition.css'

type MealType = MealEntry['meal']
const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
const mealLabel: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' }
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()
const kcalOf = (entry: MealEntry) => Math.round(((entry.snapshot.nutrientsPer100g.kcal ?? 0) * entry.grams) / 100)

const photoItemToFood = (item: FoodPhotoItem): { food: Food; grams: number } => {
  const per100 = (value: number) => Math.round(((value / item.grams) * 100) * 10) / 10
  return {
    grams: item.grams,
    food: {
      id: crypto.randomUUID(), name: item.name, servingLabel: item.portion, servingGrams: item.grams,
      nutrientsPer100g: { kcal: per100(item.kcal), proteinG: per100(item.proteinG), carbohydrateG: per100(item.carbohydrateG), fatG: per100(item.fatG) },
      source: 'ai-estimate', estimated: true,
    },
  }
}

export function FoodPage() {
  const repository = useRepository()
  const profile = useProfile()
  const meals = useMeals()
  const [panel, setPanel] = useState<'add' | 'barcode' | 'photo' | null>(null)
  const [addMeal, setAddMeal] = useState<MealType>('snacks')
  const [search, setSearch] = useState('')

  const today = useMemo(() => meals.filter((meal) => isToday(meal.eatenAt)), [meals])
  const consumed = useMemo(() => sumNutrition(today.map((meal) => ({ grams: meal.grams, nutrientsPer100g: meal.snapshot.nutrientsPer100g }))), [today])
  const results = useMemo(() => foodCatalog.filter((food) => food.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 8), [search])

  const addFood = async (food: Food, meal: MealType, grams = food.servingGrams) => {
    await repository.meals.put({ id: crypto.randomUUID(), foodId: food.id, meal, grams, eatenAt: new Date().toISOString(), snapshot: food })
    setPanel(null)
    setSearch('')
  }

  const addPhotoItems = async (items: FoodPhotoItem[]) => {
    for (const item of items) {
      const { food, grams } = photoItemToFood(item)
      await repository.meals.put({ id: crypto.randomUUID(), foodId: food.id, meal: 'dinner', grams, eatenAt: new Date().toISOString(), snapshot: food })
    }
    setPanel(null)
  }

  const openAdd = (meal: MealType) => { setAddMeal(meal); setPanel('add') }

  return (
    <div className="food-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Today’s diary</p>
          <h1>Fuel the work.</h1>
          <p className="muted">Calories, macros and useful micronutrients—always editable.</p>
        </div>
        <Button onClick={() => openAdd('snacks')}><Plus size={18} /> Add food</Button>
      </header>

      <Card className="nutrition-hero">
        <NutritionSummary consumed={consumed} calorieTarget={profile?.calorieTarget ?? 2000} proteinTargetG={profile?.proteinTargetG ?? 140} />
      </Card>

      <div className="food-tools">
        <button onClick={() => setPanel('barcode')}><span className="icon-tile"><Barcode /></span><div><strong>Scan barcode</strong><small>Open Food Facts</small></div><ChevronRight /></button>
        <button onClick={() => setPanel('photo')}><span className="icon-tile"><Camera /></span><div><strong>Photo estimate</strong><small>Review before saving</small></div><ChevronRight /></button>
      </div>

      <div className="meal-diary">
        {mealTypes.map((meal) => {
          const items = today.filter((item) => item.meal === meal)
          return (
            <Card key={meal} className="meal-section">
              <header>
                <div><p className="eyebrow">{mealLabel[meal]}</p><h2>{items.reduce((sum, item) => sum + kcalOf(item), 0)} kcal</h2></div>
                <button aria-label={`Add to ${mealLabel[meal]}`} onClick={() => openAdd(meal)}><Plus /></button>
              </header>
              {items.length ? items.map((item) => (
                <article key={item.id}>
                  <span className="food-letter">{item.snapshot.name[0]}</span>
                  <div><strong>{item.snapshot.name}</strong><small>{item.grams} g{item.snapshot.estimated ? ' · estimate' : ''}</small></div>
                  <b>{kcalOf(item)}</b>
                  <button className="round-button" aria-label={`Remove ${item.snapshot.name}`} onClick={() => void repository.meals.remove(item.id)}><Trash2 size={15} /></button>
                </article>
              )) : <button className="empty-meal" onClick={() => openAdd(meal)}>Add your first {mealLabel[meal].toLowerCase()}</button>}
            </Card>
          )
        })}
      </div>

      <p className="fine-print">Nutrition values from barcodes and photos may be incomplete or inaccurate. Confirm the package label and portion when precision matters.</p>

      {panel && (
        <div className="sheet-backdrop" role="presentation">
          <aside className="food-sheet" role="dialog" aria-modal="true" aria-label={panel === 'add' ? 'Add food' : panel === 'barcode' ? 'Scan barcode' : 'Review photo estimate'}>
            <header>
              <div><p className="eyebrow">Quick log</p><h2>{panel === 'add' ? `Add to ${mealLabel[addMeal]}` : panel === 'barcode' ? 'Scan a product' : 'Review your meal'}</h2></div>
              <button aria-label="Close" onClick={() => setPanel(null)}><X /></button>
            </header>
            {panel === 'add' && (
              <div>
                <label className="food-search"><Search /><input aria-label="Search foods" placeholder="Search foods and meals" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} /></label>
                <p className="eyebrow list-eyebrow">{search ? 'Results' : 'Suggested foods'}</p>
                {results.map((food) => (
                  <button key={food.id} className="food-result" aria-label={`Add ${food.name}`} onClick={() => void addFood(food, addMeal)}>
                    <span className="food-letter">{food.name[0]}</span>
                    <div><strong>{food.name}</strong><small>{food.servingLabel}</small></div>
                    <b>{Math.round(((food.nutrientsPer100g.kcal ?? 0) * food.servingGrams) / 100)} kcal</b>
                  </button>
                ))}
                {results.length === 0 && <p className="muted">No matches. Try another name.</p>}
              </div>
            )}
            {panel === 'barcode' && <BarcodeScanner onLookup={() => setPanel('add')} />}
            {panel === 'photo' && <PhotoFoodReview onConfirm={(items) => void addPhotoItems(items)} />}
          </aside>
        </div>
      )}
    </div>
  )
}
