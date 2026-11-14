export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type GuestbookPost = {
  name: string;
  message: string;
  password: string;
};

export const GUESTBOOK_LIMITS = {
  name: 20,
  message: 500,
  passwordMin: 4,
};
