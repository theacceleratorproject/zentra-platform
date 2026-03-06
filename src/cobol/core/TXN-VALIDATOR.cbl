      *================================================================
      * PROGRAM:    TXN-VALIDATOR.cbl
      * DESCRIPTION: Validate transactions against 6 business rules.
      *              Splits into APPROVED and REJECTED output files.
      *              Rules:
      *                E01 - Account not found
      *                E02 - Account inactive (frozen/closed)
      *                E03 - Invalid amount (zero or negative)
      *                E04 - Insufficient funds
      *                E05 - Exceeds single-txn limit ($100,000)
      *                E06 - Invalid transfer target
      *              Introduces: OCCURS/SEARCH, multi-file I/O
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. TXN-VALIDATOR.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ACCOUNTS-FILE
                   ASSIGN TO "data/input/ACCOUNTS-MASTER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ACCT-STATUS.

               SELECT TXN-INPUT-FILE
                   ASSIGN TO "data/input/DAILY-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-TXN-STATUS.

               SELECT APPROVED-FILE
                   ASSIGN TO "data/output/APPROVED-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

               SELECT REJECTED-FILE
                   ASSIGN TO "data/output/REJECTED-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.

           FD ACCOUNTS-FILE.
           01 ACCT-FILE-RECORD      PIC X(100).

           FD TXN-INPUT-FILE.
           01 TXN-FILE-RECORD       PIC X(100).

           FD APPROVED-FILE.
           01 APPROVED-RECORD       PIC X(100).

           FD REJECTED-FILE.
           01 REJECTED-RECORD       PIC X(100).

       WORKING-STORAGE SECTION.
           01 WS-ACCT-STATUS        PIC X(2).
           01 WS-TXN-STATUS         PIC X(2).
           01 WS-EOF-TXN            PIC X VALUE "N".
               88 NO-MORE-TXN          VALUE "Y".

      *    --- In-memory account table (up to 50 accounts) ---
           01 WS-ACCT-TABLE.
               05 WS-ACCT-ENTRY OCCURS 50 TIMES
                               INDEXED BY WS-ACCT-IDX.
                   10 WA-ID            PIC X(10).
                   10 WA-BALANCE       PIC S9(9)V99.
                   10 WA-OD-LIMIT      PIC 9(7)V99.
                   10 WA-STATUS        PIC X(01).
                   10 WA-TYPE          PIC X(10).
           01 WS-ACCT-COUNT         PIC 99 VALUE 0.

      *    --- Working copies of copybook records ---
           COPY "TRANSACTION-RECORD.cpy".

      *    --- Validation state ---
           01 WS-VALID              PIC X VALUE "Y".
               88 RECORD-VALID         VALUE "Y".
               88 RECORD-INVALID       VALUE "N".
           01 WS-ERROR-CODE         PIC X(03) VALUE SPACES.
           01 WS-FOUND-IDX          PIC 99 VALUE 0.
           01 WS-TARGET-FOUND       PIC X VALUE "N".

      *    --- Transaction limit ---
           01 WS-TXN-LIMIT          PIC 9(9)V99 VALUE 100000.00.

      *    --- Counters ---
           01 WS-TOTAL-READ         PIC 999 VALUE 0.
           01 WS-APPROVED-COUNT     PIC 999 VALUE 0.
           01 WS-REJECTED-COUNT     PIC 999 VALUE 0.

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM LOAD-ACCOUNTS-TO-TABLE
               OPEN INPUT  TXN-INPUT-FILE
               OPEN OUTPUT APPROVED-FILE
               OPEN OUTPUT REJECTED-FILE
               PERFORM READ-NEXT-TXN
               PERFORM VALIDATE-LOOP
                   UNTIL NO-MORE-TXN
               CLOSE TXN-INPUT-FILE
               CLOSE APPROVED-FILE
               CLOSE REJECTED-FILE
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           LOAD-ACCOUNTS-TO-TABLE.
               OPEN INPUT ACCOUNTS-FILE
               PERFORM LOAD-LOOP
                   UNTIL WS-ACCT-COUNT = 50
               CLOSE ACCOUNTS-FILE.

           LOAD-LOOP.
               READ ACCOUNTS-FILE INTO ACCT-FILE-RECORD
               AT END
                   MOVE 50 TO WS-ACCT-COUNT
               NOT AT END
                   ADD 1 TO WS-ACCT-COUNT
                   MOVE ACCT-FILE-RECORD(1:10)
                       TO WA-ID(WS-ACCT-COUNT)
                   MOVE ACCT-FILE-RECORD(46:12)
                       TO WA-BALANCE(WS-ACCT-COUNT)
                   MOVE ACCT-FILE-RECORD(58:9)
                       TO WA-OD-LIMIT(WS-ACCT-COUNT)
                   MOVE ACCT-FILE-RECORD(67:1)
                       TO WA-STATUS(WS-ACCT-COUNT)
                   MOVE ACCT-FILE-RECORD(36:10)
                       TO WA-TYPE(WS-ACCT-COUNT)
               END-READ.

           READ-NEXT-TXN.
               READ TXN-INPUT-FILE INTO TXN-FILE-RECORD
               AT END
                   MOVE "Y" TO WS-EOF-TXN
               NOT AT END
                   MOVE TXN-FILE-RECORD TO TRANSACTION-RECORD
               END-READ.

           VALIDATE-LOOP.
               ADD 1 TO WS-TOTAL-READ
               MOVE "Y"    TO WS-VALID
               MOVE SPACES TO WS-ERROR-CODE
               MOVE 0      TO WS-FOUND-IDX

               PERFORM CHECK-ACCOUNT-EXISTS
               IF RECORD-VALID
                   PERFORM CHECK-ACCOUNT-ACTIVE
               END-IF
               IF RECORD-VALID
                   PERFORM CHECK-AMOUNT-VALID
               END-IF
               IF RECORD-VALID
                   PERFORM CHECK-SUFFICIENT-FUNDS
               END-IF
               IF RECORD-VALID
                   PERFORM CHECK-TXN-LIMIT
               END-IF
               IF RECORD-VALID AND TR-TRANSFER
                   PERFORM CHECK-TRANSFER-TARGET
               END-IF

               IF RECORD-VALID
                   MOVE "APR" TO TR-STATUS
                   MOVE SPACES TO TR-ERROR-CODE
                   MOVE TRANSACTION-RECORD TO APPROVED-RECORD
                   WRITE APPROVED-RECORD
                   ADD 1 TO WS-APPROVED-COUNT
               ELSE
                   MOVE "REJ" TO TR-STATUS
                   MOVE WS-ERROR-CODE TO TR-ERROR-CODE
                   MOVE TRANSACTION-RECORD TO REJECTED-RECORD
                   WRITE REJECTED-RECORD
                   ADD 1 TO WS-REJECTED-COUNT
               END-IF
               PERFORM READ-NEXT-TXN.

           CHECK-ACCOUNT-EXISTS.
               MOVE "N" TO WS-VALID
               PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
                   UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
                   IF WA-ID(WS-ACCT-IDX) = TR-ACCOUNT-ID
                       MOVE "Y" TO WS-VALID
                       MOVE WS-ACCT-IDX TO WS-FOUND-IDX
                   END-IF
               END-PERFORM
               IF RECORD-INVALID
                   MOVE "E01" TO WS-ERROR-CODE
               END-IF.

           CHECK-ACCOUNT-ACTIVE.
               IF WA-STATUS(WS-FOUND-IDX) NOT = "A"
                   MOVE "N"   TO WS-VALID
                   MOVE "E02" TO WS-ERROR-CODE
               END-IF.

           CHECK-AMOUNT-VALID.
               IF TR-AMOUNT <= 0
                   MOVE "N"   TO WS-VALID
                   MOVE "E03" TO WS-ERROR-CODE
               END-IF.

           CHECK-SUFFICIENT-FUNDS.
               IF TR-WITHDRAWAL OR TR-TRANSFER OR TR-FEE
                   IF TR-AMOUNT >
                       WA-BALANCE(WS-FOUND-IDX)
                       + WA-OD-LIMIT(WS-FOUND-IDX)
                       MOVE "N"   TO WS-VALID
                       MOVE "E04" TO WS-ERROR-CODE
                   END-IF
               END-IF.

           CHECK-TXN-LIMIT.
               IF TR-AMOUNT > WS-TXN-LIMIT
                   MOVE "N"   TO WS-VALID
                   MOVE "E05" TO WS-ERROR-CODE
               END-IF.

           CHECK-TRANSFER-TARGET.
               MOVE "N" TO WS-TARGET-FOUND
               PERFORM VARYING WS-ACCT-IDX FROM 1 BY 1
                   UNTIL WS-ACCT-IDX > WS-ACCT-COUNT
                   IF WA-ID(WS-ACCT-IDX) = TR-TARGET-ACCOUNT
                       MOVE "Y" TO WS-TARGET-FOUND
                   END-IF
               END-PERFORM
               IF WS-TARGET-FOUND = "N"
                   MOVE "N"   TO WS-VALID
                   MOVE "E06" TO WS-ERROR-CODE
               END-IF.

           DISPLAY-RESULTS.
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Transaction Validator"
               DISPLAY "=============================================="
               DISPLAY "  Total Read    : " WS-TOTAL-READ
               DISPLAY "  Approved      : " WS-APPROVED-COUNT
               DISPLAY "  Rejected      : " WS-REJECTED-COUNT
               DISPLAY "----------------------------------------------"
               DISPLAY "  → data/output/APPROVED-TRANSACTIONS.dat"
               DISPLAY "  → data/output/REJECTED-TRANSACTIONS.dat"
               DISPLAY "==============================================".
