"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  LayoutGrid,
  Search,
  Shield,
  Gift,
  Network,
  Activity,
  ArrowLeftRight,
  Gamepad2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocalizedProducts, type Product } from "@/lib/products-content";
import { useTranslation } from "@/contexts/language-context";
import { useExperienceCopy } from "@/lib/experience-copy";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

type Category = "all" | "tools" | "learning" | "digital" | "entertainment";
function categoryOf(p: Product): Category {
  if (["vpn", "giftcards"].includes(p.slug)) return "digital";
  if (p.slug === "games") return "entertainment";
  if (p.status.startsWith("Educational")) return "learning";
  return "tools";
}
function iconOf(slug: string) {
  if (slug === "vpn") return Shield;
  if (slug === "giftcards") return Gift;
  if (slug === "referrals") return Network;
  if (slug === "swap") return ArrowLeftRight;
  if (slug === "games") return Gamepad2;
  if (
    slug.includes("learning") ||
    slug.includes("guide") ||
    slug.includes("education")
  )
    return BookOpen;
  if (slug.includes("analytics") || slug.includes("pulse")) return Activity;
  return LayoutGrid;
}
export default function ProductsPage() {
  const { locale } = useTranslation();
  const c = useExperienceCopy();
  const isAdmin = useIsAdmin();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const products = useMemo(
    () =>
      getLocalizedProducts(locale).filter((p) => p.slug !== "admin" || isAdmin),
    [locale, isAdmin],
  );
  const normalized = query.trim().toLocaleLowerCase(locale);
  const filtered = products.filter(
    (p) =>
      (category === "all" || categoryOf(p) === category) &&
      `${p.name} ${p.tagline} ${p.description}`
        .toLocaleLowerCase(locale)
        .includes(normalized),
  );
  const categories: { id: Category; label: string }[] = [
    { id: "all", label: c.allProducts },
    { id: "tools", label: c.tools },
    { id: "digital", label: c.digital },
    { id: "learning", label: c.learning },
    { id: "entertainment", label: c.entertainment },
  ];
  const featured = ["vpn", "giftcards", "prompt-guide"]
    .map((slug) => products.find((p) => p.slug === slug)!)
    .filter(Boolean);
  return (
    <div>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="eyebrow">{c.catalogEyebrow}</p>
          <h1>{c.catalogTitle}</h1>
          <p>{c.catalogBody}</p>
          <a
            href="#product-catalog"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            {c.explore}
            <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
          </a>
        </div>
        <div className="catalog-hero-image">
          <Image
            src="/images/experience/collection.webp"
            alt={c.collectionAlt}
            fill
            priority
            sizes="(max-width:768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </section>
      <div className="mb-5 mt-9">
        <h2 className="text-lg font-semibold">{c.featured}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{c.featuredNote}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {featured.map((p, i) => {
          const Icon = iconOf(p.slug);
          return (
            <Link
              href={p.href}
              key={p.slug}
              className={`featured-product featured-product-${i}`}
            >
              <div className="flex items-center justify-between">
                <span className="featured-product-icon">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-current/20 px-2.5 py-1 text-[10px]">
                  {p.statusLabel ?? p.status}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{p.tagline}</p>
              <span className="mt-6 flex items-center gap-2 text-xs font-semibold">
                {c.open}
                <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
              </span>
            </Link>
          );
        })}
      </div>
      <section id="product-catalog" className="scroll-mt-24 pt-10">
        <div className="catalog-toolbar">
          <h2 className="text-xl font-semibold">{c.allProducts}</h2>
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label={c.searchLabel}
              placeholder={c.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pe-10 ps-10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute end-1 top-1 rounded-lg p-2"
                aria-label={c.clear}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div
          className="mb-5 flex flex-wrap gap-2"
          role="group"
          aria-label={c.products}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              aria-pressed={category === cat.id}
              className={cn(
                "catalog-filter",
                category === cat.id && "selected",
              )}
            >
              {cat.label}
              <span>
                {products
                  .filter((p) => cat.id === "all" || categoryOf(p) === cat.id)
                  .length.toLocaleString(locale)}
              </span>
            </button>
          ))}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mb-4 text-xs text-muted-foreground"
        >
          {filtered.length.toLocaleString(locale)} {c.results}
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const Icon = iconOf(p.slug);
            return (
              <article key={p.slug} className="catalog-card">
                <div className="mb-5 flex items-center justify-between gap-2">
                  <span className="catalog-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      "product-status",
                      p.status === "Live"
                        ? "live"
                        : p.status === "Coming Soon"
                          ? "soon"
                          : "educational",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {p.statusLabel ?? p.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold leading-7">{p.name}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {p.tagline}
                </p>
                <details className="product-details">
                  <summary className="cursor-pointer py-3 text-xs text-muted-foreground">
                    {c.productDetails}
                  </summary>
                  <p className="mb-3 text-xs leading-6 text-muted-foreground">
                    {p.description}
                  </p>
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs leading-5"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </details>
                <Link href={p.href} className="catalog-card-link">
                  {c.open}
                  <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
                </Link>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
            <Search className="mx-auto mb-4 h-7 w-7 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{c.noResults}</h3>
            <p className="my-3 text-sm text-muted-foreground">
              {c.noResultsBody}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              {c.clear}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
