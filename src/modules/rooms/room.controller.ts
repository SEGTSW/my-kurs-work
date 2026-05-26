import { NextFunction, Request, Response } from 'express';

import { roomService } from './room.service';

export const roomController = {
  async getRooms(_req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await roomService.getRooms());
    } catch (err) {
      return next(err);
    }
  },

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(201).json(await roomService.createRoom(req.body));
    } catch (err) {
      return next(err);
    }
  },

  async getAvailableRooms(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await roomService.getAvailableRooms(req.query));
    } catch (err) {
      return next(err);
    }
  },
};
