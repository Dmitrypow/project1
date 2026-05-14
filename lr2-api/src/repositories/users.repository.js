const { v4: uuidv4 } = require("uuid");

const users = [];

function getAll() {
  return [...users];
}

function getById(id) {
  return users.find((u) => u.id === id) || null;
}

function getByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

function add(dto) {
  const entity = {
    id: uuidv4(),
    fullName: dto.fullName,
    email: dto.email,
    role: dto.role,
    createdAt: new Date().toISOString(),
  };
  users.push(entity);
  return entity;
}

function update(id, dto) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...dto };
  return users[index];
}

function remove(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, getByEmail, add, update, remove };
