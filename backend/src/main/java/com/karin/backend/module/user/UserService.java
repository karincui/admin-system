package com.karin.backend.module.user;

import com.karin.backend.common.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    

    @Transactional
    public UserResponse create(UserCreateRequest request) {
        // 1. 用户名不能重复
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(409, "用户名已存在");
        }

        // 2. 组装实体
        SysUser user = new SysUser();
        user.setUsername(request.getUsername());
        // 密码必须加密后再存
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setRole(request.getRole() == null ? UserRole.USER : request.getRole());
        user.setEnabled(true);

        // 3. 保存
        SysUser saved = userRepository.save(user);

        // 4. 返回给前端的安全对象（不含密码）
        return UserResponse.from(saved);
    }
}