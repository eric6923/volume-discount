import { useNavigate } from "@remix-run/react";
import {
  Page,
  InlineGrid,
  Box,
  Text,
  Card,
  Button,
  Badge,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { ArrowLeftMinor } from "@shopify/polaris-icons";
import quality_discount from "../assets/volumediscount.png";
// CSS styles for image placeholders

const imgStyle = {
  maxHeight: "100%",
  maxWidth: "275px",
  objectFit: "contain",
};

const cardContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "auto",
};

export default function New() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/app/offers");
  };

  return (
    <Page
      title="Select offer"
      backAction={{
        onAction: handleBack,
        content: "Back",
        icon: ArrowLeftMinor,
      }}
    >
      <InlineGrid gap="400" columns={3}>
        <Card>
          <Box>
            <div style={cardContentStyle}>
              <div>
                <img
                  src={quality_discount}
                  alt="Quantity breaks & Free Gift placeholder"
                  style={imgStyle}
                />
              </div>
              <Text variant="headingMd" as="h2">
                Quality Discounts
              </Text>
              <Text as="p">
                Applied when buying multiple quantities of the same product.
              </Text>
              <div style={buttonContainerStyle}>
                <Button onClick={() => navigate("/app/qualitydiscount")}>
                  Select
                </Button>
              </div>
            </div>
          </Box>
        </Card>

        {/* <Card>
          <Box paddingBlock="4">
            <div style={cardContentStyle}>
              <div style={imageContainerStyle}>
                <img 
                  src="/api/placeholder/300/160" 
                  alt="Bundle placeholder"
                  style={imgStyle}
                />
              </div>
              <Text variant="headingMd" as="h2">Bundle</Text>
              <Text as="p">Sell combo of different products together with a discount.</Text>
              <div style={buttonContainerStyle}>
                <Button>Select</Button>
              </div>
            </div>
          </Box>
        </Card>

        <Card>
          <Box paddingBlock="4">
            <div style={cardContentStyle}>
              <div style={imageContainerStyle}>
                <img 
                  src="/api/placeholder/300/160" 
                  alt="Volume discount bundles placeholder"
                  style={imgStyle}
                />
              </div>
              <Text variant="headingMd" as="h2">Volume discount bundles</Text>
              <Text as="p">A discount given for buying a certain quantity or more of multiple items.</Text>
              <div style={buttonContainerStyle}>
                <Button>Select</Button>
              </div>
            </div>
          </Box>
        </Card> */}
      </InlineGrid>
    </Page>
  );
}
