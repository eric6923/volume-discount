import { useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import { ActionList, Button, Popover, Spinner } from "@shopify/polaris";
import {
  ComposeIcon,
  DeleteIcon,
  MenuHorizontalIcon,
} from "@shopify/polaris-icons";
import { useCallback, useState } from "react";

export interface ActionsPopoverProps {
  id: number;
  discountId: number;
}

const ActionsPopover = (props: ActionsPopoverProps) => {
  const { id, discountId } = props;

  const submit = useSubmit();
  const nav = useNavigation();
  const navigate = useNavigate();
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const activator = (
    <Button
      icon={MenuHorizontalIcon}
      variant="plain"
      onClick={togglePopoverActive}
    ></Button>
  );

  const isSaving = nav.state === "submitting";

  const handleDelete = () => {
    if (!id || !discountId) return;

    const formData = new FormData();
    formData.append("_action", "delete_offer");
    formData.append("id", id.toString());
    formData.append("discountId", discountId.toString());

    submit(formData, { method: "post" });
  };

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      autofocusTarget="first-node"
      onClose={togglePopoverActive}
    >
      <ActionList
        actionRole="menuitem"
        items={[
          {
            content: "Edit",
            icon: ComposeIcon,
            disabled: isSaving,
            onAction: () => navigate(`/app/discounts/edit?id=${id}`),
          },
          {
            content: "Delete",
            icon: DeleteIcon,
            destructive: true,
            disabled: isSaving || !id || !discountId,
            onAction: handleDelete,
          },
        ]}
      />
    </Popover>
  );
};

export default ActionsPopover;
