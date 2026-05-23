import type {
  IProperty,
  ILead,
} from '@indiatownship/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

// ─── Generic fetch with auth cookie ──────────────────────────────────────────

async function adminFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalLeads: number;
  newLeadsToday: number;
  totalUsers: number;
  leadsByStatus: {
    new: number;
    contacted: number;
    closed: number;
    not_interested: number;
  };
}

export function getDashboardStats(): Promise<DashboardStats> {
  return adminFetch<DashboardStats>('/admin/analytics');
}

// ─── Properties ──────────────────────────────────────────────────────────────

export interface AdminPropertyListResponse {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export function getAdminProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<AdminPropertyListResponse> {
  const p = new URLSearchParams();
  if (params?.page) p.set('page', String(params.page));
  if (params?.limit) p.set('limit', String(params.limit));
  if (params?.search) p.set('search', params.search);
  if (params?.isActive !== undefined) p.set('isActive', String(params.isActive));
  const qs = p.toString() ? `?${p.toString()}` : '';
  return adminFetch<AdminPropertyListResponse>(`/admin/properties${qs}`);
}

export function getAdminProperty(id: string): Promise<IProperty> {
  return adminFetch<IProperty>(`/admin/properties/${id}`);
}

export function createProperty(data: Partial<IProperty>): Promise<IProperty> {
  return adminFetch<IProperty>('/admin/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProperty(id: string, data: Partial<IProperty>): Promise<IProperty> {
  return adminFetch<IProperty>(`/admin/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: string): Promise<void> {
  return adminFetch<void>(`/admin/properties/${id}`, { method: 'DELETE' });
}

export function togglePropertyActive(id: string): Promise<IProperty> {
  return adminFetch<IProperty>(`/admin/properties/${id}/toggle`, { method: 'PATCH' });
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export interface AdminLeadListResponse {
  leads: ILead[];
  total: number;
  page: number;
  totalPages: number;
}

export function getAdminLeads(params?: {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
}): Promise<AdminLeadListResponse> {
  const p = new URLSearchParams();
  if (params?.page) p.set('page', String(params.page));
  if (params?.limit) p.set('limit', String(params.limit));
  if (params?.status) p.set('status', params.status);
  if (params?.city) p.set('city', params.city);
  const qs = p.toString() ? `?${p.toString()}` : '';
  return adminFetch<AdminLeadListResponse>(`/admin/leads${qs}`);
}

export function getAdminLead(id: string): Promise<ILead> {
  return adminFetch<ILead>(`/admin/leads/${id}`);
}

export function updateLead(id: string, data: {
  status?: 'new' | 'contacted' | 'closed' | 'not_interested';
  adminNotes?: string;
}): Promise<ILead> {
  return adminFetch<ILead>(`/admin/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface IAdminUser {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  savedProperties: string[];
}

export interface AdminUserListResponse {
  users: IAdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export function getAdminUsers(params?: { page?: number; limit?: number }): Promise<AdminUserListResponse> {
  const p = new URLSearchParams();
  if (params?.page) p.set('page', String(params.page));
  if (params?.limit) p.set('limit', String(params.limit));
  const qs = p.toString() ? `?${p.toString()}` : '';
  return adminFetch<AdminUserListResponse>(`/admin/users${qs}`);
}

export function updateAdminUser(id: string, data: { isActive?: boolean }): Promise<IAdminUser> {
  return adminFetch<IAdminUser>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
