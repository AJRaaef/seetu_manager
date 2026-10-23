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
    public Shop createShop(Shop shopData, Long ownerId) {
        User owner = (ownerId != null) ? userService.getUserById(ownerId) : null;
        shopData.setOwner(owner);

        if (shopData.getName() == null && shopData.getShopName() != null) {
            shopData.setName(shopData.getShopName());
        }
        if (shopData.getAddress() == null && shopData.getShopAddress() != null) {
            shopData.setAddress(shopData.getShopAddress());
        }
        if (shopData.getStatus() == null || shopData.getStatus().trim().isEmpty()) {
            shopData.setStatus("ACTIVE");
        }

        return shopRepository.save(shopData);
    }

    @Transactional
    public Shop createShop(String name, String address, Long ownerId) {
        User owner = (ownerId != null) ? userService.getUserById(ownerId) : null;
        Shop shop = Shop.builder()
                .name(name)
                .address(address)
                .owner(owner)
                .status("ACTIVE")
                .build();
        return shopRepository.save(shop);
    }

    @Transactional
    public Shop updateShop(Long id, Shop updateData) {
        Shop shop = getShopById(id);

        if (updateData.getName() != null) shop.setName(updateData.getName());
        if (updateData.getShopName() != null) shop.setName(updateData.getShopName());
        if (updateData.getAddress() != null) shop.setAddress(updateData.getAddress());
        if (updateData.getShopAddress() != null) shop.setAddress(updateData.getShopAddress());
        if (updateData.getShopOwnerName() != null) shop.setShopOwnerName(updateData.getShopOwnerName());
        if (updateData.getShopType() != null) shop.setShopType(updateData.getShopType());
        if (updateData.getShopRegisterNumber() != null) shop.setShopRegisterNumber(updateData.getShopRegisterNumber());
        if (updateData.getShopEmail() != null) shop.setShopEmail(updateData.getShopEmail());
        if (updateData.getContactNumber() != null) shop.setContactNumber(updateData.getContactNumber());
        if (updateData.getStatus() != null) shop.setStatus(updateData.getStatus());
        if (updateData.getDescription() != null) shop.setDescription(updateData.getDescription());

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
