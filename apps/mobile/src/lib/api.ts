import type { IProperty, PropertyFilters, ILead, IUser, UserAlert, LeadSource } from '@indiatownship/types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

// ─── Generic fetch ─────────────────────────────────────────────────────────

let _getToken: (() => Promise<string | null>) | null = null;

/** Register a token getter so api.ts can stay free of SecureStore imports */
export function registerTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ─── Properties ────────────────────────────────────────────────────────────

export interface PropertyListResponse {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export function getProperties(filters?: Partial<PropertyFilters>): Promise<PropertyListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.set(k, String(v));
    });
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<PropertyListResponse>(`/properties${qs}`);
}

export function getFeaturedProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/featured');
}

export function getLuxuryProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/luxury');
}

export function getPropertyBySlug(slug: string): Promise<IProperty> {
  return apiFetch<IProperty>(`/properties/${slug}`);
}

// ─── Leads ─────────────────────────────────────────────────────────────────

export interface CreateLeadPayload {
  property?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
}

export interface CreateLeadResponse {
  lead: ILead;
  brochureUrl?: string;
}

export function submitLead(payload: CreateLeadPayload): Promise<CreateLeadResponse> {
  return apiFetch<CreateLeadResponse>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export function loginApi(credentials: { phone?: string; email?: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerApi(data: { name: string; phone: string; password: string; email?: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── User ──────────────────────────────────────────────────────────────────

export function getMe(): Promise<IUser> {
  return apiFetch<IUser>('/users/me');
}

export function getSavedProperties(): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/users/me/saved');
}

export function savePropertyApi(propertyId: string): Promise<IUser> {
  return apiFetch<IUser>(`/users/me/saved/${propertyId}`, { method: 'POST' });
}

export function unsavePropertyApi(propertyId: string): Promise<IUser> {
  return apiFetch<IUser>(`/users/me/saved/${propertyId}`, { method: 'DELETE' });
}

export function addAlertApi(alert: Omit<UserAlert, '_id'>): Promise<IUser> {
  return apiFetch<IUser>('/users/me/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
}
