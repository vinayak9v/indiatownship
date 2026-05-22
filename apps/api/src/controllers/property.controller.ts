import { Request, Response, NextFunction } from 'express';
import {
  listProperties, getPropertyBySlug,
  getFeaturedProperties, getLuxuryProperties,
} from '../services/property.service';
import { createError } from '../middleware/errorHandler';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listProperties(req.query);
    res.json(result);
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const prop = await getPropertyBySlug(req.params.slug);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function featured(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getFeaturedProperties());
  } catch (err) { next(err); }
}

export async function luxury(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await getLuxuryProperties());
  } catch (err) { next(err); }
}
