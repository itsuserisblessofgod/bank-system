package com.bank.patterns.observer;

import com.bank.model.Notification;
import com.bank.model.NotificationType;
import com.bank.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SmsNotificationObserver implements TransactionObserver {

    private static final Logger log = LoggerFactory.getLogger(SmsNotificationObserver.class);

    private final NotificationRepository notificationRepo;
    private final String sender;

    public SmsNotificationObserver(NotificationRepository notificationRepo,
                                   @Value("${ebms.notifications.sms-sender}") String sender) {
        this.notificationRepo = notificationRepo;
        this.sender = sender;
    }

    @Override
    public void onTransactionEvent(TransactionEvent event) {
        String message = "[" + sender + "] " + event.transaction().getTransactionType() +
                " " + event.transaction().getAmount() + " - " + event.transaction().getStatus();
        log.info("SMS to {}: {}", event.user().getEmail(), message);
        notificationRepo.save(Notification.builder()
                .user(event.user())
                .message(message)
                .notificationType(NotificationType.SMS)
                .build());
    }
}
