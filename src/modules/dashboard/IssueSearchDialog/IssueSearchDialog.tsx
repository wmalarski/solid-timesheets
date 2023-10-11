import { debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { IoCloseSharp } from "solid-icons/io";
import {
  For,
  Suspense,
  createMemo,
  createSignal,
  type Component,
  type JSX,
} from "solid-js";
import { safeParseAsync } from "valibot";
import { Button } from "~/components/Button";
import {
  DialogCloseButton,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogPositioner,
  DialogTitle,
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
import { coercedNumber } from "~/utils/validation";

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
    const result = await safeParseAsync(coercedNumber(), rawIssueId);

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

type IssueSearchDialogProps = {
  issueId?: number;
  onIsOpenChange: (isOpen: boolean) => void;
  onIssueChange: (issueId: number) => void;
  title: string;
};

export const IssueSearchDialog: Component<IssueSearchDialogProps> = (props) => {
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
