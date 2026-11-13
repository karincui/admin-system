package com.karin.backend.module.user;

import com.karin.backend.common.ApiResponse;
import com.karin.backend.security.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final SysUserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal LoginUser loginUser) {
        SysUser user = userRepository.findById(loginUser.getId())
                .orElseThrow();
        return ApiResponse.ok(UserResponse.from(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ApiResponse.ok(userService.create(request));
    }
}
