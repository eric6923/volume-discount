import { useAppBridge } from "./AppBridgeContext"; 
import { ResourcePicker } from "@shopify/app-bridge/actions";
import { Button } from "@shopify/polaris"; 
import { useCallback } from "react";

export default function ProductPickerButton() {
  const app = useAppBridge();

  const openPicker = useCallback(() => {
    const picker = ResourcePicker.create(app, {
      resourceType: ResourcePicker.ResourceType.Product,
      options: {
        showVariants: true,
      },
    });

    picker.subscribe(ResourcePicker.Action.SELECT, (selection) => {
      console.log("Selected products:", selection);
    });

    picker.dispatch(ResourcePicker.Action.OPEN);
  }, [app]);

  return <Button onClick={openPicker}>Pick Products</Button>;
}
