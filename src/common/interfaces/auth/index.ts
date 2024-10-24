export interface IUserJWT {
  email: string;

  name: string;
}

export interface IJwtPayload {
  user: IUserJWT;

  iat: number;

  exp: number;
}
