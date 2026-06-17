import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction, TransactionRequest } from '../models/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly API = `${environment.apiUrl}/transactions`;
  private http: HttpClient = inject(HttpClient);

  getAll() {
    return this.http.get<Transaction[]>(this.API);
  }

  create(data: TransactionRequest) {
    return this.http.post<Transaction>(this.API, data);
  }

  update(id: number, data: TransactionRequest) {
    return this.http.put<Transaction>(`${this.API}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
