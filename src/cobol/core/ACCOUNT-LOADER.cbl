      *================================================================
      * PROGRAM:    ACCOUNT-LOADER.cbl
      * DESCRIPTION: Read and display all accounts from master file.
      *              Introduces: COPY, READ/AT END, FILE STATUS,
      *              PERFORM UNTIL EOF
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. ACCOUNT-LOADER.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           INPUT-OUTPUT SECTION.
           FILE-CONTROL.
               SELECT ACCOUNTS-FILE
                   ASSIGN TO "data/input/ACCOUNTS-MASTER.dat"
                   ORGANIZATION IS LINE SEQUENTIAL
                   FILE STATUS IS WS-FILE-STATUS.

       DATA DIVISION.
           FILE SECTION.
           FD ACCOUNTS-FILE.
           COPY "ACCOUNT-RECORD.cpy".

       WORKING-STORAGE SECTION.
           01 WS-FILE-STATUS       PIC X(2).
               88 WS-FILE-OK           VALUE "00".
               88 WS-FILE-EOF          VALUE "10".
               88 WS-FILE-NOT-FOUND    VALUE "35".

           01 WS-EOF               PIC X VALUE "N".
               88 END-OF-ACCOUNTS      VALUE "Y".

           01 WS-ACCOUNT-COUNT     PIC 999 VALUE 0.
           01 WS-ACTIVE-COUNT      PIC 999 VALUE 0.
           01 WS-FROZEN-COUNT      PIC 999 VALUE 0.
           01 WS-TOTAL-BALANCE     PIC S9(11)V99 VALUE 0.

           01 WS-DISP-BALANCE      PIC $$$,$$$,$$9.99.
           01 WS-DISP-TOTAL        PIC $$,$$$,$$$,$$9.99.
           01 WS-STATUS-TEXT       PIC X(08).

       PROCEDURE DIVISION.
           MAIN-PARA.
               OPEN INPUT ACCOUNTS-FILE
               IF NOT WS-FILE-OK
                   DISPLAY "ERROR: Cannot open ACCOUNTS-MASTER.dat"
                   DISPLAY "FILE STATUS: " WS-FILE-STATUS
                   STOP RUN
               END-IF
               PERFORM DISPLAY-HEADER
               PERFORM READ-ACCOUNTS
                   UNTIL END-OF-ACCOUNTS
               CLOSE ACCOUNTS-FILE
               PERFORM DISPLAY-SUMMARY
               STOP RUN.

           DISPLAY-HEADER.
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Account Master File Loader"
               DISPLAY "=============================================="
               DISPLAY "  ID         NAME                     "
                   "TYPE       BALANCE        ST"
               DISPLAY "  ---------- ------------------------ "
                   "---------- -------------- --".

           READ-ACCOUNTS.
               READ ACCOUNTS-FILE
               AT END
                   MOVE "Y" TO WS-EOF
               NOT AT END
                   PERFORM PROCESS-ACCOUNT
               END-READ.

           PROCESS-ACCOUNT.
               ADD 1 TO WS-ACCOUNT-COUNT
               ADD AR-BALANCE TO WS-TOTAL-BALANCE

               EVALUATE TRUE
                   WHEN AR-ACTIVE
                       ADD 1 TO WS-ACTIVE-COUNT
                       MOVE "ACTIVE  " TO WS-STATUS-TEXT
                   WHEN AR-FROZEN
                       ADD 1 TO WS-FROZEN-COUNT
                       MOVE "FROZEN  " TO WS-STATUS-TEXT
                   WHEN AR-CLOSED
                       MOVE "CLOSED  " TO WS-STATUS-TEXT
                   WHEN OTHER
                       MOVE "UNKNOWN " TO WS-STATUS-TEXT
               END-EVALUATE

               MOVE AR-BALANCE TO WS-DISP-BALANCE

               DISPLAY "  " AR-ACCOUNT-ID
                   " " AR-ACCOUNT-NAME(1:24)
                   " " AR-ACCOUNT-TYPE
                   " " WS-DISP-BALANCE
                   " " WS-STATUS-TEXT.

           DISPLAY-SUMMARY.
               MOVE WS-TOTAL-BALANCE TO WS-DISP-TOTAL
               DISPLAY "=============================================="
               DISPLAY "  SUMMARY"
               DISPLAY "  Total Accounts : " WS-ACCOUNT-COUNT
               DISPLAY "  Active         : " WS-ACTIVE-COUNT
               DISPLAY "  Frozen         : " WS-FROZEN-COUNT
               DISPLAY "  Total Balance  : " WS-DISP-TOTAL
               DISPLAY "==============================================".
