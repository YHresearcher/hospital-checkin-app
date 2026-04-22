const API_URL = "https://script.google.com/macros/s/AKfycbxfkfoT8PBmvOJP2xQSwY3ca35kxN9VS_rKpjDZAqEZO0FLmmR31jR_BIRU_a-MNeyaWg/exec";

let customers = [];

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    customers = data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      passport: row[2] === true,
      photo: row[3] === true,
      workPermit: row[4] === true,
      scan: row[5] === true,
      checkout: row[6] === true,
      signed: row[7] === true
    }));

    renderTable();
  } catch (err) {
    console.error("Load error:", err);
  }
}

/* =========================
   CHECK COMPLETED
========================= */
function isCompleted(c) {
  return (
    c.passport &&
    c.photo &&
    c.workPermit &&
    c.scan &&
    c.checkout &&
    c.signed
  );
}

/* =========================
   RENDER TABLE
========================= */
function renderTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";

  customers.forEach((c, index) => {
    const row = document.createElement("tr");

    const statusClass = isCompleted(c) ? "done" : "pending";

    row.innerHTML = `
      <td class="${statusClass}">${c.name}</td>
      <td><input type="checkbox" ${c.passport ? "checked" : ""} onchange="updateAndSave(${index}, 'passport', this.checked)"></td>
      <td><input type="checkbox" ${c.photo ? "checked" : ""} onchange="updateAndSave(${index}, 'photo', this.checked)"></td>
      <td><input type="checkbox" ${c.workPermit ? "checked" : ""} onchange="updateAndSave(${index}, 'workPermit', this.checked)"></td>
      <td><input type="checkbox" ${c.scan ? "checked" : ""} onchange="updateAndSave(${index}, 'scan', this.checked)"></td>
      <td><input type="checkbox" ${c.checkout ? "checked" : ""} onchange="updateAndSave(${index}, 'checkout', this.checked)"></td>
      <td><input type="checkbox" ${c.signed ? "checked" : ""} onchange="updateAndSave(${index}, 'signed', this.checked)"></td>
      <td>${isCompleted(c) ? "✅" : "⏳"}</td>
    `;

    tbody.appendChild(row);
  });

  updateDashboard();
}

/* =========================
   UPDATE + AUTO SAVE
========================= */
function updateAndSave(index, field, value) {
  customers[index][field] = value;

  // Save ngay
  sendToServer(customers[index]);

  // Render lại UI
  renderTable();
}

/* =========================
   SEND TO SERVER
========================= */
async function sendToServer(customer) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customer)
    });

    const text = await res.text();
    console.log(`Saved ${customer.name}:`, text);
  } catch (err) {
    console.error("Save error:", err);
  }
}

/* =========================
   DASHBOARD
========================= */
function updateDashboard() {
  const total = customers.length;
  const done = customers.filter(c => isCompleted(c)).length;
  const pending = total - done;

  document.getElementById("total").innerText = total;
  document.getElementById("done").innerText = done;
  document.getElementById("pending").innerText = pending;
}

/* =========================
   INIT
========================= */
loadData();
