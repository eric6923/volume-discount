import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { Products, ResourcePickerPropsType } from "./AppliesTo";

const ResourcePicker = (props: ResourcePickerPropsType) => {
  const {
    initialQuery,
    setInitialQuery,
    toggle,
    setToggle,
    selectedProducts,
    setSelectedProducts,
  } = props;

  const [resourcePickerComponent, setResourcePickerComponent] =
    useState<any>(null);

  useEffect(() => {
    if (toggle) {
      const fetchData = async () => {
        const shopify = useAppBridge();
        const picker = await shopify.resourcePicker({
          type: "product",
          query: initialQuery,
          action: "select",
          multiple: true,
          selectionIds:
            selectedProducts?.map((e) => ({
              id: e.id,
              variants: e.variants.map((e: any) => ({ id: e.id })),
            })) || [],
          filter: {
            variants: true,
          },
        });
        setResourcePickerComponent(picker);
      };
      fetchData();
    } else {
      setResourcePickerComponent(null);
    }
  }, [toggle]);

  useEffect(() => {
    setToggle(false);
    setInitialQuery("");
    if (!resourcePickerComponent) return;

    const formattedData: Products[] = resourcePickerComponent.map((e: any) => {
      return {
        id: e.id,
        title: e.title,
        price: e.variants[0]?.price ? Number(e.variants[0].price) : 0,
        image: e.images.length > 0 ? e.images[0].originalSrc : null,
        variants: e.variants.map((d: any) => ({
          id: d.id,
          title: d.title,
        })),
      };
    });

    setSelectedProducts && setSelectedProducts(formattedData);
  }, [resourcePickerComponent]);
  return <></>;
};

export default ResourcePicker;
