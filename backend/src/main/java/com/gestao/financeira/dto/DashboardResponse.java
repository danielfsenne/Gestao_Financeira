package com.gestao.financeira.dto;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardResponse(
        BigDecimal income,
        BigDecimal expense,
        BigDecimal balance,
        Map<String, BigDecimal> expensesByCategory
) {}
