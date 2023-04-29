import { Divider } from "~/components/Divider";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
  DropdownMenuPanel,
} from "~/components/DropdownMenu";

export const TimeEntryMenu = () => {
  return (
    <DropdownMenu defaultOpen={false}>
      {({ isOpen }) => (
        <>
          <DropdownMenuButton isOpen={isOpen()}>
            <span>Action</span>
            <DropdownMenuArrow isOpen={isOpen()} />
          </DropdownMenuButton>
          <DropdownMenuPanel isOpen={isOpen()} unmount={false}>
            <DropdownMenuList>
              <DropdownMenuItem as="button">
                Open Link in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem as="button">
                Open Link in New Window
              </DropdownMenuItem>
              <DropdownMenuItem as="button">
                Open Link in New Incognito Window
              </DropdownMenuItem>
              <Divider />
              <DropdownMenuItem as="button">Save Link As...</DropdownMenuItem>
              <DropdownMenuItem as="button">Copy Link Address</DropdownMenuItem>
              <Divider />
              <DropdownMenuItem as="button">Inspect</DropdownMenuItem>
            </DropdownMenuList>
          </DropdownMenuPanel>
        </>
      )}
    </DropdownMenu>
  );
};
