"use client";

import type { Account } from "@/config/invitation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CopyLineIcon } from "@/components/ui/icons";
import { copy } from "@/lib/copy";

/** 마음 전하실 곳 — 신랑측/신부측 접이식 계좌 목록 */
export function AccountAccordion({
  groups,
}: {
  groups: { title: string; accounts: Account[] }[];
}) {
  return (
    <Accordion type="multiple" className="border-t border-line">
      {groups.map((group) => (
        <AccordionItem key={group.title} value={group.title}>
          <AccordionTrigger>{group.title}</AccordionTrigger>
          <AccordionContent className="space-y-1">
            {group.accounts.map((a) => (
              <div
                key={a.number}
                className="flex items-center gap-3 bg-mist px-4 py-3"
              >
                <div className="flex-1">
                  <p className="type-body-sm font-medium">{a.holder}</p>
                  <p className="type-body-sm text-ink-soft">
                    {a.bank} {a.number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`${a.bank} ${a.number}`)}
                  className="type-meta flex items-center gap-1  border-line text-ink transition-colors active:bg-mist"
                >
                  <CopyLineIcon className="size-3.5" />
                  {/* 복사 */}
                </button>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
