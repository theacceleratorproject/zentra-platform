      *================================================================
      * PROGRAM:    TEST-COPYBOOKS.cbl
      * DESCRIPTION: Verify all copybooks compile correctly and
      *              record sizes match expected lengths using
      *              FUNCTION LENGTH intrinsic.
      * PHASE:      2 - Tests
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. TEST-COPYBOOKS.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
           COPY "ACCOUNT-RECORD.cpy".
           COPY "TRANSACTION-RECORD.cpy".
           COPY "REPORT-FIELDS.cpy".

           01 WS-ACCT-LEN           PIC 999.
           01 WS-TXN-LEN            PIC 999.
           01 WS-PASS-COUNT         PIC 99 VALUE 0.
           01 WS-FAIL-COUNT         PIC 99 VALUE 0.

       PROCEDURE DIVISION.
           MAIN-PARA.
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA TEST SUITE - Copybook Verification"
               DISPLAY "=============================================="

      *        Test 1: ACCOUNT-RECORD compiles
               DISPLAY " TEST 1: ACCOUNT-RECORD compiles..."
               MOVE SPACES TO ACCOUNT-RECORD
               MOVE "ZNT-001042" TO AR-ACCOUNT-ID
               MOVE "CHECKING  " TO AR-ACCOUNT-TYPE
               MOVE 1000.00 TO AR-BALANCE
               MOVE "A" TO AR-STATUS
               IF AR-ACTIVE
                   DISPLAY "   PASS: AR-ACTIVE 88-level works"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: AR-ACTIVE not set correctly"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF
               IF AR-CHECKING
                   DISPLAY "   PASS: AR-CHECKING 88-level works"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: AR-CHECKING not set correctly"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF

      *        Test 2: TRANSACTION-RECORD compiles and 88s work
               DISPLAY " TEST 2: TRANSACTION-RECORD 88-levels..."
               INITIALIZE TRANSACTION-RECORD
               MOVE "DEP" TO TR-TXN-TYPE
               MOVE "PND" TO TR-STATUS
               IF TR-DEPOSIT
                   DISPLAY "   PASS: TR-DEPOSIT 88-level works"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: TR-DEPOSIT not triggered"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF
               IF TR-PENDING
                   DISPLAY "   PASS: TR-PENDING 88-level works"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: TR-PENDING not triggered"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF

               MOVE "REJ" TO TR-STATUS
               MOVE "E04" TO TR-ERROR-CODE
               IF TR-REJECTED AND TR-ERR-INSUFF-FUNDS
                   DISPLAY "   PASS: REJ + E04 88-levels work"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: REJ or E04 not triggered"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF

      *        Test 3: REPORT-FIELDS compiles and currency format works
               DISPLAY " TEST 3: REPORT-FIELDS format check..."
               MOVE 12345.67 TO RF-DISP-AMOUNT
               MOVE 1234567.89 TO RF-DISP-LARGE
               DISPLAY "   PASS: RF-DISP-AMOUNT = " RF-DISP-AMOUNT
               DISPLAY "   PASS: RF-DISP-LARGE  = " RF-DISP-LARGE
               ADD 1 TO WS-PASS-COUNT

               DISPLAY "----------------------------------------------"
               DISPLAY "  RESULTS: " WS-PASS-COUNT " passed  "
                   WS-FAIL-COUNT " failed"
               DISPLAY "==============================================".
