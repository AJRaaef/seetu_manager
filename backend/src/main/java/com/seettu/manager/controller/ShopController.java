package com.seettu.manager.controller;

import com.seettu.manager.dto.ApiResponse;
import com.seettu.manager.entity.Shop;
import com.seettu.manager.service.ShopService;
import lombok.RequiredArgsConstructor;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> createShop(@RequestParam String name, 
                                                        @RequestParam(required = false) String address, 
                                                        @RequestParam Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Shop created", shopService.createShop(name, address, ownerId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<Shop>> updateShop(@PathVariable Long id, 
                                                        @RequestParam(required = false) String name, 
                                                        @RequestParam(required = false) String address) {
        return ResponseEntity.ok(ApiResponse.success("Shop updated", shopService.updateShop(id, name, address)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShop(@PathVariable Long id) {
        shopService.deleteShop(id);
        return ResponseEntity.ok(ApiResponse.success("Shop deleted", null));
    }
}
