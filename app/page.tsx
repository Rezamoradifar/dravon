"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  Network,
  BookOpen,
  UserRound,
  Wallet,
  Compass,
  CheckCheck,
  Menu,
  X,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Brand } from "@/components/experience/brand";
import { useExperienceCopy } from "@/lib/experience-copy";
import { useTranslation } from "@/contexts/language-context";
import { getLocalizedHelpFaq } from "@/lib/help-content";

export default function LandingPage() {
  const c = useExperienceCopy();
  const { locale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const features = [
    {
      title: c.overview,
      body: c.overviewBody,
      icon: LayoutDashboard,
      href: "/dashboard",
      number: "01",
    },
    {
      title: c.account,
      body: c.accountBody,
      icon: UserRound,
      href: "/user",
      number: "02",
    },
    {
      title: c.networkTitle,
      body: c.networkBody,
      icon: Network,
      href: "/genealogy",
      number: "03",
    },
    {
      title: c.academy,
      body: c.academyBody,
      icon: BookOpen,
      href: "/learn",
      number: "04",
    },
  ];
  const nav = [
    { label: c.products, href: "/products" },
    { label: c.learn, href: "/learn" },
    { label: c.help, href: "/help" },
  ];
  const faq = getLocalizedHelpFaq(locale).slice(0, 4);
  return (
    <div className="dr-landing">
      <a href="#main-content" className="skip-link">
        {c.skip}
      </a>
      <header className="landing-header">
        <div className="landing-container flex h-20 items-center justify-between gap-3">
          <Link href="/" aria-label={c.ecosystem}>
            <Brand />
          </Link>
          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label={c.navLabel}
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild className="hidden gap-2 lg:inline-flex">
              <Link href="/dashboard">
                {c.dashboard}
                <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? c.closeMenu : c.menu}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="landing-mobile-menu"
            className="landing-container space-y-1 border-t py-4 md:hidden"
            aria-label={c.navLabel}
          >
            {[...nav, { label: c.dashboard, href: "/dashboard" }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        )}
      </header>
      <main id="main-content">
        <section className="landing-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {c.ecosystem}
            </p>
            <h1 className="hero-title">
              {c.heroTitle}
              <br />
              <span>{c.heroAccent}</span>
            </h1>
            <p className="hero-description">{c.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-3">
                <Link href="/dashboard">
                  {c.dashboard}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/products">{c.explore}</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs leading-6 text-muted-foreground">
              {c.heroNote}
            </p>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/experience/network.webp"
              alt={c.networkAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="hero-image-caption">
              <span className="flex items-center gap-2 text-xs text-white/75">
                <Layers className="h-4 w-4" />
                {c.ecosystem}
              </span>
              <span className="text-[10px] tracking-[0.18em] text-white/50">
                CONNECTED BY DESIGN
              </span>
            </div>
          </div>
        </section>
        <div className="landing-container">
          <div className="trust-strip">
            <div>
              <Layers className="h-5 w-5 text-primary" />
              <span>{c.network}</span>
              <span className="hidden text-muted-foreground sm:inline">
                / {c.networkCaption}
              </span>
            </div>
            <div>
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>{c.selfCustody}</span>
            </div>
            <Link href="/help" className="text-primary">
              {c.help}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
            </Link>
          </div>
        </div>
        <section className="landing-container landing-section" id="features">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{c.builtFor}</p>
              <h2>{c.featuresTitle}</h2>
            </div>
            <p>{c.featuresBody}</p>
          </div>
          <div className="feature-grid">
            {features.map(({ title, body, icon: Icon, href, number }) => (
              <Link href={href} key={href} className="feature-card group">
                <div className="flex items-center justify-between">
                  <span className="feature-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {number}
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
                <ArrowUpRight className="mt-6 h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 rtl:-rotate-90" />
              </Link>
            ))}
          </div>
        </section>
        <section className="landing-container pb-16 md:pb-24" id="products">
          <div className="collection-feature">
            <div className="collection-image">
              <Image
                src="/images/experience/collection.webp"
                alt={c.collectionAlt}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="collection-copy">
              <p className="eyebrow">{c.collection}</p>
              <h2>{c.productsTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {c.productsBody}
              </p>
              <div className="my-6 flex flex-wrap gap-2">
                {[c.tools, c.digital, c.learning].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <Button asChild className="gap-2">
                <Link href="/products">
                  {c.allProducts}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="onboarding-section">
          <div className="landing-container py-16 md:py-20">
            <p className="eyebrow">{c.start}</p>
            <h2 className="section-title">{c.startTitle}</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                { title: c.stepOne, body: c.stepOneBody, icon: Compass },
                { title: c.stepTwo, body: c.stepTwoBody, icon: Wallet },
                { title: c.stepThree, body: c.stepThreeBody, icon: CheckCheck },
              ].map(({ title, body, icon: Icon }, i) => (
                <div key={title} className="step-card">
                  <div className="mb-5 flex items-center gap-4">
                    <span className="text-xs font-medium text-primary">
                      0{i + 1}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="landing-container landing-section faq-grid"
          id="faq"
        >
          <div>
            <p className="eyebrow">{c.faqLabel}</p>
            <h2 className="section-title">{c.faq}</h2>
            <Link
              href="/help"
              className="mt-6 inline-flex items-center gap-2 text-sm text-primary"
            >
              {c.faqLink}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
            </Link>
          </div>
          <div>
            {faq.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>
                  <span>{item.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="landing-container pb-16">
          <div className="closing-panel">
            <div>
              <p className="eyebrow">{c.ecosystem}</p>
              <h2 className="section-title">{c.ctaTitle}</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                {c.ctaBody}
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 gap-2">
              <Link href="/dashboard">
                {c.dashboard}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="grid gap-10 py-12 sm:grid-cols-3">
            <div>
              <Brand />
              <p className="mt-4 text-sm text-muted-foreground">{c.footer}</p>
            </div>
            {[
              {
                title: c.platform,
                links: [
                  { label: c.dashboard, href: "/dashboard" },
                  { label: c.user, href: "/user" },
                  { label: c.products, href: "/products" },
                ],
              },
              {
                title: c.resources,
                links: [
                  { label: c.learn, href: "/learn" },
                  { label: c.help, href: "/help" },
                  { label: c.preferences, href: "/account" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold">{col.title}</h3>
                <div className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-4 border-t py-6 text-xs leading-6 text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} · {c.ecosystem}</span>
            <p>{c.disclaimer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
