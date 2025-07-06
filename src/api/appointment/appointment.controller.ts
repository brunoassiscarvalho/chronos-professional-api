import BusinessException from "../../exceptions/BusinessException";
import { Request, Response } from "express";
import Appointment, { IAppointment } from "./appointment";
import moment from "moment";

const times = {
  endDate: "06/16/2022",
  friday: true,
  interval: "30",
  monday: true,
  saturday: true,
  startDate: "06/16/2022",
  sunday: true,
  thursday: true,
  times: [{ startTime: "8:00", endTime: "12:00" }],
  tuesday: true,
  wednesday: true,
};

const weekDaysSchedule = ["monday", "wednesday", "friday"];

export default class AppointmentController {
  public async createBatchAppointments(req: Request): Promise<any> {
    this.createScheduleDay("8:00", "12:00");
    const times = this.createScheduleDay("8:00", "12:00");
    const days = this.getDatesByWeekDay("06/16/2022", "06/26/2022");
    return days;
  }

  private getDatesByWeekDay(startDate: string, endDate: string) {
    // weekDaysSchedule.map(()=>{

    // })

    const initialStartDay = moment.utc(startDate, "MM/DD/yyyy");
    const initialEndDay = moment.utc(endDate, "MM/DD/yyyy");

    const iterateDate = initialStartDay.clone();
    console.log({ iterateDate });

    // const startDay = new Date(endDate);
    // const endDay = new Date(startDate);
    const resultDays: any = [];

    do {
      // console.log({ iterateDate });
      weekDaysSchedule.forEach((weekDay: string) => {
        const weekDayForWeekSchedule = iterateDate.day(weekDay).clone();

        if (
          weekDayForWeekSchedule >= initialStartDay &&
          weekDayForWeekSchedule <= initialEndDay
        ) {
          resultDays.push(weekDayForWeekSchedule);
          console.log({ weekDayForWeekSchedule });
        }
      });
      // if(weekDay < )
      // console.log(startDay, endDay);

      iterateDate.add(1, "week");
    } while (iterateDate < initialEndDay);

    return resultDays;
  }

  private createScheduleDay(startTime: string, endTime: string) {
    const startHour = moment.utc(startTime, "hh:mm");
    const endHour = moment.utc(endTime, "hh:mm");
    const schedulles = [];
    do {
      const schedulleStart = startHour.clone();
      const schedulleEnd = startHour.add(30, "minutes").clone();

      schedulles.push({
        startTime: schedulleStart,
        endTime: schedulleEnd,
      });
    } while (startHour < endHour);
    return schedulles;
  }

  public async getAppointments(): Promise<string> {
    return "Servidor Funcionado!";
  }

  public async createAppointment(req: Request): Promise<IAppointment> {
    return Appointment.create(req.body);
  }

  public async getAvailableTime(req: Request): Promise<IAppointment[]> {
    const { professionalId } = req.body;
    return Appointment.find({
      resource: {
        professional: { _id: professionalId },
        patient: { $exists: false },
      },
    }).lean();
  }

  public async patchPatientAppointment(
    req: Request,
    res: Response
  ): Promise<IAppointment> {
    const { _id } = req.body;
    const { name, picture, user_id, email } = res.locals;
    try {
      const appointment = await Appointment.findOneAndUpdate(
        { _id, "resource.patient": { $exists: false } },
        { "resource.patient": { name, picture, user_id, email } },
        { new: true }
      ).lean();
      if (!appointment)
        throw new BusinessException(
          "Não foi possivel agendar seu horário",
          "APPTMN001"
        );
      return appointment;
    } catch (error) {
      throw new BusinessException(
        "Não foi possivel agendar seu horário",
        "APPTMN002",
        error
      );
    }
  }
}
