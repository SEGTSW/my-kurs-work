import { NextFunction, Request, Response } from 'express';

import { analyticsService } from './analytics.service';

export const analyticsController = {
  async getAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await analyticsService.getAnalytics());
    } catch (err) {
      return next(err);
    }
  },
};
