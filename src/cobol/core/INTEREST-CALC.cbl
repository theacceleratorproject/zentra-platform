      *================================================================
      * PROGRAM:    INTEREST-CALC.cbl
      * DESCRIPTION: Calculate daily interest for all active accounts
      *              using rate table by account type.
      *              Generates INT transactions for interest credits.
      *              Introduces: Two coordinated input files,
      *              ROUNDED clause, FUNCTION intrinsics
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. INTEREST-CALC.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ACCOUNTS-FILE
                   ASSIGN TO "data/input/ACCOUNTS-MASTER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

               SELECT RATES-FILE
                   ASSIGN TO "data/input/INTEREST-RATES.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

               SELECT INTEREST-OUTPUT
                   ASSIGN TO "data/output/INTEREST-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.
           FD ACCOUNTS-FILE.
           01 ACCT-FILE-RECORD      PIC X(100).

           FD RATES-FILE.
           01 RATES-FILE-RECORD     PIC X(20).

           FD INTEREST-OUTPUT.
           01 INT-OUTPUT-RECORD     PIC X(100).

       WORKING-STORAGE SECTION.
      *    --- Rate table (up to 10 account types) ---
           01 WS-RATE-TABLE.
               05 WS-RATE-ENTRY OCCURS 10 TIMES INDEXED BY WS-RIDX.
                   10 WR-ACCT-TYPE     PIC X(10).
                   10 WR-ANNUAL-RATE   PIC 9(3)V9(6).
           01 WS-RATE-COUNT         PIC 99 VALUE 0.

      *    --- Daily interest calculation ---
           01 WS-DAYS-IN-YEAR       PIC 999 VALUE 365.
           01 WS-DAILY-RATE         PIC 9(3)V9(10).
           01 WS-DAILY-INTEREST     PIC 9(9)V99.
           01 WS-MATCHED-RATE       PIC 9(3)V9(6) VALUE 0.

      *    --- Account work fields ---
           01 WS-ACCT-ID            PIC X(10).
           01 WS-ACCT-TYPE          PIC X(10).
           01 WS-ACCT-BALANCE       PIC S9(9)V99.
           01 WS-ACCT-STATUS        PIC X(1).

      *    --- Date ---
           01 WS-DATE-INT           PIC 9(8).
           01 WS-TODAY              PIC X(10).

      *    --- Output transaction ---
           COPY "TRANSACTION-RECORD.cpy".

      *    --- Counters ---
           01 WS-INT-COUNT          PIC 999 VALUE 0.
           01 WS-TOTAL-INTEREST     PIC 9(9)V99 VALUE 0.
           01 WS-EOF-ACCT           PIC X VALUE "N".
               88 END-OF-ACCOUNTS      VALUE "Y".
           01 WS-EOF-RATES          PIC X VALUE "N".
               88 END-OF-RATES         VALUE "Y".

           01 WS-DISP-INTEREST      PIC $$$,$$$,$$9.99.
           01 WS-DISP-RATE          PIC ZZ9.9999.

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM GET-SYSTEM-DATE
               PERFORM LOAD-RATE-TABLE
               OPEN INPUT  ACCOUNTS-FILE
               OPEN OUTPUT INTEREST-OUTPUT
               PERFORM CALC-INTEREST-LOOP
                   UNTIL END-OF-ACCOUNTS
               CLOSE ACCOUNTS-FILE
               CLOSE INTEREST-OUTPUT
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           GET-SYSTEM-DATE.
               ACCEPT WS-DATE-INT FROM DATE YYYYMMDD
               MOVE WS-DATE-INT(1:4) TO WS-TODAY(1:4)
               MOVE "-"              TO WS-TODAY(5:1)
               MOVE WS-DATE-INT(5:2) TO WS-TODAY(6:2)
               MOVE "-"              TO WS-TODAY(8:1)
               MOVE WS-DATE-INT(7:2) TO WS-TODAY(9:2).

           LOAD-RATE-TABLE.
               OPEN INPUT RATES-FILE
               PERFORM UNTIL END-OF-RATES
                   READ RATES-FILE INTO RATES-FILE-RECORD
                   AT END
                       MOVE "Y" TO WS-EOF-RATES
                   NOT AT END
                       ADD 1 TO WS-RATE-COUNT
                       MOVE RATES-FILE-RECORD(1:10)
                           TO WR-ACCT-TYPE(WS-RATE-COUNT)
                       MOVE RATES-FILE-RECORD(11:9)
                           TO WR-ANNUAL-RATE(WS-RATE-COUNT)
                   END-READ
               END-PERFORM
               CLOSE RATES-FILE.

           CALC-INTEREST-LOOP.
               READ ACCOUNTS-FILE INTO ACCT-FILE-RECORD
               AT END
                   MOVE "Y" TO WS-EOF-ACCT
               NOT AT END
                   MOVE ACCT-FILE-RECORD(1:10)  TO WS-ACCT-ID
                   MOVE ACCT-FILE-RECORD(36:10) TO WS-ACCT-TYPE
                   MOVE ACCT-FILE-RECORD(46:12) TO WS-ACCT-BALANCE
                   MOVE ACCT-FILE-RECORD(67:1)  TO WS-ACCT-STATUS
                   IF WS-ACCT-STATUS = "A"
                   AND WS-ACCT-BALANCE > 0
                   AND WS-ACCT-TYPE NOT = "INTERNAL  "
                       PERFORM FIND-RATE
                       IF WS-MATCHED-RATE > 0
                           PERFORM GENERATE-INTEREST-TXN
                       END-IF
                   END-IF
               END-READ.

           FIND-RATE.
               MOVE 0 TO WS-MATCHED-RATE
               PERFORM VARYING WS-RIDX FROM 1 BY 1
                   UNTIL WS-RIDX > WS-RATE-COUNT
                   IF WR-ACCT-TYPE(WS-RIDX) = WS-ACCT-TYPE
                       MOVE WR-ANNUAL-RATE(WS-RIDX)
                           TO WS-MATCHED-RATE
                   END-IF
               END-PERFORM.

           GENERATE-INTEREST-TXN.
               COMPUTE WS-DAILY-RATE ROUNDED =
                   WS-MATCHED-RATE / WS-DAYS-IN-YEAR
               COMPUTE WS-DAILY-INTEREST ROUNDED =
                   WS-ACCT-BALANCE * WS-DAILY-RATE

               IF WS-DAILY-INTEREST > 0
                   INITIALIZE TRANSACTION-RECORD
                   MOVE WS-TODAY           TO TR-DATE
                   MOVE WS-ACCT-ID         TO TR-ACCOUNT-ID
                   MOVE "INT"              TO TR-TXN-TYPE
                   MOVE WS-DAILY-INTEREST  TO TR-AMOUNT
                   MOVE SPACES             TO TR-TARGET-ACCOUNT
                   MOVE "DAILY INTEREST CREDIT"
                                           TO TR-DESCRIPTION
                   MOVE "APR"              TO TR-STATUS
                   MOVE SPACES             TO TR-ERROR-CODE
                   MOVE TRANSACTION-RECORD TO INT-OUTPUT-RECORD
                   WRITE INT-OUTPUT-RECORD
                   ADD 1 TO WS-INT-COUNT
                   ADD WS-DAILY-INTEREST TO WS-TOTAL-INTEREST
               END-IF.

           DISPLAY-RESULTS.
               MOVE WS-TOTAL-INTEREST TO WS-DISP-INTEREST
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Interest Calculator"
               DISPLAY "=============================================="
               DISPLAY "  Accounts Credited  : " WS-INT-COUNT
               DISPLAY "  Total Interest     : " WS-DISP-INTEREST
               DISPLAY "----------------------------------------------"
               DISPLAY "  → data/output/INTEREST-TRANSACTIONS.dat"
               DISPLAY "==============================================".
