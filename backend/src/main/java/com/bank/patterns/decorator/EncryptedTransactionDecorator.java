package com.bank.patterns.decorator;

import com.bank.model.Transaction;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Adds an integrity hash of the sensitive transaction fields before delegating to the
 * wrapped processor. The hash is appended to the fraudReason field as a tamper-evidence
 * marker (in production this would be a separate column / signed envelope).
 */
public class EncryptedTransactionDecorator extends TransactionDecorator {

    public EncryptedTransactionDecorator(TransactionProcessor delegate) {
        super(delegate);
    }

    @Override
    public Transaction process(Transaction transaction) {
        String payload = transaction.getAmount() + "|" +
                (transaction.getSenderAccount() == null ? "-" : transaction.getSenderAccount().getId()) + "|" +
                (transaction.getReceiverAccount() == null ? "-" : transaction.getReceiverAccount().getId());
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(payload.getBytes(StandardCharsets.UTF_8));
            String hex = HexFormat.of().formatHex(digest).substring(0, 16);
            String existing = transaction.getFraudReason();
            transaction.setFraudReason((existing == null ? "" : existing + " ") + "[sig:" + hex + "]");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
        return super.process(transaction);
    }
}
