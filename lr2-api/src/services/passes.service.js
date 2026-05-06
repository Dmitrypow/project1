const passesRepo = require("../repositories/passes.repository");

const { ApiError } = require("../middleware/error-handler.middleware");

function getAll(filters) {
  return passesRepo.getAll(filters);
}

function getById(id) {
  const pass = passesRepo.getById(id);
  if (!pass) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return pass;
}

function create(dto) {
  // Business rule: validUntil must not be in the past
  const today = new Date().toISOString().slice(0, 10);
  if (dto.validUntil < today) {
    throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
      { field: "validUntil", message: "Date must be today or in the future" },
    ]);
  }
  return passesRepo.add(dto);
}

function update(id, dto) {
  const existing = passesRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);

  // If updating validUntil — check it's not in the past
  if (dto.validUntil) {
    const today = new Date().toISOString().slice(0, 10);
    if (dto.validUntil < today) {
      throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
        { field: "validUntil", message: "Date must be today or in the future" },
      ]);
    }
  }

  return passesRepo.update(id, dto);
}

function remove(id) {
  const deleted = passesRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
}

function getTopStudentByReason() {
  const passes = passesRepo.getAll()  

  const stats = {};

  for (const p of passes) {
    const reason = p.reason
    const student = p.studentName  

    if (!reason || !student) continue

    if (!stats[reason]) {
      stats[reason] = {}
    }

    stats[reason][student] = (stats[reason][student] || 0) + 1
  }

  const result = {};

  for (const reason in stats) {
    let max = 0
    let topStudent = null

    for (const student in stats[reason]) {
      const count = stats[reason][student]

      if (count > max) {
        max = count
        topStudent = student
      }
    }

    result[reason] = {
      studentId: topStudent,
      count: max
    }
  }

  return result;
}

module.exports = { getAll, getById, create, update, remove, getTopStudentByReason };
`