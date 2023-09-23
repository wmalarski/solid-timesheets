import { createMutation, useQueryClient } from "@tanstack/solid-query";
import {
  IoDuplicateSharp,
  IoEllipsisHorizontalSharp,
  IoHourglassSharp,
  IoTrashSharp,
} from "solid-icons/io";
import { Suspense, createSignal, lazy, type Component } from "solid-js";
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/DropdownMenu";
import { showToastAsync } from "~/components/Toast/showToastAsync";
import { useI18n } from "~/contexts/I18nContext";
import {
  deleteTimeEntryServerMutation,
  getAllTimeEntriesKey,
  type CreateTimeEntryArgs,
} from "~/server/timeEntries";
import {
  copyToCurrentDay,
  copyToEndOfMonth,
  copyToEndOfWeek,
  copyToNextDay,
  copyToNextWorkingDay,
  useTimeSheetContext,
} from "../EntriesStore";

const DeleteAlertControlledDialog = lazy(() =>
  import("../DeleteAlertDialog").then((module) => ({
    default: module.DeleteAlertControlledDialog,
  }))
);

type DeleteItemProps = {
  isDisabled: boolean;
  onClick: VoidFunction;
};

const DeleteItem: Component<DeleteItemProps> = (props) => {
  const { t } = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoTrashSharp />
        {t("dashboard.timeEntry.delete")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type TrackingItemProps = {
  isDisabled: boolean;
  onClick: VoidFunction;
};

const TrackingItem: Component<TrackingItemProps> = (props) => {
  const { t } = useI18n();

  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoHourglassSharp />
        {t("dashboard.timeEntry.tracking")}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type DeleteUpdatedDialogProps = {
  id: number;
  isDisabled: boolean;
  isOpen: boolean;
  onIsOpenChange: (isOpen: boolean) => void;
};

const DeleteUpdatedDialog: Component<DeleteUpdatedDialogProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const queryClient = useQueryClient();

  const mutation = createMutation(() => ({
    mutationFn: deleteTimeEntryServerMutation,
    onError: async () => {
      await showToastAsync({
        description: t("dashboard.toasts.wrong"),
        title: t("dashboard.toasts.error"),
        variant: "error",
      });
    },
    onSettled: () => {
      props.onIsOpenChange(false);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: getAllTimeEntriesKey() });
      setState("updateMap", props.id, undefined);
      await showToastAsync({
        description: t("dashboard.toasts.remove"),
        title: t("dashboard.toasts.success"),
        variant: "success",
      });
    },
  }));

  const onClick = () => {
    mutation.mutate({ id: props.id });
  };

  return (
    <Suspense>
      <DeleteAlertControlledDialog
        isOpen={props.isOpen}
        onIsOpenChange={props.onIsOpenChange}
        onConfirm={onClick}
      />
    </Suspense>
  );
};

type CopyItemProps = {
  isDisabled: boolean;
  label: string;
  onClick: VoidFunction;
};

const CopyItem: Component<CopyItemProps> = (props) => {
  return (
    <DropdownMenuItem onClick={props.onClick} disabled={props.isDisabled}>
      <DropdownMenuItemLabel>
        <IoDuplicateSharp />
        {props.label}
      </DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
};

type CopyItemsProps = {
  args?: CreateTimeEntryArgs;
  isDisabled: boolean;
};

export const CopyItems: Component<CopyItemsProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  return (
    <>
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyCurrentDay")}
        onClick={() => copyToCurrentDay({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        onClick={() => copyToNextDay({ args: props.args, setState })}
        label={t("dashboard.timeEntry.copyNextDay")}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyNextWorkingDay")}
        onClick={() => copyToNextWorkingDay({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyWeekEnd")}
        onClick={() => copyToEndOfWeek({ args: props.args, setState })}
      />
      <CopyItem
        isDisabled={props.isDisabled}
        label={t("dashboard.timeEntry.copyMonthEnd")}
        onClick={() => copyToEndOfMonth({ args: props.args, setState })}
      />
    </>
  );
};

type CreatedCardMenuProps = {
  id: number;
  isDisabled: boolean;
  key: string;
};

export const CreatedCardMenu: Component<CreatedCardMenuProps> = (props) => {
  const { t } = useI18n();

  const { state, setState } = useTimeSheetContext();

  const args = () => {
    return state.dateMap[props.key]?.[props.id]?.args;
  };

  const onDeleteConfirm = () => {
    setState("dateMap", props.key, props.id, undefined);
  };

  const [isWarningOpen, setIsWarningOpen] = createSignal(false);

  const onDeleteClick = () => {
    setIsWarningOpen(true);
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label={t("dashboard.timeEntry.more")}
          shape="square"
          size="sm"
          variant="ghost"
        >
          <DropdownMenuIcon rotation={90}>
            <IoEllipsisHorizontalSharp />
          </DropdownMenuIcon>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <CopyItems isDisabled={props.isDisabled} args={args()} />
            <DropdownMenuSeparator />
            <DeleteItem isDisabled={props.isDisabled} onClick={onDeleteClick} />
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <Suspense>
        <DeleteAlertControlledDialog
          isOpen={isWarningOpen()}
          onIsOpenChange={setIsWarningOpen}
          onConfirm={onDeleteConfirm}
        />
      </Suspense>
    </>
  );
};
type UpdatedCardMenuProps = {
  id: number;
  isDisabled: boolean;
  onIsTrackingVisibleToggle: () => void;
};

export const UpdatedCardMenu: Component<UpdatedCardMenuProps> = (props) => {
  const { t } = useI18n();

  const { state } = useTimeSheetContext();

  const args = () => {
    return state.timeEntryMap.get(props.id);
  };

  const [isWarningOpen, setIsWarningOpen] = createSignal(false);

  const onDeleteClick = () => {
    setIsWarningOpen(true);
  };

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          aria-label={t("dashboard.timeEntry.more")}
          shape="square"
          size="sm"
          variant="ghost"
        >
          <DropdownMenuIcon rotation={90}>
            <IoEllipsisHorizontalSharp />
          </DropdownMenuIcon>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <CopyItems isDisabled={props.isDisabled} args={args()} />
            <DropdownMenuSeparator />
            <TrackingItem
              isDisabled={props.isDisabled}
              onClick={props.onIsTrackingVisibleToggle}
            />
            <DropdownMenuSeparator />
            <DeleteItem isDisabled={props.isDisabled} onClick={onDeleteClick} />
            <DropdownMenuArrow />
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
      <DeleteUpdatedDialog
        id={props.id}
        isDisabled={props.isDisabled}
        isOpen={isWarningOpen()}
        onIsOpenChange={setIsWarningOpen}
      />
    </>
  );
};
