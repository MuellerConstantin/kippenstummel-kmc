"use client";

import React, { useMemo } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu as MenuIcon, EllipsisVertical, LogOut } from "lucide-react";
import { MenuTrigger } from "react-aria-components";
import { Button } from "@/components/atoms/Button";
import { ListBox, ListBoxItem } from "@/components/atoms/ListBox";
import { Link } from "@/components/atoms/Link";
import { Switch } from "@/components/atoms/Switch";
import { Menu, MenuItem } from "@/components/molecules/Menu";
import { Popover } from "@/components/atoms/Popover";
import { useAppSelector, useAppDispatch } from "@/store";
import themeSlice from "@/store/slices/theme";

export function Navbar() {
  const navigation = useMemo(() => {
    return [{ name: "Home", href: "/" }];
  }, []);

  return (
    <nav className="relative border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="flex items-center justify-between space-x-10 p-4">
        <div className="md:hidden">
          <MenuTrigger>
            <Button variant="icon">
              <MenuIcon className="h-6 w-6" />
            </Button>
            <Menu>
              {navigation.map((item) => (
                <MenuItem
                  key={item.name}
                  id={`nav-${item.name}`}
                  href={item.href}
                >
                  {item.name}
                </MenuItem>
              ))}
            </Menu>
          </MenuTrigger>
        </div>
        <NextLink href="/">
          <div className="flex w-fit items-center justify-center md:space-x-4">
            <Image
              src="/images/logo.svg"
              width={42}
              height={32}
              className="h-6 -rotate-16 sm:h-9"
              alt="KMC"
            />
            <span className="hidden self-center text-xl font-semibold whitespace-nowrap md:block dark:text-white">
              KMC
            </span>
          </div>
        </NextLink>
        <div className="flex items-center space-x-4">
          <div className="hidden space-x-4 md:flex">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                {item.name}
              </Link>
            ))}
          </div>
          <div className="self-end">
            <NavbarOptionsMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavbarUnauthenticatedOptionsMenu() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <Popover className="entering:animate-in entering:fade-in entering:placement-bottom:slide-in-from-top-1 entering:placement-top:slide-in-from-bottom-1 exiting:animate-out exiting:fade-out exiting:placement-bottom:slide-out-to-top-1 exiting:placement-top:slide-out-to-bottom-1 fill-mode-forwards origin-top-left overflow-auto rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/10 outline-hidden dark:bg-slate-950 dark:ring-white/15">
      <Switch
        isSelected={darkMode}
        onChange={(newDarkMode) =>
          dispatch(themeSlice.actions.setDarkMode(newDarkMode))
        }
      >
        Dark Mode
      </Switch>
    </Popover>
  );
}

function NavbarAuthenticatedOptionsMenu() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <Popover className="entering:animate-in entering:fade-in entering:placement-bottom:slide-in-from-top-1 entering:placement-top:slide-in-from-bottom-1 exiting:animate-out exiting:fade-out exiting:placement-bottom:slide-out-to-top-1 exiting:placement-top:slide-out-to-bottom-1 fill-mode-forwards origin-top-left overflow-auto rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/10 outline-hidden dark:bg-zinc-950 dark:ring-white/15">
      <div className="flex w-[15rem] flex-col gap-4 overflow-hidden p-2">
        <div className="flex gap-4 overflow-hidden">
          <div className="flex flex-col gap-2 overflow-hidden">
            <div className="flex flex-col gap-1">
              <div className="truncate text-[1rem] font-bold text-slate-900 dark:text-slate-100">
                {session?.user?.name}
              </div>
            </div>
          </div>
        </div>
        <Switch
          isSelected={darkMode}
          onChange={(newDarkMode) =>
            dispatch(themeSlice.actions.setDarkMode(newDarkMode))
          }
        >
          Dark Mode
        </Switch>
        <ListBox>
          <ListBoxItem onAction={() => signOut({ callbackUrl: "/signin" })}>
            <div className="flex w-full items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </div>
          </ListBoxItem>
        </ListBox>
      </div>
    </Popover>
  );
}

export function NavbarOptionsMenu() {
  const { data: session, status } = useSession();

  const isAuthenticated = useMemo(
    () => status !== "loading" && session,
    [session, status],
  );

  return (
    <MenuTrigger>
      <Button variant="icon">
        <EllipsisVertical className="h-6 w-6" />
      </Button>
      {isAuthenticated ? (
        <NavbarAuthenticatedOptionsMenu />
      ) : (
        <NavbarUnauthenticatedOptionsMenu />
      )}
    </MenuTrigger>
  );
}
