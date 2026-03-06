      *================================================================
      * PROGRAM:    TEST-VALIDATION.cbl
      * DESCRIPTION: Test all 6 validation rules with hardcoded
      *              in-memory data. No file dependencies.
      *              Each test asserts a specific error code or pass.
      * PHASE:      2 - Tests
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. TEST-VALIDATION.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
           WORKING-STORAGE SECTION.

      *    --- Mini account table (3 test accounts) ---
           01 WS-ACCT-TABLE.
               05 WS-ACCT OCCURS 3 TIMES INDEXED BY WS-IDX.
                   10 WA-ID            PIC X(10).
                   10 WA-BALANCE       PIC S9(9)V99.
                   10 WA-OD-LIMIT      PIC 9(7)V99.
                   10 WA-STATUS        PIC X(1).
           01 WS-ACCT-COUNT         PIC 9 VALUE 3.

      *    --- Test transaction fields ---
           01 WS-TEST-ACCOUNT       PIC X(10).
           01 WS-TEST-TYPE          PIC X(03).
           01 WS-TEST-AMOUNT        PIC 9(9)V99.
           01 WS-TEST-TARGET        PIC X(10).
           01 WS-TXN-LIMIT          PIC 9(9)V99 VALUE 100000.00.

      *    --- Validation result ---
           01 WS-VALID              PIC X VALUE "Y".
               88 RECORD-VALID         VALUE "Y".
               88 RECORD-INVALID       VALUE "N".
           01 WS-ERROR-CODE         PIC X(03) VALUE SPACES.
           01 WS-FOUND-IDX          PIC 9 VALUE 0.

      *    --- Test counts ---
           01 WS-PASS-COUNT         PIC 99 VALUE 0.
           01 WS-FAIL-COUNT         PIC 99 VALUE 0.
           01 WS-TEST-NAME          PIC X(40).

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM SETUP-TEST-DATA
               DISPLAY "=============================================="
               DISPLAY "  ZENTRA TEST SUITE - Validation Rules"
               DISPLAY "=============================================="

               PERFORM TEST-E01-ACCOUNT-NOT-FOUND
               PERFORM TEST-E02-ACCOUNT-INACTIVE
               PERFORM TEST-E03-INVALID-AMOUNT
               PERFORM TEST-E04-INSUFFICIENT-FUNDS
               PERFORM TEST-E05-EXCEEDS-LIMIT
               PERFORM TEST-VALID-TRANSACTION

               DISPLAY "----------------------------------------------"
               DISPLAY "  RESULTS: " WS-PASS-COUNT " passed  "
                   WS-FAIL-COUNT " failed"
               DISPLAY "==============================================".

           SETUP-TEST-DATA.
               MOVE "ZNT-000001" TO WA-ID(1)
               MOVE 1500.00      TO WA-BALANCE(1)
               MOVE 500.00       TO WA-OD-LIMIT(1)
               MOVE "A"          TO WA-STATUS(1)

               MOVE "ZNT-000002" TO WA-ID(2)
               MOVE 250.00       TO WA-BALANCE(2)
               MOVE 0.00         TO WA-OD-LIMIT(2)
               MOVE "F"          TO WA-STATUS(2)

               MOVE "ZNT-000003" TO WA-ID(3)
               MOVE 50.00        TO WA-BALANCE(3)
               MOVE 0.00         TO WA-OD-LIMIT(3)
               MOVE "A"          TO WA-STATUS(3).

           RESET-VALIDATION.
               MOVE "Y"    TO WS-VALID
               MOVE SPACES TO WS-ERROR-CODE
               MOVE 0      TO WS-FOUND-IDX.

           RUN-FIND-ACCOUNT.
               MOVE "N" TO WS-VALID
               PERFORM VARYING WS-IDX FROM 1 BY 1
                   UNTIL WS-IDX > WS-ACCT-COUNT
                   IF WA-ID(WS-IDX) = WS-TEST-ACCOUNT
                       MOVE "Y" TO WS-VALID
                       MOVE WS-IDX TO WS-FOUND-IDX
                   END-IF
               END-PERFORM
               IF RECORD-INVALID
                   MOVE "E01" TO WS-ERROR-CODE
               END-IF.

           ASSERT-ERROR.
               IF WS-ERROR-CODE = WS-TEST-NAME(1:3)
                   DISPLAY "   PASS: " WS-TEST-NAME
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: " WS-TEST-NAME
                       " got=" WS-ERROR-CODE
                   ADD 1 TO WS-FAIL-COUNT
               END-IF.

           ASSERT-VALID.
               IF RECORD-VALID
                   DISPLAY "   PASS: " WS-TEST-NAME
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "   FAIL: " WS-TEST-NAME
                       " unexpectedly invalid, err=" WS-ERROR-CODE
                   ADD 1 TO WS-FAIL-COUNT
               END-IF.

           TEST-E01-ACCOUNT-NOT-FOUND.
               MOVE "E01 - Unknown account rejected"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-BOGUS0" TO WS-TEST-ACCOUNT
               MOVE "WDR"        TO WS-TEST-TYPE
               MOVE 100.00       TO WS-TEST-AMOUNT
               PERFORM RUN-FIND-ACCOUNT
               PERFORM ASSERT-ERROR.

           TEST-E02-ACCOUNT-INACTIVE.
               MOVE "E02 - Frozen account rejected"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-000002" TO WS-TEST-ACCOUNT
               PERFORM RUN-FIND-ACCOUNT
               IF RECORD-VALID AND WS-FOUND-IDX > 0
                   IF WA-STATUS(WS-FOUND-IDX) NOT = "A"
                       MOVE "N"   TO WS-VALID
                       MOVE "E02" TO WS-ERROR-CODE
                   END-IF
               END-IF
               PERFORM ASSERT-ERROR.

           TEST-E03-INVALID-AMOUNT.
               MOVE "E03 - Zero amount rejected"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-000001" TO WS-TEST-ACCOUNT
               MOVE 0.00         TO WS-TEST-AMOUNT
               PERFORM RUN-FIND-ACCOUNT
               IF RECORD-VALID
                   IF WS-TEST-AMOUNT <= 0
                       MOVE "N"   TO WS-VALID
                       MOVE "E03" TO WS-ERROR-CODE
                   END-IF
               END-IF
               PERFORM ASSERT-ERROR.

           TEST-E04-INSUFFICIENT-FUNDS.
               MOVE "E04 - Overdraft beyond limit rejected"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-000003" TO WS-TEST-ACCOUNT
               MOVE 500.00       TO WS-TEST-AMOUNT
               PERFORM RUN-FIND-ACCOUNT
               IF RECORD-VALID AND WS-FOUND-IDX > 0
                   IF WS-TEST-AMOUNT >
                       WA-BALANCE(WS-FOUND-IDX) +
                       WA-OD-LIMIT(WS-FOUND-IDX)
                       MOVE "N"   TO WS-VALID
                       MOVE "E04" TO WS-ERROR-CODE
                   END-IF
               END-IF
               PERFORM ASSERT-ERROR.

           TEST-E05-EXCEEDS-LIMIT.
               MOVE "E05 - Over $100k limit rejected"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-000001" TO WS-TEST-ACCOUNT
               MOVE 150000.00    TO WS-TEST-AMOUNT
               PERFORM RUN-FIND-ACCOUNT
               IF RECORD-VALID
                   IF WS-TEST-AMOUNT > WS-TXN-LIMIT
                       MOVE "N"   TO WS-VALID
                       MOVE "E05" TO WS-ERROR-CODE
                   END-IF
               END-IF
               PERFORM ASSERT-ERROR.

           TEST-VALID-TRANSACTION.
               MOVE "VALID - Good transaction passes all rules"
                   TO WS-TEST-NAME
               PERFORM RESET-VALIDATION
               MOVE "ZNT-000001" TO WS-TEST-ACCOUNT
               MOVE "DEP"        TO WS-TEST-TYPE
               MOVE 500.00       TO WS-TEST-AMOUNT
               PERFORM RUN-FIND-ACCOUNT
               IF RECORD-VALID AND WS-FOUND-IDX > 0
                   IF WA-STATUS(WS-FOUND-IDX) NOT = "A"
                       MOVE "N"   TO WS-VALID
                       MOVE "E02" TO WS-ERROR-CODE
                   END-IF
               END-IF
               IF RECORD-VALID
                   IF WS-TEST-AMOUNT <= 0
                       MOVE "N"   TO WS-VALID
                       MOVE "E03" TO WS-ERROR-CODE
                   END-IF
               END-IF
               IF RECORD-VALID
                   IF WS-TEST-AMOUNT > WS-TXN-LIMIT
                       MOVE "N"   TO WS-VALID
                       MOVE "E05" TO WS-ERROR-CODE
                   END-IF
               END-IF
               PERFORM ASSERT-VALID.
