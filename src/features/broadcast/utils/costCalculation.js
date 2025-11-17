import pricingData from "../../../pricing.json";

export const calculateEstimatedCost = ({ contactCount, template, country = "India" }) => {
  if (!template || contactCount <= 0) return 0;

  const category = template.category?.toLowerCase() || "marketing";
  const countryPricing = pricingData[country] || pricingData["All other countries"];

  const [matchedCategory, matchedRate] =
    Object.entries(countryPricing || {}).find(
      ([key]) => key.toLowerCase() === category
    ) || ["marketing", countryPricing?.marketing];

  const costPerMessage = matchedRate ?? 0.88;
  return contactCount * costPerMessage;
};


export const hasSufficientBalance = (estimatedCost, availableBalance) => {
  return estimatedCost <= availableBalance;
};


export const getCostBreakdown = ({ contactCount, template, country, availableBalance }) => {
  const estimatedCost = calculateEstimatedCost({ contactCount, template, country });
  const hasBalance = hasSufficientBalance(estimatedCost, availableBalance);

  const costPerMessage = contactCount > 0 ? estimatedCost / contactCount : 0;

  return {
    contactCount,
    estimatedCost,
    availableBalance,
    hasBalance,
    costPerMessage,
  };
};
