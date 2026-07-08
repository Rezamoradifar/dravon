"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function WorkflowDiagram({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
      {steps.map((step, index) => (
        <div key={step.title} className="flex flex-1 items-stretch gap-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className="card-glow flex-1 rounded-xl border bg-card p-4"
          >
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <p className="font-medium">{step.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
          </motion.div>
          {index < steps.length - 1 && (
            <div className="hidden items-center text-muted-foreground md:flex">
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
