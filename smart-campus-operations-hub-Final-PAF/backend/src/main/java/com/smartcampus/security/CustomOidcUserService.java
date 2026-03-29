package com.smartcampus.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

  private final OAuth2UserProcessor oauth2UserProcessor;

  @Override
  public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
    OidcUser oidcUser = super.loadUser(userRequest);
    AppUserPrincipal principal = oauth2UserProcessor.processOAuth2User(oidcUser, userRequest.getClientRegistration());
    return new AppOidcUserPrincipal(principal, oidcUser.getIdToken(), oidcUser.getUserInfo());
  }
}
