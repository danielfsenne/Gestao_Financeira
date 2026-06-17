package com.gestao.financeira.service;

import com.gestao.financeira.dto.DashboardResponse;
import com.gestao.financeira.entity.User;
import com.gestao.financeira.enums.TransactionType;
import com.gestao.financeira.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardResponse getSummary(User user) {
        BigDecimal income = transactionRepository.sumByUserIdAndType(user.getId(), TransactionType.INCOME);
        BigDecimal expense = transactionRepository.sumByUserIdAndType(user.getId(), TransactionType.EXPENSE);
        BigDecimal balance = income.subtract(expense);

        List<Object[]> rawExpenses = transactionRepository.sumExpensesByCategory(user.getId());
        Map<String, BigDecimal> expensesByCategory = new LinkedHashMap<>();
        for (Object[] row : rawExpenses) {
            String category = row[0] != null ? (String) row[0] : "Sem categoria";
            BigDecimal total = (BigDecimal) row[1];
            expensesByCategory.put(category, total);
        }

        return new DashboardResponse(income, expense, balance, expensesByCategory);
    }
}
