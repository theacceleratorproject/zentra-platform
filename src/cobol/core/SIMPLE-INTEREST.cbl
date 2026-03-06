      *================================================================
      * PROGRAM:    SIMPLE-INTEREST.cbl
      * DESCRIPTION: Calculate simple interest on a loan or deposit
      *              Formula: Interest = Principal x Rate x Time
      * PHASE:      1 - COBOL Foundations
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. SIMPLE-INTEREST.
           AUTHOR. MARCK.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
      *    --- Input Fields ---
           01 WS-PRINCIPAL         PIC 9(9)V99 VALUE 10000.00.
           01 WS-ANNUAL-RATE       PIC 9(3)V9(4) VALUE 0.0650.
           01 WS-YEARS             PIC 99 VALUE 3.

      *    --- Calculated Fields ---
           01 WS-INTEREST          PIC 9(9)V99.
           01 WS-TOTAL-DUE         PIC 9(9)V99.

      *    --- Display Fields (formatted) ---
           01 WS-DISPLAY-PRINCIPAL PIC $$$,$$$,$$9.99.
           01 WS-DISPLAY-INTEREST  PIC $$$,$$$,$$9.99.
           01 WS-DISPLAY-TOTAL     PIC $$$,$$$,$$9.99.
           01 WS-DISPLAY-RATE      PIC ZZ9.99.

       PROCEDURE DIVISION.
           MAIN-PARA.
               PERFORM CALCULATE-INTEREST
               PERFORM DISPLAY-RESULTS
               STOP RUN.

           CALCULATE-INTEREST.
               COMPUTE WS-INTEREST =
                   WS-PRINCIPAL * WS-ANNUAL-RATE * WS-YEARS
               COMPUTE WS-TOTAL-DUE =
                   WS-PRINCIPAL + WS-INTEREST.

           DISPLAY-RESULTS.
               MOVE WS-PRINCIPAL  TO WS-DISPLAY-PRINCIPAL
               MOVE WS-INTEREST   TO WS-DISPLAY-INTEREST
               MOVE WS-TOTAL-DUE  TO WS-DISPLAY-TOTAL
               MOVE WS-ANNUAL-RATE TO WS-DISPLAY-RATE

               DISPLAY "====================================="
               DISPLAY "  ZENTRA BANK - Simple Interest Calc"
               DISPLAY "====================================="
               DISPLAY " Principal :  " WS-DISPLAY-PRINCIPAL
               DISPLAY " Rate      :  " WS-DISPLAY-RATE "%"
               DISPLAY " Term      :  " WS-YEARS " years"
               DISPLAY "-------------------------------------"
               DISPLAY " Interest  :  " WS-DISPLAY-INTEREST
               DISPLAY " Total Due :  " WS-DISPLAY-TOTAL
               DISPLAY "=====================================".
