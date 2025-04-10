document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("database-generator");
    const addTableBtn = document.querySelector(".new-table");

    let tableCount = 1;

    addTableBtn.addEventListener("click", () => {
        const tableIndex = tableCount++;
        const tableDiv = document.createElement("div");
        tableDiv.className = "database-table";

        tableDiv.innerHTML = `
            <div class="inline-row">
                <span>create table if not exists</span>
                <input type="text" name="table${tableIndex}" required>
                <button type="button" class="delete-table delete">delete</button>
            </div>

            <div class="columns-container">
                ${generateColumnHTML(tableIndex, 1)}
            </div>

            <button type="button" class="new-column">add column</button>
        `;

        addTableListeners(tableDiv, tableIndex);
        form.insertBefore(tableDiv, addTableBtn);
    });

    function addTableListeners(tableDiv, tableIndex) {
        const deleteTableBtn = tableDiv.querySelector(".delete-table");
        const addColumnBtn = tableDiv.querySelector(".new-column");
        const columnsContainer = tableDiv.querySelector(".columns-container");

        let columnCount = 2;

        deleteTableBtn.addEventListener("click", () => {
            tableDiv.remove();
        });

        addColumnBtn.addEventListener("click", () => {
            const columnHTML = generateColumnHTML(tableIndex, columnCount++);
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = columnHTML.trim();
            const columnElement = tempDiv.firstChild;
            addColumnListeners(columnElement);
            columnsContainer.appendChild(columnElement);
        });

        const firstColumn = columnsContainer.querySelector(".database-table-column");
        addColumnListeners(firstColumn);
    }

    function addColumnListeners(columnDiv) {
        const deleteColumnBtn = columnDiv.querySelector(".delete-column");
        deleteColumnBtn.addEventListener("click", () => {
            columnDiv.remove();
        });

        const configBtn = columnDiv.querySelector(".config-btn");
        const popup = columnDiv.querySelector(".popup-menu");

        configBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            popup.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!popup.contains(e.target) && e.target !== configBtn) {
                popup.classList.add("hidden");
            }
        });
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

    document.getElementById("download-sql").addEventListener("click", () => {
        const dbName = form.querySelector('[name="database-name"]').value;
        if (!dbName) {
            alert("Você precisa inserir o nome do banco de dados.");
            return;
        }

        let sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;\nUSE \`${dbName}\`;\n`;

        const tables = form.querySelectorAll(".database-table");
        tables.forEach(tableDiv => {
            const tableNameInput = tableDiv.querySelector('input[type="text"]');
            const tableName = tableNameInput?.value?.trim();
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
                    let columnLine = `\`${name}\` ${type}`;
                    if (allowNull === "NO") columnLine += " NOT NULL";
                    if (def) columnLine += ` DEFAULT '${def}'`;
                    if (key) columnLine += ` ${key}`;
                    if (extra) columnLine += ` ${extra}`;
                    columnDefs.push(columnLine);
                }
            });

            if (columnDefs.length > 0) {
                sql += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${columnDefs.join(",\n  ")}\n);\n\n`;
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
