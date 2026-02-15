let state = {
  passes: [],
  editId: null,
  sortAsc: true
};

const form = document.getElementById("passForm");
const tableBody = document.getElementById("passesTableBody");

const searchInput = document.getElementById("searchInput");
const filterReason = document.getElementById("filterReason");

function saveToStorage() {
  localStorage.setItem("passes", JSON.stringify(state.passes));
}

function loadFromStorage() {
  const data = localStorage.getItem("passes");
  if (data) {
    state.passes = JSON.parse(data);
  }
}

function validate() {
  let valid = true;

  document.querySelectorAll(".error").forEach(e => e.textContent = "");
  document.querySelectorAll("input, select").forEach(el => el.classList.remove("invalid"));

  const userName = document.getElementById("userName");
  const reason = document.getElementById("reason");
  const validDate = document.getElementById("validDate");
  const issuer = document.getElementById("issuer");

  if (!userName.value.trim()) {
    setError(userName, "Обов'язкове поле");
    valid = false;
  }

  if (!reason.value) {
    setError(reason, "Оберіть причину");
    valid = false;
  }

  if (!validDate.value) {
    setError(validDate, "Оберіть дату");
    valid = false;
  }

  if (!issuer.value.trim()) {
    setError(issuer, "Обов'язкове поле");
    valid = false;
  }

  return valid;
}

function setError(input, message) {
  input.classList.add("invalid");
  input.nextElementSibling.textContent = message;
}

function render() {
  tableBody.innerHTML = "";

  let filtered = [...state.passes];

  if (searchInput.value) {
    filtered = filtered.filter(p =>
      p.userName.toLowerCase().includes(searchInput.value.toLowerCase())
    );
  }

  if (filterReason.value) {
    filtered = filtered.filter(p => p.reason === filterReason.value);
  }

  filtered.forEach((pass, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${pass.userName}</td>
      <td>${pass.reason}</td>
      <td>${pass.validDate}</td>
      <td>${pass.issuer}</td>
      <td>
        <button data-id="${pass.id}" class="edit">Редагувати</button>
        <button data-id="${pass.id}" class="delete">Видалити</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validate()) return;

  const newPass = {
    id: state.editId || Date.now(),
    userName: userName.value,
    reason: reason.value,
    validDate: validDate.value,
    comment: comment.value,
    issuer: issuer.value
  };

  if (state.editId) {
    state.passes = state.passes.map(p => p.id === state.editId ? newPass : p);
    state.editId = null;
  } else {
    state.passes.push(newPass);
  }

  form.reset();
  document.getElementById("cancelEdit").style.display = "none";
  saveToStorage();
  render();
});

tableBody.addEventListener("click", function (e) {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains("delete")) {
    state.passes = state.passes.filter(p => p.id !== id);
    saveToStorage();
    render();
  }

  if (e.target.classList.contains("edit")) {
    const pass = state.passes.find(p => p.id === id);

    userName.value = pass.userName;
    reason.value = pass.reason;
    validDate.value = pass.validDate;
    comment.value = pass.comment;
    issuer.value = pass.issuer;

    state.editId = id;
    document.getElementById("cancelEdit").style.display = "inline-block";
  }
});

document.getElementById("cancelEdit").addEventListener("click", function () {
  form.reset();
  state.editId = null;
  this.style.display = "none";
});

searchInput.addEventListener("input", render);
filterReason.addEventListener("change", render);

document.getElementById("sortDate").addEventListener("click", function () {
  state.passes.sort((a, b) =>
    state.sortAsc
      ? new Date(a.validDate) - new Date(b.validDate)
      : new Date(b.validDate) - new Date(a.validDate)
  );
  state.sortAsc = !state.sortAsc;
  render();
});

loadFromStorage();
render();
