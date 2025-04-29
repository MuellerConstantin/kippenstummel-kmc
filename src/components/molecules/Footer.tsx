import React, { useMemo } from "react";
import { Link } from "@/components/atoms/Link";

export function Footer() {
  const navigation = useMemo(() => {
    return [{ name: "Home", href: "/" }];
  }, []);

  return (
    <div className="border-t border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="p-4 md:flex md:items-center md:justify-between">
        <span className="inline-flex flex-wrap space-x-2 text-sm sm:text-center">
          <span>
            © {new Date().getFullYear()}{" "}
            <Link href="https://github.com/MuellerConstantin">
              Constantin Müller
            </Link>
            .
          </span>
          <span>All Rights Reserved.</span>
        </span>
        <ul className="mt-3 flex flex-wrap items-center space-x-4 text-sm font-medium sm:mt-0">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
