"use client";

import { type ComponentType, useEffect, useState } from "react";

export function DevMenu() {
  const [Menu, setMenu] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    import("./Menu").then((module) => setMenu(() => module.Menu));
  }, []);

  return Menu ? <Menu /> : null;
}
