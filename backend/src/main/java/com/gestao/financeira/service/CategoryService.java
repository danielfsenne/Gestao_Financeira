package com.gestao.financeira.service;

import com.gestao.financeira.dto.CategoryResponse;
import com.gestao.financeira.entity.Category;
import com.gestao.financeira.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    public CategoryResponse create(String name) {
        Category category = categoryRepository.save(Category.builder().name(name).build());
        return new CategoryResponse(category.getId(), category.getName());
    }
}
