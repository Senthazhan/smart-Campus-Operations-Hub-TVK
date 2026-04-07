package com.smartcampus.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${app.env:dev}")
  private String env;

  /**
   * Sends a password reset email with an HTML body.
   *
   * @param to       recipient email address
   * @param resetUrl the full password-reset URL
   */
  public void sendPasswordResetEmail(String to, String resetUrl) {
    // Development Fallback: Always log the link if in dev mode
    if ("dev".equalsIgnoreCase(env)) {
      log.info("\n" + "=".repeat(80) + "\n" +
               "DEVELOPMENT MODE: PASSWORD RESET LINK\n" +
               "To:      " + to + "\n" +
               "Link:    " + resetUrl + "\n" +
               "=".repeat(80));
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setTo(to);
      helper.setSubject("Smart Campus \u2013 Password Reset Request");

      String html = """
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #4f46e5;">Smart Campus Operations Hub</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            <p style="margin: 32px 0;">
              <a href="%s"
                 style="background-color: #4f46e5; color: white; padding: 14px 28px;
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Reset My Password
              </a>
            </p>
            <p>This link expires in <strong>1 hour</strong>.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">
              Smart Campus Operations Hub &mdash; Automated security email. Please do not reply.
            </p>
          </div>
          """.formatted(resetUrl);

      helper.setText(html, true);
      mailSender.send(message);
      log.info("Password reset email sent to: {}", to);

    } catch (MailException | MessagingException e) {
      log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
      
      // In dev mode, we don't want to throw an exception that breaks the UI flow 
      // because the link is already available in the console.
      if (!"dev".equalsIgnoreCase(env)) {
        throw new RuntimeException("Could not send reset email. Please try again later.", e);
      } else {
        log.warn("SMTP delivery failed in DEV mode. Use the link logged above for testing.");
      }
    }
  }
}
