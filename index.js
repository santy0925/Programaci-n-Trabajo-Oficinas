let employees = [];
let editingIndex = -1;

// Cargar datos del almacenamiento local al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    renderEmployees();
});

// Manejar envío del formulario
document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const employee = {
        office: formData.get('office'),
        position: formData.get('position'),
        name: formData.get('name'),
        role: formData.get('role'),
        isSena: formData.get('isSena') === 'yes'
    };

    if (editingIndex >= 0) {
        employees[editingIndex] = employee;
        editingIndex = -1;
        document.querySelector('button[type="submit"]').textContent = 'Agregar Empleado';
    } else {
        employees.push(employee);
    }

    saveEmployees();
    renderEmployees();
    clearForm();
});

function loadEmployees() {
    const saved = localStorage.getItem('employees');
    if (saved) {
        employees = JSON.parse(saved);
    }
}

function saveEmployees() {
    localStorage.setItem('employees', JSON.stringify(employees));
}

function renderEmployees() {
    const employeeList = document.getElementById('employeeList');
    const spreadsheetView = document.getElementById('spreadsheetView');
    
    if (employees.length === 0) {
        employeeList.innerHTML = `
            <div class="no-employees">
                <h3>📋 No hay empleados registrados</h3>
                <p>Agrega el primer empleado usando el formulario de arriba</p>
            </div>
        `;
        spreadsheetView.style.display = 'none';
        return;
    }

    // Mostrar la vista de hoja de cálculo
    spreadsheetView.style.display = 'block';
    employeeList.style.display = 'none';

    // Agrupar empleados por oficina y ordenar
    const groupedEmployees = {};
    employees.forEach((employee, index) => {
        if (!groupedEmployees[employee.office]) {
            groupedEmployees[employee.office] = [];
        }
        groupedEmployees[employee.office].push({...employee, index});
    });

    // Generar tabla estilo hoja de cálculo
    const spreadsheetBody = document.getElementById('spreadsheetBody');
    let html = '';
    
    Object.keys(groupedEmployees).sort().forEach(office => {
        const officeEmployees = groupedEmployees[office];
        
        // Separar empleados SENA de regulares
        const regularEmployees = officeEmployees.filter(emp => !emp.isSena);
        const senaEmployees = officeEmployees.filter(emp => emp.isSena);
        
        // Agregar empleados regulares
        regularEmployees.forEach((employee, index) => {
            html += `
                <tr>
                    <td class="office-cell">${index === 0 ? office : ''}</td>
                    <td class="position-cell">${employee.position || (index + 1)}</td>
                    <td class="regular-cell">${employee.name}</td>
                    <td class="employee-name">${employee.role || 'Empleado'}</td>
                </tr>
            `;
        });
        
        // Agregar empleados SENA si existen
        if (senaEmployees.length > 0) {
            senaEmployees.forEach((employee, index) => {
                html += `
                    <tr>
                        <td class="office-cell">${regularEmployees.length === 0 && index === 0 ? office : ''}</td>
                        <td class="position-cell">${employee.position || `Sofá ${index + 1}`}</td>
                        <td class="sena-cell">${employee.name}</td>
                        <td class="employee-name">SENA</td>
                    </tr>
                `;
            });
        }
    });

    spreadsheetBody.innerHTML = html;
}

function editEmployee(index) {
    const employee = employees[index];
    
    document.getElementById('office').value = employee.office;
    document.getElementById('position').value = employee.position;
    document.getElementById('name').value = employee.name;
    document.getElementById('role').value = employee.role;
    document.getElementById('isSena').value = employee.isSena ? 'yes' : 'no';
    
    editingIndex = index;
    document.querySelector('button[type="submit"]').textContent = 'Actualizar Empleado';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteEmployee(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        employees.splice(index, 1);
        saveEmployees();
        renderEmployees();
    }
}

function clearForm() {
    document.getElementById('employeeForm').reset();
    editingIndex = -1;
    document.querySelector('button[type="submit"]').textContent = 'Agregar Empleado';
}

// Función para exportar a Excel (simulada)
function exportToExcel() {
    if (employees.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    // Crear contenido CSV
    let csvContent = "Oficina,Número de puesto,Puestos Fijos,Empleado\n";
    
    // Agrupar empleados por oficina
    const groupedEmployees = {};
    employees.forEach((employee) => {
        if (!groupedEmployees[employee.office]) {
            groupedEmployees[employee.office] = [];
        }
        groupedEmployees[employee.office].push(employee);
    });
    
    Object.keys(groupedEmployees).sort().forEach(office => {
        const officeEmployees = groupedEmployees[office];
        
        // Separar empleados SENA de regulares
        const regularEmployees = officeEmployees.filter(emp => !emp.isSena);
        const senaEmployees = officeEmployees.filter(emp => emp.isSena);
        
        // Agregar empleados regulares
        regularEmployees.forEach((employee, index) => {
            csvContent += `${index === 0 ? office : ''},${employee.position || (index + 1)},${employee.name},${employee.role || 'Empleado'}\n`;
        });
        
        // Agregar empleados SENA
        senaEmployees.forEach((employee, index) => {
            csvContent += `${regularEmployees.length === 0 && index === 0 ? office : ''},${employee.position || `Sofá ${index + 1}`},${employee.name},SENA\n`;
        });
    });
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'empleados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función para limpiar todos los datos
function clearAllData() {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los empleados registrados? Esta acción no se puede deshacer.')) {
        employees = [];
        saveEmployees();
        renderEmployees();
        clearForm();
        alert('✅ Todos los datos han sido eliminados correctamente.');
    }
}