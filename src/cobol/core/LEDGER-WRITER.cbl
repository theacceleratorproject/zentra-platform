      *================================================================
      * PROGRAM:    LEDGER-WRITER.cbl
      * DESCRIPTION: Write transactions to a flat file ledger
      *              Demonstrates: FILE SECTION, WRITE, OPEN/CLOSE
      *              This is the foundation of Phase 2 batch processing
      * PHASE:      1 - COBOL Foundations
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. LEDGER-WRITER.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT LEDGER-FILE
                   ASSIGN TO "data/output/zentra_ledger.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.
           FD LEDGER-FILE.
           01 LEDGER-RECORD.
               05 LR-DATE          PIC X(10).
               05 FILLER           PIC X(01) VALUE SPACE.
               05 LR-ACCOUNT-ID    PIC X(10).
               05 FILLER           PIC X(01) VALUE SPACE.
               05 LR-TXN-TYPE      PIC X(10).
               05 FILLER           PIC X(01) VALUE SPACE.
               05 LR-AMOUNT        PIC $$$,$$$,$$9.99.
               05 FILLER           PIC X(01) VALUE SPACE.
               05 LR-DESCRIPTION   PIC X(30).

           WORKING-STORAGE SECTION.
           01 WS-TRANSACTION-COUNT PIC 99 VALUE 0.
           01 WS-FILE-STATUS       PIC X(2).

       PROCEDURE DIVISION.
           MAIN-PARA.
               OPEN OUTPUT LEDGER-FILE
               PERFORM WRITE-TRANSACTIONS
               CLOSE LEDGER-FILE
               PERFORM DISPLAY-SUMMARY
               STOP RUN.

           WRITE-TRANSACTIONS.
      *        Transaction 1 - Deposit
               MOVE "2026-03-05"  TO LR-DATE
               MOVE "ZNT-001042"  TO LR-ACCOUNT-ID
               MOVE "DEPOSIT"     TO LR-TXN-TYPE
               MOVE 2500.00       TO LR-AMOUNT
               MOVE "DIRECT DEPOSIT - PAYROLL" TO LR-DESCRIPTION
               WRITE LEDGER-RECORD
               ADD 1 TO WS-TRANSACTION-COUNT

      *        Transaction 2 - Debit
               MOVE "2026-03-05"  TO LR-DATE
               MOVE "ZNT-001042"  TO LR-ACCOUNT-ID
               MOVE "DEBIT"       TO LR-TXN-TYPE
               MOVE 847.50        TO LR-AMOUNT
               MOVE "RENT PAYMENT - AUTO"     TO LR-DESCRIPTION
               WRITE LEDGER-RECORD
               ADD 1 TO WS-TRANSACTION-COUNT

      *        Transaction 3 - Transfer
               MOVE "2026-03-05"  TO LR-DATE
               MOVE "ZNT-001042"  TO LR-ACCOUNT-ID
               MOVE "TRANSFER"    TO LR-TXN-TYPE
               MOVE 200.00        TO LR-AMOUNT
               MOVE "TRANSFER TO SAVINGS"     TO LR-DESCRIPTION
               WRITE LEDGER-RECORD
               ADD 1 TO WS-TRANSACTION-COUNT

      *        Transaction 4 - Debit
               MOVE "2026-03-05"  TO LR-DATE
               MOVE "ZNT-001099"  TO LR-ACCOUNT-ID
               MOVE "DEBIT"       TO LR-TXN-TYPE
               MOVE 67.23         TO LR-AMOUNT
               MOVE "GROCERY STORE PURCHASE"  TO LR-DESCRIPTION
               WRITE LEDGER-RECORD
               ADD 1 TO WS-TRANSACTION-COUNT

      *        Transaction 5 - Fee
               MOVE "2026-03-05"  TO LR-DATE
               MOVE "ZNT-001099"  TO LR-ACCOUNT-ID
               MOVE "FEE"         TO LR-TXN-TYPE
               MOVE 12.00         TO LR-AMOUNT
               MOVE "MONTHLY MAINTENANCE FEE" TO LR-DESCRIPTION
               WRITE LEDGER-RECORD
               ADD 1 TO WS-TRANSACTION-COUNT.

           DISPLAY-SUMMARY.
               DISPLAY "====================================="
               DISPLAY "  ZENTRA BANK - Ledger Writer"
               DISPLAY "====================================="
               DISPLAY " Transactions Written: "
                   WS-TRANSACTION-COUNT
               DISPLAY " Ledger File: data/output/zentra_ledger.dat"
               DISPLAY " Status: COMPLETE"
               DISPLAY "=====================================".
