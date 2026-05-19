const usersRepo = require("../repositories/users.repository");
const { ApiError } = require("../middleware/error-handler.middleware");

async function getAll() {
  return await usersRepo.getAll();
}

async function getById(id) {
  const user = await usersRepo.getById(id);
  if (!user) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
  return user;
}

async function create(dto) {
  const existing = await usersRepo.getByEmail(dto.email);
  if (existing) {
    throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
  }
  return await usersRepo.add(dto);
}

async function update(id, dto) {
  const existing = await usersRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);

  if (dto.email && dto.email !== existing.email) {
    const emailTaken = await usersRepo.getByEmail(dto.email);
    if (emailTaken) {
      throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
    }
  }

  return await usersRepo.update(id, dto);
}

async function remove(id) {
  const deleted = await usersRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
}

module.exports = { getAll, getById, create, update, remove };