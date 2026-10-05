"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon/Icon";
import type { IconName } from "@/components/Icon/icons";
import { stripWhitespace } from "@/lib/format";

const COPIED_MS = 1400;

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("copy failed");
};

type Props = {
  value: string;
  className: string;
  copiedClassName: string;
  icon?: IconName;
  size?: number;
  label?: string;
};

export function CopyButton({ value, className, copiedClassName, icon = "copy", size = 20, label }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await copyText(stripWhitespace(value));
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <button
      type="button"
      className={copied ? `${className} ${copiedClassName}` : className}
      onClick={copy}
      aria-label={copied ? "copied" : label ? `copy ${label}` : "copy to clipboard"}
    >
      <Icon name={copied ? "check" : icon} size={size} />
    </button>
  );
}
