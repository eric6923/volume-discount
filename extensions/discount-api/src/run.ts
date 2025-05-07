import {
  CartInput,
  DiscountApplicationStrategy,
  FunctionResult,
} from "../generated/api";

type Configuration = {
  discount_id: string;
  applies_to: "all" | "specific-products";
  product_ids: string[];
  discount_tiers: {
    title: string;
    quantity: number;
    percentage: number;
  }[];
};

export function run(input: CartInput): FunctionResult {
  const config: Configuration = JSON.parse(
    input.discountAutomaticNode?.metafield?.value || 
    input.discountNode?.metafield?.value || 
    "{}"
  );

  if (!config.discount_tiers?.length) {
    throw new Error("No discount configuration found");
  }

  // Filter eligible lines
  const eligibleLines = input.cart.lines.filter(line => {
    if (!line.merchandise || line.merchandise.__typename !== "ProductVariant") {
      return false;
    }
    return config.applies_to === "all" || 
           config.product_ids.includes(line.merchandise.id);
  });

  // Calculate total eligible quantity
  const totalQuantity = eligibleLines.reduce((sum, line) => sum + line.quantity, 0);

  // Find applicable tier
  const applicableTier = config.discount_tiers
    .sort((a, b) => b.quantity - a.quantity)
    .find(tier => totalQuantity >= tier.quantity);

  if (!applicableTier || applicableTier.percentage <= 0) {
    return { discounts: [], discountApplicationStrategy: DiscountApplicationStrategy.Maximum };
  }

  // Create discounts using cart line targets
  const discounts = eligibleLines.map(line => ({
    targets: [{ cartLine: { id: line.id } }], // Changed to cartLine target
    value: { percentage: { value: applicableTier.percentage } },
    message: applicableTier.title || `${applicableTier.percentage}% off`
  }));

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.First, // Or Maximum
  };
}