export const PAGE_VIEW_ENDPOINT = "/s";
export const SKIP_KEY = "skipgc";
export const SKIP_TOGGLE_HASH = "#toggle-goatcounter";

export type PageView = {
  path: string;
  title: string;
  referrer: string;
  query: string;
  width: number;
};

export const pageViewUrl = (view: PageView, rnd: string) => {
  const params = new URLSearchParams({ p: view.path, t: view.title, s: String(view.width) });
  if (view.referrer) params.set("r", view.referrer);
  if (view.query) params.set("q", view.query);
  params.set("rnd", rnd);
  return `${PAGE_VIEW_ENDPOINT}?${params}`;
};
