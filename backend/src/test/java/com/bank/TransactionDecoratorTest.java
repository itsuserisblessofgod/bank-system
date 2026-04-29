package com.bank;

import com.bank.model.Transaction;
import com.bank.model.TransactionStatus;
import com.bank.model.TransactionType;
import com.bank.patterns.decorator.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class TransactionDecoratorTest {

    @Test
    void encryptedDecoratorAttachesSignature() {
        Transaction tx = Transaction.builder()
                .amount(new BigDecimal("100"))
                .transactionType(TransactionType.DEPOSIT)
                .status(TransactionStatus.PENDING)
                .build();
        TransactionProcessor p = new EncryptedTransactionDecorator(new BaseTransactionProcessor());
        Transaction out = p.process(tx);
        assertEquals(TransactionStatus.COMPLETED, out.getStatus());
        assertNotNull(out.getFraudReason());
        assertTrue(out.getFraudReason().contains("[sig:"));
    }

    @Test
    void canCompose() {
        Transaction tx = Transaction.builder()
                .amount(new BigDecimal("50"))
                .transactionType(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.PENDING)
                .build();
        TransactionProcessor p = new LoggedTransactionDecorator(
                new EncryptedTransactionDecorator(new BaseTransactionProcessor()));
        Transaction out = p.process(tx);
        assertEquals(TransactionStatus.COMPLETED, out.getStatus());
    }
}
