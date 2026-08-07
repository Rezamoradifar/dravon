import { HELP_FAQ, HELP_FAQ_FA } from "@/lib/help-content";

export interface AssistantEntry {
  question: string;
  answer: string;
}

// Everything the existing Help/FAQ page already covers, plus the newer
// SmartContract v2 mechanics (stages, weekly window, direct bonus %, error
// meanings) that predate that page's last update - kept here rather than
// merged into HELP_FAQ so the Help page's own curated list stays untouched.
const EXTRA_EN: AssistantEntry[] = [
  {
    question: "What are the pool health stages?",
    answer:
      "The contract measures pool health every round and sits in one of 4 stages: 1 Normal (15% weekly cut, 300 point ceiling), 2 Trim (10%, 200), 3 Conserve (5%, 150), 4 Floor (0%, 100). Better stages pay more generously; worse stages tighten to protect the pool. It's read from factory.stage() for right now, or window.stage() / getMainBulkInfo's stage_ for a specific past round.",
  },
  {
    question: "What is FlashRequired?",
    answer:
      "At stages 1-3, you get 2 top-ups between flashes (earning your balance down to zero). After that, chargeAccount reverts with FlashRequired until you flash. It's temporary and self-clearing - not the same as MaxReached, which means your balance is capped, not that you need to earn more first. Stage 4 has no such limit.",
  },
  {
    question: "What is the weekly $500 window?",
    answer:
      "A separate pool funded by 15% of every registration plus 0-15% of every top-up (stage-dependent). If your left leg AND right leg each reach $500 of volume within one week, you earn 1 weekly point (no cap - $1000/$1000 earns 2, etc). The whole subtree counts, and the smaller leg is what matters. Of every 4 points earned, 3 are paid; the 4th returns to the round pool.",
  },
  {
    question: "What is the direct referral bonus percentage?",
    answer:
      "15% of the entry's accounted value, paid immediately to your direct sponsor. On a $110 entry that's $15. (An earlier version of the contract paid 30% - that changed with the v2 upgrade; the other 15% now funds the weekly window instead.)",
  },
  {
    question: "Why does the pool never fully run out?",
    answer:
      "A geometric-decay payout floor: if the pool can't cover the full $3 point value, it pays 90% of whatever remains rather than 100%. Since it always pays a fraction of the remainder, mathematically the balance never hits exactly zero.",
  },
  {
    question: "What is the Referral Streak badge?",
    answer:
      "It counts consecutive rounds where you actually earned a direct bonus (someone registered or upgraded naming you as their direct sponsor), read straight from on-chain history via getUserRoundInfo. Tiers: Spark, Rising, Strong, Legendary.",
  },
  {
    question: "Where do I see the network's live stats?",
    answer: "The Network Pulse page (/pulse) shows big live numbers - total volume, this round's volume, users, points, the weekly pool - and has a fullscreen mode for presenting.",
  },
];

const EXTRA_FA: AssistantEntry[] = [
  {
    question: "مراحل سلامت استخر چیه؟",
    answer:
      "قرارداد هر راند سلامت استخر رو می‌سنجه و یکی از ۴ مرحله رو فعال می‌کنه: ۱ عادی (سهم هفتگی ۱۵٪، سقف امتیاز ۳۰۰)، ۲ کاهشی (۱۰٪، ۲۰۰)، ۳ احتیاط (۵٪، ۱۵۰)، ۴ کف (۰٪، ۱۰۰). مرحله‌ی بهتر یعنی پرداخت سخاوتمندانه‌تر. مرحله‌ی همین‌الان از factory.stage() خونده می‌شه؛ مرحله‌ی یک راند خاص از window.stage() یا stage_ تو getMainBulkInfo.",
  },
  {
    question: "خطای نیاز به فلش یعنی چی؟",
    answer:
      "تو مراحل ۱ تا ۳، بین دو فلش (خالی‌شدن کامل موجودی) فقط ۲ بار می‌تونی شارژ حساب کنی. بعدش تا فلش نکنی، شارژ حساب با خطای «نیاز به فلش» برمی‌گرده. این موقتیه و خودش برطرف می‌شه - با «سقف رسیده» (MaxReached) فرق داره؛ اون یعنی موجودیت پره. مرحله‌ی ۴ این محدودیت رو نداره.",
  },
  {
    question: "استخر هفتگی ۵۰۰ دلاری چیه؟",
    answer:
      "یه استخر جدا که از ۱۵٪ ثابت هر ثبت‌نام + بین ۰ تا ۱۵٪ هر شارژ حساب (بسته به مرحله) تأمین می‌شه. اگه پای چپ و راست زیرمجموعه‌ت هرکدوم تو یک هفته به ۵۰۰ دلار برسن، ۱ امتیاز هفتگی می‌گیری (بدون سقف). از هر ۴ امتیاز، ۳ تاش پرداخت می‌شه.",
  },
  {
    question: "درصد پاداش مستقیم چقدره؟",
    answer:
      "۱۵٪ از مبلغ حساب‌شده‌ی هر ثبت‌نام، بلافاصله به اسپانسر مستقیم واریز می‌شه. رو یه ثبت‌نام $۱۱۰، یعنی $۱۵. (نسخه‌ی قبلی قرارداد ۳۰٪ می‌داد - با آپدیت نسخه‌ی ۲ عوض شد؛ ۱۵٪ دیگه صرف استخر هفتگی می‌شه.)",
  },
  {
    question: "چرا استخر هیچ‌وقت کامل خالی نمی‌شه؟",
    answer:
      "یه مکانیزم کاهش هندسی: وقتی استخر نتونه کل ارزش ۳ دلاری هر امتیاز رو پوشش بده، به‌جای پرداخت کامل، فقط ۹۰٪ از باقی‌مانده رو پرداخت می‌کنه. چون همیشه فقط بخشی پرداخت می‌شه، از نظر ریاضی موجودی هیچ‌وقت دقیقاً صفر نمی‌شه.",
  },
  {
    question: "بج زنجیره‌ی معرفی چیه؟",
    answer:
      "تعداد راندهای پیاپی که واقعاً پاداش مستقیم گرفتی رو می‌شمره (یعنی کسی تو اون راند تو رو اسپانسر مستقیم خودش معرفی کرده)، مستقیم از تاریخچه‌ی زنجیره. سطح‌ها: جرقه، رو به رشد، قدرتمند، افسانه‌ای.",
  },
  {
    question: "آمار زنده‌ی شبکه رو کجا ببینم؟",
    answer: "صفحه‌ی «نبض شبکه» (/pulse) اعداد بزرگ و زنده (حجم کل، حجم این راند، کاربران، امتیاز، استخر هفتگی) رو نشون می‌ده و یه حالت تمام‌صفحه هم برای ارائه داره.",
  },
];

export function getAssistantKnowledge(locale: "en" | "fa"): AssistantEntry[] {
  return locale === "fa" ? [...HELP_FAQ_FA, ...EXTRA_FA] : [...HELP_FAQ, ...EXTRA_EN];
}
