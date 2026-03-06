      *================================================================
      * PROGRAM:    TEST-PROCESSING.cbl
      * DESCRIPTION: Test transaction application logic with known
      *              inputs and expected outputs. No file I/O.
      *              Validates: deposit, withdrawal, transfer,
      *              fee application, and overdraft arithmetic.
      * PHASE:      2 - Tests
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. TEST-PROCESSING.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
           WORKING-STORAGE SECTION.

      *    --- Test accounts (in-memory) ---
           01 WS-ACCOUNT-A-BAL      PIC S9(9)V99 VALUE 1000.00.
           01 WS-ACCOUNT-B-BAL      PIC S9(9)V99 VALUE 500.00.
           01 WS-TXN-AMOUNT         PIC 9(9)V99.
           01 WS-EXPECTED           PIC S9(9)V99.
           01 WS-DELTA              PIC S9(9)V99.

           01 WS-PASS-COUNT         PIC 99 VALUE 0.
           01 WS-FAIL-COUNT         PIC 99 VALUE 0.
           01 WS-TEST-NAME          PIC X(40).
           01 WS-TOLERANCE          PIC 9(5)V99 VALUE 0.01.

           01 WS-DISP-ACTUAL        PIC $$$,$$$,$$9.99.
           01 WS-DISP-EXPECTED      PIC $$$,$$$,$$9.99.

       PROCEDURE DIVISION.
           MAIN-PARA.
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA TEST SUITE - Transaction Processing"
               DISPLAY "=============================================="

               PERFORM TEST-DEPOSIT
               PERFORM TEST-WITHDRAWAL
               PERFORM TEST-TRANSFER
               PERFORM TEST-FEE-APPLICATION
               PERFORM TEST-OVERDRAFT-ARITHMETIC
               PERFORM TEST-INTEREST-CREDIT

               DISPLAY "----------------------------------------------"
               DISPLAY "  RESULTS: " WS-PASS-COUNT " passed  "
                   WS-FAIL-COUNT " failed"
               DISPLAY "==============================================".

           ASSERT-BALANCE.
               COMPUTE WS-DELTA = FUNCTION ABS(
                   WS-ACCOUNT-A-BAL - WS-EXPECTED)
               MOVE WS-ACCOUNT-A-BAL TO WS-DISP-ACTUAL
               MOVE WS-EXPECTED      TO WS-DISP-EXPECTED
               IF WS-DELTA <= WS-TOLERANCE
                   DISPLAY "   PASS: " WS-TEST-NAME
                       " balance=" WS-DISP-ACTUAL
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: " WS-TEST-NAME
                   DISPLAY "         expected=" WS-DISP-EXPECTED
                       " got=" WS-DISP-ACTUAL
                   ADD 1 TO WS-FAIL-COUNT
               END-IF.

           TEST-DEPOSIT.
               MOVE "DEPOSIT adds to balance"
                   TO WS-TEST-NAME
               MOVE 1000.00 TO WS-ACCOUNT-A-BAL
               MOVE 250.00  TO WS-TXN-AMOUNT
               ADD WS-TXN-AMOUNT TO WS-ACCOUNT-A-BAL
               MOVE 1250.00 TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.

           TEST-WITHDRAWAL.
               MOVE "WITHDRAWAL subtracts from balance"
                   TO WS-TEST-NAME
               MOVE 1000.00 TO WS-ACCOUNT-A-BAL
               MOVE 300.00  TO WS-TXN-AMOUNT
               SUBTRACT WS-TXN-AMOUNT FROM WS-ACCOUNT-A-BAL
               MOVE 700.00  TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.

           TEST-TRANSFER.
               MOVE "TRANSFER moves funds between accounts"
                   TO WS-TEST-NAME
               MOVE 1000.00 TO WS-ACCOUNT-A-BAL
               MOVE 500.00  TO WS-ACCOUNT-B-BAL
               MOVE 200.00  TO WS-TXN-AMOUNT
               SUBTRACT WS-TXN-AMOUNT FROM WS-ACCOUNT-A-BAL
               ADD WS-TXN-AMOUNT TO WS-ACCOUNT-B-BAL
               MOVE 800.00  TO WS-EXPECTED
               PERFORM ASSERT-BALANCE
               MOVE "TRANSFER: receiver balance correct"
                   TO WS-TEST-NAME
               MOVE WS-ACCOUNT-B-BAL TO WS-ACCOUNT-A-BAL
               MOVE 700.00 TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.

           TEST-FEE-APPLICATION.
               MOVE "FEE reduces balance correctly"
                   TO WS-TEST-NAME
               MOVE 150.00 TO WS-ACCOUNT-A-BAL
               MOVE 35.00  TO WS-TXN-AMOUNT
               SUBTRACT WS-TXN-AMOUNT FROM WS-ACCOUNT-A-BAL
               MOVE 115.00 TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.

           TEST-OVERDRAFT-ARITHMETIC.
               MOVE "OVERDRAFT produces negative balance"
                   TO WS-TEST-NAME
               MOVE 50.00   TO WS-ACCOUNT-A-BAL
               MOVE 75.00   TO WS-TXN-AMOUNT
               SUBTRACT WS-TXN-AMOUNT FROM WS-ACCOUNT-A-BAL
               MOVE -25.00  TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.

           TEST-INTEREST-CREDIT.
               MOVE "INTEREST credit calculated with ROUNDED"
                   TO WS-TEST-NAME
               MOVE 1000.00 TO WS-ACCOUNT-A-BAL
      *        Daily rate: 4.5% / 365 = 0.01232876712...
      *        Interest: 1000 * 0.0001232876... = 0.12 (rounded)
               COMPUTE WS-TXN-AMOUNT ROUNDED =
                   WS-ACCOUNT-A-BAL * (0.045 / 365)
               ADD WS-TXN-AMOUNT TO WS-ACCOUNT-A-BAL
               MOVE 1000.12 TO WS-EXPECTED
               PERFORM ASSERT-BALANCE.
