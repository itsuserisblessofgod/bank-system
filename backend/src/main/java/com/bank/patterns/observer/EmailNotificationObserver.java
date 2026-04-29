package com.bank.patterns.observer;

import com.bank.model.Notification;
import com.bank.model.NotificationType;
import com.bank.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailNotificationObserver implements TransactionObserver {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationObserver.class);

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepo;
    private final String fromEmail;

    public EmailNotificationObserver(JavaMailSender mailSender,
                                     NotificationRepository notificationRepo,
                                     @Value("${ebms.notifications.from-email}") String fromEmail) {
        this.mailSender = mailSender;
        this.notificationRepo = notificationRepo;
        this.fromEmail = fromEmail;
    }

    @Override
    public void onTransactionEvent(TransactionEvent event) {
        String message = "Transaction " + event.transaction().getTransactionType() +
                " of amount " + event.transaction().getAmount() +
                " status " + event.transaction().getStatus();
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(event.user().getEmail());
            mail.setSubject("EBMS Transaction Alert");
            mail.setText(message);
            mailSender.send(mail);
        } catch (Exception ex) {
            log.warn("Email send failed (dev mode OK): {}", ex.getMessage());
        }
        notificationRepo.save(Notification.builder()
                .user(event.user())
                .message(message)
                .notificationType(NotificationType.EMAIL)
                .build());
    }
}
