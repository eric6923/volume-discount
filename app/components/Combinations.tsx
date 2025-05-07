import {
  CombinationCard,
  DiscountClass,
} from "@shopify/discount-app-components";

import "../assets/CombinationStyle.css";
export interface CombinesWithType {
  orderDiscounts: boolean;
  productDiscounts: boolean;
  shippingDiscounts: boolean;
}

export interface CombinesWithProps {
  combinesWith: CombinesWithType;
  setCombinesWith: React.Dispatch<React.SetStateAction<CombinesWithType>>;
}

const Combinations = (props: CombinesWithProps) => {
  const { combinesWith, setCombinesWith } = props;

  return (
    <div className="RemoveBottomBoxSpace">
      <CombinationCard
        discountClass={DiscountClass.Product}
        discountDescriptor={""}
        combinableDiscountTypes={{
          value: combinesWith,
          onChange: setCombinesWith,
        }}
      />
    </div>
  );
};

export default Combinations;
