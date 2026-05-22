export interface LeadNotificationData {
  propertyTitle: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export async function sendLeadNotification(data: LeadNotificationData): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;

  if (!phoneNumberId || !accessToken || !adminNumber) {
    console.warn('WhatsApp not configured — skipping notification');
    return false;
  }

  const body = [
    `🏠 *New Inquiry — IndiaTownship*`,
    `Property: ${data.propertyTitle || 'General Inquiry'}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || 'N/A'}`,
    `Message: ${data.message || 'N/A'}`,
  ].join('\n');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: adminNumber,
          type: 'text',
          text: { body },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('WhatsApp API error:', err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('WhatsApp send failed:', err);
    return false;
  }
}
