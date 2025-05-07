import {
  BlockStack,
  Button,
  InlineStack,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { tiersData } from "./Tiers";
import { ErrorsType } from "app/routes/app.discounts.$form";

const options = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed Amount", value: "FIXED" },
];

interface TiersInputProps {
  index: number;
  errors: ErrorsType;
  data: tiersData[];
  setData: React.Dispatch<React.SetStateAction<tiersData[]>>;
  removeTier: (index: number) => void;
}

const TiersInput = ({
  index,
  errors,
  data,
  setData,
  removeTier,
}: TiersInputProps) => {
  const updateField = (field: keyof tiersData, value: any) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  return (
    <div
      style={{
        background: "#F7F7F7",
        padding: "15px",
        border: "1px solid #E1E1E1",
        borderRadius: "10px",
      }}
    >
      <BlockStack gap={"300"}>
        <InlineStack align="space-between">
          <Text as="p" variant="bodyLg" fontWeight="bold">
            Tier {index + 1}
          </Text>
          {data.length > 1 && (
            <Button
              icon={DeleteIcon}
              onClick={() => removeTier(index)}
              variant="monochromePlain"
            />
          )}
        </InlineStack>
        <TextField
          label="Title"
          value={data[index].title}
          onChange={(value) => updateField("title", value)}
          error={
            errors.tiers?.find((e) => e.index === index && e.type === "TITLE")
              ?.error
          }
          helpText="Customers will see this applied in their cart and during checkout."
          autoComplete="true"
        />
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <TextField
              label="Minimum quantity"
              value={String(data[index].minQuantity)}
              onChange={(value) => {
                const numericValue = Number(value);
                if (Number.isInteger(numericValue)) {
                  updateField("minQuantity", numericValue);
                }
              }}
              type="number"
              error={
                errors.tiers?.find((e) => e.index === index && e.type === "MIN")
                  ?.error ||
                errors.tiers?.find(
                  (e) => e.index === index && e.type === "MIN_MAX",
                )?.error
              }
              min={1}
              autoComplete="true"
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              label="Maximum quantity"
              value={String(data[index].maxQuantity)}
              onChange={(value) => {
                const numericValue = Number(value);
                if (Number.isInteger(numericValue)) {
                  updateField("maxQuantity", numericValue);
                }
              }}
              type="number"
              error={
                errors.tiers?.find((e) => e.index === index && e.type === "MAX")
                  ?.error
              }
              min={1}
              autoComplete="true"
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ flex: 1 }}>
            <Select
              label="Discount Type"
              options={options}
              onChange={(value) =>
                updateField("type", value as "PERCENTAGE" | "FIXED")
              }
              value={data[index].type}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextField
              label="Discount Value"
              value={String(data[index].value)}
              onChange={(value) => {
                const type = data[index].type;
                const decimalPattern = /^\d{0,10}(\.\d{0,2})?$/;
                const numericValue = Number(value);
                if (type === "PERCENTAGE") {
                  if (numericValue <= 100 && decimalPattern.test(value)) {
                    updateField("value", numericValue);
                  }
                } else if (type === "FIXED") {
                  if (decimalPattern.test(value)) {
                    updateField("value", numericValue);
                  }
                }
              }}
              suffix={data[index].type === "PERCENTAGE" ? "%" : "Amount"}
              type="number"
              min={1}
              autoComplete="true"
            />
          </div>
        </div>
      </BlockStack>
    </div>
  );
};

export default TiersInput;
