// src/utils/imageAnalytics.util.js

export const computeImageAnalytics = (bottles) => {
  const total = bottles.length;
  let pet = 0;
  let weight = 0;

  bottles.forEach((b) => {
    if (b.is_pet) pet++;
    weight += b.estimated_weight_g || 0;
  });

  const purity = total ? pet / total : 0;
  //   const purity = 0;

  return {
    total_bottles: total,
    pet_bottles: pet,
    non_pet_bottles: total - pet,
    pet_purity_percent: (purity * 100).toFixed(2),
    total_weight_kg: (weight / 1000).toFixed(2),
    quality_grade: purity > 0.8 ? "A" : purity > 0.6 ? "B" : "C",
  };
};
