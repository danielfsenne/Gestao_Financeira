import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, Category, TransactionRequest } from '../../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatDialogModule, MatProgressSpinnerModule, MatChipsModule, MatSnackBarModule, MatTooltipModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = true;
  showForm = false;
  saving = false;
  editingId: number | null = null;
  form: FormGroup;
  displayedColumns = ['date', 'description', 'category', 'type', 'amount', 'actions'];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date(), Validators.required],
      type: ['EXPENSE', Validators.required],
      categoryId: [null]
    });
  }

  ngOnInit() {
    this.loadAll();
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  loadAll() {
    this.loading = true;
    this.transactionService.getAll().subscribe({
      next: (res) => { this.transactions = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openForm(transaction?: Transaction) {
    this.showForm = true;
    if (transaction) {
      this.editingId = transaction.id;
      const cat = this.categories.find(c => c.name === transaction.categoryName);
      this.form.patchValue({
        description: transaction.description,
        amount: transaction.amount,
        date: new Date(transaction.date),
        type: transaction.type,
        categoryId: cat?.id ?? null
      });
    } else {
      this.editingId = null;
      this.form.reset({ type: 'EXPENSE', date: new Date() });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;

    const value = this.form.value;
    const payload: TransactionRequest = {
      ...value,
      date: value.date instanceof Date ? value.date.toISOString().split('T')[0] : value.date
    };

    const request$ = this.editingId
      ? this.transactionService.update(this.editingId, payload)
      : this.transactionService.create(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.editingId ? 'Transação atualizada!' : 'Transação criada!', 'OK', { duration: 3000 });
        this.cancelForm();
        this.loadAll();
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Excluir esta transação?')) return;
    this.transactionService.delete(id).subscribe(() => {
      this.snackBar.open('Transação excluída!', 'OK', { duration: 3000 });
      this.loadAll();
    });
  }
}
