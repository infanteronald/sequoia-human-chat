"use client";

import { useEffect } from "react";
import * as gtag from "@/lib/datalayer";
import type { GA4Item } from "@/lib/datalayer";

interface Props {
  listName: string;
  listId: string;
  items: GA4Item[];
}

export function CategoryTracker({ listName, listId, items }: Props) {
  useEffect(() => {
    if (items.length > 0) {
      gtag.viewItemList(listName, listId, items);
    }
  }, [listName, listId, items]);

  return null;
}
