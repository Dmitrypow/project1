const ALLOWED_REASONS = ["Навчання", "Лабораторна робота", "Робота над проектом", "Технічне обслуговування"];

function requireString(value, field, minLen = 1) {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return { field, message: `${field} must be a non-empty string (min ${minLen} chars)` };
  }
  return null;
}

function requireNumber(value, field) {
  if (typeof value !== "number" || isNaN(value)) {
    return { field, message: `${field} must be a valid number` };
  }
  return null;
}

function requireIsoDate(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || isNaN(Date.parse(value))) {
    return { field, message: `${field} must be a valid date in ISO format YYYY-MM-DD` };
  }
  return null;
}

function requireEnum(value, field, allowed) {
  if (!allowed.includes(value)) {
    return { field, message: `${field} must be one of: ${allowed.join(", ")}` };
  }
  return null;
}

function validateCreatePassDto(body) {
  const errors = [];
  const e1 = requireNumber(body.userId, "userId");
  if (e1) errors.push(e1);
  const e1_room = requireNumber(body.roomId, "roomId");
  if (e1_room) errors.push(e1_room);
  const e2 = requireEnum(body.reason, "reason", ALLOWED_REASONS);
  if (e2) errors.push(e2);
  const e3 = requireIsoDate(body.validUntil, "validUntil");
  if (e3) errors.push(e3);
  const e4 = requireString(body.issuerName, "issuerName", 2);
  if (e4) errors.push(e4);
  return errors;
}

function parseCreatePassDto(body) {
  return {
    userId: body.userId,
    roomId: body.roomId,
    reason: body.reason,
    validUntil: body.validUntil,
    issuerName: body.issuerName.trim(),
    comment: body.comment ? body.comment.trim() : "",
  };
}

function validateUpdatePassDto(body) {
  const errors = [];
  if (body.reason !== undefined) {
    const e = requireEnum(body.reason, "reason", ALLOWED_REASONS);
    if (e) errors.push(e);
  }
  return errors;
}

function parseUpdatePassDto(body) {
  const dto = {};
  if (body.reason !== undefined) dto.reason = body.reason;
  return dto;
}

function toPassResponseDto(pass) {
  return {
    id: pass.id,
    userId: pass.userId,
    roomId: pass.roomId,
    studentName: pass.studentName,
    roomNumber: pass.roomNumber,
    reason: pass.reason,
    validUntil: pass.validUntil,
    issuerName: pass.issuerName,
    comment: pass.comment,
    createdAt: pass.createdAt,
  };
}

module.exports = {
  validateCreatePassDto,
  parseCreatePassDto,
  validateUpdatePassDto,
  parseUpdatePassDto,
  toPassResponseDto,
  ALLOWED_REASONS,
};