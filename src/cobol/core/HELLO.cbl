      *================================================================
      * PROGRAM:    HELLO.cbl
      * DESCRIPTION: Zentra Banking Platform - Hello World
      * PHASE:      1 - COBOL Foundations
      * AUTHOR:     Marck (Zentra)
      *================================================================
       IDENTIFICATION DIVISION.
           PROGRAM-ID. HELLO.
           AUTHOR. MARCK.
           DATE-WRITTEN. 2026.

       ENVIRONMENT DIVISION.
           CONFIGURATION SECTION.
           SOURCE-COMPUTER. GITHUB-CODESPACES.
           OBJECT-COMPUTER. GITHUB-CODESPACES.

       DATA DIVISION.
           WORKING-STORAGE SECTION.
           01 WS-BANK-NAME         PIC X(20) VALUE "ZENTRA BANK".
           01 WS-VERSION           PIC X(10) VALUE "v1.0.0".
           01 WS-TAGLINE           PIC X(40)
               VALUE "Where Legacy Meets the Future".

       PROCEDURE DIVISION.
           MAIN-PARA.
               DISPLAY "====================================="
               DISPLAY "  Welcome to " WS-BANK-NAME
               DISPLAY "  Platform Version: " WS-VERSION
               DISPLAY "  " WS-TAGLINE
               DISPLAY "====================================="
               DISPLAY " "
               DISPLAY "COBOL Core Engine: ONLINE"
               DISPLAY "Status: READY FOR TRANSACTIONS"
               DISPLAY " "
               STOP RUN.
