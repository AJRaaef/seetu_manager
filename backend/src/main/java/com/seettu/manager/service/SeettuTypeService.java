package com.seettu.manager.service;

import com.seettu.manager.entity.SeettuType;
import com.seettu.manager.exception.DuplicateResourceException;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.SeettuTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeettuTypeService {

    private final SeettuTypeRepository seettuTypeRepository;

    public SeettuType getById(Long id) {
        return seettuTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeettuType", "id", id));
    }

    public List<SeettuType> getAll() {
        return seettuTypeRepository.findAll();
    }

    @Transactional
    public SeettuType create(String name, String description) {
        if (seettuTypeRepository.existsByName(name)) {
            throw new DuplicateResourceException("Seettu type already exists: " + name);
        }
        SeettuType type = SeettuType.builder().name(name).description(description).build();
        return seettuTypeRepository.save(type);
    }

    @Transactional
    public SeettuType update(Long id, String name, String description) {
        SeettuType type = getById(id);
        if (name != null) type.setName(name);
        if (description != null) type.setDescription(description);
        return seettuTypeRepository.save(type);
    }

    @Transactional
    public void delete(Long id) {
        SeettuType type = getById(id);
        seettuTypeRepository.delete(type);
    }
}
