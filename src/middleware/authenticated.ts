import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import UnauthorizedException from "../exceptions/UnauthorizedException";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { authorization } = req.headers;

  if (!authorization)
    throw new UnauthorizedException("Sem autorização", "MDAUTH001");

  if (!authorization.startsWith("Bearer"))
    throw new UnauthorizedException(
      "Credencial de acesso inválida",
      "MDAUTH002"
    );

  const split = authorization.split("Bearer ");
  if (split.length !== 2)
    throw new UnauthorizedException(
      "Não foi possivel identificar a credencial de acesso",
      "MDAUTH003"
    );

  const token = split[1];

  try {
    const decodedToken: DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);
    res.locals = {
      ...res.locals,
      ...decodedToken,
    };
    console.log({locals:res.locals});
    return next();
  } catch (error) {
    throw new UnauthorizedException("Sem autorização", "MDAUTH004", error);
  }
}
