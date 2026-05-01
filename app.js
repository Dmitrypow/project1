let passes = [];
let editId = null;
let displayedPasses = [];

app.use("/passes", require("./routes/passes.routes"));
function saveToStorage() {
    const json = JSON.stringify(passes);
    localStorage.setItem("lr1_passes", json);
}

function loadFromStorage() {
    const json = localStorage.getItem("lr1_passes");
    if (json === null) {
        return [];
    }
    return JSON.parse(json);
}

function readForm() {
    const userNameValue = document.getElementById("userNameInput").value;
    const reasonValue = document.getElementById("reasonSelect").value;
    const validDateValue = document.getElementById("validDateInput").value;
    const commentValue = document.getElementById("commentInput").value;
    const issuerValue = document.getElementById("issuerInput").value;

    return {
        userName: userNameValue,
        reason: reasonValue,
        validDate: validDateValue,
        comment: commentValue,
        issuer: issuerValue
    };
}

function clearErrors() {
    const inputs = document.querySelectorAll(".invalid");
    for (const input of inputs) {
        input.classList.remove("invalid");
    }
    
    const errorTexts = document.querySelectorAll(".error-text");
    for (const text of errorTexts) {
        text.innerHTML = "";
    }
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorText = document.getElementById(errorId);
    
    input.classList.add("invalid");
    errorText.innerHTML = message;
}

function validate(dto) {
    clearErrors();
    let isValid = true;

    const user = dto.userName.trim();
    if (user === "") {
        showError("userNameInput", "userNameError", "Поле є обов'язковим.");
        isValid = false;
    } else if (user.length < 3) {
        showError("userNameInput", "userNameError", "Довжина має бути не менше 3 символів.");
        isValid = false;
    }

    if (dto.reason === "") {
        showError("reasonSelect", "reasonError", "Оберіть значення зі списку.");
        isValid = false;
    }

    if (dto.validDate === "") {
        showError("validDateInput", "validDateError", "Вкажіть дату.");
        isValid = false;
    }

    const issuer = dto.issuer.trim();
    if (issuer === "") {
        showError("issuerInput", "issuerError", "Поле є обов'язковим.");
        isValid = false;
    }

    return isValid;
}



function renderStats() {
    const reasons = ["Навчання", "Лабораторна робота", "Робота над проектом", "Технічне обслуговування"];
    const tbody = document.getElementById("statsTableBody");
    const emptyMsg = document.getElementById("statsEmpty");

    const rows = [];

    for (const reason of reasons) {
        const filtered = passes.filter(p => p.reason === reason);
        if (filtered.length === 0) continue;

        // Count per student
        const counts = {};
        for (const p of filtered) {
            counts[p.userName] = (counts[p.userName] || 0) + 1;
        }

        // Find student with max count
        let topStudent = null;
        let topCount = 0;
        for (const [name, count] of Object.entries(counts)) {
            if (count > topCount) {
                topCount = count;
                topStudent = name;
            }
        }

        rows.push({ reason, topStudent, topCount });
    }

    if (rows.length === 0) {
        tbody.innerHTML = "";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";
    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${r.reason}</td>
            <td>${r.topStudent}</td>
            <td style="text-align:center;">${r.topCount}</td>
        </tr>
    `).join("");
}


    const tbody = document.getElementById("passesTableBody");
    
    const rowsHtml = dataToDisplay.map((item, index) => {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.userName}</td>
                <td>${item.reason}</td>
                <td>${item.validDate}</td>
                <td>${item.comment}</td>
                <td>${item.issuer}</td>
                <td>
                    <button type="button" class="edit-btn" data-id="${item.id}">Редагувати</button>
                    <button type="button" class="delete-btn" data-id="${item.id}">Видалити</button>
                </td>
            </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;
}

const form = document.getElementById("passForm");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const dto = readForm();

    const isValid = validate(dto);
    if (!isValid) return;

    if (editId === null) {
        const newItem = {
            id: Date.now(),
            userName: dto.userName,
            reason: dto.reason,
            validDate: dto.validDate,
            comment: dto.comment,
            issuer: dto.issuer
        };
        passes.push(newItem);
    } else {
        for (let i = 0; i < passes.length; i++) {
            if (passes[i].id === editId) {
                passes[i].userName = dto.userName;
                passes[i].reason = dto.reason;
                passes[i].validDate = dto.validDate;
                passes[i].comment = dto.comment;
                passes[i].issuer = dto.issuer;
            }
        }
        editId = null;
        document.getElementById("submitBtn").innerText = "Додати";
        document.getElementById("cancelEditBtn").style.display = "none";
    }

    saveToStorage();
    renderTable(passes);
    renderStats();
    
    form.reset();
});

const cancelBtn = document.getElementById("cancelEditBtn");
cancelBtn.addEventListener("click", () => {
    form.reset();
    editId = null;
    document.getElementById("submitBtn").innerText = "Додати";
    cancelBtn.style.display = "none";
    clearErrors();
});

const tbody = document.getElementById("passesTableBody");

tbody.addEventListener("click", (event) => {
    const target = event.target;
    
    if (target.classList.contains("delete-btn")) {
        const id = Number(target.dataset.id);
        
        passes = passes.filter(x => x.id !== id);
        
        saveToStorage();
        renderTable(passes);
        renderStats();
    }

    if (target.classList.contains("edit-btn")) {
        const id = Number(target.dataset.id);
        
        const item = passes.find(x => x.id === id);
        
        if (item) {
            document.getElementById("userNameInput").value = item.userName;
            document.getElementById("reasonSelect").value = item.reason;
            document.getElementById("validDateInput").value = item.validDate;
            document.getElementById("commentInput").value = item.comment;
            document.getElementById("issuerInput").value = item.issuer;

            editId = id;
            
            document.getElementById("submitBtn").innerText = "Зберегти";
            document.getElementById("cancelEditBtn").style.display = "inline-block";
        }
    }
});

passes = loadFromStorage();
displayedPasses = [...passes];
renderTable(displayedPasses);
renderStats();

let sortDirection = true;
let currentSortColumn = null;

function updateSortIcons(column, direction) {
    document.querySelectorAll('.sort-icon').forEach(span => span.innerHTML = '');
    
    const activeHeader = document.querySelector(`th[data-sort="${column}"] .sort-icon`);
    if (activeHeader) {
        activeHeader.innerHTML = direction ? '⬆️' : '⬇️';

    }
}
function sortPasses(column) {
    sortDirection = (currentSortColumn === column) ? !sortDirection : true;
    currentSortColumn = column;

    displayedPasses.sort((a, b) => {
        let valA = (column === 'index') ? displayedPasses.indexOf(a) : a[column];
        let valB = (column === 'index') ? displayedPasses.indexOf(b) : b[column];

        if (valA < valB) return sortDirection ? -1 : 1;
        if (valA > valB) return sortDirection ? 1 : -1;

        return 0;
    });

    updateSortIcons(column, sortDirection);
    renderTable(displayedPasses);
}

document.querySelectorAll('th[data-sort]').forEach(header => {
    header.addEventListener('click', () => {
        sortPasses(header.dataset.sort);
    });
});

function applyFilters() {
    const searchTerm = document.getElementById("searchByName").value.toLowerCase();
    const selectedReason = document.getElementById("filterReason").value;

    const filteredPasses = passes.filter(item => {
        const matchesName = item.userName.toLowerCase().includes(searchTerm);
        const machesReason = selectedReason === "" || item.reason === selectedReason;

        return matchesName && machesReason;
    });
    renderTable(filteredPasses);
}

function searchByStudent() {
    const searchTerm = document.getElementById("searchByName").value.toLowerCase();

    const filtered = passes.filter(item =>
        item.userName.toLowerCase().includes(searchTerm)
    );

    renderTable(filtered);
}

document.getElementById("searchByName").addEventListener("input", searchByStudent);
document.getElementById("findNames").addEventListener("click", searchByStudent);
document.getElementById("searchByName").addEventListener("input", applyFilters);
document.getElementById("firteredReason").addEventListener("change", applyFilters);