import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/dashboard.model';

Chart.register(...registerables);

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#14b8a6','#ec4899','#84cc16'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef;

  data: DashboardData | null = null;
  loading = true;
  chartColors = COLORS;
  categoryList: { label: string; value: number }[] = [];
  private chart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  get hasExpenses(): boolean {
    return !!this.data && Object.keys(this.data.expensesByCategory).length > 0;
  }

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        this.data = res;
        this.categoryList = Object.entries(res.expensesByCategory)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value);
        this.loading = false;
        setTimeout(() => this.buildChart(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewInit() {}

  private buildChart() {
    if (!this.categoryList.length || !this.pieChartRef) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.pieChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.categoryList.map(c => c.label),
        datasets: [{
          data: this.categoryList.map(c => c.value),
          backgroundColor: COLORS,
          borderWidth: 3,
          borderColor: 'transparent',
          hoverBorderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed as number;
                return ` R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    } as ChartConfiguration);
  }
}
