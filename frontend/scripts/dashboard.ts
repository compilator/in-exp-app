import Chart from 'chart.js/auto';
import type { Operation, OperationType } from './types/models';

const CHART_COLORS = [
  '#E04F5F',
  '#FF8C34',
  '#FFC933',
  '#2FD4A0',
  '#1E88FF',
  '#9C27B0',
  '#795548',
  '#607D8B',
];

let incomeChartInstance: Chart | null = null;
let expenseChartInstance: Chart | null = null;

function destroyCharts(): void {
  incomeChartInstance?.destroy();
  incomeChartInstance = null;
  expenseChartInstance?.destroy();
  expenseChartInstance = null;
}

function operationCategoryLabel(op: Operation | null | undefined): string {
  if (op == null) return 'Без категории';
  const c = op.category;
  if (typeof c === 'string') return c || 'Без категории';
  return c?.title || 'Без категории';
}

function aggregateByCategory(operations: Operation[], type: OperationType) {
  const map: Record<string, number> = {};
  for (const op of operations) {
    if (op.type !== type) continue;
    const label = operationCategoryLabel(op);
    const amount = Number(op.amount) || 0;
    map[label] = (map[label] || 0) + amount;
  }
  const labels = Object.keys(map);
  const data = labels.map((k) => map[k]);
  return { labels, data };
}

function buildChartData(labels: string[], data: number[]) {
  if (!labels.length || !data.some((v) => v > 0)) {
    return {
      labels: ['Нет данных'],
      data: [1],
      colors: ['#E0E0E0'],
    };
  }
  return {
    labels,
    data,
    colors: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
  };
}

function pieOptions(titleText: string) {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rect' as const,
        },
      },
      title: {
        display: !!titleText,
        text: titleText || '',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };
}

async function initDashboard(): Promise<void> {
  const incomeCanvas = document.getElementById('incomeChart') as HTMLCanvasElement | null;
  const expenseCanvas = document.getElementById('expenseChart') as HTMLCanvasElement | null;
  if (!incomeCanvas || !expenseCanvas) return;

  destroyCharts();

  let operations: Operation[] = [];
  try {
    const filter = window.getOperationsFilterParams?.() ?? { period: 'today' };
    const qs = new URLSearchParams(filter).toString();
    const result = await window.api.request(`/operations?${qs}`);
    operations = Array.isArray(result) ? (result as Operation[]) : [];
  } catch {
    operations = [];
  }

  const incomeAgg = aggregateByCategory(operations, 'income');
  const expenseAgg = aggregateByCategory(operations, 'expense');

  const inc = buildChartData(incomeAgg.labels, incomeAgg.data);
  const exp = buildChartData(expenseAgg.labels, expenseAgg.data);

  incomeChartInstance = new Chart(incomeCanvas.getContext('2d')!, {
    type: 'pie',
    data: {
      labels: inc.labels,
      datasets: [
        {
          data: inc.data,
          backgroundColor: inc.colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    options: pieOptions(''),
  });

  expenseChartInstance = new Chart(expenseCanvas.getContext('2d')!, {
    type: 'pie',
    data: {
      labels: exp.labels,
      datasets: [
        {
          data: exp.data,
          backgroundColor: exp.colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    options: pieOptions(''),
  });
}

window.initDashboard = initDashboard;
