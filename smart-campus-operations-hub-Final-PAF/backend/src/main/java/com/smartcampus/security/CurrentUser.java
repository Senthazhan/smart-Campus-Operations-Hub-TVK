package com.smartcampus.security;

import com.smartcampus.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;

public final class CurrentUser {
  private CurrentUser() {}

  public static String id() {
    Authentication auth = requireAuth();
    Object principal = auth.getPrincipal();

    // AppUserPrincipal (our custom principal for both OAuth2 and OIDC flows)
    if (principal instanceof AppUserPrincipal appUserPrincipal) {
      return appUserPrincipal.getAppUserId();
    }

    // Standard username/password auth via UserPrincipal
    if (principal instanceof UserPrincipal userPrincipal) {
      return userPrincipal.getId();
    }

    // Fallback: Generic OAuth2User with appUserId attribute (e.g. old tokens)
    if (principal instanceof OAuth2User oauth2User) {
      Object appUserId = oauth2User.getAttributes().get("appUserId");
      if (appUserId != null) {
        return String.valueOf(appUserId);
      }
    }

    // Fallback: Spring Security's built-in User
    if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
      return springUser.getUsername();
    }

    // Fallback: Anonymous user check
    if (principal instanceof String str && !"anonymousUser".equals(str)) {
      return str;
    }

    throw new ForbiddenException("Authenticated user information is unavailable.");
  }

  public static String username() {
    Authentication auth = requireAuth();
    Object principal = auth.getPrincipal();

    if (principal instanceof AppUserPrincipal appUserPrincipal) {
      return appUserPrincipal.getName();
    }

    if (principal instanceof UserPrincipal userPrincipal) {
      return userPrincipal.getUsername();
    }

    if (principal instanceof OAuth2User oauth2User) {
      Object name = oauth2User.getAttributes().get("name");
      if (name != null) return String.valueOf(name);
      Object email = oauth2User.getAttributes().get("email");
      if (email != null) return String.valueOf(email);
    }

    if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
      return springUser.getUsername();
    }

    if (principal instanceof String str && !"anonymousUser".equals(str)) {
      return str;
    }

    throw new ForbiddenException("Authenticated username is unavailable.");
  }

  public static Authentication requireAuth() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated()) {
      throw new ForbiddenException("Not authenticated");
    }

    return auth;
  }
}