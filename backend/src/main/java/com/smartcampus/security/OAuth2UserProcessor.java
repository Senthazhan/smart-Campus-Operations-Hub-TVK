package com.smartcampus.security;

import com.smartcampus.entity.User;
import com.smartcampus.enums.RoleName;
import com.smartcampus.repository.RoleRepository;
import com.smartcampus.repository.UserRepository;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class OAuth2UserProcessor {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;

  @Transactional
  public AppUserPrincipal processOAuth2User(OAuth2User oauthUser, ClientRegistration clientRegistration) {
    String registrationId = clientRegistration.getRegistrationId();
    String subject = extractSubject(oauthUser);
    String email = (String) oauthUser.getAttributes().get("email");
    String name = (String) oauthUser.getAttributes().getOrDefault("name", email);
    String picture = (String) oauthUser.getAttributes().getOrDefault("picture", null);

    if (email == null || subject == null) {
      throw new OAuth2AuthenticationException("Missing required OAuth attributes");
    }

    User user = userRepository.findByProviderAndProviderSubject(registrationId, subject)
        .orElseGet(() -> userRepository.findByEmail(email).orElse(null));

    if (user == null) {
      var defaultRole = roleRepository.findByName(RoleName.USER)
          .orElseThrow(() -> new OAuth2AuthenticationException("Default role USER missing"));
      user = new User();
      user.setEmail(email);
      user.setFullName(name);
      user.setAvatarUrl(picture);
      user.setRole(defaultRole);
      user.setProvider(registrationId);
      user.setProviderSubject(subject);
    } else {
      user.setEmail(email);
      user.setFullName(name);
      // Only set the Google avatar if the user has NOT already uploaded a custom one
      if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) {
        user.setAvatarUrl(picture);
      }
      user.setProvider(registrationId);
      user.setProviderSubject(subject);
    }

    user = userRepository.save(user);

    var authority = new SimpleGrantedAuthority(SecurityConstants.ROLE_PREFIX + user.getRole().getName().name());
    Map<String, Object> attrs = new HashMap<>(oauthUser.getAttributes());
    attrs.put("appUserId", user.getId());
    
    String nameAttrKey = clientRegistration.getProviderDetails()
        .getUserInfoEndpoint().getUserNameAttributeName();
    if (nameAttrKey == null || nameAttrKey.isBlank()) nameAttrKey = "sub";

    return new AppUserPrincipal(user.getId(), user.getRole().getName(), List.of(authority), attrs, nameAttrKey);
  }

  private String extractSubject(OAuth2User oauthUser) {
    Object sub = oauthUser.getAttributes().get("sub");
    if (sub != null) return String.valueOf(sub);
    if (oauthUser instanceof OidcUser oidcUser) return oidcUser.getSubject();
    return null;
  }
}
