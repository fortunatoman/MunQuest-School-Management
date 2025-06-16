import { Router } from 'express';
import { testDirectMessage } from '../controllers/test.controller';

const router = Router();

router.get('/test-direct-message/:userId', testDirectMessage);

export default router;
