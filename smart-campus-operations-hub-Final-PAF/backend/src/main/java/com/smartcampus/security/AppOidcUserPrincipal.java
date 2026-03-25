package com.smartcampus.security;

import java.util.Map;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public class AppOidcUserPrincipal extends AppUserPrincipal implements OidcUser {
    private final OidcIdToken idToken;
    private final OidcUserInfo userInfo;

    public AppOidcUserPrincipal(AppUserPrincipal principal, OidcIdToken idToken, OidcUserInfo userInfo) {
        super(
            principal.getAppUserId(),
            principal.getRole(),
            principal.getAuthorities(),
            principal.getAttributes(),
            principal.getNameAttributeKey()
        );
        this.idToken = idToken;
        this.userInfo = userInfo;
    }

    @Override
    public Map<String, Object> getClaims() {
        return getAttributes();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return userInfo;
    }

    @Override
    public OidcIdToken getIdToken() {
        return idToken;
    }
}
