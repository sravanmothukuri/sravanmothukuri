// Excel-like Web Application JavaScript
class ExcelWebApp {
    constructor() {
        this.data = [];
        this.selectedCell = null;
        this.chart = null;
        this.filteredData = [];
        this.rowCount = 20;
        this.columnCount = 5;
        this.columnLabels = ['A', 'B', 'C', 'D', 'E'];
        
        this.init();
    }

    init() {
        this.createInitialTable();
        this.bindEvents();
        this.updateStats();
    }

    createInitialTable() {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';
        
        for (let i = 0; i < this.rowCount; i++) {
            const row = document.createElement('tr');
            
            // Row header
            const rowHeader = document.createElement('td');
            rowHeader.className = 'row-header';
            rowHeader.textContent = i + 1;
            row.appendChild(rowHeader);
            
            // Data cells
            for (let j = 0; j < this.columnCount; j++) {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.dataset.row = i;
                input.dataset.col = j;
                input.dataset.cellId = `${this.columnLabels[j]}${i + 1}`;
                input.addEventListener('input', (e) => this.handleCellInput(e));
                input.addEventListener('focus', (e) => this.handleCellFocus(e));
                input.addEventListener('blur', (e) => this.handleCellBlur(e));
                cell.appendChild(input);
                row.appendChild(cell);
            }
            
            tableBody.appendChild(row);
        }
        
        // Initialize data array
        this.data = Array(this.rowCount).fill().map(() => Array(this.columnCount).fill(''));
    }

    bindEvents() {
        // Toolbar buttons
        document.getElementById('addRow').addEventListener('click', () => this.addRow());
        document.getElementById('addColumn').addEventListener('click', () => this.addColumn());
        document.getElementById('deleteRow').addEventListener('click', () => this.deleteRow());
        document.getElementById('calculate').addEventListener('click', () => this.calculateAll());
        document.getElementById('createChart').addEventListener('click', () => this.createChart());
        
        // Import/Export
        document.getElementById('importData').addEventListener('click', () => this.importData());
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));
        
        // Formula
        document.getElementById('applyFormula').addEventListener('click', () => this.applyFormula());
        
        // Filters
        document.getElementById('applyFilter').addEventListener('click', () => this.applyFilter());
        document.getElementById('clearFilter').addEventListener('click', () => this.clearFilter());
    }

    handleCellInput(event) {
        const input = event.target;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        this.data[row][col] = input.value;
        this.updateStats();
        
        // Auto-calculate if it's a formula
        if (input.value.startsWith('=')) {
            this.calculateCell(input, row, col);
        }
    }

    handleCellFocus(event) {
        // Remove previous selection
        document.querySelectorAll('.cell-selected').forEach(cell => {
            cell.classList.remove('cell-selected');
        });
        
        // Add selection to current cell
        event.target.classList.add('cell-selected');
        this.selectedCell = event.target;
        
        // Update formula bar
        document.getElementById('formulaInput').value = event.target.value;
    }

    handleCellBlur(event) {
        event.target.classList.remove('cell-selected');
    }

    addRow() {
        this.rowCount++;
        const tableBody = document.getElementById('tableBody');
        const row = document.createElement('tr');
        
        // Row header
        const rowHeader = document.createElement('td');
        rowHeader.className = 'row-header';
        rowHeader.textContent = this.rowCount;
        row.appendChild(rowHeader);
        
        // Data cells
        for (let j = 0; j < this.columnCount; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = this.rowCount - 1;
            input.dataset.col = j;
            input.dataset.cellId = `${this.columnLabels[j]}${this.rowCount}`;
            input.addEventListener('input', (e) => this.handleCellInput(e));
            input.addEventListener('focus', (e) => this.handleCellFocus(e));
            input.addEventListener('blur', (e) => this.handleCellBlur(e));
            cell.appendChild(input);
            row.appendChild(cell);
        }
        
        tableBody.appendChild(row);
        this.data.push(Array(this.columnCount).fill(''));
    }

    addColumn() {
        if (this.columnCount >= 26) {
            alert('Maximum 26 columns supported');
            return;
        }
        
        this.columnCount++;
        const newColumnLabel = String.fromCharCode(65 + this.columnCount - 1);
        this.columnLabels.push(newColumnLabel);
        
        // Add header
        const tableHead = document.getElementById('tableHead');
        const headerRow = tableHead.querySelector('tr');
        const newHeader = document.createElement('th');
        newHeader.textContent = newColumnLabel;
        headerRow.appendChild(newHeader);
        
        // Add cells to each row
        const tableBody = document.getElementById('tableBody');
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = index;
            input.dataset.col = this.columnCount - 1;
            input.dataset.cellId = `${newColumnLabel}${index + 1}`;
            input.addEventListener('input', (e) => this.handleCellInput(e));
            input.addEventListener('focus', (e) => this.handleCellFocus(e));
            input.addEventListener('blur', (e) => this.handleCellBlur(e));
            cell.appendChild(input);
            row.appendChild(cell);
            
            this.data[index].push('');
        });
        
        // Update dropdowns
        this.updateColumnDropdowns();
    }

    deleteRow() {
        if (this.rowCount <= 1) {
            alert('Cannot delete all rows');
            return;
        }
        
        const tableBody = document.getElementById('tableBody');
        const lastRow = tableBody.lastElementChild;
        if (lastRow) {
            lastRow.remove();
            this.rowCount--;
            this.data.pop();
            this.updateStats();
        }
    }

    calculateCell(input, row, col) {
        const formula = input.value.substring(1); // Remove '='
        
        try {
            // Simple formula evaluation
            const result = this.evaluateFormula(formula);
            input.value = result;
            this.data[row][col] = result;
        } catch (error) {
            input.classList.add('error');
            console.error('Formula error:', error);
        }
    }

    evaluateFormula(formula) {
        // Replace cell references with values
        const cellRegex = /([A-Z])(\d+)/g;
        let processedFormula = formula.replace(cellRegex, (match, col, row) => {
            const colIndex = col.charCodeAt(0) - 65;
            const rowIndex = parseInt(row) - 1;
            
            if (rowIndex >= 0 && rowIndex < this.data.length && 
                colIndex >= 0 && colIndex < this.data[rowIndex].length) {
                const value = this.data[rowIndex][colIndex];
                return isNaN(value) ? 0 : parseFloat(value) || 0;
            }
            return 0;
        });
        
        // Handle common functions
        processedFormula = processedFormula.replace(/SUM\(([^)]+)\)/g, (match, range) => {
            return this.calculateSum(range);
        });
        
        processedFormula = processedFormula.replace(/AVG\(([^)]+)\)/g, (match, range) => {
            return this.calculateAverage(range);
        });
        
        // Evaluate the expression safely
        return Function(`"use strict"; return (${processedFormula})`)();
    }

    calculateSum(range) {
        const values = this.getRangeValues(range);
        return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    }

    calculateAverage(range) {
        const values = this.getRangeValues(range);
        const validValues = values.filter(val => !isNaN(parseFloat(val)));
        return validValues.length > 0 ? 
            validValues.reduce((sum, val) => sum + parseFloat(val), 0) / validValues.length : 0;
    }

    getRangeValues(range) {
        // Simple range parsing (e.g., "A1:A5")
        const [start, end] = range.split(':');
        const values = [];
        
        if (start && end) {
            const startCol = start.charAt(0).charCodeAt(0) - 65;
            const startRow = parseInt(start.substring(1)) - 1;
            const endCol = end.charAt(0).charCodeAt(0) - 65;
            const endRow = parseInt(end.substring(1)) - 1;
            
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                    if (row >= 0 && row < this.data.length && 
                        col >= 0 && col < this.data[row].length) {
                        values.push(this.data[row][col]);
                    }
                }
            }
        }
        
        return values;
    }

    calculateAll() {
        const inputs = document.querySelectorAll('#tableBody input');
        inputs.forEach(input => {
            if (input.value.startsWith('=')) {
                const row = parseInt(input.dataset.row);
                const col = parseInt(input.dataset.col);
                this.calculateCell(input, row, col);
            }
        });
        this.updateStats();
    }

    updateStats() {
        const allValues = this.data.flat().filter(val => val !== '' && !isNaN(val)).map(val => parseFloat(val));
        
        const sum = allValues.reduce((acc, val) => acc + val, 0);
        const avg = allValues.length > 0 ? sum / allValues.length : 0;
        const count = allValues.length;
        const max = allValues.length > 0 ? Math.max(...allValues) : 0;
        const min = allValues.length > 0 ? Math.min(...allValues) : 0;
        
        document.getElementById('sumValue').textContent = sum.toFixed(2);
        document.getElementById('avgValue').textContent = avg.toFixed(2);
        document.getElementById('countValue').textContent = count;
        document.getElementById('maxValue').textContent = max.toFixed(2);
        document.getElementById('minValue').textContent = min.toFixed(2);
    }

    createChart() {
        const chartType = document.getElementById('chartType').value;
        const dataColumn = document.getElementById('dataColumn').value;
        const colIndex = dataColumn.charCodeAt(0) - 65;
        
        const labels = [];
        const data = [];
        
        for (let i = 0; i < this.rowCount; i++) {
            if (this.data[i][colIndex] && !isNaN(this.data[i][colIndex])) {
                labels.push(`Row ${i + 1}`);
                data.push(parseFloat(this.data[i][colIndex]));
            }
        }
        
        const ctx = document.getElementById('dataChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const chartConfig = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: `Column ${dataColumn}`,
                    data: data,
                    backgroundColor: chartType === 'pie' ? [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ] : 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: chartType !== 'pie' ? {
                    y: {
                        beginAtZero: true
                    }
                } : {}
            }
        };
        
        this.chart = new Chart(ctx, chartConfig);
    }

    applyFormula() {
        if (!this.selectedCell) {
            alert('Please select a cell first');
            return;
        }
        
        const formula = document.getElementById('formulaInput').value;
        this.selectedCell.value = formula;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        if (formula.startsWith('=')) {
            this.calculateCell(this.selectedCell, row, col);
        } else {
            this.data[row][col] = formula;
        }
        
        this.updateStats();
    }

    applyFilter() {
        const filterColumn = document.getElementById('filterColumn').value;
        const filterValue = document.getElementById('filterValue').value.toLowerCase();
        
        if (!filterColumn || !filterValue) {
            alert('Please select a column and enter a filter value');
            return;
        }
        
        const colIndex = filterColumn.charCodeAt(0) - 65;
        const rows = document.querySelectorAll('#tableBody tr');
        
        rows.forEach((row, index) => {
            const cellValue = this.data[index][colIndex].toString().toLowerCase();
            if (cellValue.includes(filterValue)) {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    }

    clearFilter() {
        const rows = document.querySelectorAll('#tableBody tr');
        rows.forEach(row => {
            row.style.display = 'table-row';
        });
        
        document.getElementById('filterColumn').value = '';
        document.getElementById('filterValue').value = '';
    }

    importData() {
        document.getElementById('fileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                this.loadDataFromArray(jsonData);
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    loadDataFromArray(jsonData) {
        // Clear existing data
        this.data = [];
        
        // Ensure we have enough rows and columns
        const maxRows = Math.max(jsonData.length, this.rowCount);
        const maxCols = Math.max(
            Math.max(...jsonData.map(row => row.length)), 
            this.columnCount
        );
        
        // Adjust table size if needed
        while (this.rowCount < maxRows) {
            this.addRow();
        }
        
        while (this.columnCount < maxCols) {
            this.addColumn();
        }
        
        // Load data into cells
        const inputs = document.querySelectorAll('#tableBody input');
        jsonData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (rowIndex < this.rowCount && colIndex < this.columnCount) {
                    const input = document.querySelector(
                        `input[data-row="${rowIndex}"][data-col="${colIndex}"]`
                    );
                    if (input) {
                        input.value = cell || '';
                        this.data[rowIndex] = this.data[rowIndex] || [];
                        this.data[rowIndex][colIndex] = cell || '';
                    }
                }
            });
        });
        
        this.updateStats();
    }

    exportData() {
        const ws = XLSX.utils.aoa_to_sheet(this.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        const fileName = `excel_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    updateColumnDropdowns() {
        const selects = ['dataColumn', 'filterColumn'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            // Clear existing options (except "Select Column" for filter)
            if (selectId === 'filterColumn') {
                select.innerHTML = '<option value="">Select Column</option>';
            } else {
                select.innerHTML = '';
            }
            
            // Add current columns
            this.columnLabels.forEach(label => {
                const option = document.createElement('option');
                option.value = label;
                option.textContent = `Column ${label}`;
                select.appendChild(option);
            });
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExcelWebApp();
});

// Add sample data for demonstration
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const sampleData = [
            ['Product', 'Price', 'Quantity', 'Total', 'Category'],
            ['Laptop', '999.99', '5', '=B2*C2', 'Electronics'],
            ['Mouse', '25.50', '10', '=B3*C3', 'Electronics'],
            ['Keyboard', '75.00', '8', '=B4*C4', 'Electronics'],
            ['Monitor', '299.99', '3', '=B5*C5', 'Electronics'],
            ['Chair', '150.00', '4', '=B6*C6', 'Furniture']
        ];
        
        // Load sample data
        const inputs = document.querySelectorAll('#tableBody input');
        sampleData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const input = document.querySelector(
                    `input[data-row="${rowIndex}"][data-col="${colIndex}"]`
                );
                if (input && cell) {
                    input.value = cell;
                    input.dispatchEvent(new Event('input'));
                }
            });
        });
        
        // Calculate formulas
        setTimeout(() => {
            document.getElementById('calculate').click();
        }, 500);
    }, 1000);
});