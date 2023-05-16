import { DropdownMenu as KobalteDropdownMenu } from "@kobalte/core";
import type { VariantProps } from "class-variance-authority";
import { createSignal, onMount, splitProps, type Component } from "solid-js";
import { buttonClass } from "../Button";
import { twCva, twCx } from "../utils/twCva";
import styles from "./DropdownMenu.module.css";

export const DropdownMenuRoot = KobalteDropdownMenu.Root;

export type DropdownMenuTriggerProps =
  KobalteDropdownMenu.DropdownMenuTriggerProps &
    VariantProps<typeof buttonClass>;

export const DropdownMenuTrigger: Component<DropdownMenuTriggerProps> = (
  props
) => {
  const [split, rest] = splitProps(props, [
    "color",
    "isLoading",
    "size",
    "variant",
  ]);

  return (
    <KobalteDropdownMenu.Trigger
      {...rest}
      class={buttonClass({ class: props.class, ...split })}
    />
  );
};

export const DropdownMenuIcon: Component<
  KobalteDropdownMenu.DropdownMenuIconProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Icon
      {...props}
      class={twCx("h-4 w-4 rotate-0", "ui-expanded:rotate-180", props.class)}
    />
  );
};

export const DropdownMenuPortal = KobalteDropdownMenu.Portal;

export const dropdownMenuContentClass = twCva([
  "min-w-[220px] p-2 bg-white shadow-sm outline-none",
  styles.content,
]);

export const DropdownMenuContent: Component<
  KobalteDropdownMenu.DropdownMenuContentProps
> = (props) => {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  onMount(() => {
    ref()?.parentElement?.classList.add(styles.portal);
  });

  return (
    <KobalteDropdownMenu.Content
      {...props}
      ref={setRef}
      class={dropdownMenuContentClass({ class: props.class })}
    />
  );
};

export const DropdownMenuArrow: Component<
  KobalteDropdownMenu.DropdownMenuArrowProps
> = (props) => {
  return <KobalteDropdownMenu.Arrow {...props} class={twCx("", props.class)} />;
};

export const DropdownMenuSeparator: Component<
  KobalteDropdownMenu.DropdownMenuSeparatorProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Separator
      {...props}
      class={twCx("h-px m-1.5 border-[1px] border-base-300", props.class)}
    />
  );
};

export const DropdownMenuGroup: Component<
  KobalteDropdownMenu.DropdownMenuGroupProps
> = (props) => {
  return <KobalteDropdownMenu.Group {...props} class={twCx("", props.class)} />;
};

export const DropdownMenuGroupLabel: Component<
  KobalteDropdownMenu.DropdownMenuGroupLabelProps
> = (props) => {
  return (
    <KobalteDropdownMenu.GroupLabel
      {...props}
      class={twCx("px-6 text-sm leading-[32px] text-base-200", props.class)}
    />
  );
};

export const DropdownMenuSub = KobalteDropdownMenu.Sub;

export const dropdownMenuItemClass = twCva([
  "relative flex h-8 select-none items-center pl-2 pr-6 text-base leading-none outline-none",
  "ui-disabled:opacity-50 ui-disabled:pointer-events-none",
  "ui-highlighted:outline-none ui-highlighted:bg-base-100",
]);

export const dropdownMenuSubTriggerClass = twCva([
  dropdownMenuItemClass,
  "ui-expanded:bg-white ui-expanded:text-accent-content",
]);

export const DropdownMenuSubTrigger: Component<
  KobalteDropdownMenu.DropdownMenuSubTriggerProps
> = (props) => {
  return (
    <KobalteDropdownMenu.SubTrigger
      {...props}
      class={dropdownMenuSubTriggerClass({ class: props.class })}
    />
  );
};

export const DropdownMenuSubContent: Component<
  KobalteDropdownMenu.DropdownMenuSubContentProps
> = (props) => {
  return (
    <KobalteDropdownMenu.SubContent
      {...props}
      class={dropdownMenuContentClass({ class: props.class })}
    />
  );
};

export const DropdownMenuItem: Component<
  KobalteDropdownMenu.DropdownMenuItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.Item
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};

export const DropdownMenuItemLabel: Component<
  KobalteDropdownMenu.DropdownMenuItemLabelProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemLabel {...props} class={twCx("", props.class)} />
  );
};

export const DropdownMenuItemDescription: Component<
  KobalteDropdownMenu.DropdownMenuItemDescriptionProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemDescription
      {...props}
      class={twCx("", props.class)}
    />
  );
};

export const DropdownMenuItemIndicator: Component<
  KobalteDropdownMenu.DropdownMenuItemIndicatorProps
> = (props) => {
  return (
    <KobalteDropdownMenu.ItemIndicator
      {...props}
      class={twCx(
        "absolute left-0 h-4 w-4 inline-flex items-center justify-center",
        props.class
      )}
    />
  );
};

export const DropdownMenuRadioGroup = KobalteDropdownMenu.RadioGroup;

export const DropdownMenuRadioItem: Component<
  KobalteDropdownMenu.DropdownMenuRadioItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.RadioItem
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};

export const DropdownMenuCheckboxItem: Component<
  KobalteDropdownMenu.DropdownMenuCheckboxItemProps
> = (props) => {
  return (
    <KobalteDropdownMenu.CheckboxItem
      {...props}
      class={dropdownMenuItemClass({ class: props.class })}
    />
  );
};
