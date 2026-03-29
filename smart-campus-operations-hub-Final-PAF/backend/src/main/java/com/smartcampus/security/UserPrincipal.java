package com.smartcampus.security;

import com.smartcampus.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class UserPrincipal implements UserDetails {
  private final String id;
  private final String username;
  private final String email;
  private final String password;
  private final Collection<? extends GrantedAuthority> authorities;

  public UserPrincipal(String id, String username, String email, String password, Collection<? extends GrantedAuthority> authorities) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.authorities = authorities;
  }

  public static UserPrincipal create(User user) {
    String roleName = (user.getRole() != null && user.getRole().getName() != null) 
        ? user.getRole().getName().name() 
        : "USER";
    Collection<? extends GrantedAuthority> authorities = Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + roleName)
    );

    return new UserPrincipal(
        user.getId(),
        user.getUsername() != null ? user.getUsername() : user.getEmail(),
        user.getEmail(),
        user.getPassword(),
        authorities
    );
  }

  @Override
  public boolean isAccountNonExpired() { return true; }

  @Override
  public boolean isAccountNonLocked() { return true; }

  @Override
  public boolean isCredentialsNonExpired() { return true; }

  @Override
  public boolean isEnabled() { return true; }
}
