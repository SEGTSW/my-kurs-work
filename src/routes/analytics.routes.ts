import {Router} from "express";
import {Role} from "@prisma/client";
import {auth, authorize} from "../middlewares/auth";
import {getAnalytics} from "../controllers/analytics.controller";

const router = Router();

router.get('/', auth, authorize([Role.ADMIN]), getAnalytics);

export default router;
