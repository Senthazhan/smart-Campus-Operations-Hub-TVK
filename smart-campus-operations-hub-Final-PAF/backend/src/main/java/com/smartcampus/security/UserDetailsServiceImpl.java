package com.smartcampus.security;

import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
    var user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail));

    if ("INACTIVE".equals(user.getStatus()) || "SUSPENDED".equals(user.getStatus())) {
      throw new org.springframework.security.authentication.DisabledException("User account is disabled");
    }

    return UserPrincipal.create(user);
  }

  @Transactional
  public UserDetails loadUserById(String id) {
    var user = userRepository.findById(id)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

    if ("INACTIVE".equals(user.getStatus()) || "SUSPENDED".equals(user.getStatus())) {
      throw new org.springframework.security.authentication.DisabledException("User account is disabled");
    }

    return UserPrincipal.create(user);
  }
}
