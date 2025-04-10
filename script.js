document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("database-generator");
    const addTableBtn = document.querySelector(".new-table");

    const globalPopup = document.getElementById("global-data-popup");
    const popupForm = document.getElementById("popup-form");
    const popupConfirm = document.getElementById("popup-confirm");
    const popupCancel = document.getElementById("popup-cancel");
    const popupRowsList = document.getElementById("popup-rows-list");

    const tableDataMap = new Map();
    let currentPopupTableId = null;

    let tableCount = 0;

    addTableBtn.addEventListener("click", () => {
        const tableIndex = tableCount++;
        const tableId = `table${tableIndex}`;

        const tableDiv = document.createElement("div");
        tableDiv.className = "database-table";
        tableDiv.dataset.tableId = tableId;

        tableDiv.innerHTML = `
            <div class="inline-row">
                <span>create table if not exists</span>
                <input type="text" class="table-name" name="table${tableIndex}" required>
                <button type="button" class="delete-table delete">delete</button>
            </div>

            <div class="columns-container">
                ${generateColumnHTML(tableIndex, 1)}
            </div>

            <button type="button" class="new-column">add column</button>
            <button type="button" class="open-data-popup">insert values</button>
        `;

        tableDataMap.set(tableId, { columns: [], rows: [] });

        addTableListeners(tableDiv, tableIndex);
        form.insertBefore(tableDiv, addTableBtn);
    });

    function addTableListeners(tableDiv, tableIndex) {
        const tableId = tableDiv.dataset.tableId;
        const deleteTableBtn = tableDiv.querySelector(".delete-table");
        const addColumnBtn = tableDiv.querySelector(".new-column");
        const columnsContainer = tableDiv.querySelector(".columns-container");
        const openPopupBtn = tableDiv.querySelector(".open-data-popup");

        let columnCount = 2;

        deleteTableBtn.addEventListener("click", () => {
            tableDataMap.delete(tableId);
            tableDiv.remove();
        });

        addColumnBtn.addEventListener("click", () => {
            const columnHTML = generateColumnHTML(tableIndex, columnCount++);
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = columnHTML.trim();
            const columnElement = tempDiv.firstChild;
            addColumnListeners(columnElement, tableId);
            columnsContainer.appendChild(columnElement);
            updateColumnModel(columnsContainer, tableId);
        });

        const firstColumn = columnsContainer.querySelector(".database-table-column");
        addColumnListeners(firstColumn, tableId);

        openPopupBtn.addEventListener("click", () => {
            updateColumnModel(columnsContainer, tableId);
            const tableData = tableDataMap.get(tableId);
            const columns = tableData.columns;

            popupForm.innerHTML = "";
            columns.forEach(name => {
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = name;
                input.setAttribute("data-col-name", name);
                popupForm.appendChild(input);
            });

            popupRowsList.innerHTML = "";
tableData.rows.forEach((row, rowIndex) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "popup-data-row";

    const indexLabel = document.createElement("label");
    indexLabel.textContent = `#${rowIndex}`;
    rowDiv.appendChild(indexLabel);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-row delete";
    delBtn.textContent = "🗑️";
    delBtn.addEventListener("click", () => {
        tableData.rows.splice(rowIndex, 1);
        rowDiv.remove();
    });

    rowDiv.appendChild(delBtn);

    row.forEach((val, colIndex) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = val;
        input.placeholder = columns[colIndex];
        input.addEventListener("input", (e) => {
            tableData.rows[rowIndex][colIndex] = e.target.value;
        });
        rowDiv.appendChild(input);
    });
    popupRowsList.appendChild(rowDiv);
});


            globalPopup.classList.remove("hidden");
            currentPopupTableId = tableId;
        });
    }

    function addColumnListeners(columnDiv, tableId) {
        const deleteColumnBtn = columnDiv.querySelector(".delete-column");
        const configBtn = columnDiv.querySelector(".config-btn");
        const popup = columnDiv.querySelector(".popup-menu");

        deleteColumnBtn.addEventListener("click", () => {
            columnDiv.remove();
            updateColumnModel(columnDiv.closest(".columns-container"), tableId);
        });

        configBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            popup.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!popup.contains(e.target) && e.target !== configBtn) {
                popup.classList.add("hidden");
            }
        });

        const nameInput = columnDiv.querySelector('input[name*="name"]');
        nameInput.addEventListener("input", () => {
            updateColumnModel(columnDiv.closest(".columns-container"), tableId);
        });
    }

    function updateColumnModel(columnsContainer, tableId) {
        const nameInputs = columnsContainer.querySelectorAll("input[name*='name']");
        const newColumnNames = Array.from(nameInputs)
            .map(input => input.value.trim())
            .filter(name => !!name);

        const tableData = tableDataMap.get(tableId);
        if (!tableData) return;

        const updatedRows = tableData.rows.map(oldRow => {
            const newRow = newColumnNames.map(name => {
                const idx = tableData.columns.indexOf(name);
                return idx !== -1 ? oldRow[idx] : "";
            });
            return newRow;
        });

        tableData.columns = newColumnNames;
        tableData.rows = updatedRows;
    }

    function generateColumnHTML(tableIndex, columnIndex) {
        return `
        <div class="database-table-column">
            <div class="inline-row">
                <span style="width: 42px;">name</span>
                <input type="text" name="table${tableIndex}column${columnIndex}name" required>
                <button type="button" class="delete-column delete">delete</button>
            </div>
            <div class="inline-row">
                <span style="width: 42px;">type</span>
                <input type="text" name="table${tableIndex}column${columnIndex}type" required>
                <div class="popup-container">
                    <button type="button" class="config-btn">⚙️</button>
                    <div class="popup-menu hidden">
                        <div class="inline-row">
                            <label>NULL</label>
                            <select name="table${tableIndex}column${columnIndex}null">
                                <option value="YES">YES</option>
                                <option value="NO">NO</option>
                            </select>
                        </div>
                        <div class="inline-row">
                            <label>KEY</label>
                            <select name="table${tableIndex}column${columnIndex}key">
                                <option value="">(none)</option>
                                <option value="PRIMARY KEY">PRIMARY</option>
                                <option value="UNIQUE">UNIQUE</option>
                                <option value="INDEX">INDEX</option>
                            </select>
                        </div>
                        <div class="inline-row">
                            <label>DEFAULT</label>
                            <input type="text" name="table${tableIndex}column${columnIndex}default">
                        </div>
                        <div class="inline-row">
                            <label>EXTRA</label>
                            <input type="text" name="table${tableIndex}column${columnIndex}extra">
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    popupCancel.addEventListener("click", () => {
        globalPopup.classList.add("hidden");
        popupForm.innerHTML = "";
        popupRowsList.innerHTML = "";
        currentPopupTableId = null;
    });

    popupConfirm.addEventListener("click", () => {
        if (!currentPopupTableId) return;
        const inputs = popupForm.querySelectorAll("input[data-col-name]");
        const values = Array.from(inputs).map(input => input.value);
        const tableData = tableDataMap.get(currentPopupTableId);
        if (tableData) {
            tableData.rows.push(values);
        }
        popupForm.querySelectorAll("input").forEach(input => input.value = "");
        // Atualiza visualização
        document.querySelector(`[data-table-id="${currentPopupTableId}"] .open-data-popup`).click();
    });

    document.getElementById("download-sql").addEventListener("click", () => {
        const dbName = form.querySelector('[name="database-name"]').value;
        if (!dbName) {
            const popup = document.getElementById("alert-popup");
            const texto = document.getElementById("alert-popup-text");
            texto.textContent = "error: null database name";
            popup.showModal();
            return;
        }


        let sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;\nUSE \`${dbName}\`;\n`;

        const tables = form.querySelectorAll(".database-table");
        tables.forEach(tableDiv => {
            const tableId = tableDiv.dataset.tableId;
            const tableName = tableDiv.querySelector(".table-name")?.value?.trim();
            if (!tableName) return;

            const columns = tableDiv.querySelectorAll(".database-table-column");
            const columnDefs = [];

            columns.forEach(colDiv => {
                const name = colDiv.querySelector('input[name*="name"]')?.value?.trim();
                const type = colDiv.querySelector('input[name*="type"]')?.value?.trim();
                const allowNull = colDiv.querySelector('select[name*="null"]')?.value;
                const key = colDiv.querySelector('select[name*="key"]')?.value;
                const def = colDiv.querySelector('input[name*="default"]')?.value?.trim();
                const extra = colDiv.querySelector('input[name*="extra"]')?.value?.trim();

                if (name && type) {
                    let line = `\`${name}\` ${type}`;
                    if (allowNull === "NO") line += " NOT NULL";
                    if (def) line += ` DEFAULT '${def}'`;
                    if (key) line += ` ${key}`;
                    if (extra) line += ` ${extra}`;
                    columnDefs.push(line);
                }
            });

            if (columnDefs.length > 0) {
                sql += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${columnDefs.join(",\n  ")}\n);\n\n`;

                const tableData = tableDataMap.get(tableId);
                if (tableData && tableData.rows.length > 0) {
                    const colNames = tableData.columns.map(col => `\`${col}\``);
                    tableData.rows.forEach(row => {
                        const formatted = row.map(val =>
                            isNaN(val) || val === "" ? `'${val.replace(/'/g, "\\'")}'` : val
                        );
                        sql += `INSERT INTO \`${tableName}\` (${colNames.join(", ")}) VALUES (${formatted.join(", ")});\n`;
                    });
                    sql += `\n`;
                }
            }
        });

        const blob = new Blob([sql], { type: "text/sql" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${dbName || "database"}.sql`;
        a.click();
        URL.revokeObjectURL(url);
    });
});
