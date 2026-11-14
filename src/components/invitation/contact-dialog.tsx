"use client";

import type { Contact } from "@/config/invitation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatIcon, PhoneIcon } from "@/components/ui/icons";

/** "연락하기" 버튼 → 양가 연락처 다이얼로그 (전화 / 문자) */
export function ContactDialog({
  groom,
  bride,
}: {
  groom: Contact[];
  bride: Contact[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>연락하기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Contact.</DialogTitle>
        <DialogDescription>축하의 마음을 전해주세요</DialogDescription>
        <div className="mt-6 space-y-6">
          <ContactGroup label="Groom." list={groom} />
          <ContactGroup label="Bride." list={bride} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactGroup({ label, list }: { label: string; list: Contact[] }) {
  return (
    <div>
      <p className="type-label mb-1">{label}</p>
      <ul className="divide-y divide-line border-y border-line">
        {list.map((c) => (
          <li key={c.role} className="flex items-center gap-3 py-3">
            <span className="type-meta w-20 shrink-0">{c.role}</span>
            <span className="type-body flex-1 font-medium">{c.name}</span>
            <a
              href={`tel:${c.phone}`}
              aria-label={`${c.name}에게 전화하기`}
              className="p-1.5 text-ink-soft transition-opacity active:opacity-50"
            >
              <PhoneIcon className="size-[18px]" />
            </a>
            <a
              href={`sms:${c.phone}`}
              aria-label={`${c.name}에게 문자 보내기`}
              className="p-1.5 text-ink-soft transition-opacity active:opacity-50"
            >
              <ChatIcon className="size-[18px]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
