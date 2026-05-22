import { Request, Response, NextFunction } from 'express';
import { createLead } from '../services/lead.service';
import { createError } from '../middleware/errorHandler';

export async function submitLead(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId, name, phone, email, message, source } = req.body;
    if (!name) return next(createError('name is required', 400));
    if (!phone) return next(createError('phone is required', 400));

    const lead = await createLead({ propertyId, name, phone, email, message, source });
    res.status(201).json(lead);
  } catch (err) { next(err); }
}
