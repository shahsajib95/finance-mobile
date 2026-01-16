"use client";

import * as React from "react";
import { store } from "@/lib/store";

export function useLiabilities() {
  const [, force] = React.useState(0);

  React.useEffect(() => {
    const on = () => force((x) => x + 1);
    window.addEventListener("finance_db_changed", on);
    return () => window.removeEventListener("finance_db_changed", on);
  }, []);

  return store.getLiabilities();
}
