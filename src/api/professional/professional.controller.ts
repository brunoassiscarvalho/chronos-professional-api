import BusinessException from "../../exceptions/BusinessException";
import { Request } from "express";
import { auth } from "firebase-admin";
import { UserRecord } from "firebase-functions/v1/auth";
import EMailController from "../../email/email.controller";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { decodePassAuthorization } from "../../util/Utils";
import Professional, { IProfessional } from "./professional";

export default class UsesrController {
  private mailController: EMailController;

  constructor() {
    this.mailController = new EMailController();
  }

  public async getProfessionals(): Promise<string> {
    return "Servidor Funcionado!";
  }

  public async createProfessional(req: Request): Promise<UserRecord> {
    const { email, password } = decodePassAuthorization(req.headers);

    const { name, phone, cep } = req.body;
    if (!name || !phone || !cep || !email || !password)
      throw new BusinessException("Dados incompletos", "PROFESSIONAL001");

    try {
      const newProfessional: IProfessional = await Professional.create(
        req.body
      );
      const professional: UserRecord = await auth().createUser({
        email,
        password,
        emailVerified: false,
      });

      await auth().setCustomUserClaims(professional.uid, {
        role: "professional",
        name,
        _id: newProfessional._id,
      });

      const link: string = await auth().generateEmailVerificationLink(email, {
        url: "https://localhost:3000",
      });

      await this.mailController.sendVerificationEmail({
        userEmail: email,
        userName: name,
        link,
      });

      return professional;
    } catch (error) {
      throw new BusinessException(
        "Não foi possível criar o usuário",
        "PROFESSIONAL002",
        error
      );
    }
  }

  public async sendVerificationEmail(req: Request): Promise<string> {
    const { email, password } = decodePassAuthorization(req.headers);
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      const professional: IProfessional = await Professional.findOne({
        email,
      }).lean();
      const link: string = await auth().generateEmailVerificationLink(email, {
        url: "https://localhost:3000",
      });
      await this.mailController.sendVerificationEmail({
        userEmail: email,
        userName: professional.name,
        link,
      });
      return "deu certo";
    } catch (error) {
      throw new BusinessException(
        "Não foi possível enviar o email de confirmação",
        "PROFESSIONAL003",

        error
      );
    }
  }
}
