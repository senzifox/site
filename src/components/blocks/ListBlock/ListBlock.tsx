import { LabeledCard } from "@/components/Card/Card";
import { Chips } from "@/components/Chips/Chips";
import type { ListBlock as Props } from "@/content/types";

export function ListBlock({ label, items }: Props) {
  const entries = items.map((item) => item.trim()).filter(Boolean);

  if (entries.length === 0) return null;

  return (
    <LabeledCard label={label}>
      <Chips items={entries} />
    </LabeledCard>
  );
}
