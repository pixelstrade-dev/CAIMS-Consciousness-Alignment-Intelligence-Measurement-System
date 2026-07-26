# Déclarations de confidentialité store — App Privacy (Apple) & Data safety (Google)

> Texte prêt à saisir dans App Store Connect (« App Privacy ») et Google Play
> Console (« Sécurité des données »). ⚠️ **La déclaration doit correspondre
> EXACTEMENT aux SDK réellement activés.** Si une fonction (ex. pub, attribution)
> n'est pas activée au lancement, ne pas la déclarer. Faire vérifier par le
> responsable data.

## Hypothèse de configuration (à confirmer)
SDK/services activés : Firebase Auth, Firestore, Google Analytics (GA4),
Crashlytics, Performance, Firebase Cloud Messaging, Google AdMob (+ médiation),
Google UMP, RevenueCat, achats in-app (Apple/Google). Attribution (AppsFlyer/
Adjust) : **non au lancement** (à ajouter plus tard si besoin).

---

## 1. Données collectées — vue synthétique

| Donnée | Collectée | Liée à l'identité | Utilisée pour le suivi (tracking) | Finalités |
|---|---|---|---|---|
| Adresse e-mail | Oui (si compte) | Oui | Non | Fonctionnalité, compte |
| Nom (facultatif Apple) | Si fourni | Oui | Non | Compte |
| Identifiant utilisateur | Oui | Oui | Non | Fonctionnalité, analytics |
| Identifiants d'appareil (IDFA/GAID) | Oui, **avec consentement** | Oui | **Oui (publicité)** | Publicité, mesure |
| Réponses au questionnaire (santé/bien-être) | Oui | Oui | Non | Fonctionnalité (résultat, programme) |
| Info de santé/forme (poids, objectif — facultatif) | Si saisi | Oui | Non | Fonctionnalité |
| Historique d'achat | Oui | Oui | Non | Fonctionnalité, abonnements |
| Interactions produit / données d'usage | Oui | Oui | Non (si non lié à la pub) | Analytics, amélioration |
| Données de diagnostic (crash, performance) | Oui | Non (recommandé) | Non | Stabilité, performance |
| Jeton de notification push | Si activé | Oui | Non | Notifications |
| Données de consentement | Oui | Oui | Non | Conformité |

> **Localisation :** non collectée par l'app. (Certains réseaux publicitaires
> peuvent déduire une localisation grossière ; le déclarer **uniquement** si la
> médiation l'active réellement.)

---

## 2. Apple — App Privacy (par catégorie)

**Data Used to Track You** (nécessite ATT + consentement) :
- Identifiers → Device ID (IDFA)
- Usage Data → Product Interaction (si transmise aux réseaux pub)

**Data Linked to You :**
- Contact Info → Email Address
- Identifiers → User ID
- Health & Fitness → Health (réponses/poids/objectif) *(si vous saisissez ces données)*
- Purchases → Purchase History
- Usage Data → Product Interaction
- User Content → Other (réponses au questionnaire)

**Data Not Linked to You :**
- Diagnostics → Crash Data, Performance Data

> Renseigner pour chaque type : finalités (App Functionality, Analytics,
> Product Personalization, Third-Party Advertising) cohérentes avec le tableau §1.

---

## 3. Google Play — Data safety (par type)

**Personal info :** Email address (collecté, chiffré en transit, non partagé,
optionnel/ requis selon compte) ; User IDs.
**Health and fitness :** Health info (réponses/poids/objectif — si saisi).
**Financial info :** Purchase history.
**App activity :** App interactions ; (in-app search/other si applicable).
**Device or other IDs :** Device or other IDs (IDFA/GAID — pour la publicité,
avec consentement).
**App info and performance :** Crash logs, Diagnostics.

Pour chaque type, déclarer : **Collected/Shared**, **chiffré en transit (oui)**,
possibilité de **demander la suppression (oui — suppression de compte in-app)**,
et la finalité (App functionality, Analytics, Advertising or marketing,
Personalization, Account management).

---

## 4. Points de conformité à respecter dans la déclaration
- **Publicité / IDFA** : déclarer « utilisé pour le suivi » et n'activer qu'après
  consentement (UMP + ATT). Si la pub n'est pas au lancement, ne pas la déclarer.
- **Données de santé** : ne **jamais** les déclarer comme partagées à des fins
  publicitaires (interdit par Apple 5.1.2 et Google Play).
- **Suppression** : la suppression de compte in-app doit réellement effacer les
  données déclarées supprimables.
- **Cohérence** : la déclaration doit refléter la Politique de Confidentialité et
  la réalité technique. Toute incohérence = motif de rejet.
