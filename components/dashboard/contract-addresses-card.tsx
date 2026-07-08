import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AddressPill } from "@/components/shared/address-pill";
import { FACTORY_ADDRESS, WINDOW_ADDRESS } from "@/contracts/addresses";

export function ContractAddressesCard() {
  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          The factory that deploys round windows, and the window this dashboard is wired to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Factory</span>
          <AddressPill address={FACTORY_ADDRESS} chars={6} />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
          <span className="text-sm text-muted-foreground">Active Window</span>
          <AddressPill address={WINDOW_ADDRESS} chars={6} />
        </div>
      </CardContent>
    </Card>
  );
}
