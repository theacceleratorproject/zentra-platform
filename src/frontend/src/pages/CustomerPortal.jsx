import { useState, useEffect, useCallback, useRef } from "react";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "ZENTRA",
    tagline: "Private Banking Platform",
    signIn: "Sign In", openAccount: "Open Account",
    email: "Email Address", password: "Password", name: "Full Name",
    confirmPw: "Confirm Password", minPw: "Min 8 characters",
    creating: "Creating...", signingIn: "Signing in...",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    totalPortfolio: "Total Portfolio",
    batchNote: "Nightly batch reconciliation runs at 22:00 EST",
    accounts: "Accounts", newAccount: "New Account",
    quickActions: "Quick Actions",
    deposit: "Deposit", withdraw: "Withdraw", transfer: "Transfer",
    history: "History", home: "Home", profile: "Profile",
    recentTxns: "Recent Transactions", viewAll: "View All Transactions",
    alerts: "Alerts",
    overdraftTitle: "Overdraft",
    overdraftBody: "Balance is {bal}. Overdraft fee may apply.",
    lowBalTitle: "Low Balance",
    lowBalBody: "Balance is {bal}. Consider a deposit.",
    depositFunds: "Deposit Funds", depositSub: "Add funds to your account in real-time.",
    withdrawFunds: "Withdraw Funds", withdrawSub: "Withdraw from your account instantly.",
    transferFunds: "Transfer Funds", transferSub: "Move money between your Zentra accounts.",
    amount: "Amount", destination: "Destination Account", source: "Source Account",
    fromAccount: "From Account", toAccount: "To Account",
    description: "Description", continue: "Continue",
    confirmDeposit: "Confirm Deposit", confirmWithdraw: "Confirm Withdrawal", confirmTransfer: "Confirm Transfer",
    confirm: "Confirm", edit: "Edit", back: "Back",
    processing: "Processing via COBOL Engine...",
    depositSuccess: "Deposit Successful", withdrawSuccess: "Withdrawal Complete", transferSuccess: "Transfer Complete",
    depositSuccessSub: "deposited to", withdrawSuccessSub: "withdrawn from", transferSuccessSub: "moved from",
    to: "to",
    fundsAvailable: "Funds available immediately. Reflected in nightly batch at 22:00 EST.",
    backToDash: "Back to Dashboard",
    overdraftWarn: "Overdraft Warning",
    overdraftWarnBody: "This exceeds your available balance + overdraft limit of",
    insufficientFunds: "Insufficient funds",
    ref: "REF", processingCobol: "Real-time via COBOL", batchReconcile: "Batch Reconcile",
    transactionHistory: "Transaction History", found: "transactions found",
    filterAccount: "Filter by Account", allAccounts: "All Accounts",
    all: "All", deposits: "Deposits", withdrawals: "Withdrawals", transfers: "Transfers", fees: "Fees",
    noTxns: "No transactions found",
    openNewAccount: "Open New Account",
    openNewSub: "Choose your account type. Powered by COBOL batch engine.",
    accountTerms: "Account Terms", monthlyFee: "Monthly Fee",
    overdraftLimit: "Overdraft Limit", interestRate: "Interest Rate",
    cobolProcessing: "Real-time + nightly COBOL batch",
    openBtn: "Open",
    personalInfo: "Personal Information", securityPw: "Security & Password",
    notifPrefs: "Notification Preferences", downloadStmt: "Download Statement",
    opsDashboard: "Operations Dashboard", apiDocs: "API Documentation",
    cobolSchedule: "COBOL Batch Schedule", language: "Language",
    signOut: "Sign Out",
    saving: "Saving...", save: "Save Changes", saved: "Saved ✓",
    currentPw: "Current Password", newPw: "New Password", confirmNewPw: "Confirm New Password",
    updatePw: "Update Password", pwUpdated: "Password updated successfully",
    pwMismatch: "Passwords do not match", pwWrong: "Current password is incorrect",
    notifLowBal: "Low Balance Alerts", notifTxn: "Transaction Alerts", notifBatch: "Batch Cycle Alerts",
    notifSaved: "Preferences saved",
    stmtDownload: "Download Statement", stmtSub: "Export your transaction history as CSV",
    stmtBtn: "Download CSV",
    phone: "Phone Number",
    accountsLinked: "Linked Accounts", noAccountsLinked: "No accounts linked yet",
    linkAccount: "Link Account", linkAccountId: "Account ID (e.g. ZNT-001042)",
    linking: "Linking...", linked: "Linked ✓",
    active: "Active", suspended: "Suspended", closed: "Closed",
    checking: "CHECKING", savings: "SAVINGS", moneyMarket: "MONEY MARKET",
    checkingDesc: "Daily transactions, debit access, overdraft protection up to $500",
    savingsDesc: "High-yield savings with nightly interest crediting via batch cycle",
    mmDesc: "Premium rates for balances over $10,000",
    apiError: "Connection error. Please try again.",
    loginError: "Invalid email or password",
    registerError: "This email is already registered",
    fieldRequired: "All fields are required",
    accountNotFound: "Account not found",
    sessionExpired: "Session expired. Please sign in again.",
    waivedWith: "waived with $1,500 min",
    none: "None",
    apy: "APY",
    noneOD: "None",
    searchPlaceholder: "Search by account number",
    searchClear: "Clear",
    noAccountFound: "No account found",
    accountDetail: "Account Details",
    owner: "Owner",
    openDate: "Opened",
    lastActivity: "Last Activity",
    noActivity: "No transactions yet",
    pendingLabel: "pending",
    accountOwner: "Account Owner",
    accountCreatedFor: "Account will be created for",
    viewAllAccounts: "All accounts",
    overdraftLimitLabel: "Overdraft limit",
    noAccountsYet: "No accounts yet. Open your first account!",
    holderName: "Account Holder Name",
    holderSection: "Account Holder",
    configSection: "Account Configuration",
    additionalSection: "Additional Information",
    optional: "Optional",
    dob: "Date of Birth",
    address: "Address",
    accountPurpose: "Account Purpose",
    purposePersonal: "Personal", purposeBusiness: "Business",
    purposeSavings: "Savings Goal", purposeEmergency: "Emergency Fund", purposeOther: "Other",
    nameRequired: "Name required",
    openAccountBtn: "Open Account",
    draftRestored: "Draft restored",
    createdBy: "Created by",
    infoSaved: "Information saved",
    lowBalCount: "{count} accounts with low balance",
    seeDetails: "See details",
    hideDetails: "Hide details",
    suspendedAccounts: "Suspended Account(s)",
    moreOverdrafts: "and {n} more accounts overdrawn",
    dismissAlert: "Dismiss",
  },
  fr: {
    appName: "ZENTRA",
    tagline: "Plateforme Bancaire Privée",
    signIn: "Connexion", openAccount: "Ouvrir un Compte",
    email: "Adresse E-mail", password: "Mot de Passe", name: "Nom Complet",
    confirmPw: "Confirmer le Mot de Passe", minPw: "Min 8 caractères",
    creating: "Création...", signingIn: "Connexion...",
    goodMorning: "Bonjour", goodAfternoon: "Bon après-midi", goodEvening: "Bonsoir",
    totalPortfolio: "Portefeuille Total",
    batchNote: "Traitement nocturne à 22h00 HNE",
    accounts: "Comptes", newAccount: "Nouveau Compte",
    quickActions: "Actions Rapides",
    deposit: "Dépôt", withdraw: "Retrait", transfer: "Virement",
    history: "Historique", home: "Accueil", profile: "Profil",
    recentTxns: "Transactions Récentes", viewAll: "Voir Toutes les Transactions",
    alerts: "Alertes",
    overdraftTitle: "Découvert",
    overdraftBody: "Solde: {bal}. Des frais de découvert peuvent s'appliquer.",
    lowBalTitle: "Solde Faible",
    lowBalBody: "Solde: {bal}. Pensez à effectuer un dépôt.",
    depositFunds: "Effectuer un Dépôt", depositSub: "Ajoutez des fonds à votre compte en temps réel.",
    withdrawFunds: "Effectuer un Retrait", withdrawSub: "Retirez de votre compte instantanément.",
    transferFunds: "Effectuer un Virement", transferSub: "Transférez de l'argent entre vos comptes Zentra.",
    amount: "Montant", destination: "Compte Destinataire", source: "Compte Source",
    fromAccount: "Du Compte", toAccount: "Vers le Compte",
    description: "Description", continue: "Continuer",
    confirmDeposit: "Confirmer le Dépôt", confirmWithdraw: "Confirmer le Retrait", confirmTransfer: "Confirmer le Virement",
    confirm: "Confirmer", edit: "Modifier", back: "Retour",
    processing: "Traitement via Moteur COBOL...",
    depositSuccess: "Dépôt Réussi", withdrawSuccess: "Retrait Effectué", transferSuccess: "Virement Effectué",
    depositSuccessSub: "déposé sur", withdrawSuccessSub: "retiré de", transferSuccessSub: "transféré de",
    to: "vers",
    fundsAvailable: "Fonds disponibles immédiatement. Intégré au traitement nocturne à 22h00 HNE.",
    backToDash: "Retour au Tableau de Bord",
    overdraftWarn: "Avertissement de Découvert",
    overdraftWarnBody: "Ceci dépasse votre solde disponible + limite de découvert de",
    insufficientFunds: "Fonds insuffisants",
    ref: "RÉF", processingCobol: "Temps réel via COBOL", batchReconcile: "Rapprochement nocturne",
    transactionHistory: "Historique des Transactions", found: "transactions trouvées",
    filterAccount: "Filtrer par Compte", allAccounts: "Tous les Comptes",
    all: "Tout", deposits: "Dépôts", withdrawals: "Retraits", transfers: "Virements", fees: "Frais",
    noTxns: "Aucune transaction trouvée",
    openNewAccount: "Ouvrir un Nouveau Compte",
    openNewSub: "Choisissez le type de compte. Propulsé par le moteur COBOL.",
    accountTerms: "Conditions du Compte", monthlyFee: "Frais Mensuels",
    overdraftLimit: "Limite de Découvert", interestRate: "Taux d'Intérêt",
    cobolProcessing: "Temps réel + traitement COBOL nocturne",
    openBtn: "Ouvrir",
    personalInfo: "Informations Personnelles", securityPw: "Sécurité & Mot de Passe",
    notifPrefs: "Préférences de Notification", downloadStmt: "Télécharger le Relevé",
    opsDashboard: "Tableau de Bord Opérationnel", apiDocs: "Documentation API",
    cobolSchedule: "Planification COBOL", language: "Langue",
    signOut: "Déconnexion",
    saving: "Enregistrement...", save: "Enregistrer", saved: "Enregistré ✓",
    currentPw: "Mot de Passe Actuel", newPw: "Nouveau Mot de Passe", confirmNewPw: "Confirmer le Nouveau Mot de Passe",
    updatePw: "Mettre à Jour", pwUpdated: "Mot de passe mis à jour",
    pwMismatch: "Les mots de passe ne correspondent pas", pwWrong: "Mot de passe actuel incorrect",
    notifLowBal: "Alertes Solde Faible", notifTxn: "Alertes de Transaction", notifBatch: "Alertes de Traitement",
    notifSaved: "Préférences enregistrées",
    stmtDownload: "Télécharger le Relevé", stmtSub: "Exportez votre historique en CSV",
    stmtBtn: "Télécharger CSV",
    phone: "Numéro de Téléphone",
    accountsLinked: "Comptes Liés", noAccountsLinked: "Aucun compte lié",
    linkAccount: "Lier un Compte", linkAccountId: "ID de Compte (ex. ZNT-001042)",
    linking: "Liaison...", linked: "Lié ✓",
    active: "Actif", suspended: "Suspendu", closed: "Fermé",
    checking: "COURANT", savings: "ÉPARGNE", moneyMarket: "MARCHÉ MONÉTAIRE",
    checkingDesc: "Transactions quotidiennes, accès débit, protection découvert jusqu'à 500$",
    savingsDesc: "Épargne à rendement élevé avec crédits d'intérêts nocturnes",
    mmDesc: "Taux premium pour soldes supérieurs à 10 000$",
    apiError: "Erreur de connexion. Veuillez réessayer.",
    loginError: "Email ou mot de passe invalide",
    registerError: "Cet email est déjà enregistré",
    fieldRequired: "Tous les champs sont obligatoires",
    accountNotFound: "Compte introuvable",
    sessionExpired: "Session expirée. Veuillez vous reconnecter.",
    waivedWith: "exonéré avec 1 500$ min",
    none: "Aucun",
    apy: "TAE",
    noneOD: "Aucune",
    searchPlaceholder: "Rechercher par numéro de compte",
    searchClear: "Effacer",
    noAccountFound: "Aucun compte trouvé",
    accountDetail: "Détails du Compte",
    owner: "Propriétaire",
    openDate: "Ouvert le",
    lastActivity: "Dernière Activité",
    noActivity: "Aucune transaction",
    pendingLabel: "en attente",
    accountOwner: "Propriétaire du Compte",
    accountCreatedFor: "Le compte sera créé pour",
    viewAllAccounts: "Tous les comptes",
    overdraftLimitLabel: "Découvert autorisé",
    noAccountsYet: "Aucun compte. Ouvrez votre premier compte !",
    holderName: "Nom du Titulaire",
    holderSection: "Titulaire du Compte",
    configSection: "Configuration du Compte",
    additionalSection: "Informations Complémentaires",
    optional: "Optionnel",
    dob: "Date de Naissance",
    address: "Adresse",
    accountPurpose: "Objet du Compte",
    purposePersonal: "Personnel", purposeBusiness: "Professionnel",
    purposeSavings: "Objectif d'épargne", purposeEmergency: "Fonds d'urgence", purposeOther: "Autre",
    nameRequired: "Nom requis",
    openAccountBtn: "Ouvrir le Compte",
    draftRestored: "Brouillon restauré",
    createdBy: "Créé par",
    infoSaved: "Informations enregistrées",
    lowBalCount: "{count} comptes à solde faible",
    seeDetails: "Voir détails",
    hideDetails: "Masquer",
    suspendedAccounts: "Compte(s) Suspendu(s)",
    moreOverdrafts: "et {n} autres comptes en découvert",
    dismissAlert: "Ignorer",
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy: #0a0f1e; --navy2: #111827; --navy3: #1c2535; --navy4: #243044;
    --gold: #c9a84c; --gold2: #e8c97a; --gold3: #f5e6b8;
    --white: #f8f6f1; --muted: #8a95a8; --red: #e05252; --green: #4caf82;
    --border: rgba(201,168,76,0.15); --glass: rgba(255,255,255,0.04);
  }
  body { font-family:'DM Sans',sans-serif; background:var(--navy); color:var(--white); min-height:100vh; -webkit-font-smoothing:antialiased; }
  .app { max-width:430px; margin:0 auto; min-height:100vh; background:var(--navy); position:relative; }
  .auth-screen { min-height:100vh; display:flex; flex-direction:column; }
  .auth-hero { background:linear-gradient(160deg,#0d1529 0%,#1a2540 60%,#0a0f1e 100%); padding:72px 32px 48px; position:relative; overflow:hidden; }
  .auth-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:240px; height:240px; border-radius:50%; border:1px solid rgba(201,168,76,0.12); }
  .auth-logo { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:300; letter-spacing:6px; color:var(--white); margin-bottom:8px; }
  .auth-logo span { color:var(--gold); }
  .auth-tagline { font-size:12px; letter-spacing:3px; color:var(--muted); text-transform:uppercase; }
  .auth-body { padding:36px 28px; flex:1; }
  .auth-tabs { display:flex; background:var(--navy3); border-radius:12px; padding:4px; margin-bottom:28px; }
  .auth-tab { flex:1; padding:10px; border:none; background:none; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; border-radius:9px; cursor:pointer; transition:all .2s; }
  .auth-tab.active { background:var(--gold); color:var(--navy); }
  .lang-toggle { display:flex; gap:6px; position:absolute; top:20px; right:20px; }
  .lang-btn { background:var(--navy3); border:1px solid var(--border); color:var(--muted); border-radius:8px; padding:4px 10px; font-size:11px; font-weight:500; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .lang-btn.active { background:var(--gold); color:var(--navy); border-color:var(--gold); }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .field input, .field select { width:100%; background:var(--navy3); border:1px solid var(--border); border-radius:10px; padding:14px 16px; color:var(--white); font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color .2s; -webkit-appearance:none; }
  .field input:focus, .field select:focus { border-color:var(--gold); }
  .field select option { background:var(--navy2); }
  .error-msg { background:rgba(224,82,82,0.1); border:1px solid rgba(224,82,82,0.25); border-radius:10px; padding:12px 14px; font-size:13px; color:var(--red); margin-bottom:14px; }
  .success-msg { background:rgba(76,175,130,0.1); border:1px solid rgba(76,175,130,0.25); border-radius:10px; padding:12px 14px; font-size:13px; color:var(--green); margin-bottom:14px; }
  .btn-primary { width:100%; background:var(--gold); color:var(--navy); border:none; border-radius:12px; padding:16px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500; letter-spacing:1px; cursor:pointer; transition:all .2s; margin-top:8px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:hover { background:var(--gold2); transform:translateY(-1px); }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
  .btn-ghost { background:transparent; border:1px solid var(--border); color:var(--white); border-radius:12px; padding:14px 20px; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all .2s; width:100%; }
  .btn-ghost:hover { border-color:var(--gold); color:var(--gold); }
  .btn-sm { background:var(--gold); color:var(--navy); border:none; border-radius:8px; padding:10px 18px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .2s; }
  .btn-sm:hover { background:var(--gold2); }
  .btn-danger { background:rgba(224,82,82,0.1); border:1px solid rgba(224,82,82,0.25); color:var(--red); border-radius:10px; padding:14px 18px; font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all .2s; width:100%; margin-top:8px; }
  .topbar { padding:52px 24px 16px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:var(--navy); z-index:10; }
  .topbar-logo { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; letter-spacing:4px; color:var(--white); }
  .topbar-logo span { color:var(--gold); }
  .topbar-actions { display:flex; gap:10px; align-items:center; }
  .icon-btn { width:36px; height:36px; border-radius:50%; background:var(--navy3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; transition:all .2s; position:relative; }
  .icon-btn:hover { border-color:var(--gold); }
  .notif-dot { position:absolute; top:5px; right:5px; width:8px; height:8px; background:var(--gold); border-radius:50%; border:2px solid var(--navy); }
  .page { padding:0 20px 100px; overflow-y:auto; min-height:calc(100vh - 80px); }
  .greeting { margin-bottom:20px; }
  .greeting-sub { font-size:12px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
  .greeting-name { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:400; color:var(--white); }
  .balance-hero { background:linear-gradient(135deg,#1a2a4a 0%,#0d1a30 100%); border:1px solid var(--border); border-radius:20px; padding:28px 24px; margin-bottom:20px; position:relative; overflow:hidden; }
  .balance-hero::before { content:'Z'; font-family:'Cormorant Garamond',serif; font-size:180px; font-weight:300; color:rgba(201,168,76,0.04); position:absolute; right:-20px; bottom:-40px; line-height:1; pointer-events:none; }
  .balance-label { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .balance-amount { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:300; color:var(--white); line-height:1; margin-bottom:4px; }
  .balance-cents { font-size:24px; color:var(--gold); }
  .account-scroll { display:flex; gap:12px; overflow-x:auto; margin-bottom:24px; padding-bottom:4px; scrollbar-width:none; }
  .account-scroll::-webkit-scrollbar { display:none; }
  .account-pill { min-width:160px; background:var(--navy3); border:1px solid var(--border); border-radius:14px; padding:16px; cursor:pointer; transition:all .2s; flex-shrink:0; }
  .account-pill.active { border-color:var(--gold); background:rgba(201,168,76,0.06); }
  .account-pill:hover { border-color:var(--gold); }
  .pill-type { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .pill-id { font-size:12px; color:var(--gold); margin-bottom:8px; font-family:monospace; }
  .pill-balance { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:500; }
  .pill-status { display:inline-block; margin-top:6px; padding:2px 8px; border-radius:20px; font-size:10px; letter-spacing:1px; text-transform:uppercase; }
  .pill-status.active-s { background:rgba(76,175,130,0.15); color:var(--green); }
  .pill-status.suspended-s { background:rgba(224,82,82,0.15); color:var(--red); }
  .section-title { font-size:11px; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }
  .quick-actions { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:24px; }
  .qa-btn { background:var(--navy3); border:1px solid var(--border); border-radius:14px; padding:16px 8px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s; }
  .qa-btn:hover { border-color:var(--gold); background:rgba(201,168,76,0.05); }
  .qa-icon { font-size:22px; }
  .qa-label { font-size:10px; color:var(--muted); text-align:center; }
  .txn-list { display:flex; flex-direction:column; gap:2px; }
  .txn-item { background:var(--navy3); border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:14px; }
  .txn-item:hover { background:var(--navy4); }
  .txn-icon { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .txn-icon.dep { background:rgba(76,175,130,0.15); }
  .txn-icon.wth { background:rgba(224,82,82,0.15); }
  .txn-icon.xfr { background:rgba(201,168,76,0.15); }
  .txn-icon.fee { background:rgba(138,149,168,0.15); }
  .txn-details { flex:1; min-width:0; }
  .txn-desc { font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
  .txn-meta { font-size:11px; color:var(--muted); }
  .txn-amount { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:500; flex-shrink:0; }
  .txn-amount.credit { color:var(--green); }
  .txn-amount.debit { color:var(--red); }
  .alert-card { background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.2); border-radius:14px; padding:14px 16px; display:flex; gap:12px; align-items:flex-start; margin-bottom:10px; }
  .alert-card.danger { background:rgba(224,82,82,0.06); border-color:rgba(224,82,82,0.2); }
  .alert-title { font-size:13px; font-weight:500; margin-bottom:2px; }
  .alert-body { font-size:12px; color:var(--muted); line-height:1.5; }
  .page-title { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; color:var(--white); margin-bottom:6px; }
  .page-subtitle { font-size:13px; color:var(--muted); margin-bottom:24px; line-height:1.5; }
  .amount-display { background:var(--navy3); border:1px solid var(--border); border-radius:16px; padding:24px; text-align:center; margin-bottom:24px; }
  .amount-display .currency { font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--gold); vertical-align:super; margin-right:4px; }
  .amount-input { background:none; border:none; outline:none; font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:var(--white); width:180px; text-align:center; -moz-appearance:textfield; }
  .amount-input::-webkit-outer-spin-button, .amount-input::-webkit-inner-spin-button { -webkit-appearance:none; }
  .confirm-box { background:var(--navy3); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:20px; }
  .confirm-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:13px; }
  .confirm-row:last-child { border-bottom:none; }
  .confirm-row span:first-child { color:var(--muted); }
  .success-screen { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 28px; text-align:center; min-height:60vh; }
  .success-ring { width:80px; height:80px; border-radius:50%; background:rgba(76,175,130,0.15); border:1px solid rgba(76,175,130,0.3); display:flex; align-items:center; justify-content:center; font-size:36px; margin-bottom:24px; }
  .success-title { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:400; margin-bottom:10px; }
  .success-sub { font-size:14px; color:var(--muted); margin-bottom:16px; }
  .success-ref { font-family:monospace; font-size:12px; color:var(--gold); background:var(--navy3); padding:8px 16px; border-radius:8px; margin-bottom:24px; }
  .bottom-nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:430px; background:rgba(10,15,30,0.96); backdrop-filter:blur(20px); border-top:1px solid var(--border); display:flex; padding:10px 0 24px; z-index:100; }
  .nav-item { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; padding:6px 0; cursor:pointer; color:var(--muted); border:none; background:none; transition:color .2s; }
  .nav-item.active { color:var(--gold); }
  .nav-icon { font-size:20px; }
  .nav-label { font-size:10px; letter-spacing:.5px; }
  .profile-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,var(--gold),var(--navy4)); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:400; color:var(--navy); margin:0 auto 16px; border:2px solid var(--border); }
  .profile-name { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:400; margin-bottom:4px; text-align:center; }
  .profile-email { font-size:13px; color:var(--muted); margin-bottom:24px; text-align:center; }
  .settings-item { background:var(--navy3); border:1px solid var(--border); border-radius:12px; padding:15px 16px; display:flex; align-items:center; gap:14px; margin-bottom:2px; cursor:pointer; transition:background .15s; }
  .settings-item:hover { background:var(--navy4); }
  .settings-icon { font-size:18px; width:24px; text-align:center; }
  .settings-label { flex:1; font-size:14px; }
  .settings-arrow { color:var(--muted); font-size:12px; }
  .settings-value { font-size:13px; color:var(--muted); }
  .batch-bar { background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.15); border-radius:10px; padding:10px 14px; display:flex; align-items:center; gap:10px; margin-bottom:20px; font-size:12px; color:var(--gold); }
  .batch-dot { width:8px; height:8px; border-radius:50%; background:var(--gold); animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,.1); border-top-color:var(--gold); border-radius:50%; animation:spin .6s linear infinite; display:inline-block; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .divider { height:1px; background:var(--border); margin:20px 0; }
  .back-btn { background:none; border:none; color:var(--gold); font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; padding:0; margin-bottom:20px; display:flex; align-items:center; gap:6px; }
  .tag { display:inline-block; padding:2px 8px; border-radius:20px; font-size:11px; letter-spacing:.5px; text-transform:uppercase; }
  .tag-pending { background:rgba(201,168,76,0.15); color:var(--gold); }
  .tag-approved { background:rgba(76,175,130,0.15); color:var(--green); }
  .tag-rejected { background:rgba(224,82,82,0.15); color:var(--red); }
  .sub-screen { padding:20px 0; }
  .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
  .toggle-row:last-child { border-bottom:none; }
  .toggle-label { font-size:14px; }
  .toggle-sub { font-size:11px; color:var(--muted); margin-top:2px; }
  .toggle { width:44px; height:24px; border-radius:12px; background:var(--navy4); border:1px solid var(--border); position:relative; cursor:pointer; transition:background .2s; flex-shrink:0; }
  .toggle.on { background:var(--gold); border-color:var(--gold); }
  .toggle::after { content:''; position:absolute; width:18px; height:18px; background:var(--white); border-radius:50%; top:2px; left:2px; transition:left .2s; }
  .toggle.on::after { left:22px; }
  .link-row { display:flex; gap:10px; align-items:center; }
  .acct-tag { background:var(--navy3); border:1px solid var(--border); border-radius:8px; padding:6px 12px; font-family:monospace; font-size:12px; color:var(--gold); display:flex; align-items:center; gap:8px; }
  .acct-tag button { background:none; border:none; color:var(--muted); cursor:pointer; font-size:14px; padding:0; }
  .acct-tag button:hover { color:var(--red); }
  .search-bar { position:relative; margin-bottom:20px; }
  .search-input { width:100%; background:var(--navy3); border:1px solid var(--border); border-radius:12px; padding:12px 16px; padding-right:44px; color:var(--white); font-family:'DM Sans',sans-serif; font-size:15px; outline:none; transition:border-color .2s, box-shadow .2s; }
  .search-input:focus { border-color:var(--gold); box-shadow:0 0 0 2px rgba(201,168,76,0.15); }
  .search-clear { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--muted); font-size:18px; cursor:pointer; padding:4px; line-height:1; }
  .search-clear:hover { color:var(--white); }
  .no-match-msg { text-align:center; padding:14px; font-size:13px; color:var(--muted); }
  .pending-badge { display:inline-block; margin-left:6px; font-size:10px; color:var(--gold); background:rgba(201,168,76,0.15); padding:1px 6px; border-radius:10px; vertical-align:middle; }
  .detail-card { background:var(--navy3); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:16px; }
  .detail-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:14px; }
  .detail-row:last-child { border-bottom:none; }
  .detail-row span:first-child { color:var(--muted); }
  .detail-balance { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; text-align:center; margin:16px 0; }
  .detail-actions { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(Math.abs(n));
const fmtFull = (n) => `${n < 0 ? "-" : ""}${fmt(n)}`;
const txnIcon = (type) => ({ DEP:"↓", WTH:"↑", WDR:"↑", XFR:"⇄", FEE:"●" }[type] || "●");
const txnClass = (type) => ({ DEP:"dep", WTH:"wth", WDR:"wth", XFR:"xfr", FEE:"fee" }[type] || "fee");
const isCredit = (type) => type === "DEP";
const greeting = (t) => {
  const h = new Date().getHours();
  return h < 12 ? t.goodMorning : h < 17 ? t.goodAfternoon : t.goodEvening;
};
const getToken = () => localStorage.getItem("zntr_token");
const setToken = (tok) => tok ? localStorage.setItem("zntr_token", tok) : localStorage.removeItem("zntr_token");

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL = "/api";

async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  const t = token || getToken();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  if (res.status === 401) {
    setToken(null);
    throw new Error("SESSION_EXPIRED");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  if (res.headers.get("content-type")?.includes("text/csv")) return res;
  return res.json();
}

const api = {
  register: (email, name, password, language) =>
    apiFetch("/auth/register", { method:"POST", body: JSON.stringify({ email, name, password, language }) }),
  login: (email, password) =>
    apiFetch("/auth/login", { method:"POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch("/auth/logout", { method:"POST" }),
  getMe: () => apiFetch("/auth/me"),
  updateMe: (fields) => apiFetch("/auth/me", { method:"PATCH", body: JSON.stringify(fields) }),
  changePassword: (old_password, new_password) =>
    apiFetch("/auth/change-password", { method:"POST", body: JSON.stringify({ old_password, new_password }) }),
  updateNotifications: (prefs) =>
    apiFetch("/auth/notifications", { method:"PATCH", body: JSON.stringify(prefs) }),
  getAccounts: () => apiFetch("/accounts"),
  getTransactions: (accountId) => {
    const q = accountId ? `?account_id=${accountId}&limit=50` : "?limit=50";
    return apiFetch(`/transactions/ledger${q}`);
  },
  deposit: (account_id, amount, description) =>
    apiFetch("/transactions/deposit", { method:"POST", body: JSON.stringify({ account_id, amount: parseFloat(amount), description }) }),
  withdraw: (account_id, amount, description) =>
    apiFetch("/transactions/withdraw", { method:"POST", body: JSON.stringify({ account_id, amount: parseFloat(amount), description }) }),
  transfer: (from_account_id, to_account_id, amount, description) =>
    apiFetch("/transactions/transfer", { method:"POST", body: JSON.stringify({ from_account_id, to_account_id, amount: parseFloat(amount), description }) }),
  createAccount: (name, type) =>
    apiFetch("/accounts", { method:"POST", body: JSON.stringify({ name, type }) }),
  closeAccount: (account_id) =>
    apiFetch(`/accounts/${account_id}`, { method:"DELETE" }),
  linkAccount: (account_id) =>
    apiFetch("/auth/accounts/link", { method:"POST", body: JSON.stringify({ account_id }) }),
  unlinkAccount: (account_id) =>
    apiFetch(`/auth/accounts/${account_id}/unlink`, { method:"DELETE" }),
  downloadStatement: (account_id) =>
    apiFetch(`/auth/statement${account_id ? `?account_id=${account_id}` : ""}`),
};

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, lang, setLang, t }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email:"", password:"", name:"", confirmPw:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    setError("");
    if (!form.email || !form.password) { setError(t.fieldRequired); return; }
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await api.login(form.email, form.password);
        setToken(res.token);
        onLogin({ ...res.user, account_ids: res.account_ids || [] }, res.token);
      } else {
        if (!form.name) { setError(t.fieldRequired); setLoading(false); return; }
        const res = await api.register(form.email, form.name, form.password, lang);
        setToken(res.token);
        onLogin({ ...res.user, account_ids: [] }, res.token);
      }
    } catch (e) {
      setError(e.message === "Email already registered" ? t.registerError : e.message || t.loginError);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero" style={{ position:"relative" }}>
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
          <button className={`lang-btn ${lang === "fr" ? "active" : ""}`} onClick={() => setLang("fr")}>FR</button>
        </div>
        <div className="auth-logo">ZENTR<span>A</span></div>
        <div className="auth-tagline">{t.tagline}</div>
      </div>
      <div className="auth-body">
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>{t.signIn}</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>{t.openAccount}</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {tab === "register" && (
          <div className="field">
            <label>{t.name}</label>
            <input type="text" placeholder="Marck Pierre" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>{t.email}</label>
          <input type="email" placeholder="you@zentra.bank" value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
        <div className="field">
          <label>{t.password}</label>
          <input type="password" placeholder={tab === "register" ? t.minPw : "••••••••"} value={form.password} onChange={e => set("password", e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="btn-primary" onClick={handle} disabled={loading}>
          {loading ? <><span className="spinner" /> {tab === "login" ? t.signingIn : t.creating}</> : (tab === "login" ? t.signIn : t.openAccount)}
        </button>
      </div>
    </div>
  );
}

// ─── TRANSACTION FLOW (shared confirm→success pattern) ───────────────────────
function TxnFlow({ t, accounts, onBack, mode, onTxnSuccess, defaultAccountId }) {
  const [amount, setAmount] = useState("");
  const [acctId, setAcctId] = useState(defaultAccountId || accounts[0]?.id || "");
  const [toAcctId, setToAcctId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [desc, setDesc] = useState(
    mode === "deposit" ? "PORTAL DEPOSIT" : mode === "withdraw" ? "PORTAL WITHDRAWAL" : "PORTAL TRANSFER"
  );
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");

  const acct = accounts.find(a => a.id === acctId);
  const isOverdraft = mode !== "deposit" && acct && parseFloat(amount) > acct.balance + (acct.overdraftLimit || 0);

  const titles = { deposit: t.depositFunds, withdraw: t.withdrawFunds, transfer: t.transferFunds };
  const subs   = { deposit: t.depositSub,   withdraw: t.withdrawSub,   transfer: t.transferSub };
  const confirmLabels = { deposit: t.confirmDeposit, withdraw: t.confirmWithdraw, transfer: t.confirmTransfer };
  const successTitles = { deposit: t.depositSuccess, withdraw: t.withdrawSuccess, transfer: t.transferSuccess };

  const submit = async () => {
    if (step === "form") { setStep("confirm"); return; }
    setLoading(true); setError("");
    try {
      let res;
      if (mode === "deposit")  res = await api.deposit(acctId, amount, desc);
      if (mode === "withdraw") res = await api.withdraw(acctId, amount, desc);
      if (mode === "transfer") res = await api.transfer(acctId, toAcctId, amount, desc);
      setRef(res.reference);
      setStep("success");
      if (onTxnSuccess) onTxnSuccess(mode, acctId, toAcctId, parseFloat(amount));
    } catch (e) {
      setError(e.message);
      setStep("form");
    }
    setLoading(false);
  };

  if (step === "success") return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">{successTitles[mode]}</div>
        <div className="success-sub">
          ${fmt(parseFloat(amount))} {mode === "deposit" ? t.depositSuccessSub : mode === "withdraw" ? t.withdrawSuccessSub : t.transferSuccessSub} {acctId}
          {mode === "transfer" && ` ${t.to} ${toAcctId}`}
        </div>
        <div className="success-ref">{t.ref}: {ref}</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:24 }}>{t.fundsAvailable}</div>
        <button className="btn-primary" onClick={onBack}>{t.backToDash}</button>
      </div>
    </div>
  );

  const disabled = !amount || parseFloat(amount) <= 0 || loading || (mode !== "deposit" && isOverdraft) || (mode === "transfer" && acctId === toAcctId);

  return (
    <div className="page">
      <button className="back-btn" onClick={step === "confirm" ? () => setStep("form") : onBack}>
        ← {step === "confirm" ? t.edit : t.back}
      </button>
      <div className="page-title">{step === "form" ? titles[mode] : confirmLabels[mode]}</div>
      <div className="page-subtitle">{subs[mode]}</div>
      {error && <div className="error-msg">{error}</div>}

      <div className="amount-display">
        <span className="currency">$</span>
        {step === "form"
          ? <input className="amount-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          : <span style={{ fontFamily:"Cormorant Garamond", fontSize:52, fontWeight:300 }}>{fmt(parseFloat(amount)||0)}</span>
        }
      </div>

      {isOverdraft && step === "form" && (
        <div className="alert-card danger" style={{ marginBottom:16 }}>
          <span>⚠️</span>
          <div>
            <div className="alert-title">{t.overdraftWarn}</div>
            <div className="alert-body">{t.overdraftWarnBody} {fmtFull((acct?.balance||0) + (acct?.overdraftLimit||0))}.</div>
          </div>
        </div>
      )}

      {step === "form" ? (
        <>
          <div className="field">
            <label>{mode === "deposit" ? t.destination : mode === "withdraw" ? t.source : t.fromAccount}</label>
            <select value={acctId} onChange={e => setAcctId(e.target.value)}>
              {accounts.filter(a => a.status === "A").map(a => (
                <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>
              ))}
            </select>
          </div>
          {mode === "transfer" && (
            <div className="field">
              <label>{t.toAccount}</label>
              <select value={toAcctId} onChange={e => setToAcctId(e.target.value)}>
                {accounts.filter(a => a.id !== acctId && a.status === "A").map(a => (
                  <option key={a.id} value={a.id}>{a.id} — {a.type} ({fmtFull(a.balance)})</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label>{t.description}</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} maxLength={30} />
          </div>
        </>
      ) : (
        <div className="confirm-box">
          <div className="confirm-row"><span>{t.amount}</span><span style={{ color: mode === "deposit" ? "var(--green)" : "var(--red)" }}>{mode !== "deposit" ? "-" : "+"}${fmt(parseFloat(amount))}</span></div>
          <div className="confirm-row"><span>{mode === "transfer" ? t.fromAccount : (mode === "deposit" ? t.destination : t.source)}</span><span>{acctId}</span></div>
          {mode === "transfer" && <div className="confirm-row"><span>{t.toAccount}</span><span>{toAcctId}</span></div>}
          <div className="confirm-row"><span>{t.description}</span><span>{desc}</span></div>
          <div className="confirm-row"><span>{t.processingCobol}</span><span>✓ COBOL Engine</span></div>
          <div className="confirm-row"><span>{t.batchReconcile}</span><span>22:00 EST</span></div>
        </div>
      )}

      <button className="btn-primary" onClick={submit} disabled={disabled}>
        {loading ? <><span className="spinner" /> {t.processing}</> : (step === "form" ? t.continue : t.confirm)}
      </button>
    </div>
  );
}

// ─── NEW ACCOUNT ─────────────────────────────────────────────────────────────
function NewAccountPage({ t, user, onBack, onCreated }) {
  const [form, setForm] = useState({ holderName: user.name, type: "CHECKING", phone: "", dob: "", address: "", purpose: "" });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [draftBanner, setDraftBanner] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zntr_acct_draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.createdBy !== user.email) return;
      setForm({
        holderName: draft.holderName || user.name,
        type: draft.type || "CHECKING",
        phone: draft.phone || "",
        dob: draft.dob || "",
        address: draft.address || "",
        purpose: draft.purpose || "",
      });
      setDraftBanner(true);
    } catch {}
  }, []);

  // Save draft on form change
  useEffect(() => {
    localStorage.setItem("zntr_acct_draft", JSON.stringify({
      ...form, createdBy: user.email, createdAt: new Date().toISOString(),
    }));
  }, [form, user.email]);

  const types = [
    { key:"CHECKING",    icon:"💳", label:t.checking,    desc:t.checkingDesc,   fee:"$12.00", od:"$500.00", rate:"0.05%" },
    { key:"SAVINGS",     icon:"🏦", label:t.savings,     desc:t.savingsDesc,    fee:"$5.00",  od:t.noneOD,  rate:"2.15%" },
    { key:"MONEY_MARKET",icon:"📈", label:t.moneyMarket, desc:t.mmDesc,         fee:"$15.00", od:t.noneOD,  rate:"3.80%" },
  ];
  const selected = types.find(tp => tp.key === form.type);
  const purposes = [
    { key:"", label:"—" },
    { key:"personal", label:t.purposePersonal },
    { key:"business", label:t.purposeBusiness },
    { key:"savings", label:t.purposeSavings },
    { key:"emergency", label:t.purposeEmergency },
    { key:"other", label:t.purposeOther },
  ];
  const today = new Date().toISOString().split("T")[0];
  const canSubmit = form.holderName.trim().length >= 2 && !loading;

  const create = async () => {
    if (form.holderName.trim().length < 2) { setNameError(t.nameRequired); return; }
    setNameError("");
    setLoading(true); setError("");
    try {
      const res = await api.createAccount(form.holderName.trim(), form.type);
      await api.linkAccount(res.id);
      localStorage.removeItem("zntr_acct_draft");
      setCreated(res);
      if (onCreated) onCreated();
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  if (created) return (
    <div className="page">
      <div className="success-screen">
        <div className="success-ring">✓</div>
        <div className="success-title">{t.openNewAccount}</div>
        <div className="success-ref">{created.id}</div>
        <div style={{ fontSize:15, marginBottom:4 }}>{form.holderName}</div>
        <div className="success-sub">{created.type}</div>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>{t.createdBy}: {user.email}</div>
        <div style={{ fontSize:12, color:"var(--green)", marginBottom:24 }}>{t.infoSaved}</div>
        <button className="btn-primary" onClick={onBack}>{t.backToDash}</button>
      </div>
    </div>
  );

  const optFieldStyle = { borderStyle: "dashed" };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.openNewAccount}</div>
      <div className="page-subtitle">{t.openNewSub}</div>
      {error && <div className="error-msg">{error}</div>}

      {draftBanner && (
        <div style={{ background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, fontSize:13, color:"var(--gold)" }}>
          <span>{t.draftRestored}</span>
          <button onClick={() => setDraftBanner(false)} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 }}>×</button>
        </div>
      )}

      {/* ── Account Holder ── */}
      <div className="section-title" style={{ color:"var(--gold)", marginBottom:12 }}>{t.holderSection}</div>
      <div className="field">
        <label>{t.holderName} *</label>
        <input type="text" value={form.holderName} onChange={e => { set("holderName", e.target.value); setNameError(""); }} placeholder="Jean Dupont" />
        {nameError && <div style={{ fontSize:12, color:"var(--red)", marginTop:4 }}>{nameError}</div>}
      </div>

      {/* ── Account Configuration ── */}
      <div className="section-title" style={{ color:"var(--gold)", marginTop:20, marginBottom:12 }}>{t.configSection}</div>
      {types.map(a => (
        <div key={a.key} onClick={() => set("type", a.key)}
          style={{ background: form.type===a.key ? "rgba(201,168,76,0.06)" : "var(--navy3)", border:`1px solid ${form.type===a.key?"var(--gold)":"var(--border)"}`, borderRadius:14, padding:"18px 16px", marginBottom:10, cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start", transition:"all .2s" }}>
          <div style={{ fontSize:28 }}>{a.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:500, marginBottom:4, fontSize:15 }}>{a.label}</div>
            <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5 }}>{a.desc}</div>
          </div>
          {form.type === a.key && <div style={{ color:"var(--gold)", fontSize:18, flexShrink:0 }}>✓</div>}
        </div>
      ))}
      {selected && (
        <div className="confirm-box" style={{ marginTop:6 }}>
          <div className="section-title" style={{ marginBottom:8 }}>{t.accountTerms}</div>
          <div className="confirm-row"><span>{t.monthlyFee}</span><span>{selected.fee}</span></div>
          <div className="confirm-row"><span>{t.overdraftLimit}</span><span>{selected.od}</span></div>
          <div className="confirm-row"><span>{t.interestRate}</span><span>{selected.rate} {t.apy}</span></div>
          <div className="confirm-row"><span>Processing</span><span>{t.cobolProcessing}</span></div>
        </div>
      )}

      {/* ── Additional Information (Optional) ── */}
      <div className="section-title" style={{ color:"var(--gold)", marginTop:24, marginBottom:12 }}>
        {t.additionalSection} <span style={{ color:"var(--muted)", fontSize:10, fontWeight:400, letterSpacing:1 }}>({t.optional})</span>
      </div>
      <div className="field">
        <label>{t.phone}</label>
        <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+509 5550 0000" style={optFieldStyle} />
      </div>
      <div className="field">
        <label>{t.dob}</label>
        <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} max={today} style={optFieldStyle} />
      </div>
      <div className="field">
        <label>{t.address}</label>
        <input type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main St, Plaine Du Nord, Nord" style={optFieldStyle} />
      </div>
      <div className="field">
        <label>{t.accountPurpose}</label>
        <select value={form.purpose} onChange={e => set("purpose", e.target.value)} style={optFieldStyle}>
          {purposes.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      <button className="btn-primary" style={{ marginTop:16 }} onClick={create} disabled={!canSubmit}>
        {loading ? <><span className="spinner" /></> : t.openAccountBtn}
      </button>
    </div>
  );
}

// ─── ACCOUNT DETAIL ──────────────────────────────────────────────────────────
function AccountDetailPage({ t, account, onBack, onNav, onSelectAccount }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    api.getTransactions(account.id)
      .then(data => setTxns((data.transactions || []).sort((a, b) => (b.date || "").localeCompare(a.date || ""))))
      .catch(() => setTxns([]))
      .finally(() => setLoading(false));
  }, [account?.id]);

  if (!account) return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <p style={{ color: "var(--muted)" }}>{t.accountNotFound}</p>
    </div>
  );

  const goTxn = (mode) => {
    if (onSelectAccount) onSelectAccount(account);
    onNav(mode);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ fontFamily: "monospace", fontSize: 18, color: "var(--gold)" }}>{account.id}</div>
        <span className={`pill-status ${account.status === "A" ? "active-s" : "suspended-s"}`}>
          {account.status === "A" ? t.active : t.suspended}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20, textTransform: "uppercase", letterSpacing: 2 }}>{account.type}</div>

      <div className="detail-card">
        <div className="detail-balance" style={{ color: account.balance < 0 ? "var(--red)" : "var(--white)" }}>
          <span style={{ fontSize: 20, color: "var(--gold)", verticalAlign: "super", marginRight: 4 }}>$</span>
          {fmtFull(account.balance)}
        </div>
        <div className="detail-row"><span>{t.owner}</span><span>{account.name}</span></div>
        <div className="detail-row"><span>{t.accounts}</span><span>{account.type}</span></div>
        <div className="detail-row"><span>{t.overdraftLimit}</span><span>${fmt(account.overdraftLimit || 0)}</span></div>
      </div>

      <div className="detail-actions">
        <button className="btn-sm" onClick={() => goTxn("deposit")}>↓ {t.deposit}</button>
        <button className="btn-sm" onClick={() => goTxn("withdraw")}>↑ {t.withdraw}</button>
        <button className="btn-sm" onClick={() => goTxn("transfer")}>⇄ {t.transfer}</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <p className="section-title">{t.transactionHistory || t.recentTxns}</p>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>
        ) : txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div>{t.noActivity}</div>
          </div>
        ) : (
          <div className="txn-list">
            {txns.map((txn, i) => (
              <div key={i} className="txn-item">
                <div className={`txn-icon ${txnClass(txn.type)}`}>{txnIcon(txn.type)}</div>
                <div className="txn-details">
                  <div className="txn-desc">{txn.description || txn.desc}</div>
                  <div className="txn-meta">{txn.date} · <span className={`tag tag-${txn.status === "APR" ? "approved" : txn.status === "PND" ? "pending" : "rejected"}`}>{txn.status}</span></div>
                </div>
                <div className={`txn-amount ${isCredit(txn.type) ? "credit" : "debit"}`}>
                  {isCredit(txn.type) ? "+" : "-"}${fmt(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function HistoryPage({ t, accounts, onBack }) {
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [acctFilter, setAcctFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTransactions(acctFilter === "ALL" ? null : acctFilter)
      .then(data => setTxns(data.transactions || []))
      .catch(() => setTxns([]))
      .finally(() => setLoading(false));
  }, [acctFilter]);

  const filtered = txns.filter(t => filter === "ALL" || t.type === filter || (filter === "WTH" && t.type === "WDR"));

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.transactionHistory}</div>
      <div className="page-subtitle">{filtered.length} {t.found}</div>
      <div className="field">
        <label>{t.filterAccount}</label>
        <select value={acctFilter} onChange={e => setAcctFilter(e.target.value)}>
          <option value="ALL">{t.allAccounts}</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.type}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto" }}>
        {[["ALL",t.all],["DEP",t.deposits],["WTH",t.withdrawals],["XFR",t.transfers],["FEE",t.fees]].map(([key,label]) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding:"6px 14px", borderRadius:20, border:"1px solid", borderColor: filter===key?"var(--gold)":"var(--border)", background: filter===key?"rgba(201,168,76,0.1)":"transparent", color: filter===key?"var(--gold)":"var(--muted)", fontSize:12, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"DM Sans,sans-serif" }}>
            {label}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:"center", padding:40 }}><span className="spinner" /></div> : (
        <div className="txn-list">
          {filtered.length === 0
            ? <div style={{ textAlign:"center", color:"var(--muted)", padding:40 }}>{t.noTxns}</div>
            : filtered.map((txn, i) => (
              <div key={i} className="txn-item">
                <div className={`txn-icon ${txnClass(txn.type)}`}>{txnIcon(txn.type)}</div>
                <div className="txn-details">
                  <div className="txn-desc">{txn.description || txn.desc}</div>
                  <div className="txn-meta">{txn.date} · {txn.account_id || txn.acct} · <span className={`tag tag-${txn.status==="APR"?"approved":txn.status==="PND"?"pending":"rejected"}`}>{txn.status}</span></div>
                </div>
                <div className={`txn-amount ${isCredit(txn.type)?"credit":"debit"}`}>
                  {isCredit(txn.type)?"+":"-"}${fmt(txn.amount)}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── PROFILE SUBPAGES ─────────────────────────────────────────────────────────
function PersonalInfoPage({ t, user, onBack, onUpdated }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const save = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await api.updateMe({ name: form.name, phone: form.phone });
      onUpdated({ ...user, name: res.name, phone: res.phone });
      setMsg(t.saved);
    } catch(e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.personalInfo}</div>
      {msg && <div className={msg === t.saved ? "success-msg" : "error-msg"}>{msg}</div>}
      <div className="field"><label>{t.name}</label><input type="text" value={form.name} onChange={e => set("name",e.target.value)} /></div>
      <div className="field"><label>{t.email}</label><input type="email" value={user.email} disabled style={{ opacity:.5 }} /></div>
      <div className="field"><label>{t.phone}</label><input type="tel" value={form.phone} onChange={e => set("phone",e.target.value)} placeholder="+1 (555) 000-0000" /></div>
      <button className="btn-primary" onClick={save} disabled={loading}>
        {loading ? <><span className="spinner" /> {t.saving}</> : t.save}
      </button>
    </div>
  );
}

function SecurityPage({ t, onBack }) {
  const [form, setForm] = useState({ old:"", new1:"", new2:"" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text:"", ok:false });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const update = async () => {
    if (form.new1 !== form.new2) { setMsg({ text:t.pwMismatch, ok:false }); return; }
    if (form.new1.length < 8)    { setMsg({ text:t.minPw, ok:false }); return; }
    setLoading(true); setMsg({ text:"", ok:false });
    try {
      await api.changePassword(form.old, form.new1);
      setMsg({ text:t.pwUpdated, ok:true });
      setForm({ old:"", new1:"", new2:"" });
    } catch(e) { setMsg({ text: e.message.includes("incorrect") ? t.pwWrong : e.message, ok:false }); }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.securityPw}</div>
      {msg.text && <div className={msg.ok ? "success-msg" : "error-msg"}>{msg.text}</div>}
      <div className="field"><label>{t.currentPw}</label><input type="password" value={form.old} onChange={e => set("old",e.target.value)} /></div>
      <div className="field"><label>{t.newPw}</label><input type="password" value={form.new1} onChange={e => set("new1",e.target.value)} /></div>
      <div className="field"><label>{t.confirmNewPw}</label><input type="password" value={form.new2} onChange={e => set("new2",e.target.value)} /></div>
      <button className="btn-primary" onClick={update} disabled={loading || !form.old || !form.new1}>
        {loading ? <><span className="spinner" /></> : t.updatePw}
      </button>
    </div>
  );
}

function NotificationsPage({ t, user, onBack, onUpdated }) {
  const [prefs, setPrefs] = useState({
    notif_low_bal: user.notif_low_bal ?? true,
    notif_txn:     user.notif_txn     ?? true,
    notif_batch:   user.notif_batch   ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await api.updateNotifications(prefs);
      onUpdated({ ...user, ...prefs });
      setMsg(t.notifSaved);
    } catch(e) { setMsg(e.message); }
    setSaving(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.notifPrefs}</div>
      {msg && <div className="success-msg">{msg}</div>}
      <div className="confirm-box" style={{ marginBottom:20 }}>
        {[["notif_low_bal", t.notifLowBal], ["notif_txn", t.notifTxn], ["notif_batch", t.notifBatch]].map(([key, label]) => (
          <div key={key} className="toggle-row">
            <div>
              <div className="toggle-label">{label}</div>
            </div>
            <div className={`toggle ${prefs[key] ? "on" : ""}`} onClick={() => toggle(key)} />
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={save} disabled={saving}>
        {saving ? <><span className="spinner" /></> : t.save}
      </button>
    </div>
  );
}

function StatementPage({ t, accounts, onBack }) {
  const [acctId, setAcctId] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const download = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await api.downloadStatement(acctId === "ALL" ? null : acctId);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `zentra_statement_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(t.saved);
    } catch(e) { setMsg(e.message); }
    setLoading(false);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← {t.back}</button>
      <div className="page-title">{t.stmtDownload}</div>
      <div className="page-subtitle">{t.stmtSub}</div>
      {msg && <div className="success-msg">{msg}</div>}
      <div className="field">
        <label>{t.filterAccount}</label>
        <select value={acctId} onChange={e => setAcctId(e.target.value)}>
          <option value="ALL">{t.allAccounts}</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.id} — {a.type}</option>)}
        </select>
      </div>
      <div style={{ background:"var(--navy3)", border:"1px solid var(--border)", borderRadius:14, padding:20, marginBottom:20, textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>📄</div>
        <div style={{ fontFamily:"Cormorant Garamond", fontSize:20, marginBottom:4 }}>CSV Export</div>
        <div style={{ fontSize:12, color:"var(--muted)" }}>Date · Account · Type · Amount · Description · Status</div>
      </div>
      <button className="btn-primary" onClick={download} disabled={loading}>
        {loading ? <><span className="spinner" /></> : t.stmtBtn}
      </button>
    </div>
  );
}

// ─── PROFILE PAGE ────────────────────────────────────────────────────────────
function ProfilePage({ t, user, accounts, onLogout, onNav, onUpdated, lang, setLang }) {
  const [subScreen, setSubScreen] = useState(null);
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();

  if (subScreen === "personal") return <PersonalInfoPage t={t} user={user} onBack={() => setSubScreen(null)} onUpdated={onUpdated} />;
  if (subScreen === "security") return <SecurityPage t={t} onBack={() => setSubScreen(null)} />;
  if (subScreen === "notifs")   return <NotificationsPage t={t} user={user} onBack={() => setSubScreen(null)} onUpdated={onUpdated} />;
  if (subScreen === "statement") return <StatementPage t={t} accounts={accounts} onBack={() => setSubScreen(null)} />;

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    setToken(null);
    onLogout();
  };

  return (
    <div className="page">
      <div style={{ textAlign:"center", paddingTop:20 }}>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
        {[
          { label:t.accounts, value: accounts.length },
          { label:"Balance", value: fmtFull(accounts.reduce((s,a) => s+a.balance, 0)) },
          { label:"Batch", value: "22:00" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--navy3)", border:"1px solid var(--border)", borderRadius:12, padding:14, textAlign:"center" }}>
            <div style={{ fontFamily:"Cormorant Garamond", fontSize:20, fontWeight:400, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:10, letterSpacing:1, color:"var(--muted)", textTransform:"uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-title">{t.accounts}</div>
      {[
        { icon:"👤", label:t.personalInfo,  action:() => setSubScreen("personal") },
        { icon:"🔐", label:t.securityPw,    action:() => setSubScreen("security") },
        { icon:"🔔", label:t.notifPrefs,    action:() => setSubScreen("notifs") },
        { icon:"📄", label:t.downloadStmt,  action:() => setSubScreen("statement") },
      ].map(s => (
        <div key={s.label} className="settings-item" onClick={s.action}>
          <div className="settings-icon">{s.icon}</div>
          <div className="settings-label">{s.label}</div>
          <div className="settings-arrow">›</div>
        </div>
      ))}

      <div className="divider" />
      <div className="section-title">Platform</div>
      {[
        { icon:"⚙️", label:t.cobolSchedule, value:"22:00 EST", action:null },
        { icon:"📊", label:t.opsDashboard,  action:() => window.open("/", "_blank") },
        { icon:"🔗", label:t.apiDocs,        action:() => window.open("/api/docs", "_blank") },
      ].map(s => (
        <div key={s.label} className="settings-item" onClick={s.action} style={{ cursor: s.action ? "pointer" : "default" }}>
          <div className="settings-icon">{s.icon}</div>
          <div className="settings-label">{s.label}</div>
          {s.value && <div className="settings-value">{s.value}</div>}
          {s.action && <div className="settings-arrow">↗</div>}
        </div>
      ))}

      <div className="divider" />
      <div className="section-title">{t.language}</div>
      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        {[["en","English"],["fr","Français"]].map(([code, label]) => (
          <button key={code} onClick={async () => { setLang(code); try { await api.updateMe({ language: code }); } catch {} }}
            style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${lang===code?"var(--gold)":"var(--border)"}`, background: lang===code?"rgba(201,168,76,0.08)":"var(--navy3)", color: lang===code?"var(--gold)":"var(--muted)", fontFamily:"DM Sans,sans-serif", fontSize:14, cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <button className="btn-danger" onClick={handleLogout}>{t.signOut}</button>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ t, user, accounts, transactions, onNav, onSelectAccount, selectedAccount, pendingAccounts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [lowBalDismissed, setLowBalDismissed] = useState(false);
  const [lowBalExpanded, setLowBalExpanded] = useState(false);
  const scrollRef = useRef(null);
  const heroRef = useRef(null);

  const filteredAccounts = searchQuery
    ? accounts.filter(a => a.id.toUpperCase().includes(("ZNT-" + searchQuery).toUpperCase()))
    : accounts;

  // Auto-highlight single match and scroll into view
  useEffect(() => {
    if (filteredAccounts.length === 1 && searchQuery) {
      onSelectAccount(filteredAccounts[0]);
      const el = document.querySelector(`[data-acct="${filteredAccounts[0].id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [filteredAccounts.length, searchQuery]);

  const handleSearchInput = (e) => {
    let val = e.target.value;
    if (!val.startsWith("ZNT-")) val = "ZNT-";
    setSearchQuery(val.slice(4));
  };

  const clearSearch = () => { setSearchQuery(""); onSelectAccount(null); };

  // Derive live selected account from accounts array (selectedAccount state is a stale snapshot)
  const liveSelected = selectedAccount ? accounts.find(a => a.id === selectedAccount.id) || selectedAccount : null;
  const totalBalance = accounts.reduce((s,a) => s + (parseFloat(a.balance) || 0), 0);
  const recentTxns   = transactions.slice(0,4);
  const overdrawnAccts  = accounts.filter(a => (parseFloat(a.balance) || 0) < 0);
  const suspendedAccts  = accounts.filter(a => a.status !== "A");
  const lowBalAccts     = accounts.filter(a => { const b = parseFloat(a.balance) || 0; return b >= 0 && b < 200 && a.status === "A"; });
  const hasAlerts = overdrawnAccts.length > 0 || suspendedAccts.length > 0 || (lowBalAccts.length > 0 && !lowBalDismissed);

  // Reset dismiss if low balance list changes
  const lowBalKey = lowBalAccts.map(a => a.id).join(",");
  useEffect(() => { setLowBalDismissed(false); }, [lowBalKey]);

  const pillStyle = { display:"inline-block", fontFamily:"monospace", fontSize:10, color:"var(--gold)", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:12, padding:"2px 8px", margin:"2px 3px" };

  return (
    <div className="page">
      <div className="greeting">
        <div className="greeting-sub">{greeting(t)}</div>
        <div className="greeting-name">{user.name.split(" ")[0]}</div>
      </div>

      {/* ── Priority 1: Overdraft (critical, individual, capped at 2 + summary) ── */}
      {overdrawnAccts.slice(0, 2).map(a => (
        <div key={a.id} className="alert-card danger">
          <span>⚠️</span>
          <div>
            <div className="alert-title">{t.overdraftTitle} — {a.id}</div>
            <div className="alert-body">{t.overdraftBody.replace("{bal}", fmtFull(a.balance))}</div>
          </div>
        </div>
      ))}
      {overdrawnAccts.length > 2 && (
        <div className="alert-card danger">
          <span>⚠️</span>
          <div>
            <div className="alert-title">{t.overdraftTitle}</div>
            <div className="alert-body">{t.moreOverdrafts.replace("{n}", overdrawnAccts.length - 2)}</div>
          </div>
        </div>
      )}

      {/* ── Priority 2: Suspended (consolidated) ── */}
      {suspendedAccts.length > 0 && (
        <div className="alert-card" style={{ background:"rgba(224,82,82,0.06)", borderColor:"rgba(224,82,82,0.2)" }}>
          <span>⏸️</span>
          <div>
            <div className="alert-title">{t.suspendedAccounts}</div>
            <div style={{ marginTop:6, lineHeight:2 }}>
              {suspendedAccts.map(a => <span key={a.id} style={pillStyle}>{a.id}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* ── Priority 3: Low Balance (consolidated, dismissable) ── */}
      {lowBalAccts.length > 0 && !lowBalDismissed && (
        <div className="alert-card" style={{ position:"relative" }}>
          <span>💛</span>
          <div style={{ flex:1 }}>
            {lowBalAccts.length === 1 ? (
              <>
                <div className="alert-title">{t.lowBalTitle} — {lowBalAccts[0].id}</div>
                <div className="alert-body">{t.lowBalBody.replace("{bal}", fmtFull(lowBalAccts[0].balance))}</div>
              </>
            ) : (
              <>
                <div className="alert-title">{t.lowBalTitle} — {t.lowBalCount.replace("{count}", lowBalAccts.length)}</div>
                <div style={{ marginTop:6, lineHeight:2 }}>
                  {lowBalAccts.map(a => <span key={a.id} style={pillStyle}>{a.id}</span>)}
                </div>
                <button onClick={() => setLowBalExpanded(p => !p)} style={{ background:"none", border:"none", color:"var(--gold)", fontFamily:"DM Sans,sans-serif", fontSize:12, cursor:"pointer", padding:"6px 0 0", display:"flex", alignItems:"center", gap:4 }}>
                  {lowBalExpanded ? t.hideDetails : t.seeDetails}
                  <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform: lowBalExpanded ? "rotate(180deg)" : "none" }}>▾</span>
                </button>
                {lowBalExpanded && (
                  <div style={{ marginTop:8 }}>
                    {lowBalAccts.map(a => (
                      <div key={a.id} style={{ fontSize:12, color:"var(--muted)", padding:"3px 0", display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontFamily:"monospace", color:"var(--gold)" }}>{a.id}</span>
                        <span>${fmt(parseFloat(a.balance) || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <button onClick={() => setLowBalDismissed(true)} title={t.dismissAlert} style={{ position:"absolute", top:10, right:12, background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:14, padding:0, lineHeight:1 }}>×</button>
        </div>
      )}

      <div className="balance-hero" ref={heroRef}>
        {liveSelected ? (
          <>
            <button onClick={() => onSelectAccount(null)} style={{ background:"none", border:"none", color:"var(--gold)", fontFamily:"DM Sans,sans-serif", fontSize:13, cursor:"pointer", padding:0, marginBottom:10, display:"flex", alignItems:"center", gap:4 }}>
              ← {t.viewAllAccounts}
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontFamily:"monospace", fontSize:13, color:"var(--gold)" }}>{liveSelected.id}</span>
              <span style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"var(--muted)" }}>{liveSelected.type}</span>
            </div>
            <div className="balance-amount" style={{ color: (parseFloat(liveSelected.balance)||0) < 0 ? "var(--red)" : "var(--white)" }}>
              <span style={{ fontSize:22, color:"var(--gold)", verticalAlign:"super", marginRight:4 }}>$</span>
              {fmt(parseFloat(liveSelected.balance)||0).split(".")[0]}
              <span className="balance-cents">.{fmt(parseFloat(liveSelected.balance)||0).split(".")[1]}</span>
            </div>
            {(liveSelected.overdraftLimit || 0) > 0 && (
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:6 }}>{t.overdraftLimitLabel}: ${fmt(liveSelected.overdraftLimit)}</div>
            )}
          </>
        ) : (
          <>
            <div className="balance-label">{t.totalPortfolio}</div>
            <div className="balance-amount">
              <span style={{ fontSize:22, color:"var(--gold)", verticalAlign:"super", marginRight:4 }}>$</span>
              {fmt(totalBalance).split(".")[0]}
              <span className="balance-cents">.{fmt(totalBalance).split(".")[1]}</span>
            </div>
          </>
        )}
      </div>

      <div className="batch-bar">
        <div className="batch-dot" />
        <span>{t.batchNote}</span>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          value={"ZNT-" + searchQuery}
          onChange={handleSearchInput}
          placeholder={t.searchPlaceholder}
        />
        {searchQuery && (
          <button className="search-clear" onClick={clearSearch} title={t.searchClear}>×</button>
        )}
      </div>

      <p className="section-title">{t.accounts}</p>
      {accounts.length === 0 && !searchQuery ? (
        <div style={{ textAlign:"center", padding:"32px 16px", background:"var(--navy3)", border:"1px solid var(--border)", borderRadius:14, marginBottom:20 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🏦</div>
          <div style={{ fontSize:14, color:"var(--muted)", marginBottom:16 }}>{t.noAccountsYet}</div>
          <button className="btn-sm" onClick={() => onNav("new-account")}>+ {t.newAccount}</button>
        </div>
      ) : filteredAccounts.length === 0 && searchQuery ? (
        <div className="no-match-msg">{t.noAccountFound}</div>
      ) : (
        <div className="account-scroll" ref={scrollRef}>
          {filteredAccounts.map(a => (
            <div key={a.id} data-acct={a.id} className={`account-pill ${selectedAccount?.id === a.id ? "active" : ""}`} onClick={() => { if (selectedAccount?.id === a.id) { onNav("account-detail"); } else { onSelectAccount(a); heroRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }); } }}>
              <div className="pill-type">{a.type}</div>
              <div className="pill-id">{a.id}</div>
              <div className="pill-balance" style={{ color: (parseFloat(a.balance)||0)<0?"var(--red)":"var(--white)" }}>
                {fmtFull(parseFloat(a.balance)||0)}
                {pendingAccounts?.has(a.id) && <span className="pending-badge">({t.pendingLabel})</span>}
              </div>
              <span className={`pill-status ${a.status==="A"?"active-s":"suspended-s"}`}>{a.status==="A"?t.active:t.suspended}</span>
            </div>
          ))}
          <div className="account-pill" style={{ borderStyle:"dashed", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => onNav("new-account")}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>+</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{t.newAccount}</div>
            </div>
          </div>
        </div>
      )}

      <p className="section-title">{t.quickActions}</p>
      <div className="quick-actions">
        {[["↓",t.deposit,"deposit"],["↑",t.withdraw,"withdraw"],["⇄",t.transfer,"transfer"],["📄",t.history,"history"]].map(([icon,label,nav]) => (
          <div key={nav} className="qa-btn" onClick={() => onNav(nav)}>
            <div className="qa-icon">{icon}</div>
            <div className="qa-label">{label}</div>
          </div>
        ))}
      </div>

      <p className="section-title">{t.recentTxns}</p>
      <div className="txn-list">
        {recentTxns.map((txn,i) => (
          <div key={i} className="txn-item">
            <div className={`txn-icon ${txnClass(txn.type)}`}>{txnIcon(txn.type)}</div>
            <div className="txn-details">
              <div className="txn-desc">{txn.description || txn.desc}</div>
              <div className="txn-meta">{txn.date} · <span className={`tag tag-${txn.status==="APR"?"approved":txn.status==="PND"?"pending":"rejected"}`}>{txn.status}</span></div>
            </div>
            <div className={`txn-amount ${isCredit(txn.type)?"credit":"debit"}`}>
              {isCredit(txn.type)?"+":"-"}${fmt(txn.amount)}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-ghost" style={{ marginTop:12 }} onClick={() => onNav("history")}>{t.viewAll}</button>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function ZentraPortal() {
  const [user, setUser]                   = useState(null);
  const [lang, setLang]                   = useState("en");
  const [screen, setScreen]               = useState("dashboard");
  const [accounts, setAccounts]           = useState([]);
  const [transactions, setTransactions]   = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pendingAccounts, setPendingAccounts] = useState(new Set());
  const [dataLoading, setDataLoading]     = useState(false);
  const t = T[lang];

  // Restore session on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.getMe()
      .then(u => { setUser(u); setLang(u.language || "en"); })
      .catch(() => setToken(null));
  }, []);

  // Load real data when user is set — filter accounts by ownership
  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    const ownedIds = user.account_ids || [];
    Promise.all([
      api.getAccounts().then(d => {
        setAccounts((d.accounts || []).filter(a => ownedIds.includes(a.id)));
      }).catch(() => {}),
      api.getTransactions(null).then(d => setTransactions(d.transactions || [])).catch(() => {}),
    ]).finally(() => setDataLoading(false));
  }, [user]);

  const navTo = useCallback(s => setScreen(s), []);

  const handleLogin = (u) => { setUser(u); setLang(u.language || "en"); setScreen("dashboard"); };
  const handleLogout = () => { setUser(null); setAccounts([]); setTransactions([]); setScreen("dashboard"); };
  const handleAccountCreated = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      const data = await api.getAccounts();
      const ownedIds = u.account_ids || [];
      setAccounts((data.accounts || []).filter(a => ownedIds.includes(a.id)));
    } catch {}
  };
  const handleUserUpdated = (u) => setUser(u);

  const handleTxnSuccess = useCallback((mode, fromId, toId, amount) => {
    // Optimistic balance update — ACCOUNTS-MASTER.dat is only updated by
    // nightly TXN-PROCESSOR batch, so re-fetching would overwrite correct
    // optimistic values with stale pre-transaction balances.
    setAccounts(prev => prev.map(a => {
      if (mode === "deposit" && a.id === fromId) return { ...a, balance: (parseFloat(a.balance) || 0) + amount };
      if (mode === "withdraw" && a.id === fromId) return { ...a, balance: (parseFloat(a.balance) || 0) - amount };
      if (mode === "transfer" && a.id === fromId) return { ...a, balance: (parseFloat(a.balance) || 0) - amount };
      if (mode === "transfer" && a.id === toId) return { ...a, balance: (parseFloat(a.balance) || 0) + amount };
      return a;
    }));
    // Mark affected accounts as pending, clear after 3 seconds
    const pending = new Set([fromId]);
    if (mode === "transfer" && toId) pending.add(toId);
    setPendingAccounts(pending);
    setTimeout(() => setPendingAccounts(new Set()), 3000);
  }, []);

  if (!user) return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <AuthScreen onLogin={handleLogin} lang={lang} setLang={setLang} t={t} />
      </div>
    </>
  );

  const mainScreens = ["dashboard","transfer","deposit","history","profile"];
  const navItems = [
    { icon:"⌂", label:t.home,     screen:"dashboard" },
    { icon:"⇄", label:t.transfer, screen:"transfer" },
    { icon:"↓", label:t.deposit,  screen:"deposit" },
    { icon:"📋",label:t.history,  screen:"history" },
    { icon:"☰", label:t.profile,  screen:"profile" },
  ];

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":  return <Dashboard t={t} user={user} accounts={accounts} transactions={transactions} onNav={navTo} onSelectAccount={setSelectedAccount} selectedAccount={selectedAccount} pendingAccounts={pendingAccounts} />;
      case "deposit":    return <TxnFlow t={t} accounts={accounts} onBack={() => navTo("dashboard")} mode="deposit" onTxnSuccess={handleTxnSuccess} defaultAccountId={selectedAccount?.id} />;
      case "withdraw":   return <TxnFlow t={t} accounts={accounts} onBack={() => navTo("dashboard")} mode="withdraw" onTxnSuccess={handleTxnSuccess} defaultAccountId={selectedAccount?.id} />;
      case "transfer":   return <TxnFlow t={t} accounts={accounts} onBack={() => navTo("dashboard")} mode="transfer" onTxnSuccess={handleTxnSuccess} defaultAccountId={selectedAccount?.id} />;
      case "history":    return <HistoryPage t={t} accounts={accounts} onBack={() => navTo("dashboard")} />;
      case "new-account": return <NewAccountPage t={t} user={user} onBack={() => navTo("dashboard")} onCreated={handleAccountCreated} />;
      case "account-detail": return <AccountDetailPage t={t} account={selectedAccount} onBack={() => navTo("dashboard")} onNav={navTo} onSelectAccount={setSelectedAccount} />;
      case "profile":    return <ProfilePage t={t} user={user} accounts={accounts} onLogout={handleLogout} onNav={navTo} onUpdated={handleUserUpdated} lang={lang} setLang={setLang} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-logo">ZENTR<span>A</span></div>
          <div className="topbar-actions">
            <div className="icon-btn">
              <div className="notif-dot" />🔔
            </div>
            <div className="lang-toggle" style={{ position:"relative", top:"auto", right:"auto" }}>
              <button className={`lang-btn ${lang==="en"?"active":""}`} onClick={() => { setLang("en"); api.updateMe({ language:"en" }).catch(()=>{}); }}>EN</button>
              <button className={`lang-btn ${lang==="fr"?"active":""}`} onClick={() => { setLang("fr"); api.updateMe({ language:"fr" }).catch(()=>{}); }}>FR</button>
            </div>
          </div>
        </div>

        {dataLoading && screen === "dashboard"
          ? <div style={{ display:"flex", justifyContent:"center", padding:60 }}><span className="spinner" /></div>
          : renderScreen()
        }

        {mainScreens.includes(screen) && (
          <nav className="bottom-nav">
            {navItems.map(n => (
              <button key={n.screen} className={`nav-item ${screen===n.screen?"active":""}`} onClick={() => navTo(n.screen)}>
                <div className="nav-icon">{n.icon}</div>
                <div className="nav-label">{n.label}</div>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
