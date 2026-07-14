import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { HelpPageHeader } from "@/components/help/help-page-header";
import { HelpToc } from "@/components/help/help-toc";
import { HelpSection, HelpScreenshot } from "@/components/help/help-section";
import { WorkflowDiagram } from "@/components/learn/workflow-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HELP_FAQ, TROUBLESHOOTING } from "@/lib/help-content";

export const metadata = {
  title: "Help & User Guide - Round Dashboard",
  description: "How to use the Round Dashboard: wallet connection, registration, deposits, swap and more.",
};

export default function HelpPage() {
  return (
    <div>
      <HelpPageHeader />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <HelpToc />
        </aside>

        <div className="space-y-10">
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
              {HELP_FAQ.map((item) => (
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
                  {TROUBLESHOOTING.map((row) => (
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
        </div>
      </div>
    </div>
  );
}
