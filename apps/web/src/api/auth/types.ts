export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  accessToken: string;
  tokenType: 'Bearer';
  user: UserInfo;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
