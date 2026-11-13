package com.karin.backend.module.user;

import com.karin.backend.common.ApiResponse;
import com.karin.backend.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final SysUserRepository userRepository;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal LoginUser loginUser) {
        SysUser user = userRepository.findById(loginUser.getId())
                .orElseThrow();
        return ApiResponse.ok(UserResponse.from(user));
    }
}
