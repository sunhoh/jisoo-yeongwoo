import type { Metadata } from "next";
import Link from "next/link";
import { type Design, designs } from "@/config/designs";
import { invitation } from "@/config/invitation";

export const metadata: Metadata = {
  title: "청첩장 디자인 — 지수 🖤 영우",
};

const { groom, bride } = invitation;

function DesignList({
  items,
  numbered,
}: {
  items: Design[];
  numbered?: boolean;
}) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((d, i) => (
        <li key={d.href}>
          <Link
            href={d.href}
            className="group flex items-baseline gap-4 py-stack transition-colors active:bg-mist"
          >
            {numbered && (
              <span className="type-caption w-6 shrink-0 text-ink-faint tabular-nums lining-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="type-heading block">{d.title}</span>
              <span className="type-body-sm mt-1 block text-ink-soft">
                {d.concept}
              </span>
              <span className="type-meta mt-2 block">{d.href}</span>
            </span>
            <span
              aria-hidden
              className="text-ink-faint transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  return (
    <div className="mx-gutter py-section">
      <p className="type-caption text-ink-faint">
        {bride.en} &amp; {groom.en} ·{" "}
        {invitation.date.slice(0, 10).replaceAll("-", ".")}
      </p>
      <h1 className="type-title mt-tight">Invitation Designs</h1>
      <p className="type-body mt-stack text-ink-soft">
        지금까지 만든 청첩장 디자인이에요. 눌러서 각 디자인을 볼 수 있어요.
      </p>

      <div className="mt-header">
        <DesignList items={designs} numbered />
      </div>
    </div>
  );
}
