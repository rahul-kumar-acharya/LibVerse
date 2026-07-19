export const parseApiError = (error, defaultMsg = 'Something went wrong.') => {
  const data = error.response?.data;
  if (!data) return defaultMsg;
  
  // DRF standard detail key
  if (data.detail) return data.detail;
  
  // Field-specific validation dictionary
  if (typeof data === 'object' && !Array.isArray(data)) {
    const messages = [];
    for (const [key, value] of Object.entries(data)) {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
      const valMsg = Array.isArray(value) ? value.join(' ') : value;
      messages.push(`${fieldName}: ${valMsg}`);
    }
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }
  
  return defaultMsg;
};
