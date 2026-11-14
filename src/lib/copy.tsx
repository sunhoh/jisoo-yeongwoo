import { toast } from "react-hot-toast";

export async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(() => (
      <div className="min-w-[200px]">
        <p className="type-body-sm font-bold">복사되었습니다</p>
        <p className="type-meta">{text}</p>
      </div>
    ));
  } catch {
    toast.error("클립보드 복사에 실패했습니다.");
  }
}
