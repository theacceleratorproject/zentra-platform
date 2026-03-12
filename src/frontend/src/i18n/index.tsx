/**
 * Zentra Banking Platform — Ops Hub i18n
 * File: src/frontend/src/i18n/index.tsx
 *
 * French as default, English available via toggle.
 * Usage:
 *   import { useT, LanguageProvider, LanguageToggle } from '@/i18n';
 *   const t = useT();
 *   <p>{t.dashboard.title}</p>
 */

import React, { createContext, useContext, useState, ReactNode } from "react";

// ─── TRANSLATION DICTIONARIES ─────────────────────────────────────────────────

const translations = {
  fr: {
    // ── App Shell ──────────────────────────────────────────────────────────────
    app: {
      name: "ZENTRA",
      tagline: "Plateforme Bancaire",
      version: "v2.0.0",
    },

    // ── Sidebar Navigation ─────────────────────────────────────────────────────
    nav: {
      dashboard:    "Tableau de Bord",
      accounts:     "Comptes",
      transactions: "Transactions",
      loans:        "Prêts",
      reports:      "Rapports",
      batch:        "Traitement en Lot",
      portal:       "Portail Client",
      portalSub:    "Ouvrir le portail mobile",
    },

    // ── Common ─────────────────────────────────────────────────────────────────
    common: {
      loading:      "Chargement...",
      error:        "Erreur",
      success:      "Succès",
      save:         "Enregistrer",
      cancel:       "Annuler",
      confirm:      "Confirmer",
      delete:       "Supprimer",
      edit:         "Modifier",
      view:         "Voir",
      back:         "Retour",
      refresh:      "Actualiser",
      export:       "Exporter",
      search:       "Rechercher",
      filter:       "Filtrer",
      all:          "Tout",
      active:       "Actif",
      inactive:     "Inactif",
      status:       "Statut",
      date:         "Date",
      amount:       "Montant",
      type:         "Type",
      id:           "Identifiant",
      name:         "Nom",
      balance:      "Solde",
      actions:      "Actions",
      details:      "Détails",
      submit:       "Soumettre",
      reset:        "Réinitialiser",
      close:        "Fermer",
      open:         "Ouvrir",
      yes:          "Oui",
      no:           "Non",
      na:           "N/A",
      total:        "Total",
      processing:   "Traitement en cours...",
      noData:       "Aucune donnée disponible",
      noResults:    "Aucun résultat trouvé",
      copySuccess:  "Copié !",
    },

    // ── Dashboard ──────────────────────────────────────────────────────────────
    dashboard: {
      title:            "Tableau de Bord",
      subtitle:         "Vue d'ensemble du système en temps réel",
      totalAccounts:    "Comptes Totaux",
      totalBalance:     "Solde Total",
      todayTxns:        "Transactions Aujourd'hui",
      pendingTxns:      "Transactions en Attente",
      systemStatus:     "État du Système",
      cobolEngine:      "Moteur COBOL",
      apiStatus:        "API FastAPI",
      lastBatch:        "Dernier Traitement",
      nextBatch:        "Prochain Traitement",
      batchSchedule:    "Traitement Quotidien 22h00 HNE",
      recentActivity:   "Activité Récente",
      accountBreakdown: "Répartition des Comptes",
      balanceOverview:  "Aperçu des Soldes",
      healthy:          "Opérationnel",
      degraded:         "Dégradé",
      down:             "Hors Ligne",
      available:        "Disponible",
      unavailable:      "Indisponible",
      checking:         "Courant",
      savings:          "Épargne",
      business:         "Entreprise",
      internal:         "Interne",
      overdraftAlert:   "Alerte Découvert",
      accountsInOD:     "compte(s) en découvert",
    },

    // ── Accounts ───────────────────────────────────────────────────────────────
    accounts: {
      title:          "Gestion des Comptes",
      subtitle:       "Tous les comptes gérés par le moteur COBOL",
      newAccount:     "Nouveau Compte",
      accountId:      "Numéro de Compte",
      accountName:    "Nom du Titulaire",
      accountType:    "Type de Compte",
      balance:        "Solde",
      overdraftLimit: "Limite de Découvert",
      status:         "Statut",
      openDate:       "Date d'Ouverture",
      lastTxn:        "Dernière Transaction",
      closeAccount:   "Clôturer le Compte",
      closeConfirm:   "Confirmer la clôture du compte",
      closeWarning:   "Cette action est irréversible. Le solde doit être nul.",
      createTitle:    "Ouvrir un Nouveau Compte",
      ownerName:      "Nom du Propriétaire",
      selectType:     "Sélectionner le type",
      typeChecking:   "Courant",
      typeSavings:    "Épargne",
      typeBusiness:   "Entreprise",
      typeMM:         "Marché Monétaire",
      created:        "Compte créé avec succès",
      closed:         "Compte clôturé",
      activeOnly:     "Comptes actifs uniquement",
      showAll:        "Afficher tout",
      totalAccounts:  "Total des comptes",
      totalBalance:   "Solde total",
      overdrafted:    "En découvert",
    },

    // ── Transactions ───────────────────────────────────────────────────────────
    transactions: {
      title:          "Transactions",
      subtitle:       "Pipeline de validation et traitement COBOL",
      validate:       "Valider",
      process:        "Traiter",
      upload:         "Importer",
      ledger:         "Grand Livre",
      rejected:       "Rejetées",
      deposit:        "Dépôt",
      withdrawal:     "Retrait",
      transfer:       "Virement",
      fee:            "Frais",
      interest:       "Intérêts",
      pending:        "En Attente",
      approved:       "Approuvée",
      rejectedStatus: "Rejetée",
      validateTitle:  "Valider les Transactions",
      validateSub:    "Exécute TXN-VALIDATOR.cbl — 6 règles de validation",
      processTitle:   "Traiter les Transactions",
      processSub:     "Exécute TXN-PROCESSOR.cbl — Met à jour les soldes",
      uploadTitle:    "Importer un Fichier",
      uploadSub:      "Importer un fichier .dat de transactions",
      ledgerTitle:    "Grand Livre des Transactions",
      ledgerSub:      "Toutes les transactions des fichiers .dat",
      rejectedTitle:  "Transactions Rejetées",
      rejectedSub:    "Transactions ayant échoué à la validation",
      runValidation:  "Lancer la Validation",
      runProcessing:  "Lancer le Traitement",
      results:        "Résultats",
      approved_count: "Approuvées",
      rejected_count: "Rejetées",
      total_amount:   "Montant Total",
      errorCode:      "Code Erreur",
      targetAccount:  "Compte Cible",
      description:    "Description",
      filterAccount:  "Filtrer par Compte",
      filterType:     "Filtrer par Type",
      filterStatus:   "Filtrer par Statut",
      allAccounts:    "Tous les Comptes",
      allTypes:       "Tous les Types",
      allStatuses:    "Tous les Statuts",
      noTxns:         "Aucune transaction trouvée",
      newDeposit:     "Nouveau Dépôt",
      newWithdrawal:  "Nouveau Retrait",
      newTransfer:    "Nouveau Virement",
      fromAccount:    "Compte Source",
      toAccount:      "Compte Destinataire",
    },

    // ── Loans ──────────────────────────────────────────────────────────────────
    loans: {
      title:          "Calculateur de Prêts",
      subtitle:       "Calcul d'amortissement et simulation de prêts",
      principal:      "Montant du Prêt",
      interestRate:   "Taux d'Intérêt Annuel",
      termMonths:     "Durée (mois)",
      termYears:      "Durée (années)",
      calculate:      "Calculer",
      monthlyPayment: "Mensualité",
      totalPayment:   "Total des Paiements",
      totalInterest:  "Total des Intérêts",
      amortization:   "Tableau d'Amortissement",
      month:          "Mois",
      payment:        "Paiement",
      principalPaid:  "Capital Remboursé",
      interestPaid:   "Intérêts Payés",
      remainingBal:   "Solde Restant",
      presets:        "Préréglages",
      personalLoan:   "Prêt Personnel",
      autoLoan:       "Prêt Auto",
      mortgage:       "Hypothèque",
      businessLoan:   "Prêt Entreprise",
      exportTable:    "Exporter le Tableau",
    },

    // ── Reports ────────────────────────────────────────────────────────────────
    reports: {
      title:          "Rapports",
      subtitle:       "Moteur de frais, calcul d'intérêts et rapport de fin de journée",
      eodReport:      "Rapport de Fin de Journée",
      eodSub:         "Exécute EOD-REPORT.cbl — Résumé complet",
      feeReport:      "Rapport des Frais",
      feeSub:         "Exécute FEE-ENGINE.cbl — Maintenance, solde faible, découvert",
      interestReport: "Rapport des Intérêts",
      interestSub:    "Exécute INTEREST-CALC.cbl — Intérêts journaliers",
      generateEOD:    "Générer le Rapport EOD",
      generateFees:   "Générer les Frais",
      generateInterest: "Calculer les Intérêts",
      reportOutput:   "Résultat du Rapport",
      totalFees:      "Total des Frais",
      totalInterest:  "Total des Intérêts",
      accountsProcessed: "Comptes Traités",
      maintenanceFee: "Frais de Tenue de Compte",
      lowBalanceFee:  "Frais de Solde Faible",
      overdraftFee:   "Frais de Découvert",
      interestCredited: "Intérêts Crédités",
      runningReport:  "Génération du rapport...",
      reportGenerated: "Rapport généré avec succès",
    },

    // ── Batch Pipeline ─────────────────────────────────────────────────────────
    batch: {
      title:          "Pipeline de Traitement",
      subtitle:       "Cycle journalier COBOL — Orchestré par BATCH-RUNNER.cbl",
      runBatch:       "Lancer le Traitement",
      batchStatus:    "État du Traitement",
      lastRun:        "Dernier Traitement",
      duration:       "Durée",
      step:           "Étape",
      steps: {
        feeEngine:    "Moteur de Frais",
        validator:    "Validateur de Transactions",
        processor:    "Processeur de Transactions",
        interest:     "Calcul des Intérêts",
        eodReport:    "Rapport de Fin de Journée",
      },
      stepDesc: {
        feeEngine:    "Génère les frais de maintenance, solde faible et découvert",
        validator:    "Applique 6 règles de validation (E01–E06)",
        processor:    "Met à jour les soldes et écrit le registre d'audit",
        interest:     "Crédite les intérêts journaliers depuis la table des taux",
        eodReport:    "Génère le résumé complet de fin de journée",
      },
      running:        "En cours d'exécution...",
      completed:      "Terminé",
      failed:         "Échec",
      idle:           "En attente",
      batchComplete:  "Traitement journalier terminé",
      batchFailed:    "Échec du traitement",
      scheduleNote:   "Le traitement automatique s'exécute à 22h00 HNE chaque jour",
      manualRun:      "Exécution manuelle disponible via ce panneau ou l'API",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ENGLISH
  // ─────────────────────────────────────────────────────────────────────────────
  en: {
    app: {
      name: "ZENTRA",
      tagline: "Banking Platform",
      version: "v2.0.0",
    },
    nav: {
      dashboard:    "Dashboard",
      accounts:     "Accounts",
      transactions: "Transactions",
      loans:        "Loans",
      reports:      "Reports",
      batch:        "Batch Pipeline",
      portal:       "Customer Portal",
      portalSub:    "Open mobile portal",
    },
    common: {
      loading:      "Loading...",
      error:        "Error",
      success:      "Success",
      save:         "Save",
      cancel:       "Cancel",
      confirm:      "Confirm",
      delete:       "Delete",
      edit:         "Edit",
      view:         "View",
      back:         "Back",
      refresh:      "Refresh",
      export:       "Export",
      search:       "Search",
      filter:       "Filter",
      all:          "All",
      active:       "Active",
      inactive:     "Inactive",
      status:       "Status",
      date:         "Date",
      amount:       "Amount",
      type:         "Type",
      id:           "ID",
      name:         "Name",
      balance:      "Balance",
      actions:      "Actions",
      details:      "Details",
      submit:       "Submit",
      reset:        "Reset",
      close:        "Close",
      open:         "Open",
      yes:          "Yes",
      no:           "No",
      na:           "N/A",
      total:        "Total",
      processing:   "Processing...",
      noData:       "No data available",
      noResults:    "No results found",
      copySuccess:  "Copied!",
    },
    dashboard: {
      title:            "Dashboard",
      subtitle:         "Real-time system overview",
      totalAccounts:    "Total Accounts",
      totalBalance:     "Total Balance",
      todayTxns:        "Today's Transactions",
      pendingTxns:      "Pending Transactions",
      systemStatus:     "System Status",
      cobolEngine:      "COBOL Engine",
      apiStatus:        "FastAPI Bridge",
      lastBatch:        "Last Batch",
      nextBatch:        "Next Batch",
      batchSchedule:    "Daily Batch 22:00 EST",
      recentActivity:   "Recent Activity",
      accountBreakdown: "Account Breakdown",
      balanceOverview:  "Balance Overview",
      healthy:          "Healthy",
      degraded:         "Degraded",
      down:             "Down",
      available:        "Available",
      unavailable:      "Unavailable",
      checking:         "Checking",
      savings:          "Savings",
      business:         "Business",
      internal:         "Internal",
      overdraftAlert:   "Overdraft Alert",
      accountsInOD:     "account(s) in overdraft",
    },
    accounts: {
      title:          "Account Management",
      subtitle:       "All accounts managed by the COBOL engine",
      newAccount:     "New Account",
      accountId:      "Account ID",
      accountName:    "Account Name",
      accountType:    "Account Type",
      balance:        "Balance",
      overdraftLimit: "Overdraft Limit",
      status:         "Status",
      openDate:       "Open Date",
      lastTxn:        "Last Transaction",
      closeAccount:   "Close Account",
      closeConfirm:   "Confirm account closure",
      closeWarning:   "This action is irreversible. Balance must be zero.",
      createTitle:    "Open New Account",
      ownerName:      "Owner Name",
      selectType:     "Select type",
      typeChecking:   "Checking",
      typeSavings:    "Savings",
      typeBusiness:   "Business",
      typeMM:         "Money Market",
      created:        "Account created successfully",
      closed:         "Account closed",
      activeOnly:     "Active accounts only",
      showAll:        "Show all",
      totalAccounts:  "Total accounts",
      totalBalance:   "Total balance",
      overdrafted:    "In overdraft",
    },
    transactions: {
      title:          "Transactions",
      subtitle:       "COBOL validation and processing pipeline",
      validate:       "Validate",
      process:        "Process",
      upload:         "Upload",
      ledger:         "Ledger",
      rejected:       "Rejected",
      deposit:        "Deposit",
      withdrawal:     "Withdrawal",
      transfer:       "Transfer",
      fee:            "Fee",
      interest:       "Interest",
      pending:        "Pending",
      approved:       "Approved",
      rejectedStatus: "Rejected",
      validateTitle:  "Validate Transactions",
      validateSub:    "Runs TXN-VALIDATOR.cbl — 6 validation rules",
      processTitle:   "Process Transactions",
      processSub:     "Runs TXN-PROCESSOR.cbl — Updates balances",
      uploadTitle:    "Upload File",
      uploadSub:      "Import a .dat transaction file",
      ledgerTitle:    "Transaction Ledger",
      ledgerSub:      "All transactions from .dat files",
      rejectedTitle:  "Rejected Transactions",
      rejectedSub:    "Transactions that failed validation",
      runValidation:  "Run Validation",
      runProcessing:  "Run Processing",
      results:        "Results",
      approved_count: "Approved",
      rejected_count: "Rejected",
      total_amount:   "Total Amount",
      errorCode:      "Error Code",
      targetAccount:  "Target Account",
      description:    "Description",
      filterAccount:  "Filter by Account",
      filterType:     "Filter by Type",
      filterStatus:   "Filter by Status",
      allAccounts:    "All Accounts",
      allTypes:       "All Types",
      allStatuses:    "All Statuses",
      noTxns:         "No transactions found",
      newDeposit:     "New Deposit",
      newWithdrawal:  "New Withdrawal",
      newTransfer:    "New Transfer",
      fromAccount:    "From Account",
      toAccount:      "To Account",
    },
    loans: {
      title:          "Loan Calculator",
      subtitle:       "Amortization and loan simulation",
      principal:      "Loan Amount",
      interestRate:   "Annual Interest Rate",
      termMonths:     "Term (months)",
      termYears:      "Term (years)",
      calculate:      "Calculate",
      monthlyPayment: "Monthly Payment",
      totalPayment:   "Total Payment",
      totalInterest:  "Total Interest",
      amortization:   "Amortization Schedule",
      month:          "Month",
      payment:        "Payment",
      principalPaid:  "Principal Paid",
      interestPaid:   "Interest Paid",
      remainingBal:   "Remaining Balance",
      presets:        "Presets",
      personalLoan:   "Personal Loan",
      autoLoan:       "Auto Loan",
      mortgage:       "Mortgage",
      businessLoan:   "Business Loan",
      exportTable:    "Export Schedule",
    },
    reports: {
      title:          "Reports",
      subtitle:       "Fee engine, interest calculation, and end-of-day reporting",
      eodReport:      "End-of-Day Report",
      eodSub:         "Runs EOD-REPORT.cbl — Full daily summary",
      feeReport:      "Fee Report",
      feeSub:         "Runs FEE-ENGINE.cbl — Maintenance, low-balance, overdraft",
      interestReport: "Interest Report",
      interestSub:    "Runs INTEREST-CALC.cbl — Daily interest crediting",
      generateEOD:    "Generate EOD Report",
      generateFees:   "Generate Fees",
      generateInterest: "Calculate Interest",
      reportOutput:   "Report Output",
      totalFees:      "Total Fees",
      totalInterest:  "Total Interest",
      accountsProcessed: "Accounts Processed",
      maintenanceFee: "Maintenance Fee",
      lowBalanceFee:  "Low Balance Fee",
      overdraftFee:   "Overdraft Fee",
      interestCredited: "Interest Credited",
      runningReport:  "Generating report...",
      reportGenerated: "Report generated successfully",
    },
    batch: {
      title:          "Batch Pipeline",
      subtitle:       "Daily COBOL cycle — Orchestrated by BATCH-RUNNER.cbl",
      runBatch:       "Run Batch",
      batchStatus:    "Batch Status",
      lastRun:        "Last Run",
      duration:       "Duration",
      step:           "Step",
      steps: {
        feeEngine:    "Fee Engine",
        validator:    "Transaction Validator",
        processor:    "Transaction Processor",
        interest:     "Interest Calculator",
        eodReport:    "End-of-Day Report",
      },
      stepDesc: {
        feeEngine:    "Generates maintenance, low-balance, and overdraft fees",
        validator:    "Applies 6 validation rules (E01–E06)",
        processor:    "Updates balances and writes audit ledger",
        interest:     "Credits daily interest from rate table",
        eodReport:    "Generates complete end-of-day summary",
      },
      running:        "Running...",
      completed:      "Completed",
      failed:         "Failed",
      idle:           "Idle",
      batchComplete:  "Daily batch completed",
      batchFailed:    "Batch failed",
      scheduleNote:   "Automatic batch runs at 22:00 EST daily",
      manualRun:      "Manual run available via this panel or API",
    },
  },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Language = "fr" | "en";
export type Translations = typeof translations.fr;

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: translations.fr,
});

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem("zntr_ops_lang") as Language) || "fr";
  const [lang, setLangState] = useState<Language>(stored);

  const setLang = (newLang: Language) => {
    localStorage.setItem("zntr_ops_lang", newLang);
    setLangState(newLang);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useT(): Translations {
  return useContext(I18nContext).t;
}

export function useLang(): { lang: Language; setLang: (l: Language) => void } {
  const { lang, setLang } = useContext(I18nContext);
  return { lang, setLang };
}

// ─── LANGUAGE TOGGLE COMPONENT ────────────────────────────────────────────────

export function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "8px",
        padding: "3px",
      }}
    >
      {(["fr", "en"] as Language[]).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            padding: "4px 10px",
            borderRadius: "6px",
            border: "none",
            background: lang === code ? "var(--gold, #c9a84c)" : "transparent",
            color: lang === code ? "#0a0f1e" : "rgba(255,255,255,0.5)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1px",
            cursor: "pointer",
            transition: "all 0.15s",
            textTransform: "uppercase",
          }}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export default translations;
