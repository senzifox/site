import { HomePage, homeMetadata } from "./HomePage";

export const metadata = homeMetadata("ru");

export default function RuHome() {
  return <HomePage lang="ru" />;
}
