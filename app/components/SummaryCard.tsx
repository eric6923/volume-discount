import {
  DiscountMethod,
  DiscountStatus,
  SummaryCard,
} from "@shopify/discount-app-components";

export interface SummaryProps {
  title: string;
  status: "ACTIVE" | "DRAFT";
  usageCount: number;
  startDate: string;
  endDate: string | null;
  orderDiscounts: boolean;
  productDiscounts: boolean;
  shippingDiscounts: boolean;
  selectedAppliesTo: "ALL" | "EXCLUDED_PRODUCTS" | "SPECIFIC_PRODUCTS";
}

const Summary = (props: SummaryProps) => {
  const {
    title,
    status,
    usageCount,
    startDate,
    endDate,
    orderDiscounts,
    productDiscounts,
    shippingDiscounts,
    selectedAppliesTo,
  } = props;

  return (
    <SummaryCard
      header={{
        discountMethod: DiscountMethod.Automatic,
        appDiscountType: "Tiered discounts",
        discountDescriptor: title,
        isEditing: true,
        discountStatus:
          status === "ACTIVE" ? DiscountStatus.Active : DiscountStatus.Expired,
      }}
      performance={{
        status:
          status === "ACTIVE" ? DiscountStatus.Active : DiscountStatus.Expired,
        discountMethod: DiscountMethod.Automatic,
        usageCount: usageCount,
      }}
      activeDates={{
        startDate: startDate,
        endDate: endDate,
      }}
      combinations={{
        combinesWith: {
          orderDiscounts,
          productDiscounts,
          shippingDiscounts,
        },
      }}
      additionalDetails={[
        selectedAppliesTo === "EXCLUDED_PRODUCTS"
          ? "Discounts will apply to all products except excluded ones."
          : selectedAppliesTo === "SPECIFIC_PRODUCTS"
            ? "Discounts will be applied only to selected products."
            : "Discounts will be applied to all products.",
      ]}
    />
  );
};

export default Summary;
