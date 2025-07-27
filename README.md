# 📊 Excel-like Web Application

A comprehensive web application that replicates Excel functionality with modern web technologies. Perfect for data analytics, calculations, and visualization.

## 🚀 Features

### 📋 Core Spreadsheet Features
- **Interactive Grid**: Editable cells with Excel-like interface
- **Dynamic Rows/Columns**: Add and remove rows and columns dynamically
- **Cell Selection**: Click on cells to select and edit
- **Formula Bar**: Enter formulas and see cell contents

### 🧮 Formula Support
- **Basic Arithmetic**: `=A1+B1`, `=A1*B1`, `=A1-B1`, `=A1/B1`
- **Cell References**: Reference any cell (e.g., `=A1`, `=B5`)
- **SUM Function**: `=SUM(A1:A5)` - Calculate sum of a range
- **AVERAGE Function**: `=AVG(A1:A5)` - Calculate average of a range
- **Auto-calculation**: Formulas are calculated automatically

### 📈 Analytics Dashboard
- **Real-time Statistics**: Sum, Average, Count, Max, Min
- **Data Visualization**: Bar charts, Line charts, Pie charts
- **Chart Creation**: Select data column and chart type
- **Live Updates**: Statistics update as you type

### 📊 Data Management
- **Excel Import**: Upload `.xlsx`, `.xls`, and `.csv` files
- **Excel Export**: Download your data as Excel files
- **Data Filtering**: Filter rows by column values
- **Search & Filter**: Find specific data quickly

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server installation required!

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start using the application immediately!

```bash
git clone <repository-url>
cd excel-web-app
open index.html
```

## 📖 How to Use

### Basic Operations
1. **Enter Data**: Click on any cell and start typing
2. **Navigate**: Use mouse or keyboard to move between cells
3. **Add Rows**: Click "Add Row" button in the toolbar
4. **Add Columns**: Click "Add Column" button (up to 26 columns)
5. **Delete Rows**: Click "Delete Row" to remove the last row

### Working with Formulas
1. **Enter Formula**: Start with `=` in any cell
2. **Cell References**: Use column letter + row number (e.g., `A1`, `B5`)
3. **Functions**: Use `SUM(A1:A5)` or `AVG(A1:A5)`
4. **Calculate**: Click "Calculate" button to process all formulas

### Creating Charts
1. Enter numeric data in any column
2. Select chart type (Bar, Line, or Pie)
3. Choose data column to visualize
4. Click "Create Chart" button

### Import/Export Data
- **Import**: Click "Import Excel" and select your file
- **Export**: Click "Export Excel" to download current data
- **Supported Formats**: .xlsx, .xls, .csv

### Filtering Data
1. Select a column from the filter dropdown
2. Enter the value you want to filter by
3. Click "Apply Filter" to show matching rows
4. Click "Clear" to remove filters

## 🎯 Sample Data Included

The application loads with sample e-commerce data:
- Product names and categories
- Prices and quantities
- Calculated totals using formulas
- Perfect for testing all features

## 💡 Pro Tips

### Excel-like Shortcuts
- **Select Cell**: Click on any cell to select it
- **Formula Bar**: Shows the content of selected cell
- **Auto-calculation**: Formulas calculate as you type
- **Error Handling**: Invalid formulas are highlighted in red

### Best Practices
- Use meaningful column headers
- Keep formulas simple for better performance
- Export your work regularly
- Use filters to analyze large datasets

## 🔧 Technical Features

### Built With
- **HTML5**: Modern semantic structure
- **CSS3**: Beautiful, responsive design with gradients and animations
- **Vanilla JavaScript**: No framework dependencies
- **Chart.js**: Professional data visualization
- **SheetJS**: Excel file import/export functionality

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance
- Handles up to 1000+ rows efficiently
- Real-time calculations
- Responsive design for all screen sizes
- Optimized for mobile devices

## 🎨 Design Highlights

- **Modern UI**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation support
- **Visual Feedback**: Hover effects and animations
- **Color Coding**: Different button types for clarity

## 🚀 Advanced Usage

### Custom Formulas
Create complex calculations:
```
=B2*C2          // Multiply price × quantity
=SUM(B2:B10)    // Sum a range
=AVG(C1:C5)     // Average calculation
=(A1+B1)*0.1    // Complex expression
```

### Data Analysis Workflow
1. Import your Excel data
2. Use formulas for calculations
3. Apply filters to find insights
4. Create charts for visualization
5. Export results for sharing

## 🤝 Contributing

Feel free to contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure you're using a modern browser
3. Try refreshing the page
4. Clear browser cache if needed

---

**Happy Analyzing! 📊✨**

Transform your data analysis workflow with this powerful Excel-like web application!
