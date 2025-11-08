import jwt, { JwtPayload } from 'jsonwebtoken'

export interface TokenPayload extends JwtPayload {
  _id: string;
  username: string;
  iat?: number;
  exp?: number;
}

export function GenerateAccessToken(user: TokenPayload) {
  console.log("Verify secret:", process.env.ACCESS_TOKEN_SECRET?.length);
  return jwt.sign(
    { _id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "10s" }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    console.log("Sign secret:", process.env.ACCESS_TOKEN_SECRET?.length);
    console.log("Token:", token);
    console.log("Env secret length:", process.env.ACCESS_TOKEN_SECRET?.length);

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)as TokenPayload
  } catch (error) {
    return null
  }
}