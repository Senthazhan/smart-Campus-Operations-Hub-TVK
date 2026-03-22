package com.smartcampus.security;

import com.smartcampus.config.AppProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String token = jwtUtils.generateToken(authentication);

        // Extract role from granted authorities
    String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER")
                .replace("ROLE_", "");

    // Try to extract profile information from the OAuth2 principal
    String fullName = null;
    String email = null;
    Object principal = authentication.getPrincipal();
    if (principal instanceof AppUserPrincipal appUserPrincipal) {
      Object nameAttr = ((DefaultOAuth2User) appUserPrincipal).getAttributes().get("name");
      Object emailAttr = ((DefaultOAuth2User) appUserPrincipal).getAttributes().get("email");
      fullName = nameAttr != null ? String.valueOf(nameAttr) : null;
      email = emailAttr != null ? String.valueOf(emailAttr) : null;
    } else if (principal instanceof DefaultOAuth2User oauthUser) {
      Map<String, Object> attrs = oauthUser.getAttributes();
      Object nameAttr = attrs.get("name");
      Object emailAttr = attrs.get("email");
      fullName = nameAttr != null ? String.valueOf(nameAttr) : null;
      email = emailAttr != null ? String.valueOf(emailAttr) : null;
    }

        String baseUrl = appProperties.frontendBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

    UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl + "/oauth2/redirect")
        .queryParam("token", token)
        .queryParam("role", role);

    if (fullName != null && !fullName.isBlank()) {
      builder.queryParam("fullName", fullName);
    }
    if (email != null && !email.isBlank()) {
      builder.queryParam("email", email);
    }

    return builder.build().toUriString();
    }
}
