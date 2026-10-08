"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Layers,
  Wallet,
  Globe2,
  ShieldCheck,
  Gamepad2,
  BookOpen,
  Network,
  Repeat2,
  Check,
  ChevronDown,
} from "lucide-react";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useTranslation } from "@/contexts/language-context";
import { LiveMarkets } from "@/components/landing/live-markets";
import { FACTORY_ADDRESS } from "@/contracts/addresses";
import { getLocalizedHelpFaq } from "@/lib/help-content";

export default function LandingPage() {
  const { locale } = useTranslation();
  const fa = locale === "fa";
  const text = (en: string, persian: string) => (fa ? persian : en);
  const modules = [
    {
      n: "01",
      icon: Network,
      title: text("Your network, connected.", "شبکه شما، یکپارچه."),
      detail: text(
        "Explore your genealogy, round statistics and account activity in one workspace.",
        "درخت شبکه، آمار دوره‌ها و فعالیت حساب را در یک فضای کاری دنبال کنید.",
      ),
      href: "/genealogy",
      tag: "NETWORK",
      links: [
        { href: "/weekly", label: text("Weekly fund", "صندوق هفتگی") },
        { href: "/pulse", label: text("Pulse", "پالس شبکه") },
      ],
    },
    {
      n: "02",
      icon: Repeat2,
      title: text("A gateway to the market.", "دروازه‌ای به بازار."),
      detail: text(
        "Access the integrated PancakeSwap interface and manage your wallet on BNB Chain.",
        "از رابط PancakeSwap برای مبادله و مدیریت کیف پول در شبکه BNB Chain استفاده کنید.",
      ),
      href: "/swap",
      tag: "EXCHANGE",
      links: [
        { href: "/charge", label: text("Charge account", "شارژ حساب") },
        { href: "/account", label: text("Account", "حساب کاربری") },
      ],
    },
    {
      n: "03",
      icon: Gamepad2,
      title: text("More ways to explore.", "فراتر از یک داشبورد."),
      detail: text(
        "Discover backgammon, digital products and practical Web3 learning resources.",
        "تخته‌نرد، محصولات دیجیتال و آموزش کاربردی وب۳ را کشف کنید.",
      ),
      href: "/games",
      tag: "DISCOVER",
      links: [
        { href: "/products", label: text("Products", "محصولات") },
        { href: "/learn", label: text("Learning center", "مرکز آموزش") },
      ],
    },
  ];
  const phases = [
    {
      state: text("AVAILABLE", "در دسترس"),
      title: text("Build the foundation", "ساخت زیرساخت"),
      detail: text(
        "Wallet connection, registration, round dashboard and network explorer.",
        "اتصال کیف پول، ثبت‌نام، داشبورد دوره‌ها و نمایش شبکه.",
      ),
      items: [
        text("Wallet & account", "کیف پول و حساب"),
        text("Network visibility", "شفافیت شبکه"),
      ],
      href: "/dashboard",
    },
    {
      state: text("THIS UPGRADE", "این ارتقا"),
      title: text("Elevate the experience", "ارتقای تجربه"),
      detail: text(
        "A refined project showcase, a clear growth roadmap and a live market observatory.",
        "ویترین حرفه‌ای پروژه، نقشه راه روشن و نمایش قیمت‌های زنده بازار.",
      ),
      items: [
        text("Premium showcase", "ویترین لوکس"),
        text("Live market feed", "قیمت زنده بازار"),
      ],
      href: "#markets",
    },
    {
      state: text("PROPOSED NEXT", "مرحله پیشنهادی بعد"),
      title: text("Grow with insight", "رشد با شناخت"),
      detail: text(
        "Prioritize community feedback, clearer analytics and a more guided onboarding journey.",
        "اولویت با بازخورد کاربران، تحلیل‌های روشن‌تر و مسیر ورود ساده‌تر.",
      ),
      items: [
        text("Community feedback", "بازخورد جامعه"),
        text("Onboarding refinement", "بهبود شروع کار"),
      ],
      href: "/help",
    },
    {
      state: text("FUTURE DIRECTION", "مسیر پیشنهادی آینده"),
      title: text("Expand responsibly", "توسعه هدفمند"),
      detail: text(
        "Evaluate new integrations after technical review, user demand and security validation.",
        "بررسی اتصال‌های جدید بر پایه نیاز کاربران، بازبینی فنی و ارزیابی امنیت.",
      ),
      items: [
        text("Integration research", "بررسی اتصال‌های جدید"),
        text("Security review", "بازبینی امنیت"),
      ],
      href: "/news",
    },
  ];
  return (
    <div className="dv-showcase">
      <header className="dv-header">
        <div className="dv-container dv-header-inner">
          <Link href="/" className="dv-brand" aria-label="Dravon home">
            <Layers size={24} />
            <span>
              DRAVON<small>THE CONNECTED ECOSYSTEM</small>
            </span>
          </Link>
          <nav
            aria-label={text("Main navigation", "منوی اصلی")}
            className="dv-nav"
          >
            <a href="#ecosystem">{text("Ecosystem", "اکوسیستم")}</a>
            <a href="#markets">{text("Live markets", "بازار زنده")}</a>
            <a href="#roadmap">{text("Roadmap", "نقشه راه")}</a>
          </nav>
          <div className="dv-header-actions">
            <LanguageToggle />
            <Link className="dv-button dv-button-small" href="/dashboard">
              {text("Launch app", "ورود به پنل")}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content">
        <section className="dv-hero dv-container">
          <div className="dv-hero-copy">
            <span className="dv-eyebrow">
              <span className="dv-gold-dot" />
              WEB3, WITH A NEW PERSPECTIVE
            </span>
            <h1>
              {text("A connected world.", "دنیایی یکپارچه.")}
              <em>{text("A refined experience.", "تجربه‌ای متمایز.")}</em>
            </h1>
            <p>
              {text(
                "Your network. Your markets. Your next move. Discover a considered space for everything you do on-chain.",
                "شبکه شما، بازار شما، قدم بعدی شما. فضایی منسجم برای مدیریت فعالیت‌های شما در دنیای بلاک‌چین.",
              )}
            </p>
            <div className="dv-hero-actions">
              <Link className="dv-button" href="/dashboard">
                {text("Enter the ecosystem", "ورود به اکوسیستم")}
                <ArrowUpRight size={18} />
              </Link>
              <a className="dv-text-link" href="#roadmap">
                {text("Explore our direction", "مسیر رشد پروژه")}
                <ArrowRight size={17} />
              </a>
            </div>
            <div className="dv-hero-trust">
              <span>
                <Globe2 size={15} />
                BNB CHAIN
              </span>
              <span>
                <Wallet size={15} />
                {text("Wallet-based access", "اتصال با کیف پول")}
              </span>
              <a
                href={`https://bscscan.com/address/${FACTORY_ADDRESS}#code`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ShieldCheck size={15} />
                {text("Explore the contract", "مشاهده قرارداد")}
              </a>
            </div>
          </div>
          <div className="dv-hero-art">
            <Image
              src="/images/hero-lattice.png"
              alt={text(
                "Connected architectural lattice representing the Dravon ecosystem",
                "ساختار شبکه‌ای متصل، نمادی از اکوسیستم دراوون",
              )}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <div className="dv-art-caption">
              <span>DRAVON / CONNECTED BY DESIGN</span>
              <span>01 — ∞</span>
            </div>
            <div className="dv-art-label">
              <span className="dv-gold-dot" />
              {text(
                "One ecosystem. Many possibilities.",
                "یک اکوسیستم. مسیرهای متنوع.",
              )}
            </div>
          </div>
          <a className="dv-scroll" href="#markets">
            <ChevronDown size={16} />
            {text("Discover Dravon", "دراوون را کشف کنید")}
          </a>
        </section>
        <div className="dv-container">
          <LiveMarkets />
          <section id="ecosystem" className="dv-section">
            <div className="dv-section-heading">
              <div>
                <span className="dv-eyebrow">THE ECOSYSTEM / 02</span>
                <h2>
                  {text(
                    "One place. A wider world.",
                    "یک فضا. دنیایی گسترده‌تر.",
                  )}
                </h2>
              </div>
              <Link className="dv-text-link" href="/products">
                {text("Explore all products", "همه محصولات")}
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="dv-module-grid">
              {modules.map((m) => (
                <article className="dv-module" key={m.n}>
                  <div className="dv-module-top">
                    <m.icon size={28} strokeWidth={1} />
                    <span>
                      {m.n} / {m.tag}
                    </span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.detail}</p>
                  <Link className="dv-module-link" href={m.href}>
                    {text("Explore", "مشاهده")}
                    <ArrowUpRight size={18} />
                  </Link>
                  <div className="dv-module-secondary">
                    {m.links.map((l) => (
                      <Link key={l.href} href={l.href}>
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="roadmap" className="dv-section dv-roadmap">
            <div className="dv-section-heading">
              <div>
                <span className="dv-eyebrow">THE WAY FORWARD / 03</span>
                <h2>
                  {text("Built for the next chapter.", "آماده فصل بعدی.")}
                </h2>
              </div>
              <p className="dv-section-intro">
                {text(
                  "A clear view of where we are, and the direction we propose to take next.",
                  "نمایی روشن از وضعیت فعلی و مسیر پیشنهادی برای رشد پروژه.",
                )}
              </p>
            </div>
            <div className="dv-roadmap-grid">
              {phases.map((p, i) => (
                <article
                  key={p.title}
                  className={`dv-phase ${i === 1 ? "dv-phase-active" : ""}`}
                >
                  <div className="dv-phase-number">
                    0{i + 1}
                    <span>
                      {i === 0 ? (
                        <Check size={16} />
                      ) : i === 1 ? (
                        <span className="dv-gold-dot" />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </span>
                  </div>
                  <span className="dv-phase-state">{p.state}</span>
                  <h3>{p.title}</h3>
                  <p>{p.detail}</p>
                  <ul>
                    {p.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link href={p.href} className="dv-text-link">
                    {text("Explore", "مشاهده")}
                    <ArrowUpRight size={14} />
                  </Link>
                </article>
              ))}
            </div>
            <p className="dv-roadmap-note">
              {text(
                "Future phases are proposed directions, not release commitments. Scope and timing will follow review and approval.",
                "مراحل آینده پیشنهاد توسعه هستند؛ دامنه و زمان اجرا پس از بررسی و تأیید مشخص می‌شود.",
              )}
            </p>
          </section>
          <section className="dv-section dv-entry">
            <div>
              <span className="dv-eyebrow">YOUR NEXT MOVE</span>
              <h2>{text("Make yourself at home.", "قدم بعدی، از اینجا.")}</h2>
              <p>
                {text(
                  "Connect your wallet, discover the dashboard, or start with our practical guide.",
                  "کیف پول خود را متصل کنید، وارد پنل شوید یا از راهنمای کاربردی شروع کنید.",
                )}
              </p>
            </div>
            <div className="dv-entry-actions">
              <Link href="/register" className="dv-button">
                {text("Get started", "شروع عضویت")}
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/help" className="dv-text-link">
                <BookOpen size={16} />
                {text("Read the guide", "راهنمای استفاده")}
              </Link>
            </div>
          </section>
          <section id="faq" className="dv-section dv-faq">
            <div>
              <span className="dv-eyebrow">GOOD TO KNOW / 04</span>
              <h2>{text("A little more clarity.", "پاسخ‌های روشن.")}</h2>
            </div>
            <div>
              {getLocalizedHelpFaq(locale)
                .slice(0, 4)
                .map((f, i) => (
                  <details key={i}>
                    <summary>
                      {f.question}
                      <ChevronDown size={16} />
                    </summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="dv-footer">
        <div className="dv-container">
          <div className="dv-footer-top">
            <div className="dv-footer-brand">
              <Link href="/" className="dv-brand">
                <Layers size={24} />
                <span>DRAVON</span>
              </Link>
              <p>
                {text(
                  "Connected by design.\nBuilt around you.",
                  "طراحی برای اتصال.\nساخته‌شده برای شما.",
                )}
              </p>
            </div>
            {[
              {
                title: text("Platform", "پلتفرم"),
                links: [
                  ["/dashboard", text("Dashboard", "داشبورد")],
                  ["/register", text("Register", "ثبت‌نام")],
                  ["/statistics", text("Statistics", "آمار")],
                  ["/history", text("History", "تاریخچه")],
                  ["/user", text("Wallet explorer", "جستجوی کیف پول")],
                ],
              },
              {
                title: text("Discover", "کشف کنید"),
                links: [
                  ["/games", text("Games", "بازی‌ها")],
                  ["/products", text("Products", "محصولات")],
                  ["/swap", text("Swap", "مبادله")],
                  ["/learn", text("Learn", "آموزش")],
                ],
              },
              {
                title: text("Resources", "منابع"),
                links: [
                  ["/help", text("Help", "راهنما")],
                  ["/news", text("Updates", "تازه‌ها")],
                  ["#roadmap", text("Roadmap", "نقشه راه")],
                  [
                    "/contract-actions",
                    text("Contract console", "کنسول قرارداد"),
                  ],
                  ["/admin", text("Admin", "مدیریت")],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map(([href, label]) => (
                  <Link href={href} key={href}>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="dv-footer-bottom">
            <span>© {new Date().getFullYear()} DRAVON</span>
            <span>
              {text(
                "On-chain actions involve real assets. Review every transaction.",
                "عملیات بلاک‌چین با دارایی واقعی انجام می‌شود؛ هر تراکنش را بررسی کنید.",
              )}
            </span>
            <span>BUILT ON BNB CHAIN ↗</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
