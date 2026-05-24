import {Router} from "express";
import {Role} from "@prisma/client";
import {auth, authorize} from "../middlewares/auth";
import{createRoom, AvailableRooms, getRooms} from "../controllers/room.controller";


const router = Router();



router.get('/', auth, getRooms);
router.post('/', auth, authorize([Role.ADMIN]), createRoom);
router.get('/available', auth, AvailableRooms);

export default router;