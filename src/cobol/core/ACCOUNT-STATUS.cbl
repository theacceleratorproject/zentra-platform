      *================================================================
      * PROGRAM:    ACCOUNT-STATUS.cbl
      * DESCRIPTION: Check account balance and return status
      *              Demonstrates: conditionals, 88-levels, EVALUATE
      * PHASE:      1 - COBOL Foundations
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. ACCOUNT-STATUS.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
      *    --- Account Data ---
           01 WS-ACCOUNT-ID        PIC X(10) VALUE "ZNT-001042".
           01 WS-ACCOUNT-NAME      PIC X(30) VALUE "MARCK PIERRE".
           01 WS-BALANCE           PIC S9(9)V99 VALUE 2547.83.
           01 WS-ACCOUNT-TYPE      PIC X(10) VALUE "CHECKING".
           01 WS-OVERDRAFT-LIMIT   PIC 9(7)V99 VALUE 500.00.

      *    --- 88-level condition names (COBOL best practice) ---
           01 WS-STATUS-CODE       PIC 9.
               88 ACCOUNT-HEALTHY      VALUE 1.
               88 ACCOUNT-LOW          VALUE 2.
               88 ACCOUNT-OVERDRAFT    VALUE 3.
               88 ACCOUNT-CRITICAL     VALUE 4.

      *    --- Display ---
           01 WS-DISP-BALANCE      PIC $$$,$$$,$$9.99.
           01 WS-STATUS-MSG        PIC X(30).

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM EVALUATE-STATUS
               PERFORM DISPLAY-ACCOUNT
               STOP RUN.

           EVALUATE-STATUS.
               EVALUATE TRUE
                   WHEN WS-BALANCE > 1000
                       MOVE 1 TO WS-STATUS-CODE
                       MOVE "HEALTHY - No action needed"
                           TO WS-STATUS-MSG
                   WHEN WS-BALANCE > 100
                       MOVE 2 TO WS-STATUS-CODE
                       MOVE "LOW BALANCE - Consider deposit"
                           TO WS-STATUS-MSG
                   WHEN WS-BALANCE >= 0
                       MOVE 3 TO WS-STATUS-CODE
                       MOVE "VERY LOW - Deposit required"
                           TO WS-STATUS-MSG
                   WHEN OTHER
                       MOVE 4 TO WS-STATUS-CODE
                       MOVE "** OVERDRAFT - URGENT ACTION **"
                           TO WS-STATUS-MSG
               END-EVALUATE.

           DISPLAY-ACCOUNT.
               MOVE WS-BALANCE TO WS-DISP-BALANCE

               DISPLAY "====================================="
               DISPLAY "  ZENTRA BANK - Account Summary"
               DISPLAY "====================================="
               DISPLAY " Account ID   : " WS-ACCOUNT-ID
               DISPLAY " Account Name : " WS-ACCOUNT-NAME
               DISPLAY " Account Type : " WS-ACCOUNT-TYPE
               DISPLAY "-------------------------------------"
               DISPLAY " Balance      : " WS-DISP-BALANCE
               DISPLAY " Status       : " WS-STATUS-MSG
               DISPLAY "=====================================".
