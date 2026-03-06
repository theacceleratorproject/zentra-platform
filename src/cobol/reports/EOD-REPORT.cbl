      *================================================================
      * PROGRAM:    EOD-REPORT.cbl
      * DESCRIPTION: End-of-day report with sections, control breaks,
      *              totals and reconciliation summary.
      *              Introduces: WRITE AFTER ADVANCING, control breaks,
      *              page formatting, report sections
      * PHASE:      2 - Banking Logic Engine
      * LOCATION:   src/cobol/reports/
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. EOD-REPORT.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT LEDGER-FILE
                   ASSIGN TO "data/output/TXN-LEDGER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-LEDGER-STATUS.

               SELECT UPDATED-ACCTS
                   ASSIGN TO "data/output/ACCOUNTS-UPDATED.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-ACCT-STATUS.

               SELECT EOD-REPORT-FILE
                   ASSIGN TO "data/output/EOD-REPORT.dat"
                   ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
           FILE SECTION.
           FD LEDGER-FILE.
           01 LEDGER-RECORD         PIC X(120).

           FD UPDATED-ACCTS.
           01 ACCT-RECORD           PIC X(100).

           FD EOD-REPORT-FILE.
           01 EOD-LINE              PIC X(80).

       WORKING-STORAGE SECTION.
           01 WS-LEDGER-STATUS      PIC X(2).
           01 WS-ACCT-STATUS        PIC X(2).
           01 WS-EOF-LEDGER         PIC X VALUE "N".
               88 END-OF-LEDGER        VALUE "Y".
           01 WS-EOF-ACCT           PIC X VALUE "N".
               88 END-OF-ACCOUNTS      VALUE "Y".

      *    --- Date ---
           01 WS-DATE-INT           PIC 9(8).
           01 WS-TODAY              PIC X(10).

      *    --- Report counters ---
           01 WS-LINE-COUNT         PIC 999 VALUE 0.
           01 WS-PAGE-NUM           PIC 99 VALUE 1.
           01 WS-LINES-PER-PAGE     PIC 999 VALUE 50.

      *    --- Ledger totals ---
           01 WS-TXN-COUNT          PIC 9(5) VALUE 0.
           01 WS-TOTAL-CREDITS      PIC 9(11)V99 VALUE 0.
           01 WS-TOTAL-DEBITS       PIC 9(11)V99 VALUE 0.

      *    --- Account totals ---
           01 WS-ACCT-COUNT         PIC 99 VALUE 0.
           01 WS-TOTAL-BALANCE      PIC S9(11)V99 VALUE 0.
           01 WS-POSITIVE-BAL-COUNT PIC 99 VALUE 0.
           01 WS-NEGATIVE-BAL-COUNT PIC 99 VALUE 0.

      *    --- Work fields ---
           01 WS-ACCT-ID            PIC X(10).
           01 WS-ACCT-NAME          PIC X(25).
           01 WS-ACCT-TYPE          PIC X(10).
           01 WS-ACCT-BALANCE       PIC S9(9)V99.

           01 WS-DISP-BALANCE       PIC $$$,$$$,$$9.99.
           01 WS-DISP-LARGE         PIC $$,$$$,$$$,$$9.99.
           01 WS-DISP-CREDITS       PIC $$,$$$,$$$,$$9.99.
           01 WS-DISP-DEBITS        PIC $$,$$$,$$$,$$9.99.
           01 WS-OUT-LINE           PIC X(80).

       PROCEDURE DIVISION.
           MAIN-PARA.
               ACCEPT WS-DATE-INT FROM DATE YYYYMMDD
               MOVE WS-DATE-INT(1:4) TO WS-TODAY(1:4)
               MOVE "-"              TO WS-TODAY(5:1)
               MOVE WS-DATE-INT(5:2) TO WS-TODAY(6:2)
               MOVE "-"              TO WS-TODAY(8:1)
               MOVE WS-DATE-INT(7:2) TO WS-TODAY(9:2)

               OPEN INPUT  LEDGER-FILE
               OPEN INPUT  UPDATED-ACCTS
               OPEN OUTPUT EOD-REPORT-FILE

               PERFORM WRITE-COVER-PAGE
               PERFORM WRITE-TXN-SECTION-HEADER
               PERFORM READ-LEDGER-LOOP
                   UNTIL END-OF-LEDGER
               PERFORM WRITE-TXN-TOTALS

               PERFORM WRITE-ACCOUNT-SECTION-HEADER
               PERFORM READ-ACCOUNTS-LOOP
                   UNTIL END-OF-ACCOUNTS
               PERFORM WRITE-ACCOUNT-TOTALS

               PERFORM WRITE-RECONCILIATION

               CLOSE LEDGER-FILE
               CLOSE UPDATED-ACCTS
               CLOSE EOD-REPORT-FILE
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           WRITE-COVER-PAGE.
               PERFORM WRITE-DASHES
               MOVE "ZENTRA BANK" TO WS-OUT-LINE
               PERFORM WRITE-CENTERED
               MOVE "END-OF-DAY REPORT" TO WS-OUT-LINE
               PERFORM WRITE-CENTERED
               MOVE WS-TODAY TO WS-OUT-LINE
               PERFORM WRITE-CENTERED
               PERFORM WRITE-DASHES
               PERFORM BLANK-LINE.

           WRITE-TXN-SECTION-HEADER.
               PERFORM WRITE-DASHES
               MOVE "SECTION 1: TRANSACTION LEDGER SUMMARY"
                   TO WS-OUT-LINE
               PERFORM WRITE-LINE
               PERFORM WRITE-DASHES
               STRING
                   "DATE       ACCOUNT    "
                   DELIMITED SIZE
                   "TYPE AMOUNT         "
                   DELIMITED SIZE
                   "DESCRIPTION"
                   DELIMITED SIZE
                   INTO WS-OUT-LINE
               PERFORM WRITE-LINE
               MOVE ALL "-" TO WS-OUT-LINE
               PERFORM WRITE-LINE.

           READ-LEDGER-LOOP.
               READ LEDGER-FILE INTO LEDGER-RECORD
               AT END
                   MOVE "Y" TO WS-EOF-LEDGER
               NOT AT END
                   IF LEDGER-RECORD NOT = SPACES
                       ADD 1 TO WS-TXN-COUNT
                       MOVE LEDGER-RECORD(1:78) TO EOD-LINE
                       WRITE EOD-LINE
                   END-IF
               END-READ.

           WRITE-TXN-TOTALS.
               PERFORM BLANK-LINE
               STRING "  Total Transactions : " DELIMITED SIZE
                   WS-TXN-COUNT DELIMITED SIZE
                   INTO EOD-LINE
               WRITE EOD-LINE
               PERFORM BLANK-LINE.

           WRITE-ACCOUNT-SECTION-HEADER.
               PERFORM WRITE-DASHES
               MOVE "SECTION 2: UPDATED ACCOUNT BALANCES"
                   TO WS-OUT-LINE
               PERFORM WRITE-LINE
               PERFORM WRITE-DASHES
               STRING
                   "ACCOUNT    NAME"
                   DELIMITED SIZE
                   "                      TYPE"
                   DELIMITED SIZE
                   "       BALANCE"
                   DELIMITED SIZE
                   INTO WS-OUT-LINE
               PERFORM WRITE-LINE
               MOVE ALL "-" TO WS-OUT-LINE
               PERFORM WRITE-LINE.

           READ-ACCOUNTS-LOOP.
               READ UPDATED-ACCTS INTO ACCT-RECORD
               AT END
                   MOVE "Y" TO WS-EOF-ACCT
               NOT AT END
                   ADD 1 TO WS-ACCT-COUNT
                   MOVE ACCT-RECORD(1:10)  TO WS-ACCT-ID
                   MOVE ACCT-RECORD(11:25) TO WS-ACCT-NAME
                   MOVE ACCT-RECORD(36:10) TO WS-ACCT-TYPE
                   MOVE ACCT-RECORD(46:12) TO WS-ACCT-BALANCE
                   ADD WS-ACCT-BALANCE TO WS-TOTAL-BALANCE
                   IF WS-ACCT-BALANCE >= 0
                       ADD 1 TO WS-POSITIVE-BAL-COUNT
                   ELSE
                       ADD 1 TO WS-NEGATIVE-BAL-COUNT
                   END-IF
                   MOVE WS-ACCT-BALANCE TO WS-DISP-BALANCE
                   STRING
                       WS-ACCT-ID    DELIMITED SIZE " "
                       DELIMITED SIZE WS-ACCT-NAME DELIMITED SIZE
                       " " DELIMITED SIZE WS-ACCT-TYPE DELIMITED SIZE
                       " " DELIMITED SIZE WS-DISP-BALANCE
                       DELIMITED SIZE INTO EOD-LINE
                   WRITE EOD-LINE
               END-READ.

           WRITE-ACCOUNT-TOTALS.
               PERFORM BLANK-LINE
               MOVE WS-TOTAL-BALANCE TO WS-DISP-LARGE
               STRING "  Accounts on File   : " DELIMITED SIZE
                   WS-ACCT-COUNT DELIMITED SIZE INTO EOD-LINE
               WRITE EOD-LINE
               STRING "  Positive Balance   : " DELIMITED SIZE
                   WS-POSITIVE-BAL-COUNT DELIMITED SIZE INTO EOD-LINE
               WRITE EOD-LINE
               STRING "  Negative Balance   : " DELIMITED SIZE
                   WS-NEGATIVE-BAL-COUNT DELIMITED SIZE INTO EOD-LINE
               WRITE EOD-LINE
               STRING "  Net System Balance : " DELIMITED SIZE
                   WS-DISP-LARGE DELIMITED SIZE INTO EOD-LINE
               WRITE EOD-LINE.

           WRITE-RECONCILIATION.
               PERFORM BLANK-LINE
               PERFORM WRITE-DASHES
               MOVE "SECTION 3: RECONCILIATION STATUS"
                   TO WS-OUT-LINE
               PERFORM WRITE-LINE
               PERFORM WRITE-DASHES
               IF WS-NEGATIVE-BAL-COUNT = 0
                   MOVE "STATUS: ALL ACCOUNTS IN BALANCE - OK"
                       TO EOD-LINE
               ELSE
                   MOVE "STATUS: ACTION REQUIRED - OVERDRAFT ACCOUNTS"
                       TO EOD-LINE
               END-IF
               WRITE EOD-LINE
               PERFORM BLANK-LINE
               PERFORM WRITE-DASHES
               MOVE "END OF REPORT - ZENTRA CORE SYSTEM v2.0"
                   TO WS-OUT-LINE
               PERFORM WRITE-LINE
               PERFORM WRITE-DASHES.

           WRITE-DASHES.
               MOVE ALL "=" TO EOD-LINE
               WRITE EOD-LINE.

           BLANK-LINE.
               MOVE SPACES TO EOD-LINE
               WRITE EOD-LINE.

           WRITE-LINE.
               MOVE WS-OUT-LINE TO EOD-LINE
               WRITE EOD-LINE.

           WRITE-CENTERED.
               MOVE SPACES TO EOD-LINE
               MOVE "                    " TO EOD-LINE(1:20)
               MOVE WS-OUT-LINE TO EOD-LINE(21:40)
               WRITE EOD-LINE.

           DISPLAY-RESULTS.
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - EOD Report Generator"
               DISPLAY "=============================================="
               DISPLAY "  Transactions Logged  : " WS-TXN-COUNT
               DISPLAY "  Accounts Reported    : " WS-ACCT-COUNT
               DISPLAY "  Overdraft Accounts   : " WS-NEGATIVE-BAL-COUNT
               DISPLAY "----------------------------------------------"
               DISPLAY "  → data/output/EOD-REPORT.dat"
               DISPLAY "==============================================".
