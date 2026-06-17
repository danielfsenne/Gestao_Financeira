package com.gestao.financeira.service;

import com.gestao.financeira.dto.SavingsGoalRequest;
import com.gestao.financeira.dto.SavingsGoalResponse;
import com.gestao.financeira.entity.SavingsGoal;
import com.gestao.financeira.entity.User;
import com.gestao.financeira.exception.ResourceNotFoundException;
import com.gestao.financeira.repository.SavingsGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository repository;

    public List<SavingsGoalResponse> findAllByUser(User user) {
        return repository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SavingsGoalResponse create(SavingsGoalRequest request, User user) {
        SavingsGoal goal = SavingsGoal.builder()
                .name(request.name())
                .targetAmount(request.targetAmount())
                .currentAmount(request.currentAmount())
                .deadline(request.deadline())
                .createdAt(LocalDate.now())
                .user(user)
                .build();

        return toResponse(repository.save(goal));
    }

    public SavingsGoalResponse update(Long id, SavingsGoalRequest request, User user) {
        SavingsGoal goal = findByIdAndUser(id, user);

        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(request.currentAmount());
        goal.setDeadline(request.deadline());

        return toResponse(repository.save(goal));
    }

    public void delete(Long id, User user) {
        SavingsGoal goal = findByIdAndUser(id, user);
        repository.delete(goal);
    }

    private SavingsGoal findByIdAndUser(Long id, User user) {
        SavingsGoal goal = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Meta não encontrada");
        }
        return goal;
    }

    private SavingsGoalResponse toResponse(SavingsGoal g) {
        double progress = 0;
        if (g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progress = g.getCurrentAmount()
                    .divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .min(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        return new SavingsGoalResponse(
                g.getId(),
                g.getName(),
                g.getTargetAmount(),
                g.getCurrentAmount(),
                progress,
                g.getDeadline(),
                g.getCreatedAt()
        );
    }
}
