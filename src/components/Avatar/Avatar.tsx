import { preload } from "react-dom";
import { AvatarStage } from "./AvatarStage";
import { avatars } from "./silhouette";

export const AVATAR_SIZE = 220;

export function Avatar({ alt }: { alt: string }) {
  preload(avatars[0].photo, { as: "image", fetchPriority: "high" });
  return <AvatarStage alt={alt} size={AVATAR_SIZE} />;
}
