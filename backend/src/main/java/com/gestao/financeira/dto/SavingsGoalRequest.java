package com.gestao.financeira.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingsGoalRequest(

        @NotBlank(message = "Nome é obrigatório")
        String name,

        @NotNull(message = "Valor alvo é obrigatório")
        @DecimalMin(value = "0.01", message = "Valor alvo deve ser maior que zero")
        BigDecimal targetAmount,

        @NotNull(message = "Valor atual é obrigatório")
        @DecimalMin(value = "0.00", inclusive = true, message = "Valor atual não pode ser negativo")
        BigDecimal currentAmount,

        LocalDate deadline
) {}
