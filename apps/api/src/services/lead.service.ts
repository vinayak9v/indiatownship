import { LeadModel, LeadDoc } from '../models/Lead';
import { PropertyModel } from '../models/Property';
import { sendLeadNotification } from './whatsapp.service';

interface CreateLeadInput {
  propertyId?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: LeadDoc['source'];
}

export async function createLead(input: CreateLeadInput): Promise<Record<string, unknown>> {
  const leadData: Partial<LeadDoc> & { property?: LeadDoc['property'] } = {
    name: input.name,
    phone: input.phone,
    email: input.email ?? '',
    message: input.message ?? '',
    source: input.source ?? 'web',
    status: 'new',
  };

  let propertyTitle = 'General Inquiry';
  let brochureUrl: string | undefined;

  if (input.propertyId) {
    const prop = await PropertyModel.findById(input.propertyId);
    if (prop) {
      leadData.property = prop._id;
      propertyTitle = prop.title;
      if (input.source === 'brochure_gate' && prop.brochureUrl) {
        brochureUrl = prop.brochureUrl;
      }
    }
  }

  const lead = await LeadModel.create(leadData);

  // Fire-and-forget — failure does not abort lead creation
  sendLeadNotification({
    propertyTitle,
    name: input.name,
    phone: input.phone,
    email: input.email ?? '',
    message: input.message ?? '',
  })
    .then((sent) => {
      if (sent) {
        LeadModel.findByIdAndUpdate(lead._id, {
          whatsappSent: true,
          whatsappSentAt: new Date(),
        }).exec();
      }
    })
    .catch(() => { /* non-fatal */ });

  const result = lead.toObject() as unknown as Record<string, unknown>;
  if (brochureUrl) result.brochureUrl = brochureUrl;
  return result;
}
