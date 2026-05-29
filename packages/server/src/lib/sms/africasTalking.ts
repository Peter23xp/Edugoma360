import AfricasTalking from 'africastalking';

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY || 'sandbox',
  username: process.env.AFRICASTALKING_USERNAME || 'sandbox'
});

const sms = africastalking.SMS;

interface SendSMSParams {
  to: string[]          // Array de numéros +243...
  message: string
  from?: string         // Sender ID (optionnel)
}

export async function sendSMS(params: SendSMSParams) {
  try {
    const result = await sms.send({
      to: params.to,
      message: params.message,
      from: params.from || 'EduGoma360'
    });
    
    return {
      success: true,
      data: result.SMSMessageData.Recipients.map((r: any) => ({
        phone: r.number,
        status: r.status,      // 'Success' | 'Rejected'
        messageId: r.messageId,
        cost: r.cost
      }))
    };
  } catch (error: any) {
    console.error('Africa\'s Talking Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getBalance() {
  try {
    const result = await africastalking.APPLICATION.fetchApplicationData();
    return {
      balance: result.UserData.balance
    };
  } catch (error: any) {
    console.error('Failed to fetch SMS balance (Check AfricasTalking API Keys):', error.message || error);
    // Return a mock balance if API fails so the UI doesn't break
    return {
      balance: 0
    };
  }
}
