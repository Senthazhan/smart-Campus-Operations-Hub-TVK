package com.smartcampus.security;

import com.smartcampus.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtils {

  private final AppProperties appProperties;

  public String generateToken(Authentication authentication) {
    Object principal = authentication.getPrincipal();
    String userId;

    if (principal instanceof UserPrincipal userPrincipal) {
      userId = userPrincipal.getId();
    } else if (principal instanceof AppUserPrincipal appUserPrincipal) {
      userId = appUserPrincipal.getAppUserId();
    } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2User && oauth2User.getAttributes().containsKey("appUserId")) {
        userId = String.valueOf(oauth2User.getAttributes().get("appUserId"));
    } else {
      userId = authentication.getName();
    }

    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + appProperties.jwtExpirationMs());

    SecretKey key = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));

    return Jwts.builder()
        .setSubject(userId)
        .setIssuedAt(new Date())
        .setExpiration(expiryDate)
        .signWith(key)
        .compact();
  }

  public String getUserIdFromToken(String token) {
    SecretKey key = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));

    Claims claims = Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();

    return claims.getSubject();
  }

  public boolean validateToken(String authToken) {
    try {
      SecretKey key = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
      Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
      return true;
    } catch (SecurityException ex) {
      log.error("Invalid JWT signature");
    } catch (MalformedJwtException ex) {
      log.error("Invalid JWT token");
    } catch (ExpiredJwtException ex) {
      log.error("Expired JWT token");
    } catch (UnsupportedJwtException ex) {
      log.error("Unsupported JWT token");
    } catch (IllegalArgumentException ex) {
      log.error("JWT claims string is empty.");
    }
    return false;
  }
}
