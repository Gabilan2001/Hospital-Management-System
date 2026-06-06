const twilio = require('twilio');

let client = null;

const getClient = () => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    process.env.TWILIO_ACCOUNT_SID.startsWith('ACxxxx')
  ) {
    return null;
  }
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

const sendWhatsApp = async (to, message) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    console.log('Twilio not configured, skipping WhatsApp message');
    return null;
  }

  let formattedTo = to;
  if (!to.startsWith('whatsapp:')) {
    formattedTo = `whatsapp:${to.replace(/^\+/, '')}`;
    if (!formattedTo.startsWith('whatsapp:+')) {
      formattedTo = `whatsapp:+${to.replace(/\D/g, '')}`;
    }
  }

  const result = await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    to: formattedTo,
  });

  return result;
};

module.exports = sendWhatsApp;
