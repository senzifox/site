import { Icon } from "@/components/Icon/Icon";
import type { IconName } from "@/components/Icon/icons";
import styles from "./Badge.module.css";

export function Badge({ icon }: { icon: IconName }) {
  return (
    <div className={styles.badge}>
      <Icon name={icon} size={22} />
    </div>
  );
}
