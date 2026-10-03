import type { ReactNode } from "react";
import { Badge } from "@/components/Badge/Badge";
import { Card } from "@/components/Card/Card";
import { Icon } from "@/components/Icon/Icon";
import type { IconName } from "@/components/Icon/icons";
import type { CopyBlock as CopyProps, LinkBlock as LinkProps } from "@/content/types";
import { CopyButton } from "./CopyButton";
import styles from "./ValueBlock.module.css";

type Props = { icon: IconName; label: string; value: string; action: ReactNode };

function ValueCard({ icon, label, value, action }: Props) {
  return (
    <Card className={styles.card}>
      <Badge icon={icon} />
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      {action}
    </Card>
  );
}

export function CopyBlock({ icon, label, value }: CopyProps) {
  return (
    <ValueCard
      icon={icon}
      label={label}
      value={value}
      action={<CopyButton value={value} className={styles.action} copiedClassName={styles.copied} />}
    />
  );
}

export function LinkBlock({ icon, label, value, href }: LinkProps) {
  return (
    <ValueCard
      icon={icon}
      label={label}
      value={value}
      action={
        <a
          className={styles.action}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`open ${label}`}
        >
          <Icon name="openInNew" size={20} />
        </a>
      }
    />
  );
}
