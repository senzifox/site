import { Icon } from "@/components/Icon/Icon";
import type { Social } from "@/content/types";
import styles from "./SocialLinks.module.css";

export function SocialLinks({ items }: { items: Social[] }) {
  return items.map((item) => (
    <a
      key={item.label}
      className={styles.link}
      href={item.href}
      aria-label={item.label}
      {...(item.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <Icon name={item.icon} size={22} />
    </a>
  ));
}
