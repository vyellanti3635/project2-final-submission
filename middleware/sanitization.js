// Sanitization middleware - prevents NoSQL injection and XSS

function sanitizeObject(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove $ and . from keys to prevent NoSQL injection
      const cleanKey = key.replace(/^\$/, "").replace(/\./g, '_');
      sanitized[cleanKey] = sanitizeObject(obj[key]);
        }
  }
  return sanitized;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

const sanitizationMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = sanitizationMiddleware;
