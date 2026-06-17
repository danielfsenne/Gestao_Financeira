package com.gestao.financeira.controller;

import com.gestao.financeira.dto.SavingsGoalRequest;
import com.gestao.financeira.dto.SavingsGoalResponse;
import com.gestao.financeira.entity.User;
import com.gestao.financeira.service.SavingsGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
@RequiredArgsConstructor
@Tag(name = "Metas de Economia")
@SecurityRequirement(name = "bearerAuth")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    @Operation(summary = "Listar metas do usuário")
    public ResponseEntity<List<SavingsGoalResponse>> findAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savingsGoalService.findAllByUser(user));
    }

    @PostMapping
    @Operation(summary = "Criar nova meta")
    public ResponseEntity<SavingsGoalResponse> create(@Valid @RequestBody SavingsGoalRequest request,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(savingsGoalService.create(request, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar meta")
    public ResponseEntity<SavingsGoalResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody SavingsGoalRequest request,
                                                       @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savingsGoalService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir meta")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        savingsGoalService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
