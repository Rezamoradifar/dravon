"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { HelpSection, HelpScreenshot } from "@/components/help/help-section";
import { WorkflowDiagram } from "@/components/learn/workflow-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getLocalizedHelpFaq, getLocalizedTroubleshooting } from "@/lib/help-content";
import { useTranslation } from "@/contexts/language-context";

function HelpContentEn() {
  const faq = getLocalizedHelpFaq("en");
  const troubleshooting = getLocalizedTroubleshooting("en");

  return (
    <>
      <HelpSection id="wallet-connection" number={1} title="Wallet Connection">
        <p>
          There is no username/password login. Your crypto wallet <strong>is</strong> your login.
          Connecting your wallet proves who you are and lets you sign transactions.
        </p>
        <p>
          <strong>Supported wallets:</strong> MetaMask, Trust Wallet, and any wallet supporting
          WalletConnect.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Click <strong>Connect Wallet</strong> in the top-right corner of any page.</li>
          <li>Choose your wallet from the list.</li>
          <li>Approve the connection request inside your wallet app.</li>
          <li>
            Make sure your wallet is switched to <strong>BNB Smart Chain</strong> - if it isn&apos;t, click
            the <strong>Switch network</strong> banner and confirm in your wallet.
          </li>
        </ol>
        <WorkflowDiagram
          steps={[
            { title: "Click Connect Wallet", description: "Top-right corner of any page." },
            { title: "Choose wallet app", description: "MetaMask, Trust Wallet, or WalletConnect." },
            { title: "Approve connection", description: "Confirm inside your wallet app." },
            { title: "Check network", description: "Switch to BNB Smart Chain if prompted." },
          ]}
        />
      </HelpSection>

      <HelpSection id="dashboard" number={2} title="Dashboard">
        <p>The Dashboard is the home page and gives a live snapshot of the current round:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Native token price, 24h change, gas price and network/block status</li>
          <li>Your connected wallet address and live balance</li>
          <li>Round ID, Latest Window, Point Value, token addresses, contract status</li>
          <li>Current Round Overview - users, points, entered volume, next binary pay</li>
          <li>Network growth chart and recent activity</li>
        </ul>
        <HelpScreenshot src="/help/dashboard.png" alt="Dashboard page" />
      </HelpSection>

      <HelpSection id="registration" number={3} title="Registration">
        <p>Registration is required once per wallet before you can do anything else on-chain.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Connect your wallet.</li>
          <li>Go to <strong>Register</strong> in the sidebar.</li>
          <li>Choose a package - Starter, Professional, or Enterprise.</li>
          <li>Enter a Direct Sponsor and Referral Sponsor address (or use auto-fill).</li>
          <li>Choose USDT (approve once, if needed) or BNB as your payment method.</li>
          <li>Click Register and confirm in your wallet.</li>
        </ol>
        <p>
          If your wallet is already registered, this page automatically links to Charge Account
          instead.
        </p>
        <HelpScreenshot src="/help/register.png" alt="Registration page" />
        <WorkflowDiagram
          steps={[
            { title: "Select a package", description: "Starter, Professional or Enterprise." },
            { title: "Enter sponsors", description: "Direct + referral sponsor addresses." },
            { title: "Choose payment", description: "USDT (approve) or BNB." },
            { title: "Confirm", description: "Sign in your wallet and wait for confirmation." },
          ]}
        />
      </HelpSection>

      <HelpSection id="deposit" number={4} title="Deposit Guide (Registration & Top-Up)">
        <p>
          &quot;Depositing&quot; means either registering (first time) or topping up to a higher
          package on the Charge Account page.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supported assets: USDT (BEP-20) or BNB, on BNB Smart Chain.</li>
          <li>Amounts are fixed per package: $11, $55, or $110.</li>
          <li>Status shown live: Awaiting signature → Pending → Success/Failed, with an explorer link.</li>
          <li>
            Top-ups only allow a strictly higher package than your current one (the $110 package can
            renew itself once its cap is reached).
          </li>
        </ul>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Common mistakes</AlertTitle>
          <AlertDescription>
            Sending USDT without approving first, sending less BNB than required, or trying to top up
            to the same or a lower package - all of these will fail the transaction (gas is spent, but
            no funds are lost beyond that).
          </AlertDescription>
        </Alert>
        <HelpScreenshot src="/help/charge.png" alt="Charge Account / Top-Up page" />
      </HelpSection>

      <HelpSection id="withdrawal" number={5} title="Withdrawal Guide">
        <Alert>
          <AlertDescription>
            <strong>There is no manual &quot;Withdraw&quot; button on this platform.</strong> This is
            intentional, not a missing feature.
          </AlertDescription>
        </Alert>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Direct and binary earnings are paid automatically - your share is sent directly to your
            wallet as a USDT transfer when the contract processes payouts.
          </li>
          <li>
            Your accumulated figures are visible any time on your Profile page - they reflect amounts
            already paid or currently available under the contract&apos;s rules.
          </li>
          <li>
            Terminating your account pays out your insurance/assurance balance, if eligible, directly
            to your wallet at that moment.
          </li>
        </ul>
      </HelpSection>

      <HelpSection id="profile" number={6} title="Profile (My Dashboard)">
        <p>The My Dashboard page shows a wallet&apos;s on-chain round data.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Shows your own wallet by default; search any other address.</li>
          <li>Cards: Round Points, Total Enter, Worth, Users, Direct Earned, Binary Earned, Earnable, Insurance Status.</li>
          <li>Round History shows the same wallet&apos;s points and income across recent rounds as charts.</li>
          <li>Genealogy visualizes your referral tree and gives you a shareable referral link with a QR code.</li>
        </ul>
        <HelpScreenshot src="/help/genealogy.png" alt="Genealogy / referral page" />
      </HelpSection>

      <HelpSection id="swap" number={7} title="Swap">
        <p>
          The Swap page lets you trade BNB and BEP-20 tokens directly through PancakeSwap&apos;s
          Router V2 contract. This is a real trading feature - every swap uses real funds.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Connect your wallet and confirm you&apos;re on BNB Smart Chain.</li>
          <li>Choose the tokens you&apos;re swapping from/to.</li>
          <li>Enter an amount - see the live quote, price impact and minimum received.</li>
          <li>Adjust slippage if needed, approve the token if prompted, then swap.</li>
        </ol>
        <HelpScreenshot src="/help/swap.png" alt="Swap page" />
      </HelpSection>

      <HelpSection id="learning-center" number={8} title="Learning Center">
        <p>
          The Learning Center is educational content only - blockchain concepts explained with
          diagrams and FAQs. The Simulator is a fully manual calculator you control - it does not use
          real funds and does not predict or promise any real-world outcome.
        </p>
        <HelpScreenshot src="/help/learning-center.png" alt="Learning Center page" />
      </HelpSection>

      <HelpSection id="statistics" number={9} title="Statistics">
        <p>
          The Statistics page lets you browse round-level data for any past round using the
          &quot;Rounds ago&quot; field: total users, round points, point value, entered volume, and
          next binary pay timing.
        </p>
        <HelpScreenshot src="/help/statistics.png" alt="Statistics page" />
      </HelpSection>

      <HelpSection id="account-settings" number={10} title="Account Settings">
        <p>The Account Actions page contains wallet-level actions, each behind a confirmation dialog:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Vote Shutdown</strong> - cast your vote to shut down the current round (once per round).</li>
          <li><strong>Reset Wallet Address</strong> - move your account to a different wallet. Cannot be undone.</li>
          <li><strong>Terminate Account</strong> - permanently close your account and pay out insurance, if eligible.</li>
        </ul>
        <p>
          There&apos;s also a low-level <Link href="/contract-actions" className="text-primary hover:underline">Contract Actions</Link> page
          exposing every write function directly, with live parameters, gas estimate, and transaction
          status.
        </p>
        <HelpScreenshot src="/help/account-actions.png" alt="Account Actions page" />
      </HelpSection>

      <HelpSection id="security" number={11} title="Security">
        <ul className="list-disc space-y-1 pl-5">
          <li>Never type your seed phrase or private key into this website or anywhere else.</li>
          <li>Read every transaction before approving it in your wallet.</li>
          <li>Double-check addresses before entering a sponsor or a new wallet address.</li>
          <li>Review token approvals periodically and revoke any you no longer need.</li>
          <li>Be alert to phishing - confirm the domain before connecting your wallet.</li>
        </ul>
      </HelpSection>

      <HelpSection id="faq" number={12} title="FAQ">
        <div className="space-y-3">
          {faq.map((item) => (
            <Card key={item.question}>
              <CardContent className="p-4">
                <p className="font-medium text-foreground">{item.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </HelpSection>

      <HelpSection id="troubleshooting" number={13} title="Troubleshooting">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symptom</TableHead>
                <TableHead>Likely cause</TableHead>
                <TableHead>What to do</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {troubleshooting.map((row) => (
                <TableRow key={row.symptom}>
                  <TableCell className="font-medium text-foreground">{row.symptom}</TableCell>
                  <TableCell>{row.cause}</TableCell>
                  <TableCell>{row.fix}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs">
          If a problem persists, note the exact error message and the transaction hash (if any) from
          the transaction status panel.
        </p>
      </HelpSection>
    </>
  );
}

function HelpContentFa() {
  const faq = getLocalizedHelpFaq("fa");
  const troubleshooting = getLocalizedTroubleshooting("fa");

  return (
    <>
      <HelpSection id="wallet-connection" number={1} title="اتصال کیف‌پول">
        <p>
          ورود با نام کاربری/رمز عبور وجود ندارد. کیف‌پول ارز دیجیتال شما <strong>همان</strong> ورود شماست.
          وصل کردن کیف‌پول ثابت می‌کند شما چه کسی هستید و اجازه می‌دهد تراکنش‌ها را امضا کنید.
        </p>
        <p>
          <strong>کیف‌پول‌های پشتیبانی‌شده:</strong> MetaMask، Trust Wallet، و هر کیف‌پولی که از
          WalletConnect پشتیبانی کند.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>روی <strong>اتصال کیف‌پول</strong> در گوشه بالای هر صفحه کلیک کنید.</li>
          <li>کیف‌پول خود را از لیست انتخاب کنید.</li>
          <li>درخواست اتصال را داخل اپلیکیشن کیف‌پول خود تأیید کنید.</li>
          <li>
            مطمئن شوید کیف‌پول شما روی <strong>BNB Smart Chain</strong> است - اگر نیست، روی بنر
            <strong> تغییر شبکه</strong> کلیک کرده و در کیف‌پول خود تأیید کنید.
          </li>
        </ol>
        <WorkflowDiagram
          steps={[
            { title: "کلیک روی اتصال کیف‌پول", description: "گوشه بالای هر صفحه." },
            { title: "انتخاب اپلیکیشن کیف‌پول", description: "MetaMask، Trust Wallet یا WalletConnect." },
            { title: "تأیید اتصال", description: "داخل اپلیکیشن کیف‌پول خود تأیید کنید." },
            { title: "بررسی شبکه", description: "در صورت درخواست، به BNB Smart Chain تغییر دهید." },
          ]}
        />
      </HelpSection>

      <HelpSection id="dashboard" number={2} title="داشبورد">
        <p>داشبورد صفحه اصلی است و نمای زنده‌ای از راند فعلی ارائه می‌دهد:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>قیمت توکن بومی، تغییر ۲۴ ساعته، قیمت گاز و وضعیت شبکه/بلاک</li>
          <li>آدرس کیف‌پول متصل شما و موجودی زنده</li>
          <li>شناسه راند، آخرین پنجره، ارزش پوینت، آدرس توکن‌ها، وضعیت قرارداد</li>
          <li>نمای کلی راند جاری - کاربران، امتیاز، حجم ورودی، پرداخت باینری بعدی</li>
          <li>نمودار رشد شبکه و فعالیت اخیر</li>
        </ul>
        <HelpScreenshot src="/help/dashboard.png" alt="صفحه داشبورد" />
      </HelpSection>

      <HelpSection id="registration" number={3} title="ثبت‌نام">
        <p>ثبت‌نام یک‌بار برای هر کیف‌پول لازم است، قبل از اینکه بتوانید هر کار دیگری روی زنجیره انجام دهید.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>کیف‌پول خود را وصل کنید.</li>
          <li>به <strong>ثبت‌نام</strong> در منو بروید.</li>
          <li>یک پکیج انتخاب کنید - استارتر، حرفه‌ای یا سازمانی.</li>
          <li>آدرس اسپانسر مستقیم و اسپانسر معرف را وارد کنید (یا از پر کردن خودکار استفاده کنید).</li>
          <li>USDT (تأیید یک‌بار، در صورت نیاز) یا BNB را به‌عنوان روش پرداخت انتخاب کنید.</li>
          <li>روی ثبت‌نام کلیک کرده و در کیف‌پول خود تأیید کنید.</li>
        </ol>
        <p>اگر کیف‌پول شما قبلاً ثبت‌نام کرده باشد، این صفحه به‌جای آن خودکار به شارژ حساب لینک می‌شود.</p>
        <HelpScreenshot src="/help/register.png" alt="صفحه ثبت‌نام" />
        <WorkflowDiagram
          steps={[
            { title: "انتخاب یک پکیج", description: "استارتر، حرفه‌ای یا سازمانی." },
            { title: "وارد کردن اسپانسرها", description: "آدرس‌های اسپانسر مستقیم و معرف." },
            { title: "انتخاب پرداخت", description: "USDT (تأیید) یا BNB." },
            { title: "تأیید", description: "در کیف‌پول خود امضا کرده و منتظر تأیید بمانید." },
          ]}
        />
      </HelpSection>

      <HelpSection id="deposit" number={4} title="راهنمای واریز (ثبت‌نام و شارژ حساب)">
        <p>«واریز» یعنی یا ثبت‌نام (اولین بار) یا شارژ به پکیج بالاتر در صفحه شارژ حساب.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>دارایی‌های پشتیبانی‌شده: USDT (BEP-20) یا BNB، روی BNB Smart Chain.</li>
          <li>مبالغ برای هر پکیج ثابت هستند: ۱۱، ۵۵ یا ۱۱۰ دلار.</li>
          <li>وضعیت به‌صورت زنده نشان داده می‌شود: در انتظار امضا → در انتظار → موفق/ناموفق، همراه با لینک اکسپلورر.</li>
          <li>
            شارژها فقط اجازه پکیج دقیقاً بالاتر از پکیج فعلی شما را می‌دهند (پکیج ۱۱۰ دلاری می‌تواند پس از رسیدن به سقف خودش تمدید شود).
          </li>
        </ul>
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>اشتباهات رایج</AlertTitle>
          <AlertDescription>
            ارسال USDT بدون تأیید قبلی، ارسال BNB کمتر از مقدار مورد نیاز، یا تلاش برای شارژ به همان پکیج یا پکیج پایین‌تر - همه این‌ها تراکنش را ناموفق می‌کنند (گاز صرف می‌شود، اما ضرر دیگری فراتر از آن نیست).
          </AlertDescription>
        </Alert>
        <HelpScreenshot src="/help/charge.png" alt="صفحه شارژ حساب / تاپ‌آپ" />
      </HelpSection>

      <HelpSection id="withdrawal" number={5} title="راهنمای برداشت">
        <Alert>
          <AlertDescription>
            <strong>هیچ دکمه دستی «برداشت» در این پلتفرم وجود ندارد.</strong> این عمدی است، نه یک ویژگی جاافتاده.
          </AlertDescription>
        </Alert>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            درآمدهای مستقیم و باینری به‌صورت خودکار پرداخت می‌شوند - سهم شما مستقیماً به‌صورت یک انتقال USDT به کیف‌پول شما ارسال می‌شود وقتی قرارداد پرداخت‌ها را پردازش می‌کند.
          </li>
          <li>
            ارقام انباشته‌شده شما هر زمان در صفحه پروفایل شما قابل‌مشاهده هستند - آن‌ها مبالغی را نشان می‌دهند که قبلاً پرداخت شده یا در حال حاضر تحت قوانین قرارداد در دسترس‌اند.
          </li>
          <li>
            خاتمه دادن حساب شما، موجودی بیمه/تضمین شما را، در صورت واجد شرایط بودن، مستقیماً در همان لحظه به کیف‌پول شما پرداخت می‌کند.
          </li>
        </ul>
      </HelpSection>

      <HelpSection id="profile" number={6} title="پروفایل (داشبورد من)">
        <p>صفحه داشبورد من داده آن‌چین راند یک کیف‌پول را نشان می‌دهد.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>به‌طور پیش‌فرض کیف‌پول خودتان را نشان می‌دهد؛ هر آدرس دیگری را جستجو کنید.</li>
          <li>کارت‌ها: امتیاز راند، کل ورودی، ارزش، کاربران، درآمد مستقیم، درآمد باینری، قابل‌کسب، وضعیت بیمه.</li>
          <li>تاریخچه راندها امتیاز و درآمد همان کیف‌پول را در راندهای اخیر به‌صورت نمودار نشان می‌دهد.</li>
          <li>شجره‌نامه درخت معرفی شما را تجسم می‌کند و یک لینک معرفی قابل‌اشتراک با کد QR به شما می‌دهد.</li>
        </ul>
        <HelpScreenshot src="/help/genealogy.png" alt="صفحه شجره‌نامه / معرفی" />
      </HelpSection>

      <HelpSection id="swap" number={7} title="تبدیل ارز">
        <p>
          صفحه تبدیل ارز به شما اجازه می‌دهد BNB و توکن‌های BEP-20 را مستقیماً از طریق قرارداد Router V2 پنکیک‌سواپ معامله کنید. این یک ویژگی معاملاتی واقعی است - هر تبدیل از سرمایه واقعی استفاده می‌کند.
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>کیف‌پول خود را وصل کرده و تأیید کنید روی BNB Smart Chain هستید.</li>
          <li>توکن‌هایی که می‌خواهید از/به آن‌ها تبدیل کنید انتخاب کنید.</li>
          <li>یک مبلغ وارد کنید - قیمت زنده، تأثیر قیمتی و حداقل دریافتی را ببینید.</li>
          <li>در صورت نیاز لغزش قیمت را تنظیم کنید، در صورت درخواست توکن را تأیید کنید، سپس تبدیل کنید.</li>
        </ol>
        <HelpScreenshot src="/help/swap.png" alt="صفحه تبدیل ارز" />
      </HelpSection>

      <HelpSection id="learning-center" number={8} title="مرکز آموزش">
        <p>
          مرکز آموزش فقط محتوای آموزشی است - مفاهیم بلاکچین با نمودار و سوالات متداول توضیح داده می‌شوند. شبیه‌ساز یک ماشین‌حساب کاملاً دستی تحت کنترل شماست - از سرمایه واقعی استفاده نمی‌کند و هیچ نتیجه واقعی را پیش‌بینی یا وعده نمی‌دهد.
        </p>
        <HelpScreenshot src="/help/learning-center.png" alt="صفحه مرکز آموزش" />
      </HelpSection>

      <HelpSection id="statistics" number={9} title="آمار">
        <p>
          صفحه آمار به شما اجازه می‌دهد داده سطح راند برای هر راند گذشته را با استفاده از فیلد «چند راند قبل» مرور کنید: کل کاربران، امتیاز راند، ارزش پوینت، حجم ورودی، و زمان‌بندی پرداخت باینری بعدی.
        </p>
        <HelpScreenshot src="/help/statistics.png" alt="صفحه آمار" />
      </HelpSection>

      <HelpSection id="account-settings" number={10} title="تنظیمات حساب">
        <p>صفحه عملیات حساب شامل عملیات سطح کیف‌پول است، هرکدام پشت یک دیالوگ تأیید:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>رأی به خاموشی</strong> - رأی خود را برای خاموش کردن راند فعلی ثبت کنید (یک‌بار در هر راند).</li>
          <li><strong>بازنشانی آدرس کیف‌پول</strong> - حساب خود را به کیف‌پول دیگری منتقل کنید. قابل بازگشت نیست.</li>
          <li><strong>خاتمه حساب</strong> - حساب خود را برای همیشه ببندید و بیمه را، در صورت واجد شرایط بودن، پرداخت کنید.</li>
        </ul>
        <p>
          همچنین یک صفحه سطح پایین <Link href="/contract-actions" className="text-primary hover:underline">عملیات قرارداد</Link> وجود دارد
          که هر تابع نوشتنی را مستقیماً، با پارامترهای زنده، تخمین گاز و وضعیت تراکنش نمایش می‌دهد.
        </p>
        <HelpScreenshot src="/help/account-actions.png" alt="صفحه عملیات حساب" />
      </HelpSection>

      <HelpSection id="security" number={11} title="امنیت">
        <ul className="list-disc space-y-1 pl-5">
          <li>هرگز عبارت بازیابی یا کلید خصوصی خود را در این وب‌سایت یا هر جای دیگری تایپ نکنید.</li>
          <li>قبل از تأیید هر تراکنش در کیف‌پول خود، آن را بخوانید.</li>
          <li>قبل از وارد کردن یک اسپانسر یا آدرس کیف‌پول جدید، آدرس‌ها را دوباره بررسی کنید.</li>
          <li>مجوزهای توکن را دوره‌ای بررسی کرده و هر کدام که دیگر نیاز ندارید را لغو کنید.</li>
          <li>مراقب فیشینگ باشید - قبل از وصل کردن کیف‌پول، دامنه را تأیید کنید.</li>
        </ul>
      </HelpSection>

      <HelpSection id="faq" number={12} title="سوالات متداول">
        <div className="space-y-3">
          {faq.map((item) => (
            <Card key={item.question}>
              <CardContent className="p-4">
                <p className="font-medium text-foreground">{item.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </HelpSection>

      <HelpSection id="troubleshooting" number={13} title="عیب‌یابی">
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>علامت</TableHead>
                <TableHead>علت احتمالی</TableHead>
                <TableHead>چه کاری انجام دهید</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {troubleshooting.map((row) => (
                <TableRow key={row.symptom}>
                  <TableCell className="font-medium text-foreground">{row.symptom}</TableCell>
                  <TableCell>{row.cause}</TableCell>
                  <TableCell>{row.fix}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs">
          اگر مشکل ادامه داشت، پیام خطای دقیق و هش تراکنش (در صورت وجود) را از پنل وضعیت تراکنش یادداشت کنید.
        </p>
      </HelpSection>
    </>
  );
}

export function HelpContent() {
  const { locale } = useTranslation();
  return locale === "fa" ? <HelpContentFa /> : <HelpContentEn />;
}
