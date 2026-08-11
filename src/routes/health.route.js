import { Router } from "express";
import * as healthRouter from '../controllers/healthController.js';

const router = Router();

router.get('/', healthRouter.healthCheck);
router.get('/ping', healthRouter.ping);

export default router;
