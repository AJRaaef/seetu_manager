package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.Shop;
import com.seettu.manager.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Shop>>> getAllShops() {
        return ResponseEntity.ok(ApiResponse.success(shopService.getAllShops()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Shop>> getShopById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(shopService.getShopById(id)));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<Shop>>> getShopsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success(shopService.getShopsByOwner(ownerId)));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> createShopJson(@RequestBody Shop shop,
                                                            @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Shop registered successfully", shopService.createShop(shop, ownerId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> createShop(
            @RequestParam String name,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String shopOwnerName,
            @RequestParam(required = false) String shopType,
            @RequestParam(required = false) String shopRegisterNumber,
            @RequestParam(required = false) String shopEmail,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String description) {

        Shop shop = Shop.builder()
                .name(name)
                .address(address)
                .shopOwnerName(shopOwnerName)
                .shopType(shopType != null ? shopType : "GENERAL_MERCHANT")
                .shopRegisterNumber(shopRegisterNumber)
                .shopEmail(shopEmail)
                .contactNumber(contactNumber)
                .status(status != null ? status : "ACTIVE")
                .description(description)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Shop registered successfully", shopService.createShop(shop, ownerId)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> updateShopJson(@PathVariable Long id, @RequestBody Shop updateData) {
        return ResponseEntity.ok(ApiResponse.success("Shop updated successfully", shopService.updateShop(id, updateData)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> updateShop(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String shopOwnerName,
            @RequestParam(required = false) String shopType,
            @RequestParam(required = false) String shopRegisterNumber,
            @RequestParam(required = false) String shopEmail,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String description) {

        Shop shop = Shop.builder()
                .name(name)
                .address(address)
                .shopOwnerName(shopOwnerName)
                .shopType(shopType)
                .shopRegisterNumber(shopRegisterNumber)
                .shopEmail(shopEmail)
                .contactNumber(contactNumber)
                .status(status)
                .description(description)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Shop updated successfully", shopService.updateShop(id, shop)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> deleteShop(@PathVariable Long id) {
        shopService.deleteShop(id);
        return ResponseEntity.ok(ApiResponse.success("Shop deleted", null));
    }
}
