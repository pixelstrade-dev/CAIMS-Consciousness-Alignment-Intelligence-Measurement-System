# Prompt pour Cowork — Construire & publier l'application « HungerPrint »

> À coller dans Cowork (Claude qui pilote Chrome). Objectif : construire l'app
> dans FlutterFlow, connecter tout l'écosystème (Firebase, RevenueCat, AdMob,
> GitHub), remplir les informations légales et les fiches store, puis publier
> sur Google Play et l'App Store (comptes déjà ouverts dans Chrome).
> **Le cahier des charges complet est le fichier `docs/HungerPrint-Prompt-Developpement.docx`** (source de vérité pour les écrans, le contenu, le scoring, la monétisation, la traçabilité et la publication).

---

## RÔLE & OBJECTIF

Tu es mon ingénieur produit + growth. Ton objectif final : **une application publiée
sur les deux stores, entièrement instrumentée pour la monétisation (abonnements +
publicité) et la mesure**, prête à générer des téléchargements et du revenu récurrent.
Avant le revenu il faut du **volume de téléchargements et de l'engagement** : soigne
donc le parcours, la carte de résultat partageable (virale) et l'ASO.

**Stack imposée :** FlutterFlow (plan **Growth**) + Firebase + RevenueCat + GitHub + AdMob.

**Comptes déjà ouverts dans Chrome (à réutiliser, ne pas en recréer) :**
- RevenueCat : https://app.revenuecat.com/projects/cae5b05a/settings
- AdMob : https://admob.google.com/home/
- Firebase : https://console.firebase.google.com/
- Google Play Console et App Store Connect (Apple Developer / iTunes Connect) : déjà connectés.

---

## RÈGLES NON NÉGOCIABLES (à respecter partout)

1. **Positionnement non médical** : « test de bien-être », jamais « diagnostic »,
   « traitement », « guérir », « prévenir une maladie ».
2. **Aucune garantie de résultat, aucun chiffre promis** (interdit : « -10 kg »,
   « en 3 semaines »). Formule autorisée : « maigrir, sans garantie de résultat ».
3. **Âge minimum 16+**.
4. **Ne jamais vendre les données de santé/profiling** à des tiers ; usage
   first-party consenti uniquement.
5. **Disclaimer médical** affiché avant le test et sur le résultat, en FR et EN.
6. **Demande-moi confirmation avant toute action irréversible ou payante**
   (soumission store, achat de plan, acceptation d'accords juridiques, paiement).
7. **Ne saisis jamais de code 2FA / mot de passe à ma place** : arrête-toi et
   demande-moi de le faire.

---

## MÉTHODE DE TRAVAIL

- Avance **phase par phase**. À la fin de chaque phase : récapitule ce qui est fait,
  ce qui bloque, et **attends ma validation** avant la suivante.
- Quand une étape nécessite une action humaine (2FA, paiement, signature Apple,
  acceptation d'accords, upload des screenshots), **mets en pause et liste-moi
  exactement quoi faire**.
- Tiens une **checklist d'avancement** que tu mets à jour à chaque phase.
- **Je fournirai moi-même les screenshots** des fiches store.

---

## PHASE 1 — Dépôt GitHub

1. Aller sur https://github.com/new (compte **pixelstrade-dev**).
2. Créer un repo **privé** nommé **`hungerprint`**, cocher « Add a README ».
3. Noter l'URL du repo — il servira à connecter FlutterFlow (push de code).

## PHASE 2 — Projet FlutterFlow (plan Growth)

1. Ouvrir https://app.flutterflow.io, créer un projet **HungerPrint** (blank).
2. Vérifier/activer le **plan Growth** (nécessaire pour code export, GitHub,
   déploiement store, suppression du branding). Me demander avant tout paiement.
3. **Construire l'app selon le cahier des charges** (`HungerPrint-Prompt-Developpement.docx`,
   §5 parcours + §6 contenu). Utiliser la génération de pages par IA de FlutterFlow
   quand c'est possible, puis affiner. Écrans à créer :
   - Splash + détection de langue (FR/EN) + sélecteur.
   - Onboarding (4 animaux, promesse, pastilles, CTA).
   - Disclaimer + confirmation d'âge 16+ (case obligatoire).
   - Consentement (UMP + ATT).
   - Auth : Sign in with Apple, Google, e-mail (lien magique), **Continuer en invité**.
   - Questionnaire : **12 questions** (contenu et poids exacts au §6.1), une par écran,
     barre de progression, retour, avance auto.
   - Calcul **local** du scoring (§6.2) : dominant + secondaire.
   - Résultat : avatar animal (+ secondaire), barres des 4 scores, **carte partageable**
     + bouton Partager (partage natif).
   - Programme : aperçu gratuit + **programme complet premium** (contenu §6.4).
   - Paywall (RevenueCat).
   - Accueil / tableau de bord.
   - Réglages : compte, abonnement, restaurer achats, langue, unités, consentement,
     notifications, liens légaux, **Supprimer mon compte**.
4. Appliquer la marque : couleurs (accent vert #2F7D5B ; Lion #DB9A15 ; Loup #587891 ;
   Renard #DF6335 ; Ours #9A6B3F), thèmes clair/sombre, emojis provisoires 🦁🐺🦊🐻.
5. Configurer **l'internationalisation FR + EN** (toutes les chaînes externalisées).
6. Connecter le projet au **repo GitHub** `hungerprint` (push de code activé).

## PHASE 3 — Firebase

1. Sur https://console.firebase.google.com/, créer le projet **HungerPrint**
   (activer Google Analytics / GA4).
2. Depuis FlutterFlow, lancer l'intégration Firebase automatique (créer/lier les apps
   iOS + Android, télécharger/injecter les fichiers de config).
3. Activer :
   - **Authentication** : Apple, Google, Email link.
   - **Firestore** : collections `users`, `quizResults`, `profiles` (modèle §7).
   - **Google Analytics (GA4)** : instrumenter les événements du §9.2.
   - **Crashlytics** + **Performance Monitoring**.
   - **Cloud Messaging (FCM)** : notifications push.
   - **Remote Config** + **A/B Testing** : prix, paywall, capping pub.
4. Vérifier les règles de sécurité Firestore (accès limité au propriétaire des données).

## PHASE 4 — RevenueCat (projet existant cae5b05a)

1. Ouvrir https://app.revenuecat.com/projects/cae5b05a/settings.
2. Créer/vérifier l'**entitlement** `premium`.
3. Créer les **produits/offres** : essai gratuit, **mensuel** (~4,99–9,99 €),
   **annuel** (~39,99 €), + achat unique optionnel. Prix par pays.
4. Lier les apps **App Store** et **Google Play** (clés/API) — me demander pour les
   étapes nécessitant mes identifiants store.
5. Configurer le **paywall** et l'intégrer dans FlutterFlow (SDK RevenueCat).
   Règle : **premium = zéro publicité**.

## PHASE 5 — AdMob (publicité)

1. Sur https://admob.google.com/home/, créer l'app **HungerPrint** (iOS + Android).
2. Créer les **blocs d'annonces** : app-open, bannière, interstitiel, **récompensé**,
   natif (voir stratégie §8.2).
3. Activer la **médiation / bidding** (ajouter des réseaux : Meta, AppLovin, Unity…)
   pour maximiser l'eCPM.
4. Lier AdMob à Firebase. Intégrer le SDK dans FlutterFlow. Appliquer le **frequency
   capping** ; **pas de pub pendant le test** ; **pas de pub pour les premium**.

## PHASE 6 — Consentement & traçabilité

1. Configurer **Google UMP** (formulaire de consentement RGPD/TCF v2.2) dans AdMob
   → « Confidentialité et messages ». Créer le message GDPR + (option) message ATT.
2. Activer **Consent Mode v2** ; **ATT** sur iOS.
3. Vérifier que **aucun tracking pub** ne se déclenche avant consentement.
4. Vérifier que les **événements GA4** (§9.2) remontent : test_started, test_completed,
   animal_result, result_shared, paywall_viewed, subscription_started, ad_impression,
   push_opened, account_created/deleted, etc.

## PHASE 7 — Informations légales & fiches store

1. **Textes légaux** : générer des versions initiales de **CGU, Politique de
   confidentialité, CGV** (via un générateur réputé ou un template), adaptées à une
   app bien-être 16+, FR + EN. **M'indiquer clairement qu'une validation avocat est
   requise** avant publication définitive. Héberger ces textes (URL publiques) et les
   lier dans l'app et les stores.
2. **Fiches store** (FR + EN), remplies selon §13.2 :
   - Nom : **HungerPrint** (+ sous-titre « Découvre ton type de faim »).
   - Descriptions (accroche non médicale, sans garantie), mots-clés ASO
     (maigrir, perte de poids, régime, faim, test, minceur…).
   - Catégorie Santé/Forme, **classification d'âge 16+**.
3. **Déclarations de confidentialité** : **App Privacy (Apple)** et **Data safety
   (Google Play)** — remplies exactement selon les données réellement collectées.
4. **Je fournirai les screenshots** ; laisse les emplacements prêts.

## PHASE 8 — Build & publication

1. Depuis FlutterFlow (Growth), lancer le **déploiement** :
   - **Android** : générer l'**AAB**, créer la fiche dans **Google Play Console**,
     publier en **test interne** puis production.
   - **iOS** : générer l'**IPA** / build, l'envoyer à **App Store Connect**,
     **TestFlight**, puis soumettre à la revue.
2. Gérer signatures/certificats (Apple signing, keystore Android) — **me demander**
   pour les étapes de signature et d'acceptation d'accords.
3. Renseigner tarifs/disponibilité, conformité, questionnaires de contenu.
4. **Avant toute soumission finale à la revue : me demander validation explicite.**

## PHASE 9 — Points nécessitant mon action (à me lister)

- Codes 2FA / mots de passe (Apple, Google, GitHub…).
- Paiements (plan FlutterFlow Growth, comptes développeur).
- Acceptation des accords Apple/Google et des CGU des plateformes.
- Signature Apple / création du keystore Android.
- Upload des **screenshots** (je m'en charge).
- Validation avocat des textes légaux avant publication définitive.

---

## LIVRABLE ATTENDU

Une app **HungerPrint** buildée dans FlutterFlow, poussée sur GitHub, connectée à
Firebase + RevenueCat + AdMob, avec consentement + analytics + monitoring en place,
textes légaux et fiches store remplis, déployée en **test interne (Play)** et
**TestFlight (Apple)**, prête pour la soumission finale que je validerai.

**Rappelle-toi : conformité d'abord (non médical, sans garantie, 16+), puis
téléchargements/engagement, puis revenu (abonnements + pub).**
