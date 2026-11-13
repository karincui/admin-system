package com.karin.backend.module.auth;

import com.karin.backend.module.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private UserResponse user;
}
