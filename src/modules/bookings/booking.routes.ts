import { Router } from 'express';

import { auth } from '../../middlewares/auth.middleware';
import { bookingController } from './booking.controller';

export const bookingRoutes = Router();

bookingRoutes.post('/', auth, bookingController.createBooking);
bookingRoutes.get('/my', auth, bookingController.getMyBookings);
bookingRoutes.delete('/:id', auth, bookingController.deleteBooking);
bookingRoutes.get('/', auth, bookingController.getAllBookings);
