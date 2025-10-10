export type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

export type SignUpData = {
  email: string;
  password: string;
  name: string;
};

export type SignInData = {
  email: string;
  password: string;
};

export type AuthError = {
  message: string;
  status?: number;
};