"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocalizedProducts } from "@/lib/products-content";
import { useTranslation } from "@/contexts/language-context";

export default function ProductsPage() {
  const { t, locale } = useTranslation();
  const products = getLocalizedProducts(locale);

  return (
    <div>
      <PageHeader
        title={t("productsPage.title")}
        description={t("productsPage.description")}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {products.map((product) => (
          <Card key={product.slug} className="card-glow flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.tagline}</CardDescription>
                </div>
                <Badge variant={product.status === "Live" ? "success" : "secondary"}>
                  {product.statusLabel ?? product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <ul className="space-y-1.5">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-success" /> {feature}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-auto w-fit gap-1.5">
                <Link href={product.href}>
                  {t("productsPage.open")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
