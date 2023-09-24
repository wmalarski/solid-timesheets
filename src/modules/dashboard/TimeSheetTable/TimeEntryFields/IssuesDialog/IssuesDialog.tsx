import { debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { IoCloseSharp, IoPencilSharp } from "solid-icons/io";
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
import { IssueDetails } from "../../IssueDetails";

type RadioGroupProps = {
  defaultIssueId: number;
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
    <RadioGroupRoot name="issueId" defaultValue={String(props.defaultIssueId)}>
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
  issueId: number;
  onCancelClick: VoidFunction;
  onIssueChange: (issueId: number) => void;
};

const IssueSelector: Component<IssueSelectorProps> = (props) => {
  const { t } = useI18n();

  const [query, setQuery] = createSignal("");

  const searchQuery = createQuery(() => ({
    queryFn: (context) => getSearchServerQuery(context.queryKey),
    queryKey: getSearchKey({ limit: 5, query: query() }),
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
    <form class="flex flex-col gap-4" onSubmit={onSubmit}>
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

type UpdateIssueDialogProps = {
  issueId: number;
  onIssueChange: (issueId: number) => void;
};

export const UpdateIssueDialog: Component<UpdateIssueDialogProps> = (props) => {
  const { t } = useI18n();

  const [isOpen, setIsOpen] = createSignal(false);

  const onCancelClick = () => {
    setIsOpen(false);
  };

  const onIssueChange = (issueId: number) => {
    props.onIssueChange(issueId);
    setIsOpen(false);
  };

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
      <DialogPortal>
        <DialogOverlay />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dashboard.timeEntry.issue.title")}</DialogTitle>
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
    </DialogRoot>
  );
};
