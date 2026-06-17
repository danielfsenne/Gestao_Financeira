import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoalsService } from '../../services/goals.service';
import { SavingsGoal } from '../../models/goal.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private goalsService = inject(GoalsService);

  goals: SavingsGoal[] = [];
  loading = true;
  showForm = false;
  saving = false;
  editingId: number | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    targetAmount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    currentAmount: [0 as number | null, [Validators.required, Validators.min(0)]],
    deadline: [null as Date | null],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.goalsService.getAll().subscribe({
      next: (data) => { this.goals = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openForm(goal?: SavingsGoal) {
    this.showForm = true;
    if (goal) {
      this.editingId = goal.id;
      this.form.setValue({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline ? new Date(goal.deadline) : null,
      });
    } else {
      this.editingId = null;
      this.form.reset({ currentAmount: 0 });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ currentAmount: 0 });
  }

  submit() {
    if (this.form.invalid) return;

    const { name, targetAmount, currentAmount, deadline } = this.form.value;
    const payload = {
      name: name!,
      targetAmount: targetAmount!,
      currentAmount: currentAmount!,
      deadline: deadline ? this.formatDate(deadline) : null,
    };

    this.saving = true;
    const req = this.editingId
      ? this.goalsService.update(this.editingId, payload)
      : this.goalsService.create(payload);

    req.subscribe({
      next: () => { this.saving = false; this.cancelForm(); this.load(); },
      error: () => { this.saving = false; },
    });
  }

  delete(id: number) {
    if (!confirm('Excluir esta meta?')) return;
    this.goalsService.delete(id).subscribe(() => this.load());
  }

  progressColor(p: number): string {
    if (p >= 100) return 'accent';
    if (p >= 50) return 'primary';
    return 'warn';
  }

  daysLeft(deadline: string | null): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
