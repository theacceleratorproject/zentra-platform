      *================================================================
      * PROGRAM:    FEE-ENGINE.cbl
      * DESCRIPTION: Scan accounts and auto-generate fee transactions.
      *              Fee types:
      *                - Monthly maintenance ($12.00 CHECKING/BUSINESS)
      *                - Low-balance fee ($8.00 if balance < $100)
      *                - Overdraft fee ($35.00 per overdraft)
      *              Introduces: ACCEPT FROM DATE, reference
      *              modification, pipeline composability
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. FEE-ENGINE.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ACCOUNTS-FILE
                   ASSIGN TO "data/input/ACCOUNTS-MASTER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

               SELECT FEE-OUTPUT-FILE
                   ASSIGN TO "data/output/FEE-TRANSACTIONS.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.
           FD ACCOUNTS-FILE.
           01 ACCT-FILE-RECORD      PIC X(100).

           FD FEE-OUTPUT-FILE.
           01 FEE-OUTPUT-RECORD     PIC X(100).

       WORKING-STORAGE SECTION.
      *    --- Date from system ---
           01 WS-DATE-INT           PIC 9(8).
           01 WS-TODAY              PIC X(10).

      *    --- Fee policy constants ---
           01 WS-MAINTENANCE-FEE    PIC 9(5)V99 VALUE 12.00.
           01 WS-LOW-BAL-FEE        PIC 9(5)V99 VALUE 8.00.
           01 WS-OVERDRAFT-FEE      PIC 9(5)V99 VALUE 35.00.
           01 WS-LOW-BAL-THRESHOLD  PIC 9(7)V99 VALUE 100.00.

      *    --- Working account fields ---
           01 WS-ACCT-ID            PIC X(10).
           01 WS-ACCT-TYPE          PIC X(10).
           01 WS-ACCT-BALANCE       PIC S9(9)V99.
           01 WS-ACCT-STATUS        PIC X(1).

      *    --- Fee transaction output ---
           COPY "TRANSACTION-RECORD.cpy".

      *    --- Counters ---
           01 WS-MAINTENANCE-COUNT  PIC 99 VALUE 0.
           01 WS-LOW-BAL-COUNT      PIC 99 VALUE 0.
           01 WS-OD-COUNT           PIC 99 VALUE 0.
           01 WS-TOTAL-FEES         PIC 9(9)V99 VALUE 0.

           01 WS-EOF                PIC X VALUE "N".
               88 END-OF-ACCOUNTS      VALUE "Y".

           01 WS-DISP-FEES          PIC $$$,$$$,$$9.99.

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM GET-SYSTEM-DATE
               OPEN INPUT  ACCOUNTS-FILE
               OPEN OUTPUT FEE-OUTPUT-FILE
               PERFORM READ-AND-ASSESS
                   UNTIL END-OF-ACCOUNTS
               CLOSE ACCOUNTS-FILE
               CLOSE FEE-OUTPUT-FILE
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           GET-SYSTEM-DATE.
               ACCEPT WS-DATE-INT FROM DATE YYYYMMDD
               MOVE WS-DATE-INT(1:4) TO WS-TODAY(1:4)
               MOVE "-"              TO WS-TODAY(5:1)
               MOVE WS-DATE-INT(5:2) TO WS-TODAY(6:2)
               MOVE "-"              TO WS-TODAY(8:1)
               MOVE WS-DATE-INT(7:2) TO WS-TODAY(9:2).

           READ-AND-ASSESS.
               READ ACCOUNTS-FILE INTO ACCT-FILE-RECORD
               AT END
                   MOVE "Y" TO WS-EOF
               NOT AT END
                   MOVE ACCT-FILE-RECORD(1:10)  TO WS-ACCT-ID
                   MOVE ACCT-FILE-RECORD(36:10) TO WS-ACCT-TYPE
                   MOVE ACCT-FILE-RECORD(46:12) TO WS-ACCT-BALANCE
                   MOVE ACCT-FILE-RECORD(67:1)  TO WS-ACCT-STATUS
                   IF WS-ACCT-STATUS = "A"
                   AND WS-ACCT-TYPE NOT = "INTERNAL  "
                       PERFORM ASSESS-FEES
                   END-IF
               END-READ.

           ASSESS-FEES.
      *        Maintenance fee for CHECKING and BUSINESS
               IF WS-ACCT-TYPE = "CHECKING  "
               OR WS-ACCT-TYPE = "BUSINESS  "
                   PERFORM GENERATE-MAINTENANCE-FEE
               END-IF
      *        Low balance fee
               IF WS-ACCT-BALANCE < WS-LOW-BAL-THRESHOLD
               AND WS-ACCT-BALANCE >= 0
                   PERFORM GENERATE-LOW-BAL-FEE
               END-IF
      *        Overdraft fee
               IF WS-ACCT-BALANCE < 0
                   PERFORM GENERATE-OD-FEE
               END-IF.

           GENERATE-MAINTENANCE-FEE.
               INITIALIZE TRANSACTION-RECORD
               MOVE WS-TODAY             TO TR-DATE
               MOVE WS-ACCT-ID           TO TR-ACCOUNT-ID
               MOVE "FEE"                TO TR-TXN-TYPE
               MOVE WS-MAINTENANCE-FEE   TO TR-AMOUNT
               MOVE SPACES               TO TR-TARGET-ACCOUNT
               MOVE "MONTHLY MAINTENANCE FEE"
                                         TO TR-DESCRIPTION
               MOVE "PND"                TO TR-STATUS
               MOVE SPACES               TO TR-ERROR-CODE
               MOVE TRANSACTION-RECORD   TO FEE-OUTPUT-RECORD
               WRITE FEE-OUTPUT-RECORD
               ADD 1 TO WS-MAINTENANCE-COUNT
               ADD WS-MAINTENANCE-FEE TO WS-TOTAL-FEES.

           GENERATE-LOW-BAL-FEE.
               INITIALIZE TRANSACTION-RECORD
               MOVE WS-TODAY             TO TR-DATE
               MOVE WS-ACCT-ID           TO TR-ACCOUNT-ID
               MOVE "FEE"                TO TR-TXN-TYPE
               MOVE WS-LOW-BAL-FEE       TO TR-AMOUNT
               MOVE SPACES               TO TR-TARGET-ACCOUNT
               MOVE "LOW BALANCE FEE"    TO TR-DESCRIPTION
               MOVE "PND"                TO TR-STATUS
               MOVE SPACES               TO TR-ERROR-CODE
               MOVE TRANSACTION-RECORD   TO FEE-OUTPUT-RECORD
               WRITE FEE-OUTPUT-RECORD
               ADD 1 TO WS-LOW-BAL-COUNT
               ADD WS-LOW-BAL-FEE TO WS-TOTAL-FEES.

           GENERATE-OD-FEE.
               INITIALIZE TRANSACTION-RECORD
               MOVE WS-TODAY             TO TR-DATE
               MOVE WS-ACCT-ID           TO TR-ACCOUNT-ID
               MOVE "FEE"                TO TR-TXN-TYPE
               MOVE WS-OVERDRAFT-FEE     TO TR-AMOUNT
               MOVE SPACES               TO TR-TARGET-ACCOUNT
               MOVE "OVERDRAFT FEE"      TO TR-DESCRIPTION
               MOVE "PND"                TO TR-STATUS
               MOVE SPACES               TO TR-ERROR-CODE
               MOVE TRANSACTION-RECORD   TO FEE-OUTPUT-RECORD
               WRITE FEE-OUTPUT-RECORD
               ADD 1 TO WS-OD-COUNT
               ADD WS-OVERDRAFT-FEE TO WS-TOTAL-FEES.

           DISPLAY-RESULTS.
               MOVE WS-TOTAL-FEES TO WS-DISP-FEES
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Fee Engine"
               DISPLAY "=============================================="
               DISPLAY "  Maintenance Fees : " WS-MAINTENANCE-COUNT
               DISPLAY "  Low Balance Fees : " WS-LOW-BAL-COUNT
               DISPLAY "  Overdraft Fees   : " WS-OD-COUNT
               DISPLAY "  Total Assessed   : " WS-DISP-FEES
               DISPLAY "----------------------------------------------"
               DISPLAY "  → data/output/FEE-TRANSACTIONS.dat"
               DISPLAY "==============================================".
