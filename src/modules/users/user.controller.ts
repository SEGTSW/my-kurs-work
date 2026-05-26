import { NextFunction, Request, Response } from 'express';

import { bookingController } from '../bookings/booking.controller';
import { userService } from './user.service';

export const userController = {
  async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await userService.getAllUsers());
    } catch (err) {
      return next(err);
    }
  },

  async makeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await userService.makeAdmin(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },

  getBookingsByUserId: bookingController.getBookingsByUserId,
};
