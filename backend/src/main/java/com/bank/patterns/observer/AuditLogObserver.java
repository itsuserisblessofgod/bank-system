package com.bank.patterns.observer;

import com.bank.model.Notification;
import com.bank.model.NotificationType;
import com.bank.repository.NotificationRepository;
import org.springframework.stereotype.Component;

@Component
public class AuditLogObserver implements TransactionObserver {

    private final NotificationRepository notificationRepo;

    public AuditLogObserver(NotificationRepository notificationRepo) {
        this.notificationRepo = notificationRepo;
    }

    @Override
    public void onTransactionEvent(TransactionEvent event) {
        String message = "AUDIT tx=" + event.transaction().getId() +
                " type=" + event.transaction().getTransactionType() +
                " amount=" + event.transaction().getAmount() +
                " status=" + event.transaction().getStatus() +
                " fraudFlag=" + event.transaction().isFraudFlag();
        notificationRepo.save(Notification.builder()
                .user(event.user())
                .message(message)
                .notificationType(NotificationType.AUDIT)
                .build());
    }
}
