# Cahier des charges — Application mobile « Mon Animal Minceur »

> Application mobile grand public : un **questionnaire simple** détecte le **type
> de faim** de l'utilisateur (4 animaux) et délivre un **résultat + un programme
> de recommandations**. Objectif : **volume de téléchargements élevé**, modèle
> **freemium + publicité**, conforme aux stores et aux lois (UE, US, Suisse,
> monde).

**Version :** 4.0 (complète) · **Date :** 2026-07-26 · **Statut :** MVP à développer
**Langues :** Français + Anglais · **Âge minimum :** 16+ · **Lancement :** mondial par vagues

---

## 0. Note d'honnêteté scientifique (socle du produit)

- **Aucune étude validée** n'utilise les animaux « Lion / Loup / Renard / Ours ».
  Cette nomenclature est un **habillage marketing assumé**.
- La **base scientifique réelle** = les **4 phénotypes de l'obésité** du
  **Dr Andres Acosta (Mayo Clinic)**, publiés dans *Obesity* (2021), sur
  **~450 patients**. Constat clé : ~27 % des patients relèvent de **plusieurs**
  phénotypes → justifie « un animal, ou deux ».
- Les animaux sont une **couche de gamification** sur des phénotypes réels. On ne
  prétend **jamais** à un diagnostic médical.

**Sources :** Acosta et al., *Obesity* 2021
<https://onlinelibrary.wiley.com/doi/10.1002/oby.23120> ·
Mayo Clinic Press <https://mcpress.mayoclinic.org/nutrition-fitness/understanding-obesity-phenotypes/>

---

## 1. Vision, positionnement & promesse

**Problème :** les régimes échouent car ils ignorent *pourquoi* la personne mange.

**Solution :** un test rapide révèle le **type de faim**, puis l'app propose un
**programme adapté** (alimentation, habitudes, mental, activité).

**Promesse (formulation autorisée — à respecter partout) :**
- ✅ « Comprends **comment** tu as faim pour **maigrir** plus intelligemment. »
- ✅ « Un plan adapté à ton type de faim pour t'aider à **perdre du poids
  durablement**. »
- ❌ **Interdit** : toute **garantie** de résultat, tout **chiffre** promis
  (« -10 kg », « en 3 semaines »), tout **KPI de perte** engageant.
- Formule sûre récurrente : **« maigrir, sans garantie de résultat »** /
  « results vary ».

**Cible :** adultes (**16+**) voulant perdre du poids, grand public FR puis EN,
déploiement mondial.

---

## 2. Base scientifique → habillage animal

| Animal | Phénotype (Mayo Clinic) | Description grand public |
|---|---|---|
| 🦁 **Lion** | **Hungry Brain** | « Il te faut de grosses portions pour te sentir rassasié. » |
| 🐺 **Loup** | **Hungry Gut** | « Tu as de nouveau faim peu de temps après avoir mangé. » |
| 🦊 **Renard** | **Emotional Hunger** | « Tu manges sous le coup des émotions. » |
| 🐻 **Ours** | **Slow Burn** | « Ton corps brûle lentement ; tu grossis en mangeant peu. » |

**Multi-types :** 1 animal dominant, souvent 1 secondaire. L'app affiche les deux.

---

## 3. Le questionnaire (cœur fonctionnel — volontairement simple)

- **12 questions**, une à la fois, barre de progression (extensible à 15-20).
- Chaque réponse **marque des points** pour un/plusieurs phénotypes.
- Format : choix multiple / fréquence. Pas de champ libre.
- Axes : satiété pendant le repas (Lion), durée de la satiété (Loup),
  déclencheurs émotionnels (Renard), métabolisme & activité (Ours).
- Profil facultatif : âge, sexe, taille, poids, objectif (pour personnaliser —
  **jamais** de promesse chiffrée).

> ⚠️ Questionnaire et programmes **relus par un(e) diététicien(ne)/médecin**
> avant publication.

---

## 4. Algorithme de détection (scoring simple, sans IA)

1. Compteurs `lion / loup / renard / ours` alimentés par les réponses.
2. Normalisation en %.
3. **Dominant** = max ; **secondaire** = 2ᵉ s'il ≥ 60 % du dominant.
4. Affichage : « Tu es un **Lion**, avec une part de **Renard**. »

Logique **déterministe par règles** : rapide, explicable, sans dépendance IA,
sans coût serveur variable. (Calibration possible en V2 sur données réelles.)

---

## 5. Résultat & programme personnalisé

- **Écran résultat** : avatar animal (+ secondaire), explication courte,
  graphique des 4 scores, **carte partageable**.
- **Programme par type** : le *pourquoi* de la faim, 4 conseils concrets, ce
  qu'il faut limiter.
  - 🦁 Lion → volume/densité (légumes, protéines, fibres).
  - 🐺 Loup → stabilité glycémique (protéines + fibres, repas structurés).
  - 🦊 Renard → gestion émotionnelle (déclencheurs, alternatives, pleine conscience).
  - 🐻 Ours → activation métabolique (activité, sommeil, hydratation, muscle).
- **Aperçu gratuit** + **programme complet premium**.

> ⚠️ Recommandations nutritionnelles **validées par un(e) professionnel(le)**.

---

## 6. Intelligence artificielle — optionnelle, pas structurante

Le cœur (questionnaire + scoring + programmes) **n'utilise pas d'IA** : c'est
simple, rapide, gratuit à faire tourner. **L'IA n'est justifiée que si elle sert
la rétention/monétisation**, en option premium :

- **V2 (optionnel) — coach conversationnel** premium : répond aux questions
  (« que manger ce soir ? ») selon l'animal. Vraie valeur perçue → argument
  d'abonnement.
- **V2 (optionnel) — variateur de programme** : reformuler/varier les plans pour
  éviter la lassitude.

Si retenue : **API Claude (Anthropic)** via fonction serveur (clé **jamais** dans
l'app), garde-fous stricts (pas de conseil médical, redirection pro, refus des
sujets à risque). **Au MVP, l'IA n'est pas requise.**

---

## 7. Framework & plateforme de déploiement (recommandation)

**Objectif : une base de code unique, publication store simple, push intégrées.**

### 7.1 Framework de développement — recommandé : **Flutter**
| Option | Avantages | Verdict |
|---|---|---|
| **Flutter** (Dart) | 1 code → iOS + Android, UI riche et rapide, idéal pour ce type d'app simple et visuelle, gros écosystème, gratuit. | ✅ **Recommandé** |
| React Native (Expo) | JS/TS, très bon aussi, déploiement EAS très simple. | ✅ Alternative solide |
| No-code (FlutterFlow) | Ultra-rapide à prototyper, exporte du Flutter. | Option pour aller vite |

### 7.2 Déploiement store « sans complexité » — recommandé : **Codemagic**
Plateforme **CI/CD** qui **build l'IPA (App Store) et l'APK/AAB (Google Play)** et
**publie automatiquement** en se connectant à vos comptes :
- Connexion **App Store Connect** (clé API Apple) et **Google Play Console**
  (compte de service) → soumission automatisée.
- Gère signatures, certificats, TestFlight, pistes de test Google Play.
- Alternatives équivalentes : **Expo EAS Submit** (si React Native), **Bitrise**,
  **Fastlane** (open source).

> Prérequis **incontournables** (aucune plateforme ne les remplace) :
> **compte Apple Developer (99 $/an)** et **compte Google Play (25 $ unique)**.

### 7.3 Backend léger
- **Supabase** ou **Firebase** : Auth (Apple/Google/e-mail), base de données,
  fonctions serveur, hébergement. Tier gratuit pour démarrer.

### 7.4 Architecture (simple)
```
[App Flutter] → questionnaire → scoring LOCAL → résultat animal + programme
      │
      ├── Auth (Supabase/Firebase)      → compte, sauvegarde, sync
      ├── RevenueCat                    → abonnements / achats
      ├── AdMob + CMP (consentement)    → publicité
      ├── Analytics + Attribution       → mesure (voir §12)
      └── Push (FCM / OneSignal)        → rétention (voir §8)
```

---

## 8. Notifications push (rétention — priorité haute)

- **Moteur** : **Firebase Cloud Messaging (FCM)** (gratuit) ou **OneSignal**
  (le plus simple, segmentation puissante, tier gratuit).
- **Cas d'usage** : rappel de programme, nouveaux contenus, félicitations, retour
  d'un inactif (« ton animal t'attend »), moments clés (matin/soir).
- **Segmentation par type d'animal** → messages personnalisés (fort taux d'ouverture).
- **Conformité** : consentement de notification, opt-out facile, pas d'abus, pas
  de données de santé dans le contenu de la notif.

---

## 9. Comptes & authentification

- **Test d'abord, compte ensuite** : questionnaire **jamais** bloqué (mode
  **invité** par défaut).
- **Sign in with Apple** (obligatoire iOS dès qu'on propose Google — règle 4.8),
  **Google Sign-In**, **e-mail (lien magique)**, **invité**.
- **Vérification d'âge 16+** à l'entrée (déclaration de date de naissance).
- **Suppression de compte in-app obligatoire** (Apple 5.1.1(v) + Google Play).
- Auth via **Supabase/Firebase** ; jetons en stockage sécurisé ; option
  « masquer mon e-mail » d'Apple.
- **Minimisation** : ne collecter que le nécessaire.

---

## 10. Monétisation (modèle réaliste & compliant)

Combinaison de revenus, du plus sain au plus accessoire :

| Levier | Détail | Priorité |
|---|---|---|
| **Freemium / abonnement** | Résultat gratuit (viral) ; **programme complet + coach** payant. ~4,99–9,99 €/mois, ~39,99 €/an. Essai gratuit. | ⭐⭐⭐ |
| **Achat unique** | Débloquer le programme une fois (~19,99 €). | ⭐⭐ |
| **Publicité in-app** | **AdMob** (bannières/interstitiels/récompensées) pour les utilisateurs gratuits. **Contextuelle/consentie, sans données de santé.** | ⭐⭐ |
| **Affiliation** | Produits/services bien-être pertinents (compléments, apps sport), avec transparence. | ⭐ |
| **Web funnel** (avancé) | Test sur le web puis paiement web (hors commission stores). Modèle très rentable des leaders minceur. | ⭐⭐ |

- Paiements stores via **RevenueCat** (obligatoire pour la conformité de
  facturation Apple/Google ; A/B testing des prix/essais).
- **Paywall au pic de motivation** (juste après le résultat).

---

## 11. Monétisation par la donnée — cadre réaliste (à lire absolument)

> 🔴 **Point critique, honnête.** L'idée de **vendre à des publicitaires les
> réponses au questionnaire et le profil de faim/poids n'est PAS réalisable.**
> La documenter comme un axe reviendrait à faire échouer l'app.

### 11.1 Pourquoi la vente de ce profiling est bloquée
- Le type de faim, le poids et l'objectif sont des **données de santé /
  sensibles** : **RGPD art. 9** (interdiction de principe sauf consentement
  explicite et cadre strict), **CCPA/CPRA** (« sensitive personal information »).
- **Apple App Store 5.1.2** et **Google Play (User Data / Health)** **interdisent
  explicitement** d'utiliser ou de **vendre des données de santé à des fins
  publicitaires ou marketing**. → **refus / retrait de l'app**, réputation, amendes.
- Conclusion : **un modèle « je vends le profiling santé aux annonceurs » = app
  bannie.** À **écarter**.

### 11.2 Ce qui crée réellement de la valeur (et reste permis)
La valeur n'est pas de *revendre* la donnée, mais de **l'exploiter en
first-party**, avec consentement :
1. **Personnalisation** (programme, notifs, contenus) → **rétention → LTV**.
   C'est le vrai levier de revenu.
2. **Publicité in-app standard (AdMob)** : ciblage **contextuel/consenti**, **sans
   utiliser les données de santé**.
3. **Ta propre acquisition** : créer des **audiences** sur Meta/TikTok/Google via
   leurs SDK, **avec consentement**, pour **tes** campagnes — sans céder la donnée
   à des tiers.
4. **Statistiques agrégées & anonymisées** (tendances par pays/animal) pour du
   contenu/PR — en gardant à l'esprit que l'anonymisation réelle est exigeante.

### 11.3 L'actif « données » à construire (valorisable et légal)
Un **jeu de données first-party propre, structuré et consenti** est l'actif qui :
- augmente la **LTV** (personnalisation, meilleure rétention),
- améliore le **ROAS** de vos campagnes (audiences, signaux de conversion),
- constitue la **valeur de l'entreprise** (base d'utilisateurs qualifiée).
C'est **ça**, la « couche de connaissance » monétisable — pas sa revente.

---

## 12. Consentement, traçabilité & mesure (standards)

> Objectif : une **stack de tracking conforme** qui maximise la valeur des données
> first-party **sans** enfreindre les règles.

### 12.1 Consentement (obligatoire avant tout tracking)
- **CMP (Consent Management Platform)** implémentant **IAB TCF v2.2** pour l'UE/UK.
- **Google Consent Mode v2** (obligatoire pour AdMob/Analytics dans l'EEE).
- **ATT (App Tracking Transparency)** d'Apple : prompt requis pour tout suivi
  cross-app (IDFA).
- Consentement **granulaire** : analytics / publicité / personnalisation, révocable.

### 12.2 Identité & traçabilité
- **ID utilisateur first-party** (interne, stable) = colonne vertébrale du profil.
- Identifiants publicitaires (IDFA/GAID) **uniquement avec consentement**.
- **Taxonomie d'événements** claire et documentée (voir §21) : install, test
  démarré/terminé, animal obtenu, paywall vu, achat, rétention.

### 12.3 Outils
| Besoin | Outil recommandé |
|---|---|
| Analytics produit | **Firebase Analytics** + **PostHog / Amplitude / Mixpanel** |
| Attribution (UA payante) | **AppsFlyer** ou **Adjust** (SKAdNetwork iOS) |
| Publicité | **AdMob** (+ médiation) avec CMP |
| Consentement | CMP certifiée **IAB TCF v2.2** + **Consent Mode v2** |

### 12.4 Gouvernance
- **Registre des traitements**, politique de conservation, chiffrement.
- Cartographie des **sous-traitants** (analytics, ads, attribution, hébergeur).
- **Suppression/export** des données sur demande (RGPD/CCPA).

---

## 13. Monitoring technique (qualité & fiabilité)

- **Crash reporting** : **Firebase Crashlytics** ou **Sentry**.
- **Performance** : Firebase Performance (temps de démarrage, réseau).
- **Disponibilité backend** : logs + alertes (Supabase/Firebase).
- **Alerting** : notifications d'anomalie (taux de crash, erreurs API,
  échecs de paiement).
- **Dashboards** : santé technique + funnel business au même endroit.

---

## 14. Conformité « dispositif médical » — mondiale

> ⚠️ Non juridique. La qualification dépend des **allégations exactes** et doit
> être **confirmée par un conseil réglementaire local** par marché.

**Stratégie unique valable partout : rester « bien-être ».** Un logiciel devient
« dispositif médical » selon sa **finalité/allégations**. On reste hors champ en
parlant **bien-être / éducation / mode de vie**, sans diagnostiquer/traiter/guérir.

| Marché | Autorité | Voie |
|---|---|---|
| **US** | **FDA** | Politique **General Wellness** → non régulé si pas d'allégation médicale. |
| **UE** | Nationales | **MDR 2017/745** + **MDCG 2019-11** → hors MDR si pas de finalité médicale. |
| **Suisse** | **Swissmedic** | **ODim/MedDO** → bien-être hors champ. |
| **UK** | **MHRA** | Carve-out bien-être. |
| **Canada** | **Santé Canada** | Hors licence si non médical. |
| **Australie** | **TGA** | Exclusions/exemptions logiciels bien-être. |
| **Japon** | **PMDA/MHLW** | Non médical si pas d'allégation thérapeutique. |
| **Monde** | Locales (IMDRF) | Même logique, à confirmer localement. |

**Règles d'or :** copie sans vocabulaire médical, disclaimer omniprésent (§17),
pas de fonctions médicales, **« maigrir » oui / « traiter/guérir » jamais / aucun
chiffre garanti**, citer la recherche comme inspiration sans usurper la Mayo Clinic.

---

## 15. Protection des données — par juridiction

| Région | Loi | À gérer |
|---|---|---|
| **UE/EEE** | **RGPD** | Base légale, consentement, droits, registre, DPO si besoin. |
| **UK** | **UK GDPR + DPA 2018** | + Children's Code si <18. |
| **Suisse** | **nLPD / revDSG** | Représentant CH possible. |
| **US** | **CCPA/CPRA** + lois d'État ; **COPPA** (<13) | Pas de « vente » de données sensibles ; **HIPAA non applicable** (ne pas le prétendre). |
| **Canada** | **PIPEDA** (+ Loi 25) | Consentement, transparence. |
| **Brésil** | **LGPD** | DPO local. |
| **Japon** | **APPI** | Transferts, consentement. |

**Transversal :** minimisation, chiffrement, hébergement UE par défaut,
consentement granulaire, suppression in-app. **16+ écarte COPPA** (pas de
collecte <13).

---

## 16. Conditions générales & confidentialité (documents à publier)

> ⚠️ **À rédiger/valider par un avocat** (santé + données, UE/US/Suisse).

Trois documents accessibles avant compte, dans les réglages et liés aux fiches
store :
1. **CGU** : objet (outil bien-être **16+**), nature non médicale, compte, PI,
   abonnement/résiliation, limitation de responsabilité (§17), droit applicable.
2. **Politique de confidentialité** : responsable, données collectées, finalités,
   base légale RGPD, données sensibles, **sous-traitants** (dont ads/analytics/IA
   si utilisée), transferts, conservation, droits, cookies/SDK, ATT, **nLPD** CH.
3. **CGV** (abonnement) + politique de remboursement renvoyant aux règles
   Apple/Google.

Déclarations store **exactes** : **App Privacy (Apple)** et **Data safety
(Google)**.

---

## 17. Disclaimers & limitation de responsabilité

**Positionnement : test de bien-être inspiré d'une étude scientifique, PAS un
avis médical à suivre.**

**Disclaimer type (avant le test + sur le résultat, traduit) :**
> « Ceci est un **test de bien-être** à but informatif. Il s'inspire de travaux
> scientifiques mais **ne constitue pas un diagnostic, un avis médical, ni un
> traitement**. Les recommandations sont **des suggestions générales que tu n'es
> pas tenu(e) de suivre**, **sans garantie de résultat**. Consulte un
> professionnel de santé avant tout changement (pathologie, grossesse,
> traitement, trouble alimentaire). »

**CGU :** aucun résultat garanti ; usage sous la seule responsabilité de
l'utilisateur ; app « en l'état » ; exclusion de responsabilité dans les limites
légales. **Renvoi vers une aide** en cas de signaux de trouble alimentaire.

---

## 18. Internationalisation (FR/EN) & déploiement mondial

- **MVP : Français + Anglais** (UI, questions, résultats, programmes, disclaimers,
  CGU, fiches store). **i18n** dès le départ (chaînes externalisées, format ICU).
- **Unités** kg/cm et lb/ft-in ; formats locaux ; **prix par pays** (RevenueCat).
- **Textes légaux & ressources d'aide** localisés par pays.
- **Rollout par vagues** (protège juridiquement + optimise le coût d'acquisition) :
  1. **Pilote** : 1-2 pays anglophones peu chers (Canada/Australie) — test funnel.
  2. **US + France + Suisse**.
  3. **Reste de l'Europe** puis **international**.
  - À chaque vague : **revue réglementaire + data + langue** avant ouverture.

---

## 19. Go-to-Market & ASO — atteindre un fort volume de téléchargements

**Règle d'or : le test est viral, le programme est payant.**

- **Viralité du résultat** (atout n°1) : **carte partageable** « Je suis un 🦁 +
  🦊 » en 1 tap → Stories/TikTok/WhatsApp. Optimiser le **coefficient viral (K)**.
- **ASO** : nom + mots-clés (maigrir, perte de poids, régime, faim, test…),
  1ʳᵉ capture = la promesse, vidéo d'aperçu 15-20 s, **localisation** FR/EN puis+,
  demande d'avis au bon moment.
- **Organique** : **TikTok/Reels/Shorts** (« POV : t'es un Loup 🐺 »), **UGC**,
  **micro-influenceurs** santé/lifestyle, **Pinterest**, **SEO/blog** (web-to-app).
- **Payant (quand le funnel convertit)** : TikTok/Meta Ads (créas = meilleurs
  organiques), **Apple Search Ads**. Scaler **seulement si LTV > CPI**.

---

## 20. Contenu opérationnel à préparer AVANT lancement (checklist)

**Store :** icône (variantes A/B), 5-8 captures/langue, vidéo aperçu,
descriptions + mots-clés ASO, nom + sous-titre.
**Légal & compte :** CGU/Confidentialité/CGV (avocat), écrans de consentement
(CMP/ATT), flux Apple/Google/e-mail/invité, suppression de compte, déclarations
App Privacy / Data safety.
**Produit :** questionnaire + 4 programmes **validés santé**, textes + avatars
des animaux, carte partageable, (prompts IA verrouillés si IA utilisée).
**Marketing :** 10-20 vidéos courtes (par animal), 20-50 micro-influenceurs,
landing page + waitlist, comptes sociaux, plan de lancement par vagues.
**Technique :** framework + Codemagic connecté aux 2 stores, RevenueCat, AdMob +
CMP, FCM/OneSignal, analytics + attribution, Crashlytics/Sentry, RGPD/nLPD.

---

## 21. KPIs, monitoring business & taxonomie d'événements

**Événements clés à instrumenter (dès le jour 1) :** `app_open`, `test_started`,
`test_completed`, `animal_result` (dominant/secondaire), `result_shared`,
`paywall_viewed`, `trial_started`, `subscription_started`, `ad_impression`,
`push_opened`, `account_created`, `retention_dN`.

| Étape | Indicateur | Cible / usage |
|---|---|---|
| Acquisition | Installs, CPI, source | Volume & coût |
| Activation | % **test terminé** | Viser >70 % |
| Viralité | taux de partage, **K** | Croissance gratuite |
| Conversion | invité→compte, free→premium | Revenu |
| Rétention | J1 / J7 / J30 | Santé produit, LTV |
| Revenu | **LTV**, MRR, churn, ARPDAU (ads) | Rentabilité |
| Réputation | note, volume d'avis | ASO & CPI |

**Règle de décision :** scaler l'acquisition payante **uniquement** quand
**LTV > CPI** avec marge et rétention J7 saine.

---

## 22. Éléments manquants / à finaliser pour le Go-to-Market

Ce qu'il reste à réunir pour publier **et** réussir en téléchargements :

1. **Décisions produit** : nom définitif de l'app + marque, charte graphique et
   **illustrations des 4 animaux** (remplacer les emojis), prix/essai.
2. **Validation santé** : questionnaire + programmes relus par un(e)
   diététicien(ne)/médecin (indispensable, aussi pour crédibilité ASO).
3. **Validation juridique par marché** : CGU/Confidentialité/CGV, qualification
   « non-dispositif médical », CMP/consentement (avocat santé + data).
   → *Préciser ici ce que « SDI » désigne pour l'intégrer.*
4. **Comptes & accès** : Apple Developer (99 $/an), Google Play (25 $),
   AdMob, RevenueCat, CMP, analytics, attribution, FCM/OneSignal.
5. **Contenu marketing** : batterie de vidéos courtes, liste d'influenceurs,
   landing + waitlist, comptes sociaux (voir §19-20).
6. **Plan de mesure** : taxonomie d'événements (§21) implémentée avant le lancement
   (sinon on lance à l'aveugle).
7. **Plan de rollout** : marché pilote choisi, budget UA de test défini.

---

*Document rédigé sans hallucination ni complaisance. Les éléments non vérifiables
sont signalés comme choix produit ou à valider par un professionnel. Les sections
réglementaires/juridiques (§11, §14-17) donnent la logique de conformité mais **ne
remplacent pas la validation par des conseils spécialisés** (dispositifs médicaux
+ données) **par marché**. La revente de données de santé/profiling aux
publicitaires est écartée car interdite par les stores et la loi (§11) ; la valeur
monétisable réside dans la donnée first-party consentie (§11-12). « SDI » reste à
préciser par le porteur du projet.*
