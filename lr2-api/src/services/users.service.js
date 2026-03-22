const usersRepo = require("../repositories/users.repository");
const { ApiError } = require("../middleware/error-handler.middleware");

function getAll() {
  return usersRepo.getAll();
}

function getById(id) {
  const user = usersRepo.getById(id);
  if (!user) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
  return user;
}

function create(dto) {
  // Business rule: email must be unique
  const existing = usersRepo.getByEmail(dto.email);
  if (existing) {
    throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
  }
  return usersRepo.add(dto);
}

function update(id, dto) {
  // Check exists
  const existing = usersRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);

  // If email is changing — check uniqueness
  if (dto.email && dto.email !== existing.email) {
    const emailTaken = usersRepo.getByEmail(dto.email);
    if (emailTaken) {
      throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
    }
  }

  return usersRepo.update(id, dto);
}

function remove(id) {
  const deleted = usersRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
}

module.exports = { getAll, getById, create, update, remove };
