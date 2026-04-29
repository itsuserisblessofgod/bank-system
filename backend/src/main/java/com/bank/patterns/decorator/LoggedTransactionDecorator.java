package com.bank.patterns.decorator;

import com.bank.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggedTransactionDecorator extends TransactionDecorator {

    private static final Logger log = LoggerFactory.getLogger(LoggedTransactionDecorator.class);

    public LoggedTransactionDecorator(TransactionProcessor delegate) {
        super(delegate);
    }

    @Override
    public Transaction process(Transaction transaction) {
        log.info("[COMPLIANCE] BEGIN tx type={} amount={}",
                transaction.getTransactionType(), transaction.getAmount());
        Transaction result = super.process(transaction);
        log.info("[COMPLIANCE] END tx id={} status={} fraudFlag={}",
                result.getId(), result.getStatus(), result.isFraudFlag());
        return result;
    }
}
