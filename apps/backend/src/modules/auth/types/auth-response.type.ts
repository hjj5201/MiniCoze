import { UserResponse } from '../../user/types/user-response.type';

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  user: UserResponse;
}
