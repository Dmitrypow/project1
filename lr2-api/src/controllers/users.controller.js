const usersService = require("../services/users.service");
const { ApiError } = require("../middleware/error-handler.middleware");
const {
  validateCreateUserDto,
  parseCreateUserDto,
  validateUpdateUserDto,
  parseUpdateUserDto,
  toUserResponseDto,
} = require("../dtos/users.dto");

function getAll(req, res) {
  const users = usersService.getAll();
  res.status(200).json({ items: users.map(toUserResponseDto) });
}

function getById(req, res, next) {
  try {
    const user = usersService.getById(req.params.id);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const errors = validateCreateUserDto(req.body);
    if (errors.length > 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    }
    const dto = parseCreateUserDto(req.body);
    const user = usersService.create(dto);
    res.status(201).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const errors = validateUpdateUserDto(req.body);
    if (errors.length > 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    }
    const dto = parseUpdateUserDto(req.body);
    const user = usersService.update(req.params.id, dto);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    usersService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
