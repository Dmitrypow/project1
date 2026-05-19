const passesRepo = require("../repositories/passes.repository");
const { ApiError } = require("../middleware/error-handler.middleware");

async function getAll(filters) {
  return await passesRepo.getAll(filters);
}

async function getById(id) {
  const pass = await passesRepo.getById(id);
  if (!pass) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return pass;
}

async function create(dto) {
  const today = new Date().toISOString().slice(0, 10);
  if (dto.validUntil < today) {
    throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
      { field: "validUntil", message: "Date must be today or in the future" },
    ]);
  }
  return await passesRepo.add(dto);
}

async function update(id, dto) {
  const existing = await passesRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);

  if (dto.validUntil) {
    const today = new Date().toISOString().slice(0, 10);
    if (dto.validUntil < today) {
      throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
        { field: "validUntil", message: "Date must be today or in the future" },
      ]);
    }
  }

  return await passesRepo.update(id, dto);
}

async function remove(id) {
  const deleted = await passesRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
}

module.exports = { getAll, getById, create, update, remove };