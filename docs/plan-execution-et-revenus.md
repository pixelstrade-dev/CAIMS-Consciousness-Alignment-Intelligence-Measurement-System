# Plan d'exécution, garde-fous & modèle de revenus — HungerPrint

> Ordre des opérations pour Cowork + garde-fous de conformité et de croissance +
> modèle chiffré **honnête** vers l'objectif de 10 000 $/mois au 3ᵉ mois.

---

## A. Ordre d'exécution (pipeline)

**Étape 1 — Création de l'application (FlutterFlow Growth)**
Projet, écrans et parcours selon le cahier des charges, marque, i18n FR/EN,
connexion au repo GitHub `hungerprint`.

**Étape 2 — Connectivité & login (Firebase Auth)**
Firebase lié à FlutterFlow ; **Sign in with Apple**, **Google Sign-In**,
e-mail (lien magique), **mode invité**. Firestore + règles de sécurité.
→ *Jalon : un utilisateur peut faire le test en invité et créer un compte.*

**Étape 3 — Traçabilité & notifications**
GA4 (événements du cahier des charges §9.2), Crashlytics, Performance, Remote
Config, **FCM push** (opt-in + segmentation par animal).
→ *Jalon : les événements remontent, une notif test est reçue.*

**Étape 4 — Textes légaux & réglementaires (soumission conforme)**
Héberger CGU, Confidentialité, CGV (dossier `docs/legal/`, après remplissage des
`[…]` et **relecture avocat**). Remplir **App Privacy (Apple)** et **Data safety
(Google)** selon `docs/legal/app-privacy-data-safety.md`. Disclaimer médical
in-app FR/EN. Consentement **UMP + ATT**.
→ *Jalon : conformité prête pour la revue (objectif : zéro motif de rejet).*

**Étape 5 — Monétisation & configuration des plateformes**
RevenueCat (entitlement `premium`, offres, prix par pays, paywall). AdMob
(blocs app-open/bannière/interstitiel/récompensé/natif, **médiation/bidding**,
capping, premium = zéro pub).
→ *Jalon : achat de test réussi (sandbox) ; pub de test affichée.*

**Étape 6 — Publication & soumission**
Build AAB (Play) + IPA (Apple) via FlutterFlow/Codemagic. Fiches store FR/EN
(`docs/store-listing.md`), tarifs, classification 16+. Déploiement **test interne
(Play)** + **TestFlight (Apple)**, puis **soumission** (après validation du porteur).

**Étape 7 — Vérification & garde-fous**
Passer la checklist §B avant et après soumission.

**Étape 8 — Optimisation des revenus**
Après le lancement : itérer paywall, prix, formats pub, notifications, ASO et
canaux d'acquisition selon les KPIs (§C-D).

---

## B. Garde-fous (checklist de vérification)

**Conformité (bloquant pour la revue)**
- [ ] Aucun mot médical (« diagnostic/traitement/guérir ») ni chiffre de perte garanti.
- [ ] Disclaimer affiché avant le test et sur le résultat, FR + EN.
- [ ] Âge 16+ appliqué ; suppression de compte in-app fonctionnelle.
- [ ] Consentement UMP + ATT **avant** tout tracking pub ; Consent Mode actif.
- [ ] App Privacy / Data safety cohérents avec la réalité technique.
- [ ] Politique de confidentialité liée dans l'app ET les deux stores.
- [ ] Données de santé jamais partagées à des fins publicitaires.

**Technique / qualité**
- [ ] Scoring correct (dominant + secondaire) ; résultats et graphiques cohérents.
- [ ] Carte de résultat partageable opérationnelle (moteur viral).
- [ ] Achats : souscription, restauration, premium = zéro pub.
- [ ] Événements GA4 émis ; Crashlytics actif ; taux de crash < 1 %.
- [ ] FR/EN complets ; bascule de langue OK.

**Croissance (garde-fous « téléchargements »)**
- [ ] 1ʳᵉ capture store = la promesse (4 animaux + « Quel est ton type de faim ? »).
- [ ] Partage en 1 tap testé sur iOS et Android.
- [ ] Demande d'avis native déclenchée après un résultat satisfaisant.
- [ ] 10–20 vidéos courtes prêtes (par animal) pour TikTok/Reels au lancement.

---

## C. KPIs à piloter dès J1
Activation (**% test terminé**, cible > 70 %) · **taux de partage** (viralité, K) ·
conversion **invité→compte** et **gratuit→premium** · rétention **J1/J7/J30** ·
**ARPDAU** (pub) · **LTV**, MRR, churn · note & avis. Règle : on ne scale l'achat
d'installs **que si LTV > CPI** avec marge.

---

## D. Modèle de revenus — objectif 10 000 $/mois au 3ᵉ mois (honnête)

> **Ce n'est pas une garantie.** Voici *ce qu'il faut* pour l'atteindre, avec des
> hypothèses prudentes. Deux moteurs : abonnements + publicité.

### Hypothèses (à ajuster avec les vrais chiffres)
- Revenu net par abonné actif : ~**4–5 $/mois** (après commission store, mix
  mensuel/annuel).
- **ARPDAU** publicitaire (pub aux gratuits, consentement UE réduisant le taux) :
  ~**0,03–0,05 $**.
- Conversion gratuit→premium : **2–4 %** des actifs.
- Ratio **DAU/MAU** : ~15 %.

### Ce qu'il faut pour 10 000 $/mois
| Moteur | Métrique cible | Détail |
|---|---|---|
| Abonnements seuls | **~2 000 abonnés actifs** | 2 000 × 5 $ = 10 000 $/mois |
| → base d'actifs nécessaire | **50 000–100 000 MAU** | selon conversion 2–4 % |
| Publicité seule | **~7 000–11 000 DAU** | 10 000 $ ÷ (0,04 $ × 30 j) ≈ 8 300 DAU |
| → base d'actifs nécessaire | **~50 000–75 000 MAU** | à DAU/MAU 15 % |
| **Mix réaliste** | **~40 000–70 000 MAU** | abonnements + pub combinés |

### Ce que cela implique en téléchargements
Pour tenir une telle base active en ~3 mois, il faut de l'ordre de **plusieurs
centaines de milliers de téléchargements cumulés** (rétention correcte requise),
soit **~4 000–7 000 installs/jour**. Deux façons d'y arriver :
1. **Viralité organique** (le scénario visé) : boucle TikTok/Reels + carte de
   résultat partageable. Peu coûteux mais **incertain** (dépend d'un « hit »).
2. **Acquisition payante** : à un CPI de 1–2 $, 5 000 installs/jour = **5 000–
   10 000 $/jour** de budget → **à ne lancer que si LTV > CPI**.

### Verdict honnête
- **10 000 $/mois au M3 est ambitieux mais possible** *si* l'app crée une vraie
  boucle virale (partage) **et/ou** dispose d'un budget d'acquisition, **avec**
  une bonne rétention et une conversion premium correcte.
- Sans viralité ni budget, l'objectif se décale (M6–M12 plus réaliste).
- **Leviers prioritaires :** (1) taux de complétion du test, (2) partage/viralité,
  (3) rétention J7, (4) conversion premium, (5) ARPDAU. On optimise dans cet ordre.
- Suivre les KPIs (§C) chaque semaine et réallouer les efforts vers le levier le
  plus faible.
