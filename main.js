const form = document.getElementById("flinfo");
const status = document.getElementById("form-status");
const entriesList = document.getElementById("entries-list");
const storageKey = "flight-log-entries";

function getStorage() {
  try {
    const testKey = "__flight_log_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    console.warn("localStorage unavailable; using sessionStorage instead.");
    return window.sessionStorage;
  }
}

const storage = getStorage();
const entries = loadEntries();

function loadEntries() {
  try {
    const stored = storage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Unable to read saved entries:", error);
    return [];
  }
}

function saveEntries() {
  try {
    storage.setItem(storageKey, JSON.stringify(entries));
  } catch (error) {
    console.error("Unable to save entries:", error);
  }
}

function formatDate(value) {
  if (!value) return "No date";
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function renderEntries() {
  if (!entriesList) return;

  if (entries.length === 0) {
    entriesList.innerHTML =
      '<li class="empty-state">No flights saved yet.</li>';
    return;
  }

  entriesList.innerHTML = "";

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.tabIndex = 0;
    item.innerHTML = `
      <div class="entry-details">
        <span class="entry-title">${entry.airline} · ${entry.callsign}</span>
        <span class="entry-meta">${entry.aircraft} • ${formatDate(entry.date)} • ${entry.deptime || "--"} to ${entry.arrtime || "--"}</span>
        <div class="entry-extra">
          <div class="entry-route">Route: ${entry.depairport || "--"} → ${entry.arrairport || "--"}</div>
          <div>Runways: ${entry.deprw || "--"} / ${entry.arrrw || "--"}</div>
          <div>Livery: ${entry.livery || "--"}</div>
        </div>
      </div>
      <button type="button" class="delete-btn" data-index="${index}">Delete</button>
    `;

    item.addEventListener("mouseenter", () =>
      item.classList.add("is-expanded"),
    );
    item.addEventListener("mouseleave", () =>
      item.classList.remove("is-expanded"),
    );
    item.addEventListener("focus", () => item.classList.add("is-expanded"));
    item.addEventListener("blur", () => item.classList.remove("is-expanded"));

    entriesList.appendChild(item);
  });

  entriesList.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetIndex = Number(button.getAttribute("data-index"));
      entries.splice(targetIndex, 1);
      saveEntries();
      renderEntries();
      status.textContent = "Flight entry removed.";
      status.className = "status show";
    });
  });
}

if (form && status && entriesList) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const requiredFields = ["date", "airline", "callsign", "aircraft"];
    const missing = requiredFields.filter((field) => {
      const input = form.elements[field];
      return input && input.value.trim() === "";
    });

    if (missing.length > 0) {
      status.textContent =
        "Please fill in the required fields before submitting.";
      status.className = "status show error";
      return;
    }
    const data = {
      date: form.elements.date.value,
      airline: form.elements.airline.value.trim(),
      callsign: form.elements.callsign.value.trim(),
      aircraft: form.elements.aircraft.value.trim(),
      depairport: form.elements.depairport.value.trim(),
      arrairport: form.elements.arrairport.value.trim(),
      deptime: form.elements.deptime.value,
      arrtime: form.elements.arrtime.value,
      deprw: form.elements.deprw.value.trim(),
      arrrw: form.elements.arrrw.value.trim(),
      livery: form.elements.livery.value.trim(),
    };

    entries.push(data);
    saveEntries();
    renderEntries();
    status.textContent = `Flight log saved for ${data.airline} (${data.callsign}).`;
    status.className = "status show";
    form.reset();
  });

  renderEntries();
}
