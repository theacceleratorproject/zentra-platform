      *================================================================
      * COPYBOOK:   TRANSACTION-RECORD.cpy
      * DESCRIPTION: Transaction record layout (100-byte fixed)
      * USED BY:    TXN-VALIDATOR, TXN-PROCESSOR, FEE-ENGINE,
      *             INTEREST-CALC
      *================================================================
           01 TRANSACTION-RECORD.
               05 TR-DATE              PIC X(10).
               05 TR-ACCOUNT-ID        PIC X(10).
               05 TR-TXN-TYPE          PIC X(03).
                   88 TR-DEPOSIT           VALUE "DEP".
                   88 TR-WITHDRAWAL        VALUE "WDR".
                   88 TR-TRANSFER          VALUE "XFR".
                   88 TR-FEE               VALUE "FEE".
                   88 TR-INTEREST          VALUE "INT".
               05 TR-AMOUNT            PIC 9(9)V99.
               05 TR-TARGET-ACCOUNT    PIC X(10).
               05 TR-DESCRIPTION       PIC X(30).
               05 TR-STATUS            PIC X(03).
                   88 TR-PENDING           VALUE "PND".
                   88 TR-APPROVED          VALUE "APR".
                   88 TR-REJECTED          VALUE "REJ".
               05 TR-ERROR-CODE        PIC X(03).
                   88 TR-ERR-NOT-FOUND     VALUE "E01".
                   88 TR-ERR-INACTIVE      VALUE "E02".
                   88 TR-ERR-BAD-AMOUNT    VALUE "E03".
                   88 TR-ERR-INSUFF-FUNDS  VALUE "E04".
                   88 TR-ERR-LIMIT-EXCEED  VALUE "E05".
                   88 TR-ERR-BAD-TARGET    VALUE "E06".
               05 FILLER               PIC X(20).
