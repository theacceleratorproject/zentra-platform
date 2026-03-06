      *================================================================
      * PROGRAM:    COMPOUND-INTEREST.cbl
      * DESCRIPTION: Calculate compound interest (savings growth)
      *              Formula: A = P(1 + r/n)^(nt)
      *              Using iterative approach (COBOL has no ^ operator)
      * PHASE:      1 - COBOL Foundations
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. COMPOUND-INTEREST.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
      *    --- Inputs ---
           01 WS-PRINCIPAL         PIC 9(9)V99 VALUE 5000.00.
           01 WS-ANNUAL-RATE       PIC 9(3)V9(6) VALUE 0.045000.
           01 WS-YEARS             PIC 99 VALUE 5.
           01 WS-COMPOUNDS-PER-YR  PIC 99 VALUE 12.

      *    --- Working Variables ---
           01 WS-PERIOD-RATE       PIC 9(3)V9(8).
           01 WS-TOTAL-PERIODS     PIC 999.
           01 WS-BALANCE           PIC 9(9)V99.
           01 WS-PERIOD-COUNTER    PIC 999.
           01 WS-YEAR-DISPLAY      PIC 99.
           01 WS-EARNED            PIC 9(9)V99.

      *    --- Display ---
           01 WS-DISP-BALANCE      PIC $$$,$$$,$$9.99.
           01 WS-DISP-EARNED       PIC $$$,$$$,$$9.99.
           01 WS-DISP-PRINCIPAL    PIC $$$,$$$,$$9.99.

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM INITIALIZE-CALC
               PERFORM COMPOUND-LOOP
                   VARYING WS-PERIOD-COUNTER FROM 1 BY 1
                   UNTIL WS-PERIOD-COUNTER > WS-TOTAL-PERIODS
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           INITIALIZE-CALC.
               COMPUTE WS-PERIOD-RATE =
                   WS-ANNUAL-RATE / WS-COMPOUNDS-PER-YR
               COMPUTE WS-TOTAL-PERIODS =
                   WS-YEARS * WS-COMPOUNDS-PER-YR
               MOVE WS-PRINCIPAL TO WS-BALANCE.

           COMPOUND-LOOP.
               COMPUTE WS-BALANCE =
                   WS-BALANCE + (WS-BALANCE * WS-PERIOD-RATE).

           DISPLAY-RESULTS.
               COMPUTE WS-EARNED = WS-BALANCE - WS-PRINCIPAL
               MOVE WS-BALANCE   TO WS-DISP-BALANCE
               MOVE WS-EARNED    TO WS-DISP-EARNED
               MOVE WS-PRINCIPAL TO WS-DISP-PRINCIPAL

               DISPLAY "====================================="
               DISPLAY "  ZENTRA BANK - Savings Growth Calc"
               DISPLAY "====================================="
               DISPLAY " Initial Deposit : " WS-DISP-PRINCIPAL
               DISPLAY " Annual Rate     : 4.5%"
               DISPLAY " Compounds/Year  : " WS-COMPOUNDS-PER-YR
               DISPLAY " Term            : " WS-YEARS " years"
               DISPLAY "-------------------------------------"
               DISPLAY " Interest Earned : " WS-DISP-EARNED
               DISPLAY " Final Balance   : " WS-DISP-BALANCE
               DISPLAY "=====================================".
