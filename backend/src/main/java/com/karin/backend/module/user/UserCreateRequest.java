package com.karin.backend.module.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserCreateRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 64, message = "用户名长度 3~64")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 4, max = 64, message = "密码长度 4~64")
    private String password;

    @Size(max = 64, message = "昵称最多 64 字")
    private String nickname;

    private UserRole role; // 可不传，Service 里默认 USER
}