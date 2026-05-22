import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminOnly';
import {
  adminCreateProperty, adminUpdateProperty, adminDeleteProperty,
  adminToggleProperty, adminListProperties,
  adminListLeads, adminUpdateLead,
  adminListUsers, adminUpdateUser,
  adminAnalytics,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

// Properties
adminRouter.get('/properties', adminListProperties);
adminRouter.post('/properties', adminCreateProperty);
adminRouter.patch('/properties/:id', adminUpdateProperty);
adminRouter.delete('/properties/:id', adminDeleteProperty);
adminRouter.patch('/properties/:id/toggle', adminToggleProperty);

// Leads
adminRouter.get('/leads', adminListLeads);
adminRouter.patch('/leads/:id', adminUpdateLead);

// Users
adminRouter.get('/users', adminListUsers);
adminRouter.patch('/users/:id', adminUpdateUser);

// Analytics
adminRouter.get('/analytics', adminAnalytics);
