package com.paltform.VoicesOfSyria.Controller;

import com.paltform.VoicesOfSyria.Enum.StoryStatus;
import com.paltform.VoicesOfSyria.Model.Story;
import com.paltform.VoicesOfSyria.Service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/stories")
public class AdminController {

    @Autowired
    private StoryService storyService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Story>> getPendingStories() {
        try {
            List<Story> pendingStories = storyService.getStoriesByStatus(StoryStatus.PENDING);
            return ResponseEntity.ok(pendingStories);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Story> approveStory(@PathVariable Long id) {
        try {
            Story approvedStory = storyService.approveStory(id);
            return ResponseEntity.ok(approvedStory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Story> rejectStory(@PathVariable Long id) {
        try {
            Story rejectedStory = storyService.rejectStory(id);
            return ResponseEntity.ok(rejectedStory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @RestController
    @RequestMapping("/admin/stories")
    public class AdminStoryController {
    
        private final StoryService storyService;
    
        public AdminStoryController(StoryService storyService) {
            this.storyService = storyService;
        }
    
        @PutMapping("/{id}/request-modification")
        @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
        public ResponseEntity<?> requestModification(
                @PathVariable Long id,
                @RequestBody String message
        ) {
            Story updatedStory = storyService.requestModification(id, message);
    
            return ResponseEntity.ok(updatedStory);
        }
    }
    
}
