import type {
  IProperty,
  PropertyFilters,
  ILead,
  LeadSource,
} from '@indiatownship/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

// ─── Generic fetch wrapper ─────────────────────────────────────────────────

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Properties ──────────────────────────────────────────────────────────────

export interface PropertyListResponse {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export function getProperties(
  filters?: Partial<PropertyFilters>,
  fetchOptions?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<PropertyListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params.set(k, String(v));
      }
    });
  }
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<PropertyListResponse>(`/properties${qs}`, fetchOptions);
}

export function getFeaturedProperties(
  fetchOptions?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/featured', fetchOptions);
}

export function getLuxuryProperties(
  fetchOptions?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<IProperty[]> {
  return apiFetch<IProperty[]>('/properties/luxury', fetchOptions);
}

export function getPropertyBySlug(
  slug: string,
  fetchOptions?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<IProperty> {
  return apiFetch<IProperty>(`/properties/${slug}`, fetchOptions);
}

// ─── Leads ───────────────────────────────────────────────────────────────────

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

export async function submitLead(
  payload: CreateLeadPayload
): Promise<CreateLeadResponse> {
  return apiFetch<CreateLeadResponse>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitContact(payload: {
  name: string;
  phone: string;
  email?: string;
  message: string;
}): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
