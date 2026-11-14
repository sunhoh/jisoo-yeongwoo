"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CloseLineIcon, DownIcon, LoadingLoopIcon, SendIcon } from "@/components/ui/icons";
import { Input, Textarea } from "@/components/ui/input";
import { GUESTBOOK_LIMITS, type GuestbookEntry } from "@/lib/guestbook";

const PAGE_SIZE = 5;

/** 축하 메시지(방명록) — 작성 / 목록 / 비밀번호로 삭제 */
export function Guestbook() {
  const [list, setList] = useState<GuestbookEntry[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { list: GuestbookEntry[] }) => setList(data.list))
      .catch(() => {
        setUnavailable(true);
        setList([]);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-center">
        <WriteDialog onCreated={(entry) => setList((l) => [entry, ...(l ?? [])])} />
      </div>

      {list === null ? (
        <div className="flex justify-center pt-10">
          <LoadingLoopIcon className="size-5 text-ink-faint" />
        </div>
      ) : list.length === 0 ? (
        <p className="type-body-sm pt-10 text-center text-ink-faint">
          {unavailable
            ? "메시지를 불러오지 못했어요."
            : "첫 번째 축하 메시지를 남겨주세요."}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {list.slice(0, visible).map((entry) => (
            <li
              key={entry.id}
              className="animate-in py-5 duration-500 fade-in-0 slide-in-from-bottom-1"
            >
              <div className="flex items-center gap-2">
                <span className="type-label">{entry.name}</span>
                <span className="type-meta ml-auto">
                  {formatDate(entry.createdAt)}
                </span>
                <DeleteDialog
                  entry={entry}
                  onDeleted={() =>
                    setList((l) => l?.filter((e) => e.id !== entry.id) ?? null)
                  }
                />
              </div>
              <p className="type-body mt-1.5 whitespace-pre-line text-ink-soft">
                {entry.message}
              </p>
            </li>
          ))}
        </ul>
      )}

      {list && list.length > visible && (
        <div className="mt-6 flex justify-center">
          <Button size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            <DownIcon className="text-ink-soft" />
            더보기
          </Button>
        </div>
      )}
    </div>
  );
}

function WriteDialog({ onCreated }: { onCreated: (entry: GuestbookEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const message = String(form.get("message") ?? "").trim();
    if (!message) {
      toast.error("메시지를 작성해주세요.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("보내는 중...");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          password: form.get("password"),
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.entry);
      toast.success("마음이 전해졌어요.", { id: toastId });
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "실패했습니다.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <SendIcon className="size-3.5" />
          축하 메시지 남기기
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>With Love.</DialogTitle>
        <DialogDescription>두 사람에게 축하의 마음을 남겨주세요</DialogDescription>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="flex gap-4">
            <Input
              name="name"
              placeholder="이름"
              maxLength={GUESTBOOK_LIMITS.name}
              disabled={loading}
              className="flex-1"
            />
            <Input
              name="password"
              type="password"
              placeholder="비밀번호"
              minLength={GUESTBOOK_LIMITS.passwordMin}
              required
              disabled={loading}
              className="flex-1"
            />
          </div>
          <Textarea
            name="message"
            placeholder="메시지를 작성해주세요."
            maxLength={GUESTBOOK_LIMITS.message}
            required
            disabled={loading}
          />
          <p className="type-meta">비밀번호는 메시지를 지울 때 필요해요.</p>
          <div className="flex gap-2 pt-3">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="solid" disabled={loading} className="flex-[2]">
              보내기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  entry,
  onDeleted,
}: {
  entry: GuestbookEntry;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");

    setLoading(true);
    const toastId = toast.loading("확인 중...");
    try {
      const res = await fetch(`/api/guestbook/${entry.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDeleted();
      toast.success("삭제되었습니다.", { id: toastId });
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "실패했습니다.", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="메시지 삭제"
        className="-mr-1.5 p-1.5 text-ink-faint transition-colors hover:text-ink"
      >
        <CloseLineIcon className="size-3" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete.</DialogTitle>
        <DialogDescription>작성할 때 입력한 비밀번호를 입력해주세요</DialogDescription>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            autoFocus
            disabled={loading}
          />
          <div className="flex gap-2 pt-3">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="solid" disabled={loading} className="flex-[2]">
              삭제
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear() % 100}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
