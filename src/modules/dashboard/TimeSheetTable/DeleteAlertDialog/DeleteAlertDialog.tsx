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
import { useI18n } from "~/contexts/I18nContext";

type DeleteAlertPortalProps = {
  onConfirm: VoidFunction;
};

const DeleteAlertPortal: Component<DeleteAlertPortalProps> = (props) => {
  const { t } = useI18n();

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPositioner>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.confirmDelete.title")}
            </AlertDialogTitle>
            <AlertDialogCloseButton variant="ghost">
              <IoCloseSharp />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {t("dashboard.confirmDelete.description")}
          </AlertDialogDescription>
          <div class="flex justify-end pt-4">
            <AlertDialogCloseButton variant="ghost" size="sm">
              {t("dashboard.confirmDelete.cancel")}
            </AlertDialogCloseButton>
            <AlertDialogCloseButton
              onClick={props.onConfirm}
              size="sm"
              variant="outline"
            >
              {t("dashboard.confirmDelete.confirm")}
            </AlertDialogCloseButton>
          </div>
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
  isOpen: boolean;
  onConfirm: VoidFunction;
  onIsOpenChange: (isOpen: boolean) => void;
};

export const DeleteAlertControlledDialog: Component<
  DeleteAlertControlledDialogProps
> = (props) => {
  return (
    <AlertDialogRoot open={props.isOpen} onOpenChange={props.onIsOpenChange}>
      <DeleteAlertPortal onConfirm={props.onConfirm} />
    </AlertDialogRoot>
  );
};
