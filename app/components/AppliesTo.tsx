import { BlockStack, Card, Select, Text } from "@shopify/polaris";
import BrowseQuery from "./BrowseQuery";
import ResourcePicker from "./ResourcePicker";
import ListItems from "./ListItems";
import { useCallback, useState } from "react";
import { ErrorsType } from "app/routes/app.discounts.$form";

export interface Products {
  id: string;
  title: string;
  price: number;
  image: string | null;
  variants?: any;
}

export interface ResourcePickerPropsType {
  errors?: ErrorsType;
  initialQuery: string;
  setInitialQuery: React.Dispatch<React.SetStateAction<string>>;
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
  selectedProducts?: Products[];
  setSelectedProducts?: React.Dispatch<React.SetStateAction<Products[]>>;
}

export interface AppliesToProps {
  errors: ErrorsType;
  selectedAppliesTo: "ALL" | "EXCLUDED_PRODUCTS" | "SPECIFIC_PRODUCTS";
  setSelectedAppliesTo: Function;
  selectedProducts: Products[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<Products[]>>;
}

const options = [
  { label: "All products", value: "ALL" },
  { label: "All products except selected", value: "EXCLUDED_PRODUCTS" },
  { label: "Specific selected products", value: "SPECIFIC_PRODUCTS" },
];

const AppliesTo = (props: AppliesToProps) => {
  const {
    errors,
    selectedAppliesTo,
    setSelectedAppliesTo,
    selectedProducts,
    setSelectedProducts,
  } = props;
  const [pickerToggle, setPickerToggle] = useState<boolean>(false);
  const [pickerQuery, setPickerQuery] = useState<string>("");

  const handleAppliesToChange = useCallback((value: string) => {
    setSelectedAppliesTo(value);
    setSelectedProducts([]);
  }, []);

  return (
    <Card>
      <BlockStack gap={"500"}>
        <Text as="h3" variant="headingMd">
          When to apply discount
        </Text>
        <Select
          label="Applies To"
          options={options}
          onChange={handleAppliesToChange}
          value={selectedAppliesTo}
        />
        {selectedAppliesTo !== "ALL" && (
          <>
            <BrowseQuery
              errors={errors}
              initialQuery={pickerQuery}
              setInitialQuery={setPickerQuery}
              toggle={pickerToggle}
              setToggle={setPickerToggle}
            />
            <ResourcePicker
              initialQuery={pickerQuery}
              setInitialQuery={setPickerQuery}
              toggle={pickerToggle}
              setToggle={setPickerToggle}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
            <ListItems
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          </>
        )}
      </BlockStack>
    </Card>
  );
};

export default AppliesTo;
