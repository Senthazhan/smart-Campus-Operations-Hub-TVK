package com.smartcampus.security;

import com.smartcampus.enums.RoleName;
import java.util.Collection;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

public class AppUserPrincipal extends DefaultOAuth2User {
  private final String appUserId;
  private final RoleName role;
  private final String nameAttributeKey;

  public AppUserPrincipal(
      String appUserId,
      RoleName role,
      Collection<? extends GrantedAuthority> authorities,
      Map<String, Object> attributes,
      String nameAttributeKey
  ) {
    super(authorities, attributes, nameAttributeKey);
    this.appUserId = appUserId;
    this.role = role;
    this.nameAttributeKey = nameAttributeKey;
  }

  public String getAppUserId() {
    return appUserId;
  }

  public RoleName getRole() {
    return role;
  }

  public String getNameAttributeKey() {
    return nameAttributeKey;
  }
}

