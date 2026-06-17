package com.gestao.financeira.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalResponse(
        Long id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        double progress,
        LocalDate deadline,
        LocalDate createdAt
) {}
