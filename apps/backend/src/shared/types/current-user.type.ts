export interface CurrentUser {
  id: string;
  email: string;
  username: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}
