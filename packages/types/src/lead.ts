export type LeadStatus = 'new' | 'contacted' | 'closed' | 'not_interested';
export type LeadSource = 'web' | 'mobile' | 'contact_page' | 'brochure_gate';

export interface ILead {
  _id: string;
  property: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: LeadSource;
  status: LeadStatus;
  adminNotes: string;
  whatsappSent: boolean;
  whatsappSentAt: string;
  createdAt: string;
  updatedAt: string;
}
