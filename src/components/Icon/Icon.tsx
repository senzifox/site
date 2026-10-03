import { type IconName, icons } from "./icons";

type Props = { name: IconName; size?: number; className?: string };

export function Icon({ name, size = 24, className }: Props) {
  const { viewBox, body } = icons[name];
  return (
    <svg
      className={className}
      viewBox={viewBox}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
