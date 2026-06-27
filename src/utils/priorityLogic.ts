import { Product, ProductRecommendation, ProductWithRec, PriorityLevel, AgingCategory } from '../types';

export function calculateDaysInInventory(product: Product): number {
  // Use age_days from DB if available (more accurate - comes from original stock report)
  if ((product as any).age_days && (product as any).age_days > 0) {
    return (product as any).age_days;
  }
  // Fallback: calculate from dateAdded
  const addedDate = new Date(product.dateAdded);
  const today = new Date();
  const diff = Math.ceil(Math.abs(today.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
  return isNaN(diff) ? 0 : diff;
}

export function getPriorityLevel(stock: number): PriorityLevel {
  if (stock === 0) return 'OUT_OF_STOCK';
  if (stock > 300) return 'HIGH';
  if (stock >= 100) return 'MEDIUM';
  if (stock >= 20) return 'NORMAL';
  return 'LOW';
}

export function getAgingCategory(days: number): AgingCategory {
  if (days <= 30)  return 'NEW';
  if (days <= 90)  return 'NORMAL';
  if (days <= 180) return 'OLD';
  return 'SELL_FIRST';
}

export function calculateRecommendation(product: Product): ProductRecommendation {
  const stock = product.currentStock ?? 0;
  const days  = calculateDaysInInventory(product);
  const priority = getPriorityLevel(stock);
  const aging    = getAgingCategory(days);

  if (stock === 0) {
    return {
      priorityLevel: 'OUT_OF_STOCK', agingCategory: aging,
      daysInInventory: days, stars: 0,
      recommendationTitle: 'OUT OF STOCK',
      actionSubtitle: 'Do not show. Order replenishment.',
      badgeColor: 'red', score: -100,
    };
  }

  let score = stock * 0.5 + days * 1.2;
  let stars = 3;
  let recTitle = 'NORMAL SHOW';
  let subtitle = 'Balanced stock & age';
  let color: 'red' | 'orange' | 'yellow' | 'green' | 'gray' = 'yellow';

  if (stock > 300 && days > 365) {
    stars = 5; color = 'orange'; score += 2000;
    recTitle = '★★★★★ URGENT — SELL FIRST';
    subtitle = `Very old (${days} days) & overstocked (${stock} pcs). Clear immediately!`;
  } else if (stock > 300 && days > 180) {
    stars = 5; color = 'orange'; score += 1500;
    recTitle = '★★★★★ SHOW & SELL FIRST';
    subtitle = `Overstocked (${stock} pcs) & old (${days} days). Priority show!`;
  } else if (days > 365) {
    stars = 4; color = 'orange'; score += 1000;
    recTitle = '★★★★ VERY OLD STOCK';
    subtitle = `${days} days in godown. Must clear before it deadens.`;
  } else if (stock > 300) {
    stars = 4; color = 'orange'; score += 600;
    recTitle = '★★★★ SHOW FIRST (OVERSTOCK)';
    subtitle = `${stock} pcs in stock. Show to clear warehouse space.`;
  } else if (days > 180) {
    stars = 4; color = 'orange'; score += 500;
    recTitle = '★★★★ SELL FIRST (OLD STOCK)';
    subtitle = `${days} days in inventory. Show before stock deadens.`;
  } else if (days <= 30) {
    stars = 3; color = 'green'; score = 250;
    recTitle = '★★★ NEW ARRIVAL';
    subtitle = 'Fresh stock. Show if customer asks for latest.';
  } else if (stock < 20) {
    stars = 1; color = 'yellow'; score = 100;
    recTitle = '★ LOW STOCK';
    subtitle = `Only ${stock} pcs left. Show higher quantity items first.`;
  } else {
    stars = 3; color = 'yellow';
    recTitle = '★★★ SHOW NORMAL';
    subtitle = 'Healthy stock level.';
  }

  return { priorityLevel: priority, agingCategory: aging, daysInInventory: days, stars, recommendationTitle: recTitle, actionSubtitle: subtitle, badgeColor: color, score };
}

export function enrichProducts(products: Product[]): ProductWithRec[] {
  return products
    .map(p => ({ ...p, rec: calculateRecommendation(p) }))
    .sort((a, b) => b.rec.score - a.rec.score);
}