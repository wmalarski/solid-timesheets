import { debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { IoAddSharp, IoCloseSharp, IoPencilSharp } from "solid-icons/io";
import {
  For,
  Suspense,
  createMemo,
  createSignal,
  type Component,
  type JSX,
} from "solid-js";
import { coerce, number, safeParseAsync } from "valibot";
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
import {
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemDescription,
  RadioGroupItemIndicator,
  RadioGroupItemInput,
  RadioGroupItemLabel,
  RadioGroupLabel,
  RadioGroupRoot,
} from "~/components/RadioGroup";
import {
  TextFieldInput,
  type TextFieldInputProps,
} from "~/components/TextField";
import { useI18n } from "~/contexts/I18nContext";
import {
  getSearchKey,
  getSearchServerQuery,
  type SearchOption,
} from "~/server/search";
import { createSheetEntryArgs, useTimeSheetContext } from "../EntriesStore";
import { IssueDetails } from "../IssueDetails";

type RadioGroupProps = {
  defaultIssueId?: number;
  onQueryChange: (query: string) => void;
  options: SearchOption[];
  query: string;
};

const RadioGroup: Component<RadioGroupProps> = (props) => {
  const { t } = useI18n();

  const [value, setValue] = createSignal("");

  const debouncedOnQueryChange = createMemo(() =>
    debounce(props.onQueryChange, 250)
  );

  const onInput: TextFieldInputProps["onInput"] = (event) => {
    const value = event.target.value;
    setValue(value);
    debouncedOnQueryChange()(value);
  };

  return (
    <RadioGroupRoot
      defaultValue={String(props.defaultIssueId)}
      name="issueId"
      required
      class="grow"
    >
      <RadioGroupLabel>{t("dashboard.timeEntry.issue.label")}</RadioGroupLabel>
      <div class="flex flex-col gap-2">
        <TextFieldInput
          onInput={onInput}
          placeholder={t("dashboard.timeEntry.issue.placeholder")}
          size="xs"
          type="text"
          value={value()}
          variant="bordered"
        />
        <Suspense>
          <For each={props.options}>
            {(option) => (
              <RadioGroupItem value={String(option.id)}>
                <RadioGroupItemInput />
                <RadioGroupItemControl>
                  <RadioGroupItemIndicator />
                </RadioGroupItemControl>
                <div class="flex flex-col items-start justify-center">
                  <RadioGroupItemDescription>
                    {option.title}
                  </RadioGroupItemDescription>
                  <RadioGroupItemLabel>{option.subject}</RadioGroupItemLabel>
                </div>
              </RadioGroupItem>
            )}
          </For>
        </Suspense>
      </div>
    </RadioGroupRoot>
  );
};

type IssueSelectorProps = {
  issueId?: number;
  onCancelClick: VoidFunction;
  onIssueChange: (issueId: number) => void;
};

const IssueSelector: Component<IssueSelectorProps> = (props) => {
  const { t } = useI18n();

  const [query, setQuery] = createSignal("");

  const searchQuery = createQuery(() => ({
    queryFn: (context) => getSearchServerQuery(context.queryKey),
    queryKey: getSearchKey({ limit: 10, query: query() }),
  }));

  const onSubmit: JSX.IntrinsicElements["form"]["onSubmit"] = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawIssueId = formData.get("issueId");
    const result = await safeParseAsync(coerce(number(), Number), rawIssueId);

    if (!result.success) {
      return;
    }

    props.onIssueChange(result.output);
  };

  const onQueryChange = (query: string) => {
    setQuery(query);
  };

  return (
    <form
      class="flex min-h-[50vh] w-96 max-w-lg flex-col gap-4"
      onSubmit={onSubmit}
    >
      <RadioGroup
        defaultIssueId={props.issueId}
        onQueryChange={onQueryChange}
        options={searchQuery.data || []}
        query={query()}
      />
      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onCancelClick}
          type="button"
        >
          {t("dashboard.timeEntry.issue.cancel")}
        </Button>
        <Button type="submit" variant="outline" size="sm">
          {t("dashboard.timeEntry.issue.submit")}
        </Button>
      </div>
    </form>
  );
};

type PortalProps = {
  issueId?: number;
  onIsOpenChange: (isOpen: boolean) => void;
  onIssueChange: (issueId: number) => void;
  title: string;
};

const Portal: Component<PortalProps> = (props) => {
  const onCancelClick = () => {
    props.onIsOpenChange(false);
  };

  const onIssueChange = (issueId: number) => {
    props.onIssueChange(issueId);
    props.onIsOpenChange(false);
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPositioner>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogCloseButton size="sm" variant="ghost" shape="square">
              <IoCloseSharp />
            </DialogCloseButton>
          </DialogHeader>
          <IssueSelector
            onCancelClick={onCancelClick}
            issueId={props.issueId}
            onIssueChange={onIssueChange}
          />
        </DialogContent>
      </DialogPositioner>
    </DialogPortal>
  );
};

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
      <Portal
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
      <Portal
        onIsOpenChange={setIsOpen}
        onIssueChange={onIssueChange}
        title={t("dashboard.createDialog.title")}
      />
    </DialogRoot>
  );
};
