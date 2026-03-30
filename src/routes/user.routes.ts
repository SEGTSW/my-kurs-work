import {Router} from "express";
import {getBookingsByUserId} from "../controllers/booking.controller";
import {auth} from "../middlewares/auth";


const router = Router();

router.get('/:id/bookings', auth, getBookingsByUserId);

export default router;