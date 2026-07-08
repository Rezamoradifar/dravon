import Image from "next/image";

import { Card } from "@/components/ui/card";

export function HelpSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4 border-t pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold tracking-tight">
        <span className="mr-2 text-muted-foreground">{number}.</span>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function HelpScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <Card className="card-glow overflow-hidden p-0">
      <Image src={src} alt={alt} width={1440} height={900} className="h-auto w-full" />
    </Card>
  );
}
