import { Application } from "express";
import { LoginApi } from "./login/login.api";

import { InfoApi } from "./info/info.api";
import { ProfessionalApi } from "./professional/professional.api";
import { AppointmentApi } from "./appointment/appointment.api";

export class Routes {
  private loginApi: LoginApi;
  private infoApi: InfoApi;
  private professionalApi: ProfessionalApi;
  private appointmentApi: AppointmentApi;

  constructor() {
    this.loginApi = new LoginApi();
    this.infoApi = new InfoApi();
    this.professionalApi = new ProfessionalApi();
    this.appointmentApi = new AppointmentApi();
  }

  public routes(app: Application): void {
    this.loginApi.routes(app);
    this.infoApi.routes(app);
    this.professionalApi.routes(app);
    this.appointmentApi.routes(app);
  }
}
