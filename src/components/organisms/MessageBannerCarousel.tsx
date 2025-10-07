import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

interface MessageBannerProps {
  title: string;
  description: string;
  variant?: "default" | "success" | "error" | "info" | "warning";
}

const banner = tv({
  base: "border w-full h-full px-4 py-2",
  variants: {
    variant: {
      default:
        "bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100",
      success:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
      error:
        "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
      info: "bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
      warning:
        "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function MessageBanner(props: MessageBannerProps) {
  return (
    <div className={banner({ variant: props.variant })} role="alert">
      <div className="line-clamp-2 text-xs lg:line-clamp-1">
        <span className="font-semibold">{props.title}</span>
        &nbsp;
        <span>{props.description}</span>
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (props.messages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % props.messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [props.messages]);

  if (props.messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          layout
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-full w-full"
        >
          <MessageBanner {...props.messages[index]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
