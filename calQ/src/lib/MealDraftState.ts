export interface DraftFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  serving: string;
}

class MealDraftStateManager {
  private items: DraftFoodItem[] = [];
  private listeners: Set<(items: DraftFoodItem[]) => void> = new Set();

  public getItems() {
    return this.items;
  }

  public addItem(item: DraftFoodItem) {
    this.items.push(item);
    this.notify();
  }

  public removeItem(index: number) {
    this.items.splice(index, 1);
    this.notify();
  }

  public clear() {
    this.items = [];
    this.notify();
  }

  public subscribe(listener: (items: DraftFoodItem[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.items]));
  }
}

export const MealDraftState = new MealDraftStateManager();
