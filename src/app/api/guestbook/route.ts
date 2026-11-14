import { addDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { connection } from "next/server";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import {
  GUESTBOOK_LIMITS,
  type GuestbookEntry,
  type GuestbookPost,
} from "@/lib/guestbook";
import { hashPassword } from "./password";

export async function GET() {
  // 요청 시점마다 최신 목록을 읽도록 프리렌더 제외
  await connection();
  if (!isFirebaseConfigured) {
    return Response.json({ error: "방명록이 아직 준비되지 않았어요." }, { status: 503 });
  }

  const snap = await getDocs(
    query(collection(getDb(), "guestbook"), orderBy("createdAt", "desc")),
  );
  const list: GuestbookEntry[] = snap.docs.map((doc) => {
    const { name, message, createdAt } = doc.data();
    return { id: doc.id, name, message, createdAt };
  });

  return Response.json({ list });
}

export async function POST(req: Request) {
  if (!isFirebaseConfigured) {
    return Response.json({ error: "방명록이 아직 준비되지 않았어요." }, { status: 503 });
  }
  const body = (await req.json()) as Partial<GuestbookPost>;
  const name = body.name?.trim().slice(0, GUESTBOOK_LIMITS.name) || "익명";
  const message = body.message?.trim().slice(0, GUESTBOOK_LIMITS.message);
  const password = body.password ?? "";

  if (!message) {
    return Response.json({ error: "메시지를 작성해주세요." }, { status: 400 });
  }
  if (password.length < GUESTBOOK_LIMITS.passwordMin) {
    return Response.json(
      { error: `비밀번호는 ${GUESTBOOK_LIMITS.passwordMin}자 이상 입력해주세요.` },
      { status: 400 },
    );
  }

  const createdAt = new Date().toISOString();
  const ref = await addDoc(collection(getDb(), "guestbook"), {
    name,
    message,
    password: hashPassword(password),
    createdAt,
  });

  const entry: GuestbookEntry = { id: ref.id, name, message, createdAt };
  return Response.json({ entry });
}
