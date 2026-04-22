const API_URL = "YOUR_GOOGLE_SCRIPT_URL";

let customers = [];

async function loadData() {
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
}

function renderTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";

  customers.forEach((c, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c.name}</td>
      <td><input type="checkbox" ${c.passport ? "checked" : ""} onchange="update(${index}, 'passport', this.checked)"></td>
      <td><input type="checkbox" ${c.photo ? "checked" : ""} onchange="update(${index}, 'photo', this.checked)"></td>
      <td><input type="checkbox" ${c.workPermit ? "checked" : ""} onchange="update(${index}, 'workPermit', this.checked)"></td>
      <td><input type="checkbox" ${c.scan ? "checked" : ""} onchange="update(${index}, 'scan', this.checked)"></td>
      <td><input type="checkbox" ${c.checkout ? "checked" : ""} onchange="update(${index}, 'checkout', this.checked)"></td>
      <td><input type="checkbox" ${c.signed ? "checked" : ""} onchange="update(${index}, 'signed', this.checked)"></td>
      <td><button onclick="submitRow(${index})">Submit</button></td>
    `;

    tbody.appendChild(row);
  });
}

function update(index, field, value) {
  customers[index][field] = value;
}

function submitRow(index) {
  const c = customers[index];

  const fields = [
    { key: "passport", label: "Passport" },
    { key: "photo", label: "Photo" },
    { key: "workPermit", label: "Work Permit" },
    { key: "scan", label: "Scan" },
    { key: "checkout", label: "Checkout" },
    { key: "signed", label: "Signed" }
  ];

  for (let f of fields) {
    if (!c[f.key]) {
      alert(`❌ ${f.label} chưa hoàn tất - Khách: ${c.name}`);
      return;
    }
  }

  sendToServer(c);
}

async function sendToServer(customer) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(customer)
  });

  alert("✅ Completed!");
}

loadData();
