import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PropertyModel } from '../models/Property';
import { LeadModel } from '../models/Lead';
import { UserModel } from '../models/User';
import {
  createProperty, updateProperty, deleteProperty, togglePropertyActive,
} from '../services/property.service';
import { createError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';
import { parsePagination } from '../utils/paginate';

// --- Properties ---

export async function adminCreateProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = { ...req.body };
    if (!data.slug) {
      data.slug = generateSlug({
        bedrooms: data.bedrooms,
        propertyType: data.propertyType,
        locality: data.locality,
        city: data.city,
      });
    }
    const prop = await createProperty(data);
    res.status(201).json(prop);
  } catch (err) { next(err); }
}

export async function adminUpdateProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prop = await updateProperty(req.params.id, req.body);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function adminDeleteProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteProperty(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

export async function adminToggleProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const prop = await togglePropertyActive(req.params.id);
    if (!prop) return next(createError('Property not found', 404));
    res.json(prop);
  } catch (err) { next(err); }
}

export async function adminListProperties(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.city) filter.city = req.query.city;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    const [data, total] = await Promise.all([
      PropertyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PropertyModel.countDocuments(filter),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

// --- Leads ---

export async function adminListLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) {
      const props = await PropertyModel.find({ city: req.query.city }).select('_id');
      filter.property = { $in: props.map((p) => p._id) };
    }
    const [data, total] = await Promise.all([
      LeadModel.find(filter).populate('property', 'title city slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LeadModel.countDocuments(filter),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

export async function adminUpdateLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, adminNotes } = req.body;
    const update: Record<string, unknown> = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lead) return next(createError('Lead not found', 404));
    res.json(lead);
  } catch (err) { next(err); }
}

// --- Users ---

export async function adminListUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      UserModel.find({}, '-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      UserModel.countDocuments(),
    ]);
    res.json({ data, pagination: { page, limit, total } });
  } catch (err) { next(err); }
}

export async function adminUpdateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { isActive } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.params.id, { isActive }, { new: true, projection: '-passwordHash' }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(user);
  } catch (err) { next(err); }
}

// --- Analytics ---

export async function adminAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [totalProperties, totalLeads, newLeads, totalUsers] = await Promise.all([
      PropertyModel.countDocuments(),
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ status: 'new' }),
      UserModel.countDocuments({ role: 'user' }),
    ]);
    res.json({ totalProperties, totalLeads, newLeads, totalUsers });
  } catch (err) { next(err); }
}
