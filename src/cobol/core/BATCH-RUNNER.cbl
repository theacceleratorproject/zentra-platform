      *================================================================
      * PROGRAM:    BATCH-RUNNER.cbl
      * DESCRIPTION: Orchestrate the full Zentra daily batch cycle.
      *              Runs all programs in dependency order:
      *                1. FEE-ENGINE    (generate fee transactions)
      *                2. TXN-VALIDATOR (validate all transactions)
      *                3. TXN-PROCESSOR (apply approved transactions)
      *                4. INTEREST-CALC (calculate daily interest)
      *                5. EOD-REPORT    (generate end-of-day report)
      *              Introduces: CALL "SYSTEM", RETURN-CODE checking
      * PHASE:      2 - Banking Logic Engine
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. BATCH-RUNNER.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
           01 WS-DATE-INT           PIC 9(8).
           01 WS-TODAY              PIC X(10).
           01 WS-STEP-NUM           PIC 9 VALUE 0.
           01 WS-STEP-NAME          PIC X(30).
           01 WS-PASS-COUNT         PIC 9 VALUE 0.
           01 WS-FAIL-COUNT         PIC 9 VALUE 0.
           01 WS-RETURN-CODE        PIC 99 VALUE 0.
           01 WS-CMD                PIC X(80).
           01 WS-BATCH-STATUS       PIC X(10).
               88 BATCH-SUCCESS        VALUE "SUCCESS   ".
               88 BATCH-FAILED         VALUE "FAILED    ".

       PROCEDURE DIVISION.
           MAIN-PARA.
               ACCEPT WS-DATE-INT FROM DATE YYYYMMDD
               MOVE WS-DATE-INT(1:4) TO WS-TODAY(1:4)
               MOVE "-"              TO WS-TODAY(5:1)
               MOVE WS-DATE-INT(5:2) TO WS-TODAY(6:2)
               MOVE "-"              TO WS-TODAY(8:1)
               MOVE WS-DATE-INT(7:2) TO WS-TODAY(9:2)

               DISPLAY "=============================================="
               DISPLAY "  ZENTRA BANK - Daily Batch Runner"
               DISPLAY "  Date: " WS-TODAY
               DISPLAY "=============================================="
               DISPLAY " "

               PERFORM RUN-FEE-ENGINE
               PERFORM RUN-TXN-VALIDATOR
               PERFORM RUN-TXN-PROCESSOR
               PERFORM RUN-INTEREST-CALC
               PERFORM RUN-EOD-REPORT

               PERFORM DISPLAY-BATCH-SUMMARY
               STOP RUN.

           RUN-FEE-ENGINE.
               ADD 1 TO WS-STEP-NUM
               MOVE "FEE-ENGINE" TO WS-STEP-NAME
               PERFORM LOG-STEP-START
               CALL "SYSTEM"
                   USING "data/output/FEE-ENGINE 2>/dev/null"
               MOVE RETURN-CODE TO WS-RETURN-CODE
               PERFORM LOG-STEP-RESULT.

           RUN-TXN-VALIDATOR.
               ADD 1 TO WS-STEP-NUM
               MOVE "TXN-VALIDATOR" TO WS-STEP-NAME
               PERFORM LOG-STEP-START
               CALL "SYSTEM"
                   USING "data/output/TXN-VALIDATOR 2>/dev/null"
               MOVE RETURN-CODE TO WS-RETURN-CODE
               PERFORM LOG-STEP-RESULT.

           RUN-TXN-PROCESSOR.
               ADD 1 TO WS-STEP-NUM
               MOVE "TXN-PROCESSOR" TO WS-STEP-NAME
               PERFORM LOG-STEP-START
               CALL "SYSTEM"
                   USING "data/output/TXN-PROCESSOR 2>/dev/null"
               MOVE RETURN-CODE TO WS-RETURN-CODE
               PERFORM LOG-STEP-RESULT.

           RUN-INTEREST-CALC.
               ADD 1 TO WS-STEP-NUM
               MOVE "INTEREST-CALC" TO WS-STEP-NAME
               PERFORM LOG-STEP-START
               CALL "SYSTEM"
                   USING "data/output/INTEREST-CALC 2>/dev/null"
               MOVE RETURN-CODE TO WS-RETURN-CODE
               PERFORM LOG-STEP-RESULT.

           RUN-EOD-REPORT.
               ADD 1 TO WS-STEP-NUM
               MOVE "EOD-REPORT" TO WS-STEP-NAME
               PERFORM LOG-STEP-START
               CALL "SYSTEM"
                   USING
                   "data/output/EOD-REPORT 2>/dev/null"
               MOVE RETURN-CODE TO WS-RETURN-CODE
               PERFORM LOG-STEP-RESULT.

           LOG-STEP-START.
               DISPLAY "  [STEP " WS-STEP-NUM "] "
                   WS-STEP-NAME " → RUNNING...".

           LOG-STEP-RESULT.
               IF WS-RETURN-CODE = 0
                   DISPLAY "  [STEP " WS-STEP-NUM "] "
                       WS-STEP-NAME " ✓ PASSED"
                   ADD 1 TO WS-PASS-COUNT
               ELSE
                   DISPLAY "  [STEP " WS-STEP-NUM "] "
                       WS-STEP-NAME " ✗ FAILED (RC="
                       WS-RETURN-CODE ")"
                   ADD 1 TO WS-FAIL-COUNT
               END-IF.

           DISPLAY-BATCH-SUMMARY.
               DISPLAY " "
               DISPLAY "=============================================="
               IF WS-FAIL-COUNT = 0
                   DISPLAY "  BATCH COMPLETE - ALL STEPS PASSED"
                   MOVE "SUCCESS   " TO WS-BATCH-STATUS
               ELSE
                   DISPLAY "  BATCH COMPLETE - " WS-FAIL-COUNT
                       " STEP(S) FAILED"
                   MOVE "FAILED    " TO WS-BATCH-STATUS
               END-IF
               DISPLAY "  Passed: " WS-PASS-COUNT
                   "  Failed: " WS-FAIL-COUNT
               DISPLAY "=============================================="
               DISPLAY "  Outputs in data/output/:"
               DISPLAY "    FEE-TRANSACTIONS.dat"
               DISPLAY "    APPROVED-TRANSACTIONS.dat"
               DISPLAY "    REJECTED-TRANSACTIONS.dat"
               DISPLAY "    TXN-LEDGER.dat"
               DISPLAY "    ACCOUNTS-UPDATED.dat"
               DISPLAY "    INTEREST-TRANSACTIONS.dat"
               DISPLAY "    EOD-REPORT.dat"
               DISPLAY "==============================================".
