package com.example.RedisCaching.controller;

import com.example.RedisCaching.dto.UserProfile;
import com.example.RedisCaching.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @Autowired
    private UserService userService;

    @GetMapping("/users/{userId}/profile")
    public UserProfile getUserProfile(@PathVariable(value = "userId") String userId) {
        return userService.getUserProfile(userId);
    }
}
