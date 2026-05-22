import { Router } from 'express';
import { list, getBySlug, featured, luxury } from '../controllers/property.controller';

export const propertyRouter = Router();

propertyRouter.get('/featured', featured);
propertyRouter.get('/luxury', luxury);
propertyRouter.get('/', list);
propertyRouter.get('/:slug', getBySlug);
