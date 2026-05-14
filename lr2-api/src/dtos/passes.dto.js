const ALLOWED_REASONS = ["Навчання", "Лабораторна робота", "Робота над проектом", "Технічне обслуговування"];


function requireString(value, field, minLen = 1) {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return { field, message: `${field} must be a non-empty string (min ${minLen} chars)` };
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

  const e1 = requireString(body.studentName, "studentName", 2);
  if (e1) errors.push(e1);

  const e2 = requireEnum(body.reason, "reason", ALLOWED_REASONS);
  if (e2) errors.push(e2);

  const e3 = requireIsoDate(body.validUntil, "validUntil");
  if (e3) errors.push(e3);

  const e4 = requireString(body.issuerName, "issuerName", 2);
  if (e4) errors.push(e4);

  if (body.comment !== undefined && body.comment !== null) {
    const e5 = requireString(body.comment, "comment", 0);
    if (e5) errors.push(e5);
    if (typeof body.comment === "string" && body.comment.length > 500) {
      errors.push({ field: "comment", message: "comment must not exceed 500 characters" });
    }
  }

  return errors;
}

function parseCreatePassDto(body) {
  return {
    studentName: body.studentName.trim(),
    reason: body.reason,
    validUntil: body.validUntil,
    issuerName: body.issuerName.trim(),
    comment: body.comment ? body.comment.trim() : "",
  };
}


function validateUpdatePassDto(body) {
  const errors = [];

  if (body.studentName !== undefined) {
    const e = requireString(body.studentName, "studentName", 2);
    if (e) errors.push(e);
  }

  if (body.reason !== undefined) {
    const e = requireEnum(body.reason, "reason", ALLOWED_REASONS);
    if (e) errors.push(e);
  }

  if (body.validUntil !== undefined) {
    const e = requireIsoDate(body.validUntil, "validUntil");
    if (e) errors.push(e);
  }

  if (body.issuerName !== undefined) {
    const e = requireString(body.issuerName, "issuerName", 2);
    if (e) errors.push(e);
  }

  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment === "string" && body.comment.length > 500) {
      errors.push({ field: "comment", message: "comment must not exceed 500 characters" });
    }
  }

  if (Object.keys(body).length === 0) {
    errors.push({ field: "body", message: "At least one field must be provided for update" });
  }

  return errors;
}

function parseUpdatePassDto(body) {
  const dto = {};
  if (body.studentName !== undefined) dto.studentName = body.studentName.trim();
  if (body.reason !== undefined) dto.reason = body.reason;
  if (body.validUntil !== undefined) dto.validUntil = body.validUntil;
  if (body.issuerName !== undefined) dto.issuerName = body.issuerName.trim();
  if (body.comment !== undefined) dto.comment = body.comment ? body.comment.trim() : "";
  return dto;
}


function toPassResponseDto(pass) {
  return {
    id: pass.id,
    studentName: pass.studentName,
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
