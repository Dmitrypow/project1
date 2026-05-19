const passesService = require("../services/passes.service");
const { ApiError } = require("../middleware/error-handler.middleware");
const { validateCreatePassDto, parseCreatePassDto, validateUpdatePassDto, parseUpdatePassDto, toPassResponseDto } = require("../dtos/passes.dto");

async function getAll(req, res, next) {
  try {
    const passes = await passesService.getAll(req.query);
    res.status(200).json({ items: passes.map(toPassResponseDto) });
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const pass = await passesService.getById(req.params.id);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const errors = validateCreatePassDto(req.body);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseCreatePassDto(req.body);
    const pass = await passesService.create(dto);
    res.status(201).json(toPassResponseDto(pass));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const errors = validateUpdatePassDto(req.body);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseUpdatePassDto(req.body);
    const pass = await passesService.update(req.params.id, dto);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await passesService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };