const usersService = require("../services/users.service");
const { ApiError } = require("../middleware/error-handler.middleware");
const { validateCreateUserDto, parseCreateUserDto, validateUpdateUserDto, parseUpdateUserDto, toUserResponseDto } = require("../dtos/users.dto");

async function getAll(req, res, next) {
  try {
    const users = await usersService.getAll();
    res.status(200).json({ items: users.map(toUserResponseDto) });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const user = await usersService.getById(req.params.id);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validateCreateUserDto(req.body);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseCreateUserDto(req.body);
    const user = await usersService.create(dto);
    res.status(201).json(toUserResponseDto(user));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const errors = validateUpdateUserDto(req.body);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseUpdateUserDto(req.body);
    const user = await usersService.update(req.params.id, dto);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await usersService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };