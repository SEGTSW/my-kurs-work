import {Router} from "express";
import {Role} from "@prisma/client";
import {getBookingsByUserId} from "../controllers/booking.controller";
import {getAllUsers, makeAdmin} from "../controllers/user.controller";
import {auth, authorize} from "../middlewares/auth";


const router = Router();

router.get('/', auth, authorize([Role.ADMIN]), getAllUsers);
router.patch('/:id/role', auth, authorize([Role.ADMIN]), makeAdmin);
router.get('/:id/bookings', auth, getBookingsByUserId);

export default router;