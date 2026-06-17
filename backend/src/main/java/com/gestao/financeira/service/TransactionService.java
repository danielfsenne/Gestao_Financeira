package com.gestao.financeira.service;

import com.gestao.financeira.dto.TransactionRequest;
import com.gestao.financeira.dto.TransactionResponse;
import com.gestao.financeira.entity.Category;
import com.gestao.financeira.entity.Transaction;
import com.gestao.financeira.entity.User;
import com.gestao.financeira.exception.ResourceNotFoundException;
import com.gestao.financeira.repository.CategoryRepository;
import com.gestao.financeira.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public List<TransactionResponse> findAllByUser(User user) {
        return transactionRepository.findByUserIdOrderByDateDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public TransactionResponse create(TransactionRequest request, User user) {
        Category category = resolveCategory(request.categoryId());

        Transaction transaction = Transaction.builder()
                .description(request.description())
                .amount(request.amount())
                .date(request.date())
                .type(request.type())
                .user(user)
                .category(category)
                .build();

        return toResponse(transactionRepository.save(transaction));
    }

    public TransactionResponse update(Long id, TransactionRequest request, User user) {
        Transaction transaction = findByIdAndUser(id, user);
        Category category = resolveCategory(request.categoryId());

        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setDate(request.date());
        transaction.setType(request.type());
        transaction.setCategory(category);

        return toResponse(transactionRepository.save(transaction));
    }

    public void delete(Long id, User user) {
        Transaction transaction = findByIdAndUser(id, user);
        transactionRepository.delete(transaction);
    }

    private Transaction findByIdAndUser(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Transação não encontrada");
        }
        return transaction;
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada: " + categoryId));
    }

    private TransactionResponse toResponse(Transaction t) {
        String categoryName = t.getCategory() != null ? t.getCategory().getName() : null;
        return new TransactionResponse(t.getId(), t.getDescription(), t.getAmount(), t.getDate(), t.getType(), categoryName);
    }
}
