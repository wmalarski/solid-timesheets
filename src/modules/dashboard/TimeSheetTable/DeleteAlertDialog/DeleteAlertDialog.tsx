import { useI18n } from "@solid-primitives/i18n";
import { IoCloseSharp } from "solid-icons/io";
import { splitProps, type Component } from "solid-js";
import {
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogPositioner,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogTriggerProps,
} from "~/components/AlertDialog";

type DeleteAlertPortalProps = {
  onConfirm: VoidFunction;
};

const DeleteAlertPortal: Component<DeleteAlertPortalProps> = (props) => {
  const [t] = useI18n();

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPositioner>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.confirmDelete.title")}
            </AlertDialogTitle>
            <AlertDialogCloseButton>
              <IoCloseSharp />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {t("dashboard.confirmDelete.description")}
          </AlertDialogDescription>
          <AlertDialogCloseButton>
            {t("dashboard.confirmDelete.cancel")}
          </AlertDialogCloseButton>
          <AlertDialogCloseButton onClick={props.onConfirm}>
            {t("dashboard.confirmDelete.confirm")}
          </AlertDialogCloseButton>
        </AlertDialogContent>
      </AlertDialogPositioner>
    </AlertDialogPortal>
  );
};

type DeleteAlertDialogProps = AlertDialogTriggerProps & {
  onConfirm: VoidFunction;
};

export const DeleteAlertDialog: Component<DeleteAlertDialogProps> = (props) => {
  const [split, rest] = splitProps(props, ["onConfirm"]);
  return (
    <AlertDialogRoot>
      <AlertDialogTrigger {...rest} />
      <DeleteAlertPortal onConfirm={split.onConfirm} />
    </AlertDialogRoot>
  );
};

type DeleteAlertControlledDialogProps = {
  onConfirm: VoidFunction;
};

export const DeleteAlertControlledDialog: Component<
  DeleteAlertControlledDialogProps
> = (props) => {
  return (
    <AlertDialogRoot>
      <DeleteAlertPortal onConfirm={props.onConfirm} />
    </AlertDialogRoot>
  );
};
