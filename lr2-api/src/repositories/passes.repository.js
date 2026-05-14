const { v4: uuidv4 } = require("uuid");

const passes = [];

function getAll({ reason, studentName } = {}) {
  let result = [...passes];

  if (reason) {
    result = result.filter((p) => p.reason === reason);
  }
  if (studentName) {
    const search = studentName.toLowerCase();
    result = result.filter((p) => p.studentName.toLowerCase().includes(search));
  }

  return result;
}

function getById(id) {
  return passes.find((p) => p.id === id) || null;
}

function add(dto) {
  const entity = {
    id: uuidv4(),
    studentName: dto.studentName,
    reason: dto.reason,
    validUntil: dto.validUntil,
    issuerName: dto.issuerName,
    comment: dto.comment || "",
    createdAt: new Date().toISOString(),
  };
  passes.push(entity);
  return entity;
}

function update(id, dto) {
  const index = passes.findIndex((p) => p.id === id);
  if (index === -1) return null;
  passes[index] = { ...passes[index], ...dto };
  return passes[index];
}

function remove(id) {
  const index = passes.findIndex((p) => p.id === id);
  if (index === -1) return false;
  passes.splice(index, 1);
  return true;
}

function getByDate(date) {
  return passes.filter((p) => p.validUntil === date);
}

module.exports = { getAll, getById, add, update, remove, getByDate };
