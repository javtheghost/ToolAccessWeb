import { Component, Input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [ChartModule, ProgressSpinnerModule],
  template: `
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mt-4"
      role="img"
    >
      <p-progressSpinner  styleClass="block mx-auto my-10" strokeWidth="4" animationDuration=".5s" aria-label="Cargando gráfico"></p-progressSpinner>
      <p-chart

        type="line"
        [data]="data"
        [options]="options"
        styleClass="w-full h-64"
      ></p-chart>
    </div>
  `,
  styles: [``]
})
export class LineChartComponent {
  @Input() loading = false;
  @Input() data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        data: [40, 80, 60, 70, 90, 50, 80, 70, 60, 70, 80, 60],
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6'
      }
    ]
  };

  @Input() options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280' // text-gray-500
        }
      },
      title: {
        display: true,
        color: '#374151', // text-gray-700
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#a3a3a3'
        }
      },
      y: {
        grid: {
          color: '#f3f4f6'
        },
        ticks: {
          color: '#a3a3a3',
          stepSize: 20
        }
      }
    }
  };
}
