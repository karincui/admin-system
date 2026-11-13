package com.karin.backend.module.auth;

import com.karin.backend.common.BusinessException;
import com.karin.backend.module.user.SysUser;
import com.karin.backend.module.user.SysUserRepository;
import com.karin.backend.module.user.UserResponse;
import com.karin.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        SysUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BusinessException(403, "账号已禁用");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        String token = jwtService.createToken(user.getId(), user.getUsername(), user.getRole().name());
        return new LoginResponse(token, UserResponse.from(user));
    }
}
