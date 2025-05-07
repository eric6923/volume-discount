import { BlockStack, Button, Card, InlineStack, Text } from "@shopify/polaris";
import TiersInput from "./TiersInput";
import { PlusIcon } from "@shopify/polaris-icons";
import { ErrorsType } from "app/routes/app.discounts.$form";

export interface tiersData {
  title: string;
  minQuantity: number;
  maxQuantity: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

export interface TiersProps {
  errors: ErrorsType;
  data: tiersData[];
  setData: React.Dispatch<React.SetStateAction<tiersData[]>>;
}

const Tiers = (props: TiersProps) => {
  const { errors, data, setData } = props;

  const addTier = () => {
    if (data.length < 10) {
      setData([
        ...data,
        {
          title: "",
          minQuantity: 1,
          maxQuantity: 1,
          type: "PERCENTAGE",
          value: 10,
        },
      ]);
    }
  };

  const removeTier = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  return (
    <Card>
      <BlockStack gap={"500"}>
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd">
            Tiers
          </Text>
          <Button icon={PlusIcon} variant="plain" onClick={addTier}>
            Add Tier
          </Button>
        </InlineStack>
        {data.map((tier, index) => (
          <TiersInput
            key={index}
            index={index}
            errors={errors}
            data={data}
            setData={setData}
            removeTier={removeTier}
          />
        ))}
      </BlockStack>
    </Card>
  );
};

export default Tiers;
