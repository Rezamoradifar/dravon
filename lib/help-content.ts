export interface HelpFaqItem {
  question: string;
  answer: string;
}

export const HELP_FAQ: HelpFaqItem[] = [
  {
    question: "Do I need an account or password?",
    answer: "No. Connecting your wallet is your login - there's no separate username/password.",
  },
  {
    question: "Which networks are supported?",
    answer:
      "The contract lives on BNB Smart Chain. The wallet connector supports switching networks, but all contract actions require BNB Smart Chain.",
  },
  {
    question: "Why can't I select a custom amount when registering?",
    answer:
      "The contract only accepts three fixed packages (10/50/100, i.e. $11/$55/$110). Any other amount is rejected on-chain.",
  },
  {
    question: "I sent BNB but got some of it back - is that a bug?",
    answer:
      "No. Paying with BNB sends slightly more than needed as a buffer; the contract swaps only the exact USDT amount required and automatically refunds the rest.",
  },
  {
    question: "Why is my Top-Up option greyed out?",
    answer:
      "You can only top up to a strictly higher package than your current one (except a $110 renewal, which has its own cap). The page shows the reason under any disabled option.",
  },
  {
    question: "Where do I see my earnings?",
    answer:
      "On the Profile / My Dashboard page - Direct Earned, Binary Earned, and Earnable are shown there and update as the contract processes payouts.",
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "You don't need to - earnings are sent to your wallet automatically. See the Withdrawal Guide section.",
  },
  {
    question: "Is the Swap page connected to real funds?",
    answer: "Yes. Unlike the Learning Center, Swap executes real trades with real funds via PancakeSwap.",
  },
  {
    question: "Is the Learning Center Simulator using real money?",
    answer: "No. Every number there is a manual input you control; no wallet or transaction is involved.",
  },
  {
    question: "Can I change my registered wallet address?",
    answer: "Yes, via Reset Wallet Address on the Account Actions page. This is permanent once confirmed.",
  },
  {
    question: "What happens if I terminate my account?",
    answer:
      "It's permanent for this round window. Any eligible insurance/assurance balance is paid out to your wallet at that moment.",
  },
  {
    question: "Why did my transaction revert?",
    answer: "See the Troubleshooting table below for the most common on-chain error messages and what they mean.",
  },
];

export interface TroubleshootingRow {
  symptom: string;
  cause: string;
  fix: string;
}

export const TROUBLESHOOTING: TroubleshootingRow[] = [
  {
    symptom: '"Connect Wallet" does nothing',
    cause: "Wallet extension not installed / blocked pop-up",
    fix: "Install MetaMask/Trust Wallet or allow the connection pop-up",
  },
  {
    symptom: '"Switch network" banner won\'t go away',
    cause: "Wallet still on the wrong chain",
    fix: "Click the banner, approve the network switch in your wallet",
  },
  {
    symptom: 'Transaction stuck on "Awaiting signature"',
    cause: "Wallet pop-up hidden behind another window, or dismissed",
    fix: "Check your wallet extension/app for a pending request",
  },
  {
    symptom: "InvalidStartBox error",
    cause: "Trying to register/top-up with a value other than the three valid packages",
    fix: "Only use the package cards shown on Register/Charge Account",
  },
  {
    symptom: "InsufficientPayment error",
    cause: "Sent too little BNB, or USDT allowance too low",
    fix: "Increase the BNB amount, or approve a sufficient USDT allowance",
  },
  {
    symptom: "UserNotFound error",
    cause: "Action requires a registered wallet, but this one isn't registered",
    fix: "Register first",
  },
  {
    symptom: "WindowClosed error",
    cause: "This round window has already closed",
    fix: "The Dashboard automatically switches to the latest round window - refresh the page and try again",
  },
  {
    symptom: "AlreadyVoted error",
    cause: "You already voted to shut down this round",
    fix: "No action needed - one vote per round is allowed",
  },
  {
    symptom: 'Swap quote shows "No liquidity route"',
    cause: "The selected token pair has no direct pool",
    fix: "Choose a different token pair",
  },
  {
    symptom: "Gas estimate fails silently",
    cause: "Wallet not connected, or invalid inputs",
    fix: "Fill in all required fields correctly, then try again",
  },
];

export interface HelpSection {
  id: string;
  title: string;
}

export const HELP_SECTIONS: HelpSection[] = [
  { id: "wallet-connection", title: "Wallet Connection" },
  { id: "dashboard", title: "Dashboard" },
  { id: "registration", title: "Registration" },
  { id: "deposit", title: "Deposit Guide" },
  { id: "withdrawal", title: "Withdrawal Guide" },
  { id: "profile", title: "Profile" },
  { id: "swap", title: "Swap" },
  { id: "learning-center", title: "Learning Center" },
  { id: "statistics", title: "Statistics" },
  { id: "account-settings", title: "Account Settings" },
  { id: "security", title: "Security" },
  { id: "faq", title: "FAQ" },
  { id: "troubleshooting", title: "Troubleshooting" },
];

export const HELP_FAQ_FA: HelpFaqItem[] = [
  {
    question: "آیا به حساب کاربری یا رمز عبور نیاز دارم؟",
    answer: "خیر. وصل کردن کیف‌پول شما همان ورود شماست - نیازی به نام کاربری/رمز عبور جداگانه نیست.",
  },
  {
    question: "کدام شبکه‌ها پشتیبانی می‌شوند؟",
    answer: "قرارداد روی BNB Smart Chain قرار دارد. کانکتور کیف‌پول امکان تغییر شبکه را دارد، اما همه عملیات قرارداد به BNB Smart Chain نیاز دارند.",
  },
  {
    question: "چرا نمی‌توانم هنگام ثبت‌نام یک مبلغ دلخواه انتخاب کنم؟",
    answer: "قرارداد فقط سه پکیج ثابت را می‌پذیرد (۱۰/۵۰/۱۰۰، یعنی ۱۱/۵۵/۱۱۰ دلار). هر مبلغ دیگری روی زنجیره رد می‌شود.",
  },
  {
    question: "BNB فرستادم ولی بخشی از آن برگشت - آیا این باگ است؟",
    answer: "خیر. پرداخت با BNB کمی بیشتر از نیاز به‌عنوان مازاد ارسال می‌کند؛ قرارداد فقط دقیقاً مبلغ USDT مورد نیاز را تبدیل می‌کند و بقیه را خودکار برمی‌گرداند.",
  },
  {
    question: "چرا گزینه شارژ حساب من خاکستری (غیرفعال) است؟",
    answer: "شما فقط می‌توانید به پکیجی دقیقاً بالاتر از پکیج فعلی خود شارژ کنید (به‌جز تمدید ۱۱۰ دلاری که سقف خودش را دارد). صفحه دلیل را زیر هر گزینه غیرفعال نشان می‌دهد.",
  },
  {
    question: "درآمدهایم را کجا می‌بینم؟",
    answer: "در صفحه پروفایل / داشبورد من - درآمد مستقیم، درآمد باینری و قابل‌کسب آنجا نمایش داده می‌شوند و با پردازش پرداخت‌ها توسط قرارداد به‌روز می‌شوند.",
  },
  {
    question: "چطور درآمدم را برداشت کنم؟",
    answer: "نیازی نیست - درآمدها به‌صورت خودکار به کیف‌پول شما ارسال می‌شوند. بخش راهنمای برداشت را ببینید.",
  },
  {
    question: "آیا صفحه تبدیل ارز به سرمایه واقعی متصل است؟",
    answer: "بله. برخلاف مرکز آموزش، تبدیل ارز معاملات واقعی با سرمایه واقعی از طریق پنکیک‌سواپ انجام می‌دهد.",
  },
  {
    question: "آیا شبیه‌ساز مرکز آموزش از پول واقعی استفاده می‌کند؟",
    answer: "خیر. هر عددی آنجا یک ورودی دستی تحت کنترل شماست؛ هیچ کیف‌پول یا تراکنشی درگیر نیست.",
  },
  {
    question: "آیا می‌توانم آدرس کیف‌پول ثبت‌شده‌ام را تغییر دهم؟",
    answer: "بله، از طریق «بازنشانی آدرس کیف‌پول» در صفحه عملیات حساب. این کار پس از تأیید دائمی است.",
  },
  {
    question: "اگر حسابم را خاتمه دهم چه اتفاقی می‌افتد؟",
    answer: "این کار برای این پنجره راند دائمی است. هر موجودی بیمه/تضمین واجد شرایط در آن لحظه به کیف‌پول شما پرداخت می‌شود.",
  },
  {
    question: "چرا تراکنش من برگشت خورد؟",
    answer: "جدول عیب‌یابی زیر را برای رایج‌ترین پیام‌های خطای روی زنجیره و معنی آن‌ها ببینید.",
  },
];

export const TROUBLESHOOTING_FA: TroubleshootingRow[] = [
  {
    symptom: 'دکمه «اتصال کیف‌پول» کاری نمی‌کند',
    cause: "افزونه کیف‌پول نصب نشده / پاپ‌آپ مسدود شده",
    fix: "MetaMask/Trust Wallet را نصب کنید یا اجازه پاپ‌آپ اتصال را بدهید",
  },
  {
    symptom: 'بنر «تغییر شبکه» از بین نمی‌رود',
    cause: "کیف‌پول هنوز روی شبکه اشتباه است",
    fix: "روی بنر کلیک کنید و تغییر شبکه را در کیف‌پول خود تأیید کنید",
  },
  {
    symptom: 'تراکنش روی «در انتظار امضا» گیر کرده',
    cause: "پاپ‌آپ کیف‌پول پشت پنجره دیگری پنهان شده، یا بسته شده",
    fix: "افزونه/اپلیکیشن کیف‌پول خود را برای یک درخواست در انتظار بررسی کنید",
  },
  {
    symptom: "خطای InvalidStartBox",
    cause: "تلاش برای ثبت‌نام/شارژ با مقداری غیر از سه پکیج معتبر",
    fix: "فقط از کارت‌های پکیج نمایش‌داده‌شده در صفحه ثبت‌نام/شارژ حساب استفاده کنید",
  },
  {
    symptom: "خطای InsufficientPayment",
    cause: "BNB کمتری ارسال شده، یا مجوز USDT کافی نیست",
    fix: "مبلغ BNB را افزایش دهید، یا مجوز USDT کافی تأیید کنید",
  },
  {
    symptom: "خطای UserNotFound",
    cause: "عملیات به یک کیف‌پول ثبت‌شده نیاز دارد، اما این یکی ثبت‌نام نکرده",
    fix: "ابتدا ثبت‌نام کنید",
  },
  {
    symptom: "خطای WindowClosed",
    cause: "این پنجره راند قبلاً بسته شده است",
    fix: "داشبورد به‌صورت خودکار به آخرین پنجره راند سوییچ می‌کند - صفحه را رفرش کرده و دوباره امتحان کنید",
  },
  {
    symptom: "خطای AlreadyVoted",
    cause: "شما قبلاً برای خاموش کردن این راند رأی داده‌اید",
    fix: "نیازی به اقدام نیست - فقط یک رأی در هر راند مجاز است",
  },
  {
    symptom: 'قیمت پیشنهادی تبدیل «مسیر نقدینگی یافت نشد» نشان می‌دهد',
    cause: "جفت توکن انتخاب‌شده استخر مستقیمی ندارد",
    fix: "یک جفت توکن دیگر انتخاب کنید",
  },
  {
    symptom: "تخمین گاز بی‌صدا ناموفق می‌شود",
    cause: "کیف‌پول وصل نیست، یا ورودی‌ها نامعتبرند",
    fix: "همه فیلدهای مورد نیاز را درست پر کنید، سپس دوباره امتحان کنید",
  },
];

export const HELP_SECTIONS_FA: HelpSection[] = [
  { id: "wallet-connection", title: "اتصال کیف‌پول" },
  { id: "dashboard", title: "داشبورد" },
  { id: "registration", title: "ثبت‌نام" },
  { id: "deposit", title: "راهنمای واریز" },
  { id: "withdrawal", title: "راهنمای برداشت" },
  { id: "profile", title: "پروفایل" },
  { id: "swap", title: "تبدیل ارز" },
  { id: "learning-center", title: "مرکز آموزش" },
  { id: "statistics", title: "آمار" },
  { id: "account-settings", title: "تنظیمات حساب" },
  { id: "security", title: "امنیت" },
  { id: "faq", title: "سوالات متداول" },
  { id: "troubleshooting", title: "عیب‌یابی" },
];

export function getLocalizedHelpFaq(locale: "en" | "fa" = "en"): HelpFaqItem[] {
  return locale === "fa" ? HELP_FAQ_FA : HELP_FAQ;
}

export function getLocalizedTroubleshooting(locale: "en" | "fa" = "en"): TroubleshootingRow[] {
  return locale === "fa" ? TROUBLESHOOTING_FA : TROUBLESHOOTING;
}

export function getLocalizedHelpSections(locale: "en" | "fa" = "en"): HelpSection[] {
  return locale === "fa" ? HELP_SECTIONS_FA : HELP_SECTIONS;
}
