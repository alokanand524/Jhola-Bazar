const TAWK_API_KEY = '7617a918e0aaed3f01d4d4b115dcf758594edf45';
const TAWK_PROPERTY_ID = '68dac40daedb73194ef75253';
const BASE_URL = 'https://api.tawk.to/v3';

export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  sender: 'user' | 'agent';
}

export const tawkApi = {
  async sendMessage(message: string, visitorId?: string): Promise<any> {
    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TAWK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: TAWK_PROPERTY_ID,
          visitorId: visitorId || 'mobile-app-user',
          message: message,
          type: 'chat'
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${TAWK_API_KEY}`,
        },
      });
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
};