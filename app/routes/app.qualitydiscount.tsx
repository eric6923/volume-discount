import { useState, useCallback, useRef } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  Text,
  Select,
  TextField,
  Button,
  LegacyStack,
  Box,
  Icon,
  Banner,
  Thumbnail,
  InlineStack,
  BlockStack,
  Tabs,
  Card,
  Divider,
  ButtonGroup,
  Frame,
  Toast,
  Loading,
} from "@shopify/polaris";
import {
  ArrowLeftIcon,
  SearchIcon,
  DeleteIcon,
  PlusIcon,
  DuplicateIcon,
} from "@shopify/polaris-icons";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";
import { useNavigate } from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
} from "@shopify/discount-app-components";

export default function LayoutExample() {
  const app = useAppBridge();
  const [selectedOption, setSelectedOption] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // Active Dates states
  const [startTime, setStartTime] = useState("2022-06-13T04:30:00.000Z");
  const [endTime, setEndTime] = useState("2022-06-14T03:30:00.000Z");

  // Combination Card states
  const [combinesWith, setCombinesWith] = useState({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: false,
  });

  // Tiers state
  const [tiers, setTiers] = useState([
    {
      id: 1,
      title: "Buy 9+ items",
      minQuantity: "9",
      maxQuantity: "",
      discountType: "percentage",
      discountValue: "25",
      startTime: "2022-06-13T04:30:00.000Z",
      endTime: "2022-06-14T03:30:00.000Z",
    },
    {
      id: 2,
      title: "Buy 6 items",
      minQuantity: "6",
      maxQuantity: "8",
      discountType: "percentage",
      discountValue: "15",
      startTime: "2022-06-13T04:30:00.000Z",
      endTime: "2022-06-14T03:30:00.000Z",
    },
    {
      id: 3,
      title: "Buy 3 items",
      minQuantity: "3",
      maxQuantity: "5",
      discountType: "percentage",
      discountValue: "10",
      startTime: "2022-06-13T04:30:00.000Z",
      endTime: "2022-06-14T03:30:00.000Z",
    },
  ]);

  const handleSelectChange = useCallback(
    (value: React.SetStateAction<string>) => {
      setSelectedOption(value);
    },
    [],
  );

  const handleSearchChange = useCallback(
    (value: React.SetStateAction<string>) => {
      setSearchValue(value);
    },
    [],
  );

  const options = [
    { label: "All products", value: "all" },
    { label: "Specific selected products", value: "specific-products" },
  ];

  // Only show search and browse for these options
  const showSearchAndBrowse = ["specific-products"].includes(selectedOption);

  const openResourcePicker = useCallback(() => {
    if (!app) {
      console.error("App Bridge instance is not available");
      return;
    }

    try {
      const picker = ResourcePicker.create(app, {
        resourceType: ResourcePicker.ResourceType.Product,
        options: {
          showVariants: true,
          initialQuery: searchValue,
        },
      });

      picker.subscribe(ResourcePicker.Action.SELECT, (selection) => {
        console.log("Selected products:", selection);
        if (selection.selection) {
          setSelectedProducts(selection.selection);
        }
      });

      console.log("Opening ResourcePicker...");
      picker.dispatch(ResourcePicker.Action.OPEN);
    } catch (error) {
      console.error("Error opening ResourcePicker:", error);
    }
  }, [app, searchValue]);

  // Handle removal of a product
  const handleRemoveProduct = useCallback((productId: any) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId),
    );
  }, []);

  // Handle tier tab change
  const handleTabChange = useCallback(
    (selectedTabIndex: React.SetStateAction<number>) => {
      setSelectedTab(selectedTabIndex);
    },
    [],
  );

  // Handle tier field changes
  const handleTierChange = useCallback((id: number, field: any, value: any) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier,
      ),
    );
  }, []);

  // Add a new tier
  const handleAddTier = useCallback(() => {
    const newTierId = Math.max(...tiers.map((tier) => tier.id), 0) + 1;
    const newTier = {
      id: newTierId,
      title: `Buy X items`,
      minQuantity: "",
      maxQuantity: "",
      discountType: "percentage",
      discountValue: "5",
      startTime: "2022-06-13T04:30:00.000Z",
      endTime: "2022-06-14T03:30:00.000Z",
    };

    setTiers((prevTiers) => [...prevTiers, newTier]);
    setSelectedTab(tiers.length); // Select the new tab
  }, [tiers]);

  // Duplicate a tier
  const handleDuplicateTier = useCallback(
    (id: number) => {
      const tierToDuplicate = tiers.find((tier) => tier.id === id);
      if (tierToDuplicate) {
        const newTierId = Math.max(...tiers.map((tier) => tier.id), 0) + 1;
        const duplicatedTier = {
          ...tierToDuplicate,
          id: newTierId,
          title: `${tierToDuplicate.title} (copy)`,
        };

        setTiers((prevTiers) => [...prevTiers, duplicatedTier]);
        setSelectedTab(tiers.length); // Select the new tab
      }
    },
    [tiers],
  );

  // Remove a tier
  const handleRemoveTier = useCallback(
    (id: number) => {
      setTiers((prevTiers) => prevTiers.filter((tier) => tier.id !== id));
      if (selectedTab >= tiers.length - 1 && selectedTab > 0) {
        setSelectedTab(selectedTab - 1);
      }
    },
    [selectedTab, tiers.length],
  );

  // Handle date changes for tiers
  const handleTierStartDateChange = useCallback((id: number, value: any) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === id ? { ...tier, startTime: value } : tier,
      ),
    );
  }, []);

  const handleTierEndDateChange = useCallback((id: number, value: any) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === id ? { ...tier, endTime: value } : tier,
      ),
    );
  }, []);

  // Generate tabs for tiers
  const tabs = tiers.map((tier, index) => ({
    id: `tier-${tier.id}`,
    content: `Tier ${index + 1}`,
    accessibilityLabel: `Tier ${index + 1}`,
    panelID: `tier-${tier.id}-panel`,
  }));

  // Get current active tier
  const activeTier = tiers[selectedTab] || tiers[0];

  // Selected products count
  const selectedProductsCount = selectedProducts.length;
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/app/offers/new");
  };

const [isLoading, setIsLoading] = useState<boolean>(false);
  
// State for tracking changes
const [hasChanges, setHasChanges] = useState<boolean>(false);
const [showToast, setShowToast] = useState<boolean>(false);
const [toastMessage, setToastMessage] = useState<string>('');
const [toastError, setToastError] = useState<boolean>(false);

    function handleSave() {
        //Handle Logic Here for Save
        shopify.toast.show('Toast Check');
    }

  return (
    <Frame>
      {isLoading && <Loading />}
      {showToast && (
        <Toast
          content={toastMessage}
          error={toastError}
          onDismiss={() => setShowToast(false)}
        />
      )}
      
      <form 
        data-save-bar
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
    <Page
      title="Create quantity discounts"
      backAction={{
        onAction: handleBack,
        content: "Back Route",
        icon: ArrowLeftIcon,
      }}
      primaryAction={{
        content: 'Save',
        onAction: handleSave, // your save handler function
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* When to display card */}
            <LegacyCard
              title={
                <Text as="h2" variant="headingMd" fontWeight="bold">
                  When to display...
                </Text>
              }
              sectioned
            >
              <Box paddingBlockEnd="200">
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    Applies to:
                  </Text>
                  <Select
                    label=""
                    labelHidden
                    options={options}
                    value={selectedOption}
                    onChange={handleSelectChange}
                  />

                  {showSearchAndBrowse && (
                    <>
                      <Box paddingBlockStart="200">
                        <LegacyStack>
                          <LegacyStack.Item fill>
                            <TextField
                              label=""
                              labelHidden
                              value={searchValue}
                              onChange={handleSearchChange}
                              prefix={<Icon source={SearchIcon} />}
                              placeholder="Search products"
                              autoComplete="off"
                            />
                          </LegacyStack.Item>
                          <Button onClick={openResourcePicker}>Browse</Button>
                        </LegacyStack>
                      </Box>

                      {selectedProductsCount > 0 && (
                        <BlockStack gap="300">
                          {selectedProducts.map((product) => (
                            <Box
                              key={product.id}
                              padding="300"
                              background="bg-surface"
                              borderColor="border"
                              borderWidth="025"
                              borderRadius="100"
                            >
                              <InlineStack
                                align="space-between"
                                blockAlign="center"
                              >
                                <InlineStack gap="400" blockAlign="center">
                                  {product.images &&
                                  product.images.length > 0 ? (
                                    <Thumbnail
                                      source={
                                        product.images[0]?.originalSrc || ""
                                      }
                                      alt={product.title}
                                      size="small"
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: "#f6f6f7",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  )}
                                  <BlockStack gap="100">
                                    <Text as="span" fontWeight="bold">
                                      {product.title}
                                    </Text>
                                    <Text
                                      as="span"
                                      variant="bodySm"
                                      color="subdued"
                                    >
                                      {product.variants?.length || 0} of{" "}
                                      {product.variants?.length || 0} variants
                                      selected
                                    </Text>
                                  </BlockStack>
                                </InlineStack>
                                <Button
                                  icon={DeleteIcon}
                                  onClick={() =>
                                    handleRemoveProduct(product.id)
                                  }
                                  variant="plain"
                                  accessibilityLabel={`Remove ${product.title}`}
                                />
                              </InlineStack>
                            </Box>
                          ))}
                        </BlockStack>
                      )}
                    </>
                  )}
                </BlockStack>
              </Box>
            </LegacyCard>

            {/* Tiers configuration card */}
            <Card padding="0">
              <Box padding="400">
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd" fontWeight="bold">
                      Tiers
                    </Text>
                    <Button onClick={handleAddTier} icon={PlusIcon}>
                      Add another tier
                    </Button>
                  </InlineStack>

                  <Tabs
                    tabs={tabs}
                    selected={selectedTab}
                    onSelect={handleTabChange}
                    fitted
                  />
                </BlockStack>
              </Box>

              <Divider />

              {activeTier && (
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingMd">
                        Tier {selectedTab + 1}
                      </Text>
                      <ButtonGroup>
                        <Button
                          icon={DuplicateIcon}
                          onClick={() => handleDuplicateTier(activeTier.id)}
                          variant="plain"
                        />
                        <Button
                          icon={DeleteIcon}
                          onClick={() => handleRemoveTier(activeTier.id)}
                          variant="plain"
                          disabled={tiers.length <= 1}
                        />
                      </ButtonGroup>
                    </InlineStack>

                    <BlockStack gap="400">
                      <TextField
                        label="Title"
                        value={activeTier.title}
                        onChange={(value) =>
                          handleTierChange(activeTier.id, "title", value)
                        }
                        autoComplete="off"
                      />

                      <Text as="p" variant="bodySm" color="subdued">
                        Customers will see this on product page, in their cart
                        and at checkout.
                      </Text>

                      <InlineStack gap="400">
                        <TextField
                          label="Minimum quantity"
                          type="number"
                          value={activeTier.minQuantity}
                          onChange={(value) =>
                            handleTierChange(
                              activeTier.id,
                              "minQuantity",
                              value,
                            )
                          }
                          autoComplete="off"
                        />
                        <TextField
                          label="Maximum quantity"
                          type="number"
                          value={activeTier.maxQuantity}
                          onChange={(value) =>
                            handleTierChange(
                              activeTier.id,
                              "maxQuantity",
                              value,
                            )
                          }
                          autoComplete="off"
                        />
                      </InlineStack>

                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                          Discount
                        </Text>
                        <InlineStack gap="200">
                          <Box minWidth="200px">
                            <Select
                              label=""
                              labelHidden
                              options={[
                                { label: "Percentage", value: "percentage" },
                                { label: "Fixed amount", value: "fixed" },
                              ]}
                              value={activeTier.discountType}
                              onChange={(value) =>
                                handleTierChange(
                                  activeTier.id,
                                  "discountType",
                                  value,
                                )
                              }
                            />
                          </Box>
                          <TextField
                            label=""
                            labelHidden
                            value={activeTier.discountValue}
                            onChange={(value) =>
                              handleTierChange(
                                activeTier.id,
                                "discountValue",
                                value,
                              )
                            }
                            suffix={
                              activeTier.discountType === "percentage"
                                ? "%"
                                : ""
                            }
                            autoComplete="off"
                          />
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </BlockStack>
                </Box>
              )}
            </Card>

            {/* Active Dates Card for each tier */}
            <Card title="Active Dates" sectioned>
              <ActiveDatesCard
                startDate={{
                  value: activeTier.startTime,
                  onChange: (value) =>
                    handleTierStartDateChange(activeTier.id, value),
                }}
                endDate={{
                  value: activeTier.endTime,
                  onChange: (value) =>
                    handleTierEndDateChange(activeTier.id, value),
                }}
                timezoneAbbreviation="EST"
              />
            </Card>

            {/* Combination Card */}
            <Card title="Combinations" sectioned>
              <CombinationCard
                combinableDiscountTypes={{
                  value: combinesWith,
                  onChange: setCombinesWith,
                }}
                combinableDiscountCounts={{
                  orderDiscountsCount: 0,
                  productDiscountsCount: 3,
                  shippingDiscountsCount: 0,
                }}
                discountClass={DiscountClass.Product}
                discountDescriptor="Quantity Discount"
                discountId="gid://Shopify/DiscountNode/123456"
              />
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
    </form>
    </Frame>
  );
}
