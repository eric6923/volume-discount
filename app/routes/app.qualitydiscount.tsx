import { useState, useCallback } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { prisma } from "../lib/prisma.server";
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
  ArrowLeftMinor,
  SearchMinor,
  DeleteMinor,
  PlusMinor,
  DuplicateMinor,
} from "@shopify/polaris-icons";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
} from "@shopify/discount-app-components";
import { useNavigate } from "@remix-run/react";

export const loader = async ({ request }: any) => {
  console.log("Inside Loader Function");
  const { session } = await authenticate.admin(request);
  return json({
    shop: session.shop,
  });
};

// Modified action function to properly apply discounts
export const action = async ({ request }: any) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    // Parse JSON data from form
    const tiersData = JSON.parse(data.tiers);
    const selectedProducts = JSON.parse(data.selectedProducts || "[]");
    const appliesTo = data.appliesTo;
    const combinesWith = JSON.parse(data.combinesWith || "{}");

    // Create discount record in database
    const discount = await prisma.quantityDiscount.create({
      data: {
        shopId: session.shop,
        title: data.title || "Volume Discount",
        isActive: true,
        appliesTo,
        productIds: selectedProducts.map((p) => p.id),
        combineWithOrderDiscounts: combinesWith.orderDiscounts || false,
        combineWithProductDiscounts: combinesWith.productDiscounts || false,
        combineWithShippingDiscounts: combinesWith.shippingDiscounts || false,
        tiers: {
          create: tiersData.map((tier) => ({
            title: tier.title,
            minQuantity: parseInt(tier.minQuantity),
            maxQuantity: tier.maxQuantity ? parseInt(tier.maxQuantity) : null,
            discountType: tier.discountType,
            discountValue: parseFloat(tier.discountValue),
            startTime: new Date(tier.startTime),
            endTime: tier.endTime ? new Date(tier.endTime) : null,
          })),
        },
      },
    });

    // Format tiers for the function input
    const formattedTiers = tiersData.map(
      (tier: {
        minQuantity: string;
        discountType: string;
        discountValue: string;
      }) => ({
        quantity: parseInt(tier.minQuantity),
        percentage:
          tier.discountType === "percentage"
            ? parseFloat(tier.discountValue)
            : 0, // You might want to handle fixed amounts differently
      }),
    );

    // Create the discount on Shopify using the function
    const discountResponse = await admin.graphql(
      `
      mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
          automaticAppDiscount {
            discountId
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: {
          automaticAppDiscount: {
            title: data.title || "Volume Discount",
            functionId: process.env.SHOPIFY_DISCOUNT_API_ID, // Make sure this env variable is correctly set
            startsAt: new Date(tiersData[0].startTime).toISOString(),
            endsAt: tiersData[0].endTime
              ? new Date(tiersData[0].endTime).toISOString()
              : null,
            combinesWith: {
              orderDiscounts: combinesWith.orderDiscounts || false,
              productDiscounts: combinesWith.productDiscounts || false,
              shippingDiscounts: combinesWith.shippingDiscounts || false,
            },
            // In your discountAutomaticAppCreate mutation:
            metafields: [
              {
                namespace: "volume-discount",
                key: "function-configuration",
                type: "json",
                value: JSON.stringify({
                  discount_id: discount.id,
                  discount_tiers: tiersData.map((t: { title: any; minQuantity: string; discountValue: string; }) => ({
                    // Must use 'discount_tiers' key
                    title: t.title,
                    quantity: parseInt(t.minQuantity),
                    percentage: parseFloat(t.discountValue),
                  })),
                  applies_to: appliesTo,
                  product_ids: selectedProducts.map((p: { id: any; }) => p.id),
                }),
              },
            ],
          },
        },
      },
    );

    // Parse the GraphQL response
    const discountData = await discountResponse.json();

    console.log("Discount Response:", JSON.stringify(discountData, null, 2));

    if (discountData.errors) {
      console.error("GraphQL Errors:", discountData.errors);
      throw new Error(discountData.errors[0].message);
    }

    if (discountData.data?.discountAutomaticAppCreate?.userErrors?.length) {
      console.error(
        "User Errors:",
        discountData.data.discountAutomaticAppCreate.userErrors,
      );
      throw new Error(
        discountData.data.discountAutomaticAppCreate.userErrors[0].message,
      );
    }

    const discountId =
      discountData.data?.discountAutomaticAppCreate?.automaticAppDiscount
        ?.discountId;

    if (!discountId) {
      console.error("No discount ID returned:", discountData);
      throw new Error("Failed to create discount: No discount ID returned");
    }

    // Update the discount record with the Shopify discount ID
    await prisma.quantityDiscount.update({
      where: { id: discount.id },
      data: {
        shopifyDiscountId: discountId,
      },
    });

    return redirect("/app/qualitydiscount");
  } catch (error) {
    console.error("Discount creation error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};

export default function NewVolumeDiscount() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const app = useAppBridge();

  const [selectedOption, setSelectedOption] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Tiers state
  const [tiers, setTiers] = useState([
    {
      id: 1,
      title: "Buy 3 items",
      minQuantity: "3",
      maxQuantity: "5",
      discountType: "percentage",
      discountValue: "10",
      startTime: new Date().toISOString(),
      endTime: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      ).toISOString(),
    },
  ]);

  // Combination Card states
  const [combinesWith, setCombinesWith] = useState({
    orderDiscounts: false,
    productDiscounts: false,
    shippingDiscounts: false,
  });

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
      startTime: new Date().toISOString(),
      endTime: new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      ).toISOString(),
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
          startTime: new Date().toISOString(),
          endTime: new Date(
            new Date().setMonth(new Date().getMonth() + 1),
          ).toISOString(),
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

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleSave = useCallback(() => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", tiers[0].title); // Using first tier as default title
    formData.append("appliesTo", selectedOption);
    formData.append("selectedProducts", JSON.stringify(selectedProducts));
    formData.append("tiers", JSON.stringify(tiers));
    formData.append("combinesWith", JSON.stringify(combinesWith));

    submit(formData, { method: "post" });

    setToastMessage("Discount saved successfully!");
    setShowToast(true);
    setIsLoading(false);
  }, [tiers, selectedOption, selectedProducts, combinesWith, submit]);

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
            icon: ArrowLeftMinor,
          }}
          primaryAction={{
            content: "Save",
            onAction: handleSave,
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
                                  prefix={<Icon source={SearchMinor} />}
                                  placeholder="Search products"
                                  autoComplete="off"
                                />
                              </LegacyStack.Item>
                              <Button onClick={openResourcePicker}>
                                Browse
                              </Button>
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
                                          {product.variants?.length || 0}{" "}
                                          variants selected
                                        </Text>
                                      </BlockStack>
                                    </InlineStack>
                                    <Button
                                      icon={DeleteMinor}
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
                        <Button onClick={handleAddTier} icon={PlusMinor}>
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
                              icon={DuplicateMinor}
                              onClick={() => handleDuplicateTier(activeTier.id)}
                              variant="plain"
                            />
                            <Button
                              icon={DeleteMinor}
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
                            Customers will see this on product page, in their
                            cart and at checkout.
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
                                    {
                                      label: "Percentage",
                                      value: "percentage",
                                    },
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
