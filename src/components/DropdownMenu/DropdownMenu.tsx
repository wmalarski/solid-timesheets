import {
  Menu,
  MenuItem,
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  type MenuItemProps,
  type MenuProps,
  type PopoverButtonProps,
  type PopoverPanelProps,
  type PopoverProps,
} from "solid-headless";
import { splitProps, type Component, type ValidComponent } from "solid-js";
import { ChevronDownIcon } from "../Icons/ChevronDownIcon";
import { twCx } from "../utils/twCva";

export const DropdownMenuItem = <T extends ValidComponent = "li">(
  props: MenuItemProps<T>
) => {
  return (
    <MenuItem
      {...props}
      class={twCx(
        "p-1 text-left text-sm hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white focus:outline-none",
        props.class
      )}
    />
  );
};

export const DropdownMenuList = (props: MenuProps) => {
  return (
    <Menu
      {...props}
      class={twCx(
        "flex w-64 flex-col space-y-1 overflow-hidden rounded-lg bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5",
        props.class
      )}
    />
  );
};

type DropdownMenuArrowProps = {
  isOpen: boolean;
};

export const DropdownMenuArrow: Component<DropdownMenuArrowProps> = (props) => {
  return (
    <ChevronDownIcon
      aria-hidden="true"
      class={twCx(
        props.isOpen ? "text-opacity-70" : null,
        "ml-2 h-5 w-5 text-purple-300 group-hover:text-opacity-80 transition ease-in-out duration-150"
      )}
    />
  );
};

type DropdownMenuButtonProps = PopoverButtonProps & {
  isOpen: boolean;
};

export const DropdownMenuButton = (props: DropdownMenuButtonProps) => {
  const [split, rest] = splitProps(props, ["isOpen"]);

  return (
    <PopoverButton
      {...rest}
      class={twCx(
        split.isOpen ? "text-opacity-90" : null,
        "btn btn-xs",
        rest.class
      )}
    />
  );
};

type DropdownMenuPanelProps = PopoverPanelProps & {
  isOpen: boolean;
};

export const DropdownMenuPanel: Component<DropdownMenuPanelProps> = (props) => {
  const [split, rest] = splitProps(props, ["isOpen"]);

  return (
    <Transition
      show={split.isOpen}
      class="z-40"
      enter="transition duration-200"
      enterFrom="opacity-0 -translate-y-1 scale-50"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition duration-150"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 -translate-y-1 scale-50"
    >
      <PopoverPanel
        {...rest}
        class={twCx(
          "absolute left-1/2 z-40 mt-3 -translate-x-1/2 px-4 sm:px-0 lg:max-w-3xl",
          rest.class
        )}
      />
    </Transition>
  );
};

export const DropdownMenu: Component<PopoverProps> = (props) => {
  return <Popover {...props} class={twCx("relative", props.class)} />;
};
