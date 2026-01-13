/**
 * Comparison View - Compare multiple URL analyses side by side
 */

import { LedgerEntry } from './trustLedger';

export interface ComparisonItem {
  entry: LedgerEntry;
  selected: boolean;
}

const COMPARISON_KEY = 'pd_comparison';

export class ComparisonManager {
  private static items: ComparisonItem[] = [];
  private static maxItems = 4;

  static initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(COMPARISON_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load comparison items', e);
    }
  }

  static addItem(entry: LedgerEntry): boolean {
    if (this.items.length >= this.maxItems) {
      return false;
    }

    const exists = this.items.some(item => item.entry.id === entry.id);
    if (exists) {
      return false;
    }

    this.items.push({ entry, selected: true });
    this.save();
    return true;
  }

  static removeItem(entryId: string): void {
    this.items = this.items.filter(item => item.entry.id !== entryId);
    this.save();
  }

  static getItems(): ComparisonItem[] {
    return [...this.items];
  }

  static clear(): void {
    this.items = [];
    this.save();
  }

  static canAdd(): boolean {
    return this.items.length < this.maxItems;
  }

  static getCount(): number {
    return this.items.length;
  }

  private static save(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(this.items));
      window.dispatchEvent(new CustomEvent('comparison:updated'));
    } catch (e) {
      console.warn('Failed to save comparison items', e);
    }
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  ComparisonManager.initialize();
}
