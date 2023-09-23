import { createWritableMemo } from "@solid-primitives/memo";
import { IoAddSharp, IoCloseSharp } from "solid-icons/io";
import {
  Suspense,
  createSignal,
  lazy,
  type Component,
  type JSX,
} from "solid-js";
import { Button } from "~/components/Button";
import {
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "~/components/Dialog";
import { useI18n } from "~/contexts/I18nContext";
import type { Issue } from "~/server/types";
import { createSheetEntryArgs, useTimeSheetContext } from "../../EntriesStore";
import { TimeEntryFields } from "../../TimeEntryFields";

const IssueCombobox = lazy(() =>
  import("../../IssueCombobox").then((module) => ({
    default: module.IssueCombobox,
  }))
);

type CreateEntryFormProps = {
  date: Date;
  initialIssueId: number;
  issues: Issue[];
  onCancelClick: VoidFunction;
};

const CreateEntryForm: Component<CreateEntryFormProps> = (props) => {
  const { t } = useI18n();

  const { setState } = useTimeSheetContext();

  const [comments, setComments] = createSignal("");
  const [hours, setHours] = createSignal(0);

  const [issueId] = createWritableMemo(() => props.initialIssueId);

  const onSubmit: JSX.IntrinsicElements["form"]["onSubmit"] = (event) => {
    event.preventDefault();

    createSheetEntryArgs({
      args: {
        comments: comments(),
        hours: hours(),
        issueId: issueId(),
        spentOn: props.date,
      },
      setState,
    });
  };

  return (
    <form class="flex flex-col gap-4" onSubmit={onSubmit}>
      <Suspense>
        <IssueCombobox issues={props.issues} />
      </Suspense>
      <TimeEntryFields
        comments={comments()}
        hours={hours()}
        issueId={props.issues[0].id}
        onCommentsChange={setComments}
        onHoursChange={setHours}
        onIssueChange={() => void 0}
      />
      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onCancelClick}
          type="button"
        >
          {t("dashboard.createDialog.cancel")}
        </Button>
        <Button type="submit" variant="outline" size="sm">
          {t("dashboard.createDialog.submit")}
        </Button>
      </div>
    </form>
  );
};

type CreateEntryDialogProps = {
  date: Date;
  issues: Issue[];
};

export const CreateEntryDialog: Component<CreateEntryDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  const onCancelClick = () => {
    setIsOpen(false);
  };

  return (
    <DialogRoot open={isOpen()} onOpenChange={setIsOpen}>
      <DialogTrigger
        aria-label={t("dashboard.createDialog.title")}
        shape="square"
        size="sm"
        variant="ghost"
      >
        <IoAddSharp />
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.createDialog.title")}</DialogTitle>
              <DialogCloseButton size="sm" variant="ghost" shape="square">
                <IoCloseSharp />
              </DialogCloseButton>
            </DialogHeader>
            <CreateEntryForm
              date={props.date}
              issues={props.issues}
              initialIssueId={props.issues[0].id}
              onCancelClick={onCancelClick}
            />
          </DialogContent>
        </DialogPositioner>
      </DialogPortal>
    </DialogRoot>
  );
};
