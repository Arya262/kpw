import pricingData from "../../../pricing.json";

export const calculateEstimatedCost = ({ contactCount, template, country = "India" }) => {
  if (!template || contactCount <= 0) return 0;

  const category = template.category?.toLowerCase() || "marketing";
  const countryPricing = pricingData[country] || pricingData["All other countries"];
  const matchingCategory = Object.keys(countryPricing || {}).find(
    key => key.toLowerCase() === category.toLowerCase()
  ) || "marketing";
  
  const costPerMessage = countryPricing?.[matchingCategory] ?? 0.88;
  return contactCount * costPerMessage;
};

export const hasSufficientBalance = (estimatedCost, availableBalance) => {
  return estimatedCost <= availableBalance;
};

export const getCostBreakdown = ({ contactCount, template, country, availableBalance }) => {
  const estimatedCost = calculateEstimatedCost({ contactCount, template, country });
  const hasBalance = hasSufficientBalance(estimatedCost, availableBalance);
  
  return {
    contactCount,
    estimatedCost,
    availableBalance,
    hasBalance,
    costPerMessage: estimatedCost / contactCount || 0,
  };
};
