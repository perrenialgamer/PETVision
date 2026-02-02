// src/utils/batchAnalytics.util.js

export const computeBatchAnalytics = (images) => {
  let totalBottles = 0;
  let pet = 0;
  let weight = 0;

  const colorDistribution = {};
  const brandDistribution = {};
  const sizeDistribution = {}; // 🔥 NEW

  images.forEach((img) => {
    const ia = img.image_analytics;

    totalBottles += ia.total_bottles;
    pet += ia.pet_bottles;
    weight += parseFloat(ia.total_weight_kg);

    img.bottles.forEach((b) => {
      // color
      if (b.color) {
        colorDistribution[b.color] = (colorDistribution[b.color] || 0) + 1;
      }

      // brand
      if (b.brand) {
        brandDistribution[b.brand] = (brandDistribution[b.brand] || 0) + 1;
      }

      // 🔥 size
      if (b.size_class) {
        sizeDistribution[b.size_class] =
          (sizeDistribution[b.size_class] || 0) + 1;
      }
    });
  });

  const purity = totalBottles ? pet / totalBottles : 0;

  return {
    total_bottles: totalBottles,
    pet_bottles: pet,
    non_pet_bottles: totalBottles - pet,
    pet_purity_percent: (purity * 100).toFixed(2),
    total_weight_kg: weight.toFixed(2),
    quality_grade: purity > 0.8 ? "A" : purity > 0.6 ? "B" : "C",

    // charts
    color_distribution: colorDistribution,
    brand_distribution: brandDistribution,
    size_distribution: sizeDistribution, // 🔥 NEW
  };
};
