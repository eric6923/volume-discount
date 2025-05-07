import { Icon, Text } from "@shopify/polaris";
import { ImageIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import styles from "../assets/ListItems.module.css";
import { Products } from "./AppliesTo";

interface ListItems {
  selectedProducts: Products[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<Products[]>>;
}

const ListItems = (props: ListItems) => {
  const { selectedProducts, setSelectedProducts } = props;

  const [productsNode, setProductsNode] = useState<React.ReactNode>([]);

  function handleOnRemoveSelectedItem(id: string) {
    const filteredItems = selectedProducts?.filter((e) => e.id !== id);

    setSelectedProducts(filteredItems);
  }

  function formatProductNode(productsData: Products[]) {
    const formattedNode: React.ReactNode[] = productsData?.map(
      (e, i: number) => {
        return (
          <div className={styles.ListView} key={i}>
            <div className={styles.ListView__Component}>
              {e.image !== "" ? (
                <img
                  src={e.image || ""}
                  alt="collection"
                  width="50px"
                  height="50px"
                />
              ) : (
                <Icon source={ImageIcon} />
              )}

              <div className={styles.ListView__Details}>
                <Text as="p" variant="bodyLg">
                  {e.title}
                </Text>
                <Text as="p" variant="bodyLg" tone="subdued">
                  {e.variants.length > 0 && (
                    <Text as={"p"} tone="subdued">
                      (
                      {e.variants.length > 1
                        ? `${e.variants.length} variants selected`
                        : `1 variant selected`}
                      )
                    </Text>
                  )}
                </Text>
              </div>
            </div>

            <div
              onClick={() => handleOnRemoveSelectedItem(e.id)}
              style={{ cursor: "pointer" }}
            >
              <Icon source={DeleteIcon} />
            </div>
          </div>
        );
      },
    );
    formattedNode && setProductsNode(formattedNode);
  }

  useEffect(() => {
    formatProductNode(selectedProducts);
  }, [selectedProducts]);

  return (
    productsNode && (
      <div className={styles.ListView__Container}>{productsNode}</div>
    )
  );
};

export default ListItems;
