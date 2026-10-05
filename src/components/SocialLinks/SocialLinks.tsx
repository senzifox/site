import { CopyButton } from "@/components/blocks/ValueBlock/CopyButton";
import { Icon } from "@/components/Icon/Icon";
import type { Social } from "@/content/types";
import styles from "./SocialLinks.module.css";

export function SocialLinks({ items }: { items: Social[] }) {
  return items.map((item) =>
    "copy" in item ? (
      <CopyButton
        key={item.label}
        value={item.copy}
        className={styles.link}
        copiedClassName={styles.copied}
        icon={item.icon}
        size={22}
        label={`${item.label} ${item.copy}`}
      />
    ) : (
      <a
        key={item.label}
        className={styles.link}
        href={item.href}
        aria-label={item.label}
        {...(item.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
      >
        <Icon name={item.icon} size={22} />
      </a>
    ),
  );
}
