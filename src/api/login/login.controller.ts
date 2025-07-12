import { Request } from "express";
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import Configurations from "../../core/configurations";
import UnauthorizedException from "../../exceptions/UnauthorizedException";
import { decodePassAuthorization } from "../../util/Utils";
import Professional, { IProfessional } from "../professional/professional";

export default class LoginController {
  private readonly configurations = new Configurations();
  public async login(req: Request): Promise<any> {
    const { email, password } = decodePassAuthorization(req.headers);
    let userLogged: UserCredential;
    try {
      userLogged = await signInWithEmailAndPassword(getAuth(), email, password);
    } catch (err) {
      throw new UnauthorizedException(
        "Não foi possível fazer o login",
        "LOGIN001",
        err
      );
    }
    console.log(
      userLogged.user.email,
      this.configurations.FEATURE_FLAGS.isValidatingMail &&
      !userLogged.user?.emailVerified
    );
    if (
      this.configurations.FEATURE_FLAGS.isValidatingMail &&
      !userLogged.user?.emailVerified
    ) {
      throw new UnauthorizedException(
        "O email ainda não foi validado",
        "LOGIN002"
      );
    }

    let professional: IProfessional | null;
    try {
      professional = await Professional.findOne({
        email: userLogged.user.email,
      });
      console.log(professional);
      if (!professional)
        throw new UnauthorizedException("Cadastro não localizado", "LOGIN003");
    } catch (error) {
      throw new UnauthorizedException(
        "O email ainda não foi validado",
        "LOGIN004",
        error
      );
    }
    const token = await userLogged.user.getIdToken();
    return {
      email: professional.email,
      name: professional.name,
      position: professional.position,
      role: professional.role,
      token,
    };
  }
}
