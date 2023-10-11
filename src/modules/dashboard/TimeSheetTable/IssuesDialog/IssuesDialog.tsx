import { IoAddSharp, IoPencilSharp } from "solid-icons/io";
import { createSignal, type Component } from "solid-js";
import { DialogRoot, DialogTrigger } from "~/components/Dialog";
import { useI18n } from "~/contexts/I18nContext";
import { IssueSearchDialog } from "../../IssueSearchDialog";
import { createSheetEntryArgs, useTimeSheetContext } from "../EntriesStore";
import { IssueDetails } from "../IssueDetails";

type UpdateIssueDialogProps = {
  issueId: number;
  onIssueChange: (issueId: number) => void;
};

export const UpdateIssueDialog: Component<UpdateIssueDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <DialogRoot open={isOpen()} onOpenChange={setIsOpen}>
      <div class="flex justify-between gap-1">
        <IssueDetails issueId={props.issueId} />
        <DialogTrigger
          aria-label={t("dashboard.timeEntry.issue.title")}
          shape="square"
          size="sm"
        >
          <IoPencilSharp />
        </DialogTrigger>
      </div>
      <IssueSearchDialog
        issueId={props.issueId}
        onIsOpenChange={setIsOpen}
        onIssueChange={props.onIssueChange}
        title={t("dashboard.timeEntry.issue.title")}
      />
    </DialogRoot>
  );
};

type CreateIssueDialogProps = {
  date: Date;
};

export const CreateIssueDialog: Component<CreateIssueDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  const { setState } = useTimeSheetContext();

  const onIssueChange = (issueId: number) => {
    createSheetEntryArgs({
      args: {
        comments: "",
        hours: 0,
        issueId,
        spentOn: props.date,
      },
      setState,
    });
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
      <IssueSearchDialog
        onIsOpenChange={setIsOpen}
        onIssueChange={onIssueChange}
        title={t("dashboard.createDialog.title")}
      />
    </DialogRoot>
  );
};
