      *================================================================
      * COPYBOOK:   REPORT-FIELDS.cpy
      * DESCRIPTION: Shared display format fields for all reports
      * USED BY:    EOD-REPORT, ACCOUNT-LOADER, TXN-VALIDATOR
      *================================================================
           01 REPORT-FIELDS.
               05 RF-REPORT-DATE       PIC X(10).
               05 RF-REPORT-TIME       PIC X(08).
               05 RF-PAGE-NUM          PIC 999 VALUE 1.
               05 RF-LINE-COUNT        PIC 999 VALUE 0.
               05 RF-LINES-PER-PAGE    PIC 999 VALUE 55.

      *    --- Currency Display ---
               05 RF-DISP-AMOUNT       PIC $$$,$$$,$$9.99.
               05 RF-DISP-BALANCE      PIC $$$,$$$,$$9.99.
               05 RF-DISP-LARGE        PIC $$,$$$,$$$,$$9.99.

      *    --- Count Display ---
               05 RF-DISP-COUNT        PIC ZZZ,ZZ9.
               05 RF-DISP-COUNT-SM     PIC ZZ9.

      *    --- Rate Display ---
               05 RF-DISP-RATE         PIC ZZ9.9999.

      *    --- Report Header Line ---
               05 RF-HEADER-LINE       PIC X(80)
                   VALUE "================================================
      -            "================".
               05 RF-BLANK-LINE        PIC X(80) VALUE SPACES.

      *    --- Output line buffer ---
               05 RF-OUT-LINE          PIC X(80).
