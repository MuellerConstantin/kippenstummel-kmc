import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";
import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

interface MessageBannerProps {
  title: string;
  description: string;
  variant?: "default" | "success" | "error" | "info" | "warning";
}

const carousel = tv({
  base: `
  relative
  w-full
  border-b
  backdrop-blur
  bg-white
  dark:bg-slate-900
  border-slate-200
  dark:border-slate-800
  `,
});

const variantStyles = {
  default: {
    text: "text-slate-800 dark:text-slate-100",
    accent: "border-l-slate-400",
    progress: "bg-slate-500/40 dark:bg-slate-400/40",
  },
  info: {
    text: "text-sky-900 dark:text-sky-200",
    accent: "border-l-sky-500",
    progress: "bg-sky-500/40",
  },
  success: {
    text: "text-green-900 dark:text-green-200",
    accent: "border-l-green-500",
    progress: "bg-green-500/40",
  },
  warning: {
    text: "text-amber-900 dark:text-amber-200",
    accent: "border-l-amber-500",
    progress: "bg-amber-500/40",
  },
  error: {
    text: "text-red-900 dark:text-red-200",
    accent: "border-l-red-500",
    progress: "bg-red-500/40",
  },
};

const icons = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

function MessageBanner(props: MessageBannerProps) {
  const variant = props.variant ?? "default";
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 border-l-4 px-4 py-3 ${variantStyles[variant].accent} ${variantStyles[variant].text}`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      <div className="text-xs leading-snug">
        <span className="font-semibold">{props.title}</span>
        <span className="ml-1 opacity-80">{props.description}</span>
      </div>
    </div>
  );
}

export interface MessageBannerCarouselProps {
  messages: {
    title: string;
    description: string;
    variant?: "default" | "success" | "error" | "info" | "warning";
  }[];
}

export function MessageBannerCarousel(props: MessageBannerCarouselProps) {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  const INTERVAL = 10000;

  useEffect(() => {
    if (props.messages.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % props.messages.length);
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [props.messages.length]);

  if (props.messages.length === 0 || !visible) return null;

  const message = props.messages[index];
  const variant = message.variant ?? "default";

  return (
    <div className={carousel()}>
      <div className="relative flex items-center justify-between gap-4 overflow-hidden pr-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
          >
            <MessageBanner {...message} />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => setVisible(false)}
          className="cursor-pointer text-slate-400 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          aria-label="Hide"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {props.messages.length > 1 && (
        <div className="h-[2px] w-full overflow-hidden bg-black/5 dark:bg-white/10">
          <motion.div
            key={index}
            className={`h-full origin-left ${variantStyles[variant].progress}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: INTERVAL / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}
    </div>
  );
}
