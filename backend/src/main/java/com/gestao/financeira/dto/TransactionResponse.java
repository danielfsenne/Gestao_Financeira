package com.gestao.financeira.dto;

import com.gestao.financeira.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        String description,
        BigDecimal amount,
        LocalDate date,
        TransactionType type,
        String categoryName
) {}
