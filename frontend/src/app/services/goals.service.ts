import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SavingsGoal, SavingsGoalRequest } from '../models/goal.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private readonly API = `${environment.apiUrl}/goals`;
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<SavingsGoal[]>(this.API);
  }

  create(data: SavingsGoalRequest) {
    return this.http.post<SavingsGoal>(this.API, data);
  }

  update(id: number, data: SavingsGoalRequest) {
    return this.http.put<SavingsGoal>(`${this.API}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
