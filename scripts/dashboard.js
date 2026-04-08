const colors = {
    red: '#E04F5F',
    orange: '#FF8C34',
    yellow: '#FFC933',
    green: '#2FD4A0',
    blue: '#1E88FF'
};

const incomeCtx = document.getElementById('incomeChart').getContext('2d');
new Chart(incomeCtx, {
    type: 'pie',
    data: {
        labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
        datasets: [{
            data: [30, 35, 15, 12, 8], // Ваши данные
            backgroundColor: [
                colors.red,
                colors.orange,
                colors.yellow,
                colors.green,
                colors.blue
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'rect'
                }
            },
            title: {
                display: true,
                font: {
                    size: 20,
                    weight: 'bold'
                }
            }
        }
    }
});

const expenseCtx = document.getElementById('expenseChart').getContext('2d');
new Chart(expenseCtx, {
    type: 'pie',
    data: {
        labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
        datasets: [{
            data: [5, 15, 30, 30, 20],
            backgroundColor: [
                colors.red,
                colors.orange,
                colors.yellow,
                colors.green,
                colors.blue
            ],
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'rect'
                }
            },
            title: {
                display: true,
                font: {
                    size: 20,
                    weight: 'bold'
                }
            }
        }
    }
});