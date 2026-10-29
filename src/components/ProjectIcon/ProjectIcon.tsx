import Image from "next/image";
import styles from "./ProjectIcon.module.css";

type Props = { name: string; src: string | null; className?: string };

export function ProjectIcon({ name, src, className }: Props) {
  const classes = className ? `${styles.icon} ${className}` : styles.icon;
  if (src) return <Image className={classes} src={src} alt="" width={120} height={120} />;
  return (
    <span className={`${classes} ${styles.letter}`} aria-hidden>
      {name.charAt(0).toLowerCase()}
    </span>
  );
}
