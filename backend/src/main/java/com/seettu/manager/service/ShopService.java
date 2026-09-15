package com.seettu.manager.service;

import com.seettu.manager.entity.Shop;
import com.seettu.manager.entity.User;
import com.seettu.manager.exception.ResourceNotFoundException;
import com.seettu.manager.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final UserService userService;

    public Shop getShopById(Long id) {
        return shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
    }

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public List<Shop> getShopsByOwner(Long ownerId) {
        return shopRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Shop createShop(String name, String address, Long ownerId) {
        User owner = userService.getUserById(ownerId);
        Shop shop = Shop.builder()
                .name(name)
                .address(address)
                .owner(owner)
                .build();
        return shopRepository.save(shop);
    }

    @Transactional
    public Shop updateShop(Long id, String name, String address) {
        Shop shop = getShopById(id);
        if (name != null) shop.setName(name);
        if (address != null) shop.setAddress(address);
        return shopRepository.save(shop);
    }

    @Transactional
    public void deleteShop(Long id) {
        Shop shop = getShopById(id);
        shopRepository.delete(shop);
    }
}
