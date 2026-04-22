const API_URL = "https://script.google.com/macros/s/AKfycbyHIgN4L32DR6_eviNkKHW8ZuBZ2UvJSyDlpbFaUpK7Cy1QjD4JKlpD8PB2u2-tsntueQ/exec";

let customers = [];

/*Import Excels*/
async function importExcel() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) {
    alert("Chọn file trước");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log("Excel data:", jsonData);

    // gửi lên Google Sheet
    await sendToSheet(jsonData);

    alert("Import xong!");
    loadData(); // reload lại bảng
  };

  reader.readAsArrayBuffer(file);
}

/*Sent data to Sheets*/
async function sendToSheet(data) {
  const url = API_URL + "?import=" + encodeURIComponent(JSON.stringify(data));
  await fetch(url);
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

/*Highlight dòng đang xử lý*/
row.style.transition = "0.2s";

/*Disable khi đang save*/
async function update(i, field, value) {
  customers[i][field] = value;

  document.body.style.cursor = "wait";

  await save(customers[i]);

  document.body.style.cursor = "default";

  render();
}

/*Sort khách chưa hoàn tất lên đầu*/
customers.sort((a, b) => isDone(a) - isDone(b));

