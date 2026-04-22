const API_URL = "https://script.google.com/macros/s/AKfycbyHIgN4L32DR6_eviNkKHW8ZuBZ2UvJSyDlpbFaUpK7Cy1QjD4JKlpD8PB2u2-tsntueQ/exec";

let customers = [];
/*GenID*/
if (!data[i][0]) {
  const id = Date.now();
  sheet.getRange(i + 1, 1).setValue(id);
  data[i][0] = id;
}
/* LOAD DATA */
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

  render();
}

/* CHECK COMPLETE */
function isDone(c) {
  return (
    c.passport &&
    c.photo &&
    c.workPermit &&
    c.scan &&
    c.checkout &&
    c.signed
  );
}

/* AUTO SAVE */
async function save(c) {
  const url = API_URL + "?data=" + encodeURIComponent(JSON.stringify(c));

  await fetch(url);  // 🔥 chỉ GET, KHÔNG POST
}

/* UPDATE */
function update(i, field, value) {
  customers[i][field] = value;

  save(customers[i]);   // auto save
  render();             // update UI
}

/* RENDER */
function render() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";

  customers.forEach((c, i) => {
    const row = document.createElement("tr");

    const cls = isDone(c) ? "done" : "pending";

    row.innerHTML = `
      <td class="${cls}">${c.name}</td>
      <td><input type="checkbox" ${c.passport ? "checked" : ""} onchange="update(${i}, 'passport', this.checked)"></td>
      <td><input type="checkbox" ${c.photo ? "checked" : ""} onchange="update(${i}, 'photo', this.checked)"></td>
      <td><input type="checkbox" ${c.workPermit ? "checked" : ""} onchange="update(${i}, 'workPermit', this.checked)"></td>
      <td><input type="checkbox" ${c.scan ? "checked" : ""} onchange="update(${i}, 'scan', this.checked)"></td>
      <td><input type="checkbox" ${c.checkout ? "checked" : ""} onchange="update(${i}, 'checkout', this.checked)"></td>
      <td><input type="checkbox" ${c.signed ? "checked" : ""} onchange="update(${i}, 'signed', this.checked)"></td>
      <td>${isDone(c) ? "✅" : "⏳"}</td>
    `;

    tbody.appendChild(row);
  });

  updateDashboard();
}

/* DASHBOARD */
function updateDashboard() {
  const total = customers.length;
  const done = customers.filter(isDone).length;

  document.getElementById("total").innerText = total;
  document.getElementById("done").innerText = done;
  document.getElementById("pending").innerText = total - done;
}

loadData();
