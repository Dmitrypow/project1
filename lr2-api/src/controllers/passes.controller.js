const passesService = require("../services/passes.service");
const { ApiError } = require("../middleware/error-handler.middleware");
const {
  validateCreatePassDto,
  parseCreatePassDto,
  validateUpdatePassDto,
  parseUpdatePassDto,
  toPassResponseDto,
} = require("../dtos/passes.dto");

function getAll(req, res) {
  // Filtering via query params: ?reason=...&studentName=...
  const { reason, studentName } = req.query;
  const passes = passesService.getAll({ reason, studentName });
  res.status(200).json({ items: passes.map(toPassResponseDto) });
}

function getById(req, res, next) {
  try {
    const pass = passesService.getById(req.params.id);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

function create(req, res, next) {
  try {
    const errors = validateCreatePassDto(req.body);
    if (errors.length > 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    }
    const dto = parseCreatePassDto(req.body);
    const pass = passesService.create(dto);
    res.status(201).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

function update(req, res, next) {
  try {
    const errors = validateUpdatePassDto(req.body);
    if (errors.length > 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    }
    const dto = parseUpdatePassDto(req.body);
    const pass = passesService.update(req.params.id, dto);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

function remove(req, res, next) {
  try {
    passesService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function getTopByReason(req, res) {
  try {
    const data = passesService.getTopStudentByReason()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getAll, getById, create, update, remove, getTopByReason };
