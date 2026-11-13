package com.karin.backend.security;

import com.karin.backend.module.user.SysUser;
import com.karin.backend.module.user.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class LoginUser implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final UserRole role;
    private final boolean enabled;

    public LoginUser(SysUser user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.enabled = Boolean.TRUE.equals(user.getEnabled());
    }

    public LoginUser(Long id, String username, UserRole role) {
        this.id = id;
        this.username = username;
        this.password = "";
        this.role = role;
        this.enabled = true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
