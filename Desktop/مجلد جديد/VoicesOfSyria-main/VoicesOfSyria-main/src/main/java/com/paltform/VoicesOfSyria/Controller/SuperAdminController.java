package com.paltform.VoicesOfSyria.Controller;

import com.paltform.VoicesOfSyria.Dto.AdminResponse;
import com.paltform.VoicesOfSyria.Dto.CreateAdminRequest;
import com.paltform.VoicesOfSyria.Service.AdminManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')") // Only SUPER_ADMIN can access these endpoints
public class SuperAdminController {

    private final AdminManagementService adminManagementService;

    public SuperAdminController(AdminManagementService adminManagementService) {
        this.adminManagementService = adminManagementService;
    }

    /**
     * Create a new ADMIN user
     * POST /super-admin/admins
     */
    @PostMapping("/admins")
    public ResponseEntity<AdminResponse> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        AdminResponse response = adminManagementService.createAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Delete an existing ADMIN user
     * DELETE /super-admin/admins/{id}
     */
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Map<String, String>> deleteAdmin(@PathVariable Long id) {
        adminManagementService.deleteAdmin(id);
        return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
    }

    /**
     * Get all ADMIN users (optional endpoint for viewing)
     * GET /super-admin/admins
     */
    @GetMapping("/admins")
    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        List<AdminResponse> admins = adminManagementService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }
}
