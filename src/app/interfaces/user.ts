export interface User {
  username: string;
  email: string;
  password: string;
}

export type LoginCredentials = Omit <User, "username">