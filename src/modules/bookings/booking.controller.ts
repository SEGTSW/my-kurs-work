import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../../shared/http-error';
import { bookingService } from './booking.service';

function requireUser(req: Request) {
  if (!req.user) {
    throw new HttpError(401, 'No token provided');
  }

  return req.user;
}

export const bookingController = {
  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.createBooking(requireUser(req), req.body);
      return res.status(201).json(booking);
    } catch (err) {
      return next(err);
    }
  },

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await bookingService.getUserBookings(requireUser(req)));
    } catch (err) {
      return next(err);
    }
  },

  async getAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await bookingService.getAllBookings(requireUser(req)));
    } catch (err) {
      return next(err);
    }
  },

  async getBookingsByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      return res.json(await bookingService.getBookingsByUserId(requireUser(req), userId));
    } catch (err) {
      return next(err);
    }
  },

  async deleteBooking(req: Request, res: Response, next: NextFunction) {
    try {
      await bookingService.deleteBooking(requireUser(req), Number(req.params.id));
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  },
};
