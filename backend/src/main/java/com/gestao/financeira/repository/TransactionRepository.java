package com.gestao.financeira.repository;

import com.gestao.financeira.entity.Transaction;
import com.gestao.financeira.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumByUserIdAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("""
        SELECT t.category.name, COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId AND t.type = 'EXPENSE'
        GROUP BY t.category.name
        """)
    List<Object[]> sumExpensesByCategory(@Param("userId") Long userId);

    @Query("""
        SELECT FUNCTION('MONTH', t.date), COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId AND t.type = :type AND FUNCTION('YEAR', t.date) = :year
        GROUP BY FUNCTION('MONTH', t.date)
        ORDER BY FUNCTION('MONTH', t.date)
        """)
    List<Object[]> sumByMonthAndType(@Param("userId") Long userId,
                                     @Param("type") TransactionType type,
                                     @Param("year") int year);
}
