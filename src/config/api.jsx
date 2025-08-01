export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const API_ENDPOINTS = {
  BROADCASTS: {
    GET_ALL: `${API_BASE}/getBroadcasts`,
    GET_CUSTOMERS: `${API_BASE}/getBroadcastCustomers`,
    DELETE: (id) => `${API_BASE}/broadcasts/${id}`,
  },
  CONTACTS: {
    ADD_SINGLE: `${API_BASE}/addcustomer`,
    ADD_MULTIPLE: `${API_BASE}/addcustomers`,
    GET_ALL: `${API_BASE}/contacts`,
    GET_CONVERSATION_ID: (customerId) =>
      `${API_BASE}/conversationid?contact_id=${customerId}`,
    DELETE: `${API_BASE}/deletecontact`,
    UPDATE: `${API_BASE}/updatecontact`,
  },
  CHAT: {
    CONVERSATIONS: `${API_BASE}/conversations`,
    MESSAGES: `${API_BASE}/messages`,
    SEND_MESSAGE: `${API_BASE}/sendmessage`,
    DELETE_CONVERSATION: `${API_BASE}/deleteconversations`,
    MARK_AS_READ: `${API_BASE}/markMessagesAsRead`,
  },
  TEMPLATES: {
    GET_ALL: `${API_BASE}/templates`,
    CREATE: `${API_BASE}/createtemplate`,
    UPDATE: (id) => `${API_BASE}/updatetemplate?templateId=${id}`,
    UPDATE_ALT: `${API_BASE}/updatetemplate`,
    DELETE: () => `${API_BASE}/deletetemplate`,
  },
  GROUPS: {
    GET_ALL: `${API_BASE}/returnGroups`,
    CREATE: `${API_BASE}/addcustomers`,
    UPDATE: `${API_BASE}/updateGroup`,
    DELETE: `${API_BASE}/deleteGroup`,
    GET_CONTACTS: (groupId) => `${API_BASE}/groups/groupContacts?group_id=${groupId}`,
  },
  EXTERNAL: {
    COUNTRY_CODES: "https://countriesnow.space/api/v0.1/countries/codes",
  },
  AUTH: {
    LOGOUT: `${API_BASE}/logout`,
    LOGIN: `${API_BASE}/login`,
    ME: `${API_BASE}/me`,
    REGISTER: `${API_BASE}/register`,
    FORGOT_PASSWORD: `${API_BASE}/forgot-password`,
  },
  CREDIT: {
    GRAPH: `${API_BASE}/creditUsage`,
  },
  RAZORPAY: {
    CREATE_ORDER: `${API_BASE}/create-payment`,
    VERIFY_PAYMENT: `${API_BASE}/verify-payment`,
  },
  WHATSAPP: {
    NUMBERS: "/api/whatsapp/numbers",
  },
  USERS: {
    GET_SUBUSERS: (customerId) => `${API_BASE}/getsubusers?customer_id=${customerId}`,
    CREATE_SUBUSER: `${API_BASE}/createSubUser`,
    UPDATE_SUBUSER: (userId) => `${API_BASE}/updatesubuser?user_id=${userId}`,
    DELETE_SUBUSER: (userId) => `${API_BASE}/deletesubuser?user_id=${userId}`,
  },
  FLOWS: {
    GET_ALL: (customerId) => `${API_BASE}/flows?customer_id=${customerId}`,
    CREATE: `${API_BASE}/flows`,
    UPDATE: (flowId) => `${API_BASE}/flows/${flowId}`,
    DELETE: (flowId) => `${API_BASE}/flows/${flowId}`,
    TOGGLE_STATUS: (flowId) => `${API_BASE}/flows/${flowId}/toggle`,
    EXECUTE: (flowId) => `${API_BASE}/flows/${flowId}/execute`,
    GET_EXECUTION_LOG: (flowId) => `${API_BASE}/flows/${flowId}/executions`,
  },
};
