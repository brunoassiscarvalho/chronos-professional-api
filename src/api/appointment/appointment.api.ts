import { Request, Response, NextFunction, Application } from "express";
import { isAuthenticated } from "../../middleware/authenticated";
import AppointmentController from "./appointment.controller";

export class AppointmentApi {
  private defaultPath = "/appointment";

  public appointmentController: AppointmentController =
    new AppointmentController();

  public routes(app: Application): void {
    app.get(
      this.defaultPath + "/professional",
      isAuthenticated,
      async (req: Request, res: Response, next: NextFunction) => {
        this.appointmentController
          .getAvailableTime(req)
          .then((result) => {
            res.json(result);
            next();
          })
          .catch((e) => next(e));
      }
    );

    app.post(
      this.defaultPath,
      // isAuthenticated,
      async (req: Request, res: Response, next: NextFunction) => {
        this.appointmentController
          .createAppointment(req)
          .then((result) => {
            res.json(result);
            next();
          })
          .catch((e) => next(e));
      }
    );

    app.post(
      this.defaultPath + "/batch",
      // isAuthenticated,
      async (req: Request, res: Response, next: NextFunction) => {
        this.appointmentController
          .createBatchAppointments(req)
          .then((result) => {
            res.json(result);
            next();
          })
          .catch((e) => next(e));
      }
    );

    app.patch(
      this.defaultPath + "/patient",
      isAuthenticated,
      async (req: Request, res: Response, next: NextFunction) => {
        this.appointmentController
          .patchPatientAppointment(req, res)
          .then((result) => {
            res.json(result);
            next();
          })
          .catch((e) => next(e));
      }
    );
  }
}
