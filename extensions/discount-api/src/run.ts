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
    max_quantity?: number;
  }[];
};

export function run(input: CartInput): FunctionResult {
  const config: Configuration = JSON.parse(
    input.discountNode?.metafield?.value || "{}",
  );
  console.log("Received config:", JSON.stringify(config, null, 2));

  if (!config.discount_tiers?.length) {
    throw new Error("No discount configuration found");
  }

  if (
    config.applies_to === "specific-products" &&
    (!config.product_ids || config.product_ids.length === 0)
  ) {
    throw new Error("Specific products discount requires product_ids");
  }

  const normalizedProductIds = (config.product_ids || []).map((id) =>
    typeof id === "string" ? id.trim() : String(id).trim(),
  );

  const eligibleLines = input.cart.lines.filter((line) => {
    if (!line.merchandise || line.merchandise.__typename !== "ProductVariant") {
      return false;
    }

    let isProductEligible = false;
    if (config.applies_to === "all") {
      isProductEligible = true;
    } else {
      const productId = line.merchandise.product?.id;
      if (!productId) {
        console.warn("Missing product ID for variant:", line.merchandise.id);
        return false;
      }
      isProductEligible = normalizedProductIds.includes(productId.trim());
    }

    if (!isProductEligible) {
      return false;
    }

    const lineTier = config.discount_tiers
      .sort((a, b) => b.quantity - a.quantity)
      .find((tier) => line.quantity >= tier.quantity);

    if (
      lineTier?.max_quantity !== undefined &&
      line.quantity > lineTier.max_quantity
    ) {
      return false;
    }

    return true;
  });

  console.log("Normalized Product IDs:", normalizedProductIds);
  console.log(
    "Cart Products:",
    JSON.stringify(
      input.cart.lines.map((line) => ({
        lineId: line.id,
        variantId:
          line.merchandise?.__typename === "ProductVariant"
            ? line.merchandise.id
            : null,
        productId:
          line.merchandise?.__typename === "ProductVariant"
            ? line.merchandise.product?.id
            : null,
        quantity: line.quantity,
        eligible: eligibleLines.includes(line),
      })),
      null,
      2,
    ),
  );

  const totalQuantity = eligibleLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  const applicableTier = config.discount_tiers
    .sort((a, b) => b.quantity - a.quantity)
    .find((tier) => totalQuantity >= tier.quantity);

  if (!applicableTier || applicableTier.percentage <= 0) {
    return {
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.Maximum,
    };
  }

  return {
    discounts: eligibleLines.map((line) => ({
      targets: [{ cartLine: { id: line.id } }],
      value: { percentage: { value: applicableTier.percentage } },
      message: applicableTier.title || `${applicableTier.percentage}% off`,
    })),
    discountApplicationStrategy: DiscountApplicationStrategy.Maximum,
  };
}