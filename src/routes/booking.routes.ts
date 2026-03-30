import {Router} from "express";
import {auth, authorize} from "../middlewares/auth";
import {createBooking, deleteBooking, getAllBookings, getUserBooking} from "../controllers/booking.controller";


const router = Router();

router.post('/', auth, createBooking);
router.get('/my', auth, getUserBooking);
router.delete('/:id', auth, deleteBooking);
router.get('/', auth, getAllBookings);
export default router;