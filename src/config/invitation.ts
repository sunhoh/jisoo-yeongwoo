// 청첩장 내용은 전부 여기서 관리한다. (현재 값은 자리표시자)

export type Contact = { role: string; name: string; phone: string };
export type Account = { holder: string; bank: string; number: string };
export type Transport = { label: string; lines: string[]; notes?: string[] };

export const invitation = {
  // parents: [아버지, 어머니], relation: 장남·차남·장녀 등
  groom: {
    name: "이영우",
    shortName: "영우",
    en: "yeongwoo",
    parents: ["이OO", "박OO"],
    relation: "장남",
  },
  bride: {
    name: "김지수",
    shortName: "지수",
    en: "jisoo",
    parents: ["김OO", "최OO"],
    relation: "장녀",
  },

  // 배경음악 (public 기준 경로). 인트로를 탭하면 재생된다
  bgm: "/sheluvme.MP3",

  // 인사말 아래 사진 (public 기준 경로)
  invitationPhoto: "/images/invitation.jpg",

  date: "2027-03-27T17:00:00+09:00",

  // 예식장 정보 (주소·좌표·교통편은 charlan-byul 참고 프로젝트의 라비돌웨딩강남 정보)
  venue: {
    name: "라비돌웨딩강남",
    hall: "2F 오뗄홀",
    address: "서울 강남구 논현로79길 72",
    tel: "02-538-3300",
    // 네이버 지도에 찍힐 좌표
    lat: 37.4960815506362,
    lng: 127.0327627846199,
    links: {
      naver: "https://naver.me/55R8LihG",
      kakao: "https://kko.to/bE8LIZYsA8",
    },
    transport: [
      {
        label: "지하철",
        lines: ["[2호선 강남역] 1번 출구 도보 10분"],
        notes: ["셔틀버스 강남역 1번 출구 수시 운행"],
      },
      {
        label: "버스",
        lines: [
          "간선 140, 146, 341, 360, 400, 402, 420, 440, 441, 452, 470, 541, 542, 740, 741",
          "광역 9404, 9408, M4403, M4434, M5438, M6427, M6439, M7412",
        ],
      },
      {
        label: "주차",
        lines: ["건물 내 주차장 600대 가능 (무료주차 1시간 30분)"],
        notes: [
          "주차장 이용이 혼잡하오니 대중교통 이용을 권장 드립니다.",
          "만차 시 제2주차장으로 안내해 드릴 수 있으니 여유롭게 도착해 주세요.",
        ],
      },
    ] satisfies Transport[],
  },

  contacts: {
    groom: [
      { role: "신랑", name: "이영우", phone: "010-0000-0000" },
      { role: "신랑 아버지", name: "이OO", phone: "010-0000-0000" },
      { role: "신랑 어머니", name: "박OO", phone: "010-0000-0000" },
    ] satisfies Contact[],
    bride: [
      { role: "신부", name: "김지수", phone: "010-0000-0000" },
      { role: "신부 아버지", name: "김OO", phone: "010-0000-0000" },
      { role: "신부 어머니", name: "최OO", phone: "010-0000-0000" },
    ] satisfies Contact[],
  },

  accounts: {
    groom: [
      { holder: "이영우", bank: "국민", number: "000000-00-000000" },
      { holder: "이OO", bank: "신한", number: "000-000-000000" },
    ] satisfies Account[],
    bride: [
      { holder: "김지수", bank: "우리", number: "0000-000-000000" },
      { holder: "김OO", bank: "농협", number: "000-0000-0000-00" },
    ] satisfies Account[],
  },

  // 인사말. 빈 줄로 문단을 나눈다
  greeting: `서로에게 행복을 주는 사람을 만났습니다.
웃는 모습이 너무나 예쁜 그 사람을 만났습니다.
운명처럼 만나게 된 우리의 인연
그 인연에 이끌려 이제 영원을 함께 약속하려 합니다.
저희의 하나 됨을 지켜보아 주시고 격려해 주시면
더 없는 기쁨으로 평생 간직하겠습니다.

둘이 함께 맞이하는 3번째 겨울,
저희 두 사람 여러분 앞에 결혼합니다.
앞으로 맞이할 저희의 봄날을 축복해주세요.`,

  // 갤러리 사진은 public/gallery 폴더에 넣으면 파일명 순으로 자동 반영된다

  share: {
    url: "https://jisoo-yeongwoo.vercel.app",
    title: "지수 🖤 영우 결혼합니다",
    description: "2027년 3월 27일 토요일 오후 5시\n라비돌웨딩강남 2F 오뗄홀",
    imageUrl: "",
  },
};
