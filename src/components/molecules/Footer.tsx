import { Link } from "@/components/atoms/Link";

export function Footer() {
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
      </div>
    </div>
  );
}
