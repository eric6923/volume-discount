// app/routes/offers.tsx
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  EmptyState,
  Text,
} from "@shopify/polaris";
import type { LoaderFunction } from "@remix-run/node";

interface LoaderData {
  hasOffers: boolean;
}

export const loader: LoaderFunction = async () => {
  
  // In a real implementation, this would fetch actual offer data from your backend
  const hasOffers = false;
  
  return json<LoaderData>({
    hasOffers,
  });
};

export default function Offers() {
  const navigate = useNavigate();
  const { hasOffers } = useLoaderData<LoaderData>();

  // Custom illustration for the empty state
  const emptyStateImageUrl = "https://upsell.profitkoala.com/assets/empty_index_table_img.png";

  return (
    <Page
      title="Offers"
      subtitle="Showcasing a variety of easy-to-use offer types to promote your sales and increase average order value (AOV)."
      primaryAction={{
        content: "Create offer",
        onAction: () => {
          navigate('/app/offers/new')
        },
      }}
    >
      <Layout>
        <Layout.Section>
          {hasOffers ? (
            <Card>
              {/* This would show the list of existing offers */}
              <p>Existing offers would be listed here</p>
            </Card>
          ) : (
            <Card>
              <div className="logo">
              <EmptyState
                heading="Run promotions like a pro. Provide incentives for your customers to increase your AOV."
                action={{
                  content: "Create offer",
                  onAction: () => {
                    navigate('/app/offers/new')
                  },
                }}
                image={emptyStateImageUrl}
              >
                <Text as="p">
                  Click "Create offer" to start selling more by choosing from a variety of 
                  easy-to-use offers like quantity breaks, volume discounts or one click 
                  post-purchase upsell.
                </Text>
              </EmptyState>
              </div>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}