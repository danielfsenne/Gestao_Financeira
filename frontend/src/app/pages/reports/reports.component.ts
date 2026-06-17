import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;

  transactions: Transaction[] = [];
  loading = true;
  exporting = false;
  private barChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.getAll().subscribe({
      next: (res) => {
        this.transactions = res;
        this.loading = false;
        setTimeout(() => this.buildCharts(), 100);
      },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts() {
    this.buildBarChart();
    this.buildCategoryChart();
  }

  private buildBarChart() {
    if (!this.barChartRef) return;

    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const income = new Array(12).fill(0);
    const expense = new Array(12).fill(0);

    this.transactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (t.type === 'INCOME') income[month] += t.amount;
      else expense[month] += t.amount;
    });

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Receitas',
            data: income,
            backgroundColor: 'rgba(16,185,129,0.8)',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Despesas',
            data: expense,
            backgroundColor: 'rgba(239,68,68,0.8)',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, pointStyle: 'circle', padding: 16 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148,163,184,0.1)' },
            ticks: { color: '#64748b' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
          }
        }
      }
    } as ChartConfiguration);
  }

  private buildCategoryChart() {
    if (!this.categoryChartRef) return;

    const map: Record<string, number> = {};
    this.transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      const cat = t.categoryName ?? 'Sem categoria';
      map[cat] = (map[cat] ?? 0) + t.amount;
    });

    if (this.categoryChart) this.categoryChart.destroy();

    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: Object.keys(map),
        datasets: [{
          data: Object.values(map),
          backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#14b8a6','#ec4899'],
          borderWidth: 3,
          borderColor: 'transparent',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        animation: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, color: '#64748b' }
          }
        }
      }
    } as ChartConfiguration);
  }

  async exportPdf() {
    this.exporting = true;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');

      const pageW = 210;
      const pageH = 297;
      const margin = 18;
      const contentW = pageW - margin * 2;
      let y = 0;

      // ── Header bar ─────────────────────────────────────────
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageW, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Financeiro', margin, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      doc.text(`Gerado em ${now}`, margin, 28);
      doc.text('FinanceApp · Gestão Financeira Pessoal', margin, 35);

      y = 52;

      // ── Summary boxes ──────────────────────────────────────
      const boxW = (contentW - 8) / 3;

      // Receitas
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, boxW, 28, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text('RECEITAS', margin + 4, y + 9);
      doc.setFontSize(12);
      doc.text(this.fmt(this.totalIncome), margin + 4, y + 21);

      // Despesas
      const b2x = margin + boxW + 4;
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(b2x, y, boxW, 28, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('DESPESAS', b2x + 4, y + 9);
      doc.setFontSize(12);
      doc.text(this.fmt(this.totalExpense), b2x + 4, y + 21);

      // Saldo
      const balance = this.totalIncome - this.totalExpense;
      const b3x = margin + (boxW + 4) * 2;
      if (balance >= 0) {
        doc.setFillColor(238, 242, 255);
        doc.setTextColor(79, 70, 229);
      } else {
        doc.setFillColor(255, 251, 235);
        doc.setTextColor(180, 83, 9);
      }
      doc.roundedRect(b3x, y, boxW, 28, 3, 3, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('SALDO LÍQUIDO', b3x + 4, y + 9);
      doc.setFontSize(12);
      doc.text(this.fmt(balance), b3x + 4, y + 21);

      y += 38;

      // ── Monthly table ──────────────────────────────────────
      doc.setTextColor(30, 27, 75);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Mensal', margin, y);
      y += 7;

      const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const inc = new Array(12).fill(0);
      const exp = new Array(12).fill(0);
      this.transactions.forEach(t => {
        const m = new Date(t.date).getMonth();
        if (t.type === 'INCOME') inc[m] += t.amount;
        else exp[m] += t.amount;
      });

      // Table header
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y, contentW, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const c = [margin + 3, margin + 43, margin + 98, margin + 143];
      doc.text('MÊS', c[0], y + 6);
      doc.text('RECEITAS', c[1], y + 6);
      doc.text('DESPESAS', c[2], y + 6);
      doc.text('SALDO', c[3], y + 6);
      y += 9;

      let rowIdx = 0;
      MONTHS.forEach((month, i) => {
        if (inc[i] === 0 && exp[i] === 0) return;
        const rowBal = inc[i] - exp[i];
        doc.setFillColor(rowIdx % 2 === 0 ? 248 : 255, rowIdx % 2 === 0 ? 249 : 255, rowIdx % 2 === 0 ? 250 : 255);
        doc.rect(margin, y, contentW, 8, 'F');

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        doc.setTextColor(51, 65, 85);
        doc.text(month, c[0], y + 5.5);

        doc.setTextColor(5, 150, 105);
        doc.text(this.fmt(inc[i]), c[1], y + 5.5);

        doc.setTextColor(220, 38, 38);
        doc.text(this.fmt(exp[i]), c[2], y + 5.5);

        doc.setTextColor(rowBal >= 0 ? 79 : 180, rowBal >= 0 ? 70 : 83, rowBal >= 0 ? 229 : 9);
        doc.text(this.fmt(rowBal), c[3], y + 5.5);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + 8, margin + contentW, y + 8);

        y += 8;
        rowIdx++;
      });

      y += 12;

      // ── Category breakdown ─────────────────────────────────
      const catMap: Record<string, number> = {};
      this.transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
        const cat = t.categoryName ?? 'Sem categoria';
        catMap[cat] = (catMap[cat] ?? 0) + t.amount;
      });
      const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

      if (cats.length > 0) {
        if (y + 10 + cats.length * 8 > pageH - 40) { doc.addPage(); y = 20; }

        doc.setTextColor(30, 27, 75);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Despesas por Categoria', margin, y);
        y += 7;

        doc.setFillColor(79, 70, 229);
        doc.rect(margin, y, contentW, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('CATEGORIA', margin + 3, y + 6);
        doc.text('VALOR', margin + 120, y + 6);
        doc.text('% DO TOTAL', margin + 148, y + 6);
        y += 9;

        cats.forEach(([cat, val], idx) => {
          const pct = this.totalExpense > 0 ? (val / this.totalExpense * 100).toFixed(1) : '0';
          doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 250 : 255);
          doc.rect(margin, y, contentW, 8, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(cat, margin + 3, y + 5.5);
          doc.setTextColor(220, 38, 38);
          doc.text(this.fmt(val), margin + 120, y + 5.5);
          doc.setTextColor(100, 116, 139);
          doc.text(`${pct}%`, margin + 148, y + 5.5);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y + 8, margin + contentW, y + 8);
          y += 8;
        });

        y += 12;
      }

      // ── Charts ─────────────────────────────────────────────
      if (this.barChartRef?.nativeElement) {
        if (y + 85 > pageH - 25) { doc.addPage(); y = 20; }
        doc.setTextColor(30, 27, 75);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Receitas × Despesas por Mês', margin, y);
        y += 5;
        const barImg = this.barChartRef.nativeElement.toDataURL('image/png');
        doc.addImage(barImg, 'PNG', margin, y, contentW, 72);
        y += 78;
      }

      if (this.categoryChartRef?.nativeElement && Object.keys(catMap).length > 0) {
        if (y + 85 > pageH - 25) { doc.addPage(); y = 20; }
        doc.setTextColor(30, 27, 75);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Distribuição por Categoria', margin, y);
        y += 5;
        const catImg = this.categoryChartRef.nativeElement.toDataURL('image/png');
        doc.addImage(catImg, 'PNG', margin + contentW / 4, y, contentW / 2, 72);
      }

      // ── Footer on each page ────────────────────────────────
      const totalPages = (doc as any).internal.pages.length - 1;
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageH - 14, pageW - margin, pageH - 14);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('FinanceApp · Gestão Financeira Pessoal', margin, pageH - 7);
        doc.text(`Página ${p} de ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' });
      }

      const filename = `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } finally {
      this.exporting = false;
    }
  }

  private fmt(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get totalIncome() { return this.transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0); }
  get totalExpense() { return this.transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0); }
}
