      *================================================================
      * PROGRAM:    TXN-PROCESSOR.cbl
      * DESCRIPTION: Apply approved transactions to accounts.
      *              Reads APPROVED-TRANSACTIONS.dat + ACCOUNTS-MASTER
      *              Produces updated ACCOUNTS-MASTER + audit ledger.
      *              Introduces: Sequential update pattern,
      *              signed arithmetic, audit trail
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. TXN-PROCESSOR.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ACCOUNTS-IN
                   ASSIGN TO "data/input/ACCOUNTS-MASTER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ACCT-STATUS.

               SELECT APPROVED-FILE
                   ASSIGN TO "data/output/APPROVED-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-TXN-STATUS.

               SELECT ACCOUNTS-OUT
                   ASSIGN TO "data/output/ACCOUNTS-UPDATED.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

               SELECT LEDGER-FILE
                   ASSIGN TO "data/output/TXN-LEDGER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.
           FD ACCOUNTS-IN.
           01 ACCT-IN-RECORD        PIC X(100).

           FD APPROVED-FILE.
           01 APPROVED-RECORD       PIC X(100).

           FD ACCOUNTS-OUT.
           01 ACCT-OUT-RECORD       PIC X(100).

           FD LEDGER-FILE.
           01 LEDGER-RECORD         PIC X(120).

       WORKING-STORAGE SECTION.
           01 WS-ACCT-STATUS        PIC X(2).
           01 WS-TXN-STATUS         PIC X(2).
           01 WS-EOF-ACCT           PIC X VALUE "N".
               88 NO-MORE-ACCOUNTS     VALUE "Y".

      *    --- Working copies ---
           COPY "ACCOUNT-RECORD.cpy".
           COPY "TRANSACTION-RECORD.cpy".

      *    --- Account table (same load pattern as TXN-VALIDATOR) ---
           01 WS-ACCT-TABLE.
               05 WS-ENTRY OCCURS 50 TIMES INDEXED BY WS-IDX.
                   10 WE-ID            PIC X(10).
                   10 WE-NAME          PIC X(25).
                   10 WE-TYPE          PIC X(10).
                   10 WE-BALANCE       PIC S9(9)V99.
                   10 WE-OD-LIMIT      PIC 9(7)V99.
                   10 WE-STATUS        PIC X(01).
                   10 WE-OPEN-DATE     PIC X(10).
                   10 WE-LAST-DATE     PIC X(10).
           01 WS-ACCT-COUNT         PIC 99 VALUE 0.
           01 WS-FOUND-IDX          PIC 99 VALUE 0.
           01 WS-TARGET-IDX         PIC 99 VALUE 0.

      *    --- Counters and totals ---
           01 WS-TXN-COUNT          PIC 999 VALUE 0.
           01 WS-TOTAL-DEPOSITED    PIC 9(11)V99 VALUE 0.
           01 WS-TOTAL-WITHDRAWN    PIC 9(11)V99 VALUE 0.

      *    --- Display ---
           01 WS-DISP-AMOUNT        PIC $$$,$$$,$$9.99.
           01 WS-DISP-BALANCE       PIC $$$,$$$,$$9.99.
           01 WS-OUT-LINE           PIC X(120).
      *    --- Output format helpers ---
           01 WS-OUT-BALANCE        PIC S9(9)V99 SIGN LEADING
                                        SEPARATE.
           01 WS-OUT-BAL-X REDEFINES WS-OUT-BALANCE PIC X(12).
           01 WS-OUT-OD             PIC 9(7)V99.
           01 WS-OUT-OD-X  REDEFINES WS-OUT-OD PIC X(9).
           01 WS-TXN-EOF            PIC X VALUE "N".
               88 NO-MORE-TXN          VALUE "Y".

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM LOAD-ACCOUNTS
               OPEN INPUT  APPROVED-FILE
               OPEN OUTPUT ACCOUNTS-OUT
               OPEN OUTPUT LEDGER-FILE
               PERFORM WRITE-LEDGER-HEADER
               PERFORM READ-NEXT-TXN
               PERFORM PROCESS-LOOP
                   UNTIL NO-MORE-TXN
               PERFORM WRITE-UPDATED-ACCOUNTS
               CLOSE APPROVED-FILE
               CLOSE ACCOUNTS-OUT
               CLOSE LEDGER-FILE
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           LOAD-ACCOUNTS.
               OPEN INPUT ACCOUNTS-IN
               PERFORM VARYING WS-IDX FROM 1 BY 1
                   UNTIL WS-IDX > 50
                   READ ACCOUNTS-IN INTO ACCT-IN-RECORD
                   AT END
                       MOVE WS-IDX TO WS-ACCT-COUNT
                       SUBTRACT 1 FROM WS-ACCT-COUNT
                       MOVE 51 TO WS-IDX
                   NOT AT END
                       MOVE ACCT-IN-RECORD(1:10)
                           TO WE-ID(WS-IDX)
                       MOVE ACCT-IN-RECORD(11:25)
                           TO WE-NAME(WS-IDX)
                       MOVE ACCT-IN-RECORD(36:10)
                           TO WE-TYPE(WS-IDX)
                       MOVE ACCT-IN-RECORD(46:12)
                           TO WE-BALANCE(WS-IDX)
                       MOVE ACCT-IN-RECORD(58:9)
                           TO WE-OD-LIMIT(WS-IDX)
                       MOVE ACCT-IN-RECORD(67:1)
                           TO WE-STATUS(WS-IDX)
                       MOVE ACCT-IN-RECORD(68:10)
                           TO WE-OPEN-DATE(WS-IDX)
                       MOVE ACCT-IN-RECORD(78:10)
                           TO WE-LAST-DATE(WS-IDX)
                   END-READ
               END-PERFORM
               CLOSE ACCOUNTS-IN.

           READ-NEXT-TXN.
               READ APPROVED-FILE INTO APPROVED-RECORD
               AT END
                   MOVE "Y" TO WS-TXN-EOF
               NOT AT END
                   MOVE APPROVED-RECORD TO TRANSACTION-RECORD
               END-READ.

           PROCESS-LOOP.
               ADD 1 TO WS-TXN-COUNT
               PERFORM FIND-ACCOUNT
               IF WS-FOUND-IDX > 0
                   PERFORM APPLY-TRANSACTION
                   PERFORM WRITE-LEDGER-ENTRY
               END-IF
               PERFORM READ-NEXT-TXN.

           FIND-ACCOUNT.
               MOVE 0 TO WS-FOUND-IDX
               PERFORM VARYING WS-IDX FROM 1 BY 1
                   UNTIL WS-IDX > WS-ACCT-COUNT
                   IF WE-ID(WS-IDX) = TR-ACCOUNT-ID
                       MOVE WS-IDX TO WS-FOUND-IDX
                   END-IF
               END-PERFORM.

           APPLY-TRANSACTION.
               MOVE "2026-03-07" TO WE-LAST-DATE(WS-FOUND-IDX)
               EVALUATE TRUE
                   WHEN TR-DEPOSIT OR TR-INTEREST
                       ADD TR-AMOUNT TO
                           WE-BALANCE(WS-FOUND-IDX)
                       ADD TR-AMOUNT TO WS-TOTAL-DEPOSITED
                   WHEN TR-WITHDRAWAL OR TR-FEE
                       SUBTRACT TR-AMOUNT FROM
                           WE-BALANCE(WS-FOUND-IDX)
                       ADD TR-AMOUNT TO WS-TOTAL-WITHDRAWN
                   WHEN TR-TRANSFER
                       SUBTRACT TR-AMOUNT FROM
                           WE-BALANCE(WS-FOUND-IDX)
                       ADD TR-AMOUNT TO WS-TOTAL-WITHDRAWN
                       PERFORM FIND-TRANSFER-TARGET
                       IF WS-TARGET-IDX > 0
                           ADD TR-AMOUNT TO
                               WE-BALANCE(WS-TARGET-IDX)
                       END-IF
               END-EVALUATE.

           FIND-TRANSFER-TARGET.
               MOVE 0 TO WS-TARGET-IDX
               PERFORM VARYING WS-IDX FROM 1 BY 1
                   UNTIL WS-IDX > WS-ACCT-COUNT
                   IF WE-ID(WS-IDX) = TR-TARGET-ACCOUNT
                       MOVE WS-IDX TO WS-TARGET-IDX
                   END-IF
               END-PERFORM.

           WRITE-LEDGER-HEADER.
               MOVE SPACES TO LEDGER-RECORD
               STRING
                   "DATE       ACCOUNT    "
                   DELIMITED SIZE
                   "TYPE AMT            "
                   DELIMITED SIZE
                   "DESCRIPTION"
                   DELIMITED SIZE
                   "              NEW BALANCE"
                   DELIMITED SIZE
                   INTO LEDGER-RECORD
               WRITE LEDGER-RECORD
               MOVE ALL "-" TO LEDGER-RECORD
               WRITE LEDGER-RECORD.

           WRITE-LEDGER-ENTRY.
               MOVE TR-AMOUNT            TO WS-DISP-AMOUNT
               MOVE WE-BALANCE(WS-FOUND-IDX) TO WS-DISP-BALANCE
               STRING
                   TR-DATE              DELIMITED SIZE
                   " " DELIMITED SIZE
                   TR-ACCOUNT-ID        DELIMITED SIZE
                   " " DELIMITED SIZE
                   TR-TXN-TYPE          DELIMITED SIZE
                   " " DELIMITED SIZE
                   WS-DISP-AMOUNT       DELIMITED SIZE
                   " " DELIMITED SIZE
                   TR-DESCRIPTION       DELIMITED SIZE
                   " " DELIMITED SIZE
                   WS-DISP-BALANCE      DELIMITED SIZE
                   INTO WS-OUT-LINE
               MOVE WS-OUT-LINE TO LEDGER-RECORD
               WRITE LEDGER-RECORD.

           WRITE-UPDATED-ACCOUNTS.
               PERFORM VARYING WS-IDX FROM 1 BY 1
                   UNTIL WS-IDX > WS-ACCT-COUNT
                   MOVE SPACES TO ACCT-OUT-RECORD
                   MOVE WE-ID(WS-IDX)
                       TO ACCT-OUT-RECORD(1:10)
                   MOVE WE-NAME(WS-IDX)
                       TO ACCT-OUT-RECORD(11:25)
                   MOVE WE-TYPE(WS-IDX)
                       TO ACCT-OUT-RECORD(36:10)
                   MOVE WE-BALANCE(WS-IDX)
                       TO WS-OUT-BALANCE
                   MOVE WS-OUT-BAL-X
                       TO ACCT-OUT-RECORD(46:12)
                   MOVE WE-OD-LIMIT(WS-IDX)
                       TO WS-OUT-OD
                   MOVE WS-OUT-OD-X
                       TO ACCT-OUT-RECORD(58:9)
                   MOVE WE-STATUS(WS-IDX)
                       TO ACCT-OUT-RECORD(67:1)
                   MOVE WE-OPEN-DATE(WS-IDX)
                       TO ACCT-OUT-RECORD(68:10)
                   MOVE WE-LAST-DATE(WS-IDX)
                       TO ACCT-OUT-RECORD(78:10)
                   WRITE ACCT-OUT-RECORD
               END-PERFORM.

           DISPLAY-RESULTS.
               MOVE WS-TOTAL-DEPOSITED TO WS-DISP-BALANCE
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Transaction Processor"
               DISPLAY "=============================================="
               DISPLAY "  Transactions Applied : " WS-TXN-COUNT
               DISPLAY "  Total Deposited      : " WS-DISP-BALANCE
               MOVE WS-TOTAL-WITHDRAWN TO WS-DISP-BALANCE
               DISPLAY "  Total Withdrawn      : " WS-DISP-BALANCE
               DISPLAY "----------------------------------------------"
               DISPLAY "  → data/output/ACCOUNTS-UPDATED.dat"
               DISPLAY "  → data/output/TXN-LEDGER.dat"
               DISPLAY "==============================================".
