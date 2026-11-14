const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entity_type, entity_id = null, details = {}) => {
  try {
    const userId = req && req.user ? req.user._id : null;
    const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '' : '';
    const userAgent = req ? req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      user_id: userId,
      action,
      entity_type,
      entity_id: entity_id ? String(entity_id) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};

module.exports = { logAudit };
