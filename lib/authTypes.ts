export type AuthUser = {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
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
