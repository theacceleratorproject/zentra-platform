      *================================================================
      * COPYBOOK:   ACCOUNT-RECORD.cpy
      * DESCRIPTION: Master account record layout (100-byte fixed)
      * USED BY:    ACCOUNT-LOADER, TXN-PROCESSOR, FEE-ENGINE,
      *             INTEREST-CALC, EOD-REPORT
      *================================================================
           01 ACCOUNT-RECORD.
               05 AR-ACCOUNT-ID        PIC X(10).
               05 AR-ACCOUNT-NAME      PIC X(25).
               05 AR-ACCOUNT-TYPE      PIC X(10).
                   88 AR-CHECKING          VALUE "CHECKING  ".
                   88 AR-SAVINGS           VALUE "SAVINGS   ".
                   88 AR-BUSINESS          VALUE "BUSINESS  ".
                   88 AR-INTERNAL          VALUE "INTERNAL  ".
               05 AR-BALANCE           PIC S9(9)V99 SIGN LEADING
                                           SEPARATE.
               05 AR-OVERDRAFT-LIMIT   PIC 9(7)V99.
               05 AR-STATUS            PIC X(01).
                   88 AR-ACTIVE            VALUE "A".
                   88 AR-FROZEN            VALUE "F".
                   88 AR-CLOSED            VALUE "C".
               05 AR-OPEN-DATE         PIC X(10).
               05 AR-LAST-TXN-DATE     PIC X(10).
               05 FILLER               PIC X(07).
