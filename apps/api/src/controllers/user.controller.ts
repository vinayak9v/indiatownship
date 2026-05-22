import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

function sanitize(user: InstanceType<typeof UserModel>) {
  const obj = user.toObject() as unknown as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId, { name }, { new: true, runValidators: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function saveProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const propId = new mongoose.Types.ObjectId(req.params.propertyId);
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $addToSet: { savedProperties: propId } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function unsaveProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const propId = new mongoose.Types.ObjectId(req.params.propertyId);
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $pull: { savedProperties: propId } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function getSaved(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findById(req.user!.userId).populate('savedProperties');
    if (!user) return next(createError('User not found', 404));
    res.json(user.savedProperties);
  } catch (err) { next(err); }
}

export async function addAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { city, listingType, propertyType, minPrice, maxPrice } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $push: { alerts: { city, listingType, propertyType, minPrice, maxPrice } } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}

export async function deleteAlert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user!.userId,
      { $pull: { alerts: { _id: req.params.alertId } } },
      { new: true }
    );
    if (!user) return next(createError('User not found', 404));
    res.json(sanitize(user));
  } catch (err) { next(err); }
}
