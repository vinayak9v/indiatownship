import { Router } from 'express';
import { submitLead } from '../controllers/lead.controller';

export const leadRouter = Router();

leadRouter.post('/', submitLead);
