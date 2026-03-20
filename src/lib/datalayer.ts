/* ──────────────────────────────────────────────────────
   GTM DataLayer — Sequoia Speed
   Pushes events to window.dataLayer for GTM processing.
   Architecture: Code → dataLayer → GTM → GA4
   ────────────────────────────────────────────────────── */

export const GTM_ID = "GTM-PLL4V52";

/* ── Types ─────────────────────────────────────────── */

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
}

/* ── Core helper ───────────────────────────────────── */

function push(data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(data);
}

/** Clear previous ecommerce object, then push event */
function ecommercePush(eventName: string, ecommerceData: Record<string, unknown>) {
  push({ ecommerce: null }); // Clear previous ecommerce data (GA4 best practice)
  push({
    event: eventName,
    ecommerce: ecommerceData,
  });
}

export function event(name: string, params: Record<string, unknown> = {}) {
  push({ event: name, ...params });
}

/* ── Page views (SPA navigation) ───────────────────── */

export function pageview(url: string) {
  push({
    event: "page_view",
    page_path: url,
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}

/* ── E-commerce: Product List / Category ───────────── */

export function viewItemList(
  listName: string,
  listId: string,
  items: GA4Item[]
) {
  ecommercePush("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items.map((item, i) => ({
      ...item,
      item_brand: "Sequoia Speed",
      index: item.index ?? i,
    })),
  });
}

export function selectItem(listName: string, item: GA4Item) {
  ecommercePush("select_item", {
    item_list_name: listName,
    items: [{ ...item, item_brand: "Sequoia Speed" }],
  });
}

/* ── E-commerce: Product Detail ────────────────────── */

export function viewItem(item: GA4Item, value: number, currency = "COP") {
  ecommercePush("view_item", {
    currency,
    value,
    items: [{ ...item, item_brand: "Sequoia Speed" }],
  });
}

/* ── E-commerce: Cart ──────────────────────────────── */

export function addToCart(item: GA4Item, value: number, currency = "COP") {
  ecommercePush("add_to_cart", {
    currency,
    value,
    items: [{ ...item, item_brand: "Sequoia Speed" }],
  });
}

export function removeFromCart(item: GA4Item, value: number, currency = "COP") {
  ecommercePush("remove_from_cart", {
    currency,
    value,
    items: [{ ...item, item_brand: "Sequoia Speed" }],
  });
}

export function viewCart(items: GA4Item[], value: number, currency = "COP") {
  ecommercePush("view_cart", {
    currency,
    value,
    items: items.map((item) => ({ ...item, item_brand: "Sequoia Speed" })),
  });
}

/* ── E-commerce: Checkout ──────────────────────────── */

export function beginCheckout(items: GA4Item[], value: number, currency = "COP") {
  ecommercePush("begin_checkout", {
    currency,
    value,
    items: items.map((item) => ({ ...item, item_brand: "Sequoia Speed" })),
  });
}

export function addShippingInfo(
  items: GA4Item[],
  value: number,
  shippingTier: string,
  currency = "COP"
) {
  ecommercePush("add_shipping_info", {
    currency,
    value,
    shipping_tier: shippingTier,
    items: items.map((item) => ({ ...item, item_brand: "Sequoia Speed" })),
  });
}

export function addPaymentInfo(
  items: GA4Item[],
  value: number,
  paymentType: string,
  currency = "COP"
) {
  ecommercePush("add_payment_info", {
    currency,
    value,
    payment_type: paymentType,
    items: items.map((item) => ({ ...item, item_brand: "Sequoia Speed" })),
  });
}

export function purchase(
  transactionId: string,
  items: GA4Item[],
  value: number,
  shipping: number,
  currency = "COP"
) {
  ecommercePush("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    shipping,
    tax: 0,
    items: items.map((item) => ({ ...item, item_brand: "Sequoia Speed" })),
  });
}

/* ── Search ────────────────────────────────────────── */

export function search(searchTerm: string) {
  push({ event: "search", search_term: searchTerm });
}

/* ── Auth ──────────────────────────────────────────── */

export function login(method: string) {
  push({ event: "login", method });
}

export function signUp(method: string) {
  push({ event: "sign_up", method });
}

/* ── Engagement ────────────────────────────────────── */

export function share(contentType: string, itemId: string) {
  push({ event: "share", content_type: contentType, item_id: itemId });
}

export function selectContent(contentType: string, contentId: string) {
  push({ event: "select_content", content_type: contentType, content_id: contentId });
}
