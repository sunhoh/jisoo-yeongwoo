import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 방명록 저장소. .env.local 에 Firebase 웹 앱 설정을 넣는다.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// 설정이 없으면 Firestore가 오프라인 캐시로 빠져 빈 목록만 돌려주므로 미리 막는다
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

export function getDb() {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return getFirestore(app);
}
