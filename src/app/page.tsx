import type { CSSProperties } from "react";
import { AVATAR_SIZE, Avatar } from "@/components/Avatar/Avatar";
import { Background } from "@/components/Background/Background";
import { Blocks } from "@/components/blocks/Blocks";
import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { SocialLinks } from "@/components/SocialLinks/SocialLinks";
import { site } from "@/content/site";
import { headerCssVars } from "@/lib/scroll";
import styles from "./page.module.css";

export default function Home() {
  const { header, blocks, footer } = site;

  return (
    <div style={headerCssVars as CSSProperties}>
      <Background />
      <Header
        avatar={<Avatar alt={header.name} />}
        avatarSize={AVATAR_SIZE}
        name={header.name}
        lineAbove={header.lineAbove}
        lineBelow={header.lineBelow}
        socials={<SocialLinks items={header.socials} />}
      />
      <main className={styles.main}>
        <Blocks blocks={blocks} />
        {footer && <Footer {...footer} />}
      </main>
    </div>
  );
}
