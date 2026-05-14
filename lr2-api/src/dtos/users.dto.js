
function requireString(value, field, minLen = 1) {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return { field, message: `${field} must be a non-empty string (min ${minLen} chars)` };
  }
  return null;
}

function requireEmail(value, field) {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { field, message: `${field} must be a valid email address` };
  }
  return null;
}


function validateCreateUserDto(body) {
  const errors = [];
  const e1 = requireString(body.fullName, "fullName", 2);
  if (e1) errors.push(e1);
  const e2 = requireEmail(body.email, "email");
  if (e2) errors.push(e2);
  const e3 = requireString(body.role, "role", 2);
  if (e3) errors.push(e3);
  return errors;
}

function parseCreateUserDto(body) {
  return {
    fullName: body.fullName.trim(),
    email: body.email.trim().toLowerCase(),
    role: body.role.trim(),
  };
}


function validateUpdateUserDto(body) {
  const errors = [];
  if (body.fullName !== undefined) {
    const e = requireString(body.fullName, "fullName", 2);
    if (e) errors.push(e);
  }
  if (body.email !== undefined) {
    const e = requireEmail(body.email, "email");
    if (e) errors.push(e);
  }
  if (body.role !== undefined) {
    const e = requireString(body.role, "role", 2);
    if (e) errors.push(e);
  }
  if (Object.keys(body).length === 0) {
    errors.push({ field: "body", message: "At least one field must be provided for update" });
  }
  return errors;
}

function parseUpdateUserDto(body) {
  const dto = {};
  if (body.fullName !== undefined) dto.fullName = body.fullName.trim();
  if (body.email !== undefined) dto.email = body.email.trim().toLowerCase();
  if (body.role !== undefined) dto.role = body.role.trim();
  return dto;
}


function toUserResponseDto(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = {
  validateCreateUserDto,
  parseCreateUserDto,
  validateUpdateUserDto,
  parseUpdateUserDto,
  toUserResponseDto,
};
