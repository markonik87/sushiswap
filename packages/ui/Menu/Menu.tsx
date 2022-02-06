import {
  FC,
  Fragment,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from "react";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { classNames } from "../lib/classNames";
import { MenuItems } from "./MenuItems";
import { MenuButton } from "./MenuButton";
import { MenuItem } from "./MenuItem";

interface MenuProps {
  className?: string;
  button: ReactNode;
  children: ReactElement<typeof HeadlessMenu.Items>;
}

const MenuRoot: FC<MenuProps> = ({ className, button, children }) => {
  return (
    <HeadlessMenu
      as="div"
      className={classNames(className, "relative inline-block text-left")}
    >
      <div>{button}</div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        {children}
      </Transition>
    </HeadlessMenu>
  );
};

export const Menu: FunctionComponent<MenuProps> & {
  Button: FC<MenuButton>;
  Items: FC<MenuItems>;
  Item: FC<MenuItem>;
} = Object.assign(MenuRoot, {
  Button: MenuButton,
  Items: MenuItems,
  Item: MenuItem,
});
