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
    
    if (employees.length === 0) {
        employeeList.innerHTML = `
            <div class="no-employees">
                <h3>📋 No hay empleados registrados</h3>
                <p>Agrega el primer empleado usando el formulario de arriba</p>
            </div>
        `;
        return;
    }

    // Agrupar empleados por oficina
    const groupedEmployees = {};
    employees.forEach((employee, index) => {
        if (!groupedEmployees[employee.office]) {
            groupedEmployees[employee.office] = [];
        }
        groupedEmployees[employee.office].push({...employee, index});
    });

    // Generar HTML
    let html = '';
    Object.keys(groupedEmployees).sort().forEach(office => {
        html += `
            <div class="employee-table">
                <div class="office-header">
                    🏢 Oficina ${office}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Puesto</th>
                            <th>Empleado</th>
                            <th>Cargo</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        groupedEmployees[office].forEach(employee => {
            html += `
                <tr>
                    <td>${employee.position || '-'}</td>
                    <td>${employee.name}</td>
                    <td>${employee.role || '-'}</td>
                    <td>${employee.isSena ? '<span class="sena-badge">SENA</span>' : 'Regular'}</td>
                    <td class="actions">
                        <button class="btn btn-edit" onclick="editEmployee(${employee.index})">✏️ Editar</button>
                        <button class="btn btn-danger" onclick="deleteEmployee(${employee.index})">🗑️ Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    employeeList.innerHTML = html;
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