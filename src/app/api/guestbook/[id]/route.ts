import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { verifyPassword } from "../password";

export async function DELETE(
  req: Request,
  ctx: RouteContext<"/api/guestbook/[id]">,
) {
  if (!isFirebaseConfigured) {
    return Response.json({ error: "방명록이 아직 준비되지 않았어요." }, { status: 503 });
  }
  const { id } = await ctx.params;
  const { password = "" } = (await req.json()) as { password?: string };

  const ref = doc(getDb(), "guestbook", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return Response.json({ error: "찾을 수 없는 메시지입니다." }, { status: 404 });
  }
  if (!verifyPassword(password, snap.data().password)) {
    return Response.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  await deleteDoc(ref);
  return Response.json({ success: true });
}
