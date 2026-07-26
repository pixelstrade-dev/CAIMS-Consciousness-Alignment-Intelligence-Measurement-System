# Cahier des charges — Application mobile « Mon Animal Minceur »

> Application de perte de poids basée sur la détection du **type de faim** de
> l'utilisateur, via un questionnaire, avec un programme personnalisé généré
> par IA.

**Version :** 3.0 (global) · **Date :** 2026-07-26 · **Statut :** MVP à développer

> **Nouveautés v2.0 :** authentification (Apple/Google/email + invité) §12,
> conditions générales & confidentialité §13, disclaimers & limitation de
> responsabilité §14, stratégie Go-to-Market & ASO §15, contenu opérationnel de
> lancement §16, indicateurs de succès §17.
>
> **Nouveautés v3.0 (lancement mondial) :** conformité dispositifs médicaux par
> pays/région — FDA, Swissmedic, UE, UK, Canada, Australie, Japon… §18 ;
> protection des données par juridiction §19 ; **mineurs 12+ — obligations &
> alertes** §20 ; internationalisation FR/EN & déploiement mondial §21.

---

## 0. Note d'honnêteté scientifique (à lire avant tout)

Ce cahier des charges est **volontairement non-hallucinatoire**. Les faits :

- **Aucune étude scientifique validée** n'utilise les animaux « Lion / Loup /
  Renard / Ours » pour classer la faim. Cette nomenclature est un **habillage
  marketing**, assumé comme tel.
- La **base scientifique réelle** de l'application est la classification des
  **4 phénotypes de l'obésité** du **Dr Andres Acosta (Mayo Clinic)**, publiée
  dans la revue *Obesity* (2021). Étude sur **~450 patients**. Résultat clé :
  un traitement choisi selon le phénotype a donné **79 % de patients perdant
  >10 % du poids** (vs 35 %), et **~27 % des patients relèvent de plusieurs
  phénotypes** — ce qui justifie le principe « un animal, ou deux, ou plusieurs ».
- Les animaux sont donc une **couche de gamification** posée sur des phénotypes
  scientifiques réels. On ne prétend **jamais** à un diagnostic médical.

**Sources :**
- Acosta et al., *Selection of Antiobesity Medications Based on Phenotypes
  Enhances Weight Loss: A Pragmatic Trial in an Obesity Clinic*, Obesity, 2021.
  <https://onlinelibrary.wiley.com/doi/10.1002/oby.23120>
- Obesity Medicine Association — *4 Metabolic Phenotypes to Aid in Weight Loss*.
- Mayo Clinic Press — *Understanding obesity phenotypes*.
  <https://mcpress.mayoclinic.org/nutrition-fitness/understanding-obesity-phenotypes/>

---

## 1. Vision & objectif

**Problème :** la plupart des régimes échouent car ils ignorent *pourquoi*
la personne mange trop. La cause de la faim diffère d'un individu à l'autre.

**Solution :** un questionnaire simple détecte le(s) **type(s) de faim** de
l'utilisateur, puis l'app délivre un **programme personnalisé** (alimentation,
habitudes, mental) adapté à son ou ses type(s).

**Promesse produit (compliant) :**
- ✅ « Comprenez *comment* vous avez faim et perdez du poids durablement. »
- ❌ À NE PAS écrire : « 10 kg en 3 semaines » (irréaliste, non sûr, motif de
  refus des stores pour allégation santé). Rythme communiqué : **objectif
  progressif, ~0,5–1 kg/semaine**.

**Cible :** adultes cherchant à perdre du poids, grand public francophone
(puis anglophone).

---

## 2. Base scientifique → habillage animal

Les 4 phénotypes de faim (Mayo Clinic) et leur correspondance de marque
(choix produit, **non** issu de l'étude) :

| Animal | Phénotype scientifique | Description grand public |
|---|---|---|
| 🦁 **Lion** | **Hungry Brain** (cerveau affamé) | « Il te faut de grosses portions pour te sentir rassasié pendant le repas. » |
| 🐺 **Loup** | **Hungry Gut** (intestin affamé) | « Tu as de nouveau faim peu de temps après avoir mangé. » |
| 🦊 **Renard** | **Emotional Hunger** (faim émotionnelle) | « Tu manges sous le coup du stress, de l'ennui ou des émotions. » |
| 🐻 **Ours** | **Slow Burn** (métabolisme lent) | « Ton corps brûle lentement ; tu prends du poids en mangeant peu. » |

**Multi-types :** un utilisateur peut être **1 animal dominant**, ou **2** (cas
le plus fréquent), voire davantage. L'app affiche le principal + le secondaire.

---

## 3. Le questionnaire (cœur fonctionnel)

### 3.1 Principe
- **12 à 20 questions** maximum (rapidité = taux de complétion élevé).
- Chaque question **marque des points** pour un ou plusieurs phénotypes.
- Format : échelle de fréquence (Jamais / Parfois / Souvent / Toujours) ou
  choix multiple. Pas de champ libre au début.

### 3.2 Axes de questions par type

**🦁 Lion / Hungry Brain — satiété pendant le repas**
- « À la fin d'un repas normal, as-tu encore faim ? »
- « As-tu besoin d'une grande assiette pour te sentir calé ? »
- « Reprends-tu souvent une deuxième portion ? »

**🐺 Loup / Hungry Gut — durée de la satiété**
- « Combien de temps après un repas as-tu de nouveau faim ? » (<2 h = Loup)
- « Grignotes-tu entre les repas ? »
- « Te réveilles-tu la nuit avec la faim ? »

**🦊 Renard / Emotional Hunger — déclencheur émotionnel**
- « Manges-tu quand tu es stressé, triste ou t'ennuies ? »
- « Manges-tu sans avoir réellement faim physiquement ? »
- « Te sens-tu coupable après avoir mangé ? »

**🐻 Ours / Slow Burn — métabolisme & activité**
- « Prends-tu du poids même en mangeant peu ? »
- « As-tu souvent froid / peu d'énergie ? »
- « Quel est ton niveau d'activité physique quotidien ? »

> Les questions ci-dessus sont un **cadre de départ**. La rédaction finale
> devra être relue par un professionnel de santé/nutrition avant publication.

### 3.3 Données de profil (facultatif, en plus du questionnaire)
Âge, sexe, taille, poids actuel, poids objectif → pour personnaliser le
programme et calculer un objectif **réaliste**.

---

## 4. Algorithme de détection (scoring)

1. Chaque réponse ajoute des points aux compteurs `lion`, `loup`, `renard`,
   `ours`.
2. Normalisation des scores en % (0–100) par type.
3. **Type dominant** = score le plus élevé.
4. **Type secondaire** = 2ᵉ score s'il dépasse un seuil (ex. ≥ 60 % du
   dominant).
5. Affichage : « Tu es un **Lion**, avec une part de **Renard**. »

```
scores = { lion:0, loup:0, renard:0, ours:0 }
pour chaque réponse: scores[type] += poids_reponse
% = score_type / score_max_possible_type * 100
dominant = argmax(scores)
secondaire = 2e si score >= 0.6 * dominant
```

> Ce scoring par règles est le MVP. Une V2 pourra calibrer les poids sur des
> données réelles d'utilisateurs.

---

## 5. Résultat & programme personnalisé

### 5.1 Écran résultat
- Avatar animal + nom du type dominant (+ secondaire).
- Explication en 2-3 phrases : « Voici pourquoi tu as faim comme ça. »
- Objectif de poids **réaliste** et échéance saine.

### 5.2 Programme (par type)
Pour chaque animal, l'app propose des **recommandations ciblées** :

| Type | Levier principal du programme |
|---|---|
| 🦁 Lion | Densité/volume alimentaire : aliments rassasiants à faible densité calorique (légumes, protéines, fibres). |
| 🐺 Loup | Stabilité glycémique : protéines + fibres, repas structurés pour tenir plus longtemps. |
| 🦊 Renard | Gestion émotionnelle : repérer les déclencheurs, alternatives au grignotage, mini-exercices anti-stress. |
| 🐻 Ours | Activation métabolique : activité physique progressive, sommeil, hydratation. |

Contenu du programme : plan quotidien simple, conseils, check-list
d'habitudes, suivi du poids.

> ⚠️ Les recommandations nutritionnelles précises **doivent être validées par
> un(e) diététicien(ne)/médecin** avant mise en production.

---

## 6. Rôle de l'intelligence artificielle

L'IA (**API Claude d'Anthropic** recommandée) sert à **personnaliser et animer**,
pas à diagnostiquer :

1. **Génération du programme** : à partir du/des type(s) + profil, Claude génère
   un plan personnalisé en langage naturel.
2. **Coach conversationnel** : l'utilisateur pose des questions
   (« que manger ce soir ? ») → réponses adaptées à son animal.
3. **Reformulation motivante** des résultats.

**Garde-fous IA (obligatoires) :**
- Prompt système imposant : pas de conseil médical, renvoi vers un
  professionnel si besoin, ton bienveillant, objectifs de poids sûrs.
- Filtrage des demandes sensibles (troubles alimentaires → message de
  redirection vers aide professionnelle).
- Aucune donnée santé envoyée à l'IA sans consentement (RGPD).

---

## 7. Stack technique recommandée (simple & rapide à publier)

Objectif : **une seule base de code**, iOS + Android, publication rapide.

| Couche | Choix recommandé | Pourquoi |
|---|---|---|
| App mobile | **Flutter** (Dart) | 1 code → iOS + Android, rapide, gratuit. Alternative no-code : **FlutterFlow**. |
| État local / offline | Stockage local (Hive / SharedPreferences) | Le questionnaire marche sans compte au début. |
| Backend (léger) | **Supabase** ou **Firebase** | Auth, base de données, hébergement gérés, tier gratuit. |
| IA | **API Claude (Anthropic)** via une petite fonction serveur | La clé API **ne doit jamais** être dans l'app ; elle passe par une fonction cloud (Supabase Edge Function / Firebase Function). |
| Paiement | **RevenueCat** | Gère abonnements App Store + Play Store avec un seul SDK. |
| Analytics | Firebase Analytics / PostHog | Suivi funnel questionnaire → conversion. |

**Architecture (simple) :**
```
[App Flutter] → questionnaire → scoring local → résultat animal
      │
      └── (bouton "mon programme") → Cloud Function → API Claude → programme
                                          │
                                     [Supabase/Firebase] (profil, historique)
```

> ⚠️ Sécurité : la clé API Claude reste **côté serveur** uniquement. Jamais dans
> l'app compilée.

---

## 8. Modèle économique (freemium simple)

| Offre | Contenu | Prix indicatif |
|---|---|---|
| **Gratuit** | Questionnaire + résultat animal + aperçu du programme. | 0 € |
| **Premium** (abonnement) | Programme complet, coach IA illimité, suivi, nouveaux plans. | ~4,99–9,99 €/mois ou ~39,99 €/an |
| **Achat unique** (option) | Débloquer le programme complet une fois. | ~19,99 € |

- **Levier de conversion :** le résultat est gratuit (accroche virale), le
  **programme détaillé + coach IA** est payant.
- **Coût variable à surveiller :** appels API Claude → plafonner l'usage IA du
  tier gratuit, mettre en cache les programmes types.
- Gestion des abonnements via **RevenueCat** (obligatoire pour être conforme
  aux règles de facturation Apple/Google).

---

## 9. Conformité stores & légal (critique)

- ❌ **Pas de promesse chiffrée irréaliste** (« -10 kg en 3 semaines ») → refus
  quasi certain. Communiquer un rythme **sain et progressif**.
- ✅ **Disclaimer médical** visible : « Cette app ne remplace pas un avis
  médical. Consultez un professionnel de santé. »
- ✅ **Pas de diagnostic médical** revendiqué (l'app est un outil
  bien-être/éducatif). *(Décision validée : la détection par photo est retirée
  pour rester conforme Apple/Google.)*
- ✅ **RGPD** : consentement, politique de confidentialité, droit à
  l'effacement, données santé traitées avec soin.
- ✅ **Guidelines Apple** (santé/fitness) et **Google Play** (santé) : lire et
  respecter les sections « Health ».
- ✅ Mentionner que le contenu s'inspire de recherches publiées, **sans**
  affilier faussement l'app à la Mayo Clinic ou à un auteur.

---

## 10. Périmètre du MVP (v1) & roadmap

### MVP (à livrer en premier)
- [ ] Onboarding + questionnaire (12–20 questions)
- [ ] Scoring 4 types + détection dominant/secondaire
- [ ] Écran résultat (animal + explication)
- [ ] Aperçu de programme statique par type (gratuit)
- [ ] Programme complet généré par IA (premium)
- [ ] Paywall + abonnement (RevenueCat)
- [ ] Disclaimer + politique de confidentialité
- [ ] Publication TestFlight / Play Console (bêta fermée)

### V2 (après validation)
- [ ] Coach IA conversationnel
- [ ] Suivi du poids + graphiques
- [ ] Notifications d'habitudes
- [ ] Localisation anglaise
- [ ] Calibration du scoring sur données réelles

### Hors périmètre (assumé)
- Détection du type par photo (retirée — non scientifique + risque store)
- Toute allégation de diagnostic ou de traitement médical

---

## 11. Ce qu'il reste à décider / fournir

1. **Validation santé** : faire relire questionnaire + programmes par un(e)
   diététicien(ne)/médecin (indispensable avant publication).
2. **« mwm.ai »** : préciser de quel outil il s'agit — le cahier des charges
   sera adapté si c'est un builder no-code spécifique.
3. **Nom & marque** de l'app (à déposer si besoin).
4. **Charte graphique** (avatars des 4 animaux).

---

---

## 12. Comptes & authentification

### 12.1 Principe : le test d'abord, le compte ensuite
Pour maximiser la complétion et les téléchargements, on **ne bloque jamais** le
questionnaire derrière un compte. Parcours :

1. **Mode invité** (par défaut) : l'utilisateur fait le test et voit son
   résultat + un aperçu du programme, **sans compte**.
2. **Création de compte** proposée pour : sauvegarder le résultat, suivre son
   poids, débloquer le programme premium et le coach IA, changer d'appareil.
3. Le premium peut fonctionner sans e-mail (achat lié au compte Apple/Google),
   mais un compte facilite le multi-appareils.

### 12.2 Méthodes de connexion (MVP)
| Méthode | Priorité | Notes |
|---|---|---|
| **Sign in with Apple** | Obligatoire (iOS) | **Règle App Store 4.8** : si vous proposez Google/Facebook login, vous **devez** aussi proposer Sign in with Apple. Non négociable pour la validation iOS. |
| **Google Sign-In** | Haute | Standard sur Android, réduit la friction. |
| **E-mail + lien magique / mot de passe** | Moyenne | Pour ceux qui ne veulent pas de social login. Le lien magique évite la gestion de mots de passe. |
| **Continuer en invité** | Haute | Toujours visible. Conversion du compte plus tard. |

### 12.3 Exigences techniques d'auth
- Auth gérée par **Supabase Auth** ou **Firebase Auth** (les deux gèrent Apple +
  Google + e-mail nativement) → pas de gestion de mots de passe maison.
- **Option « masquer mon e-mail »** d'Apple à supporter (adresse relais privée).
- **Suppression de compte in-app obligatoire** (règle App Store 5.1.1(v) et
  Google Play) : un bouton « Supprimer mon compte et mes données » accessible
  depuis les réglages, sans passer par le support.
- Jetons stockés dans le **stockage sécurisé** (Keychain iOS / Keystore Android).
- Reconnexion silencieuse ; déconnexion explicite ; gestion de l'expiration.

### 12.4 Données de compte (minimisation)
On ne collecte **que le nécessaire** : identifiant d'auth, e-mail (si fourni),
et les données du profil/questionnaire que l'utilisateur choisit de sauvegarder.
Pas de collecte cachée. Voir §13–14.

---

## 13. Conditions générales & confidentialité (documents à publier)

> ⚠️ **Ces textes doivent être rédigés/validés par un avocat** (santé + données
> personnelles, UE et Suisse). Ce qui suit est la **structure et le contenu
> attendu**, pas un texte juridique définitif.

### 13.1 Documents obligatoires
Trois documents, accessibles **avant** création de compte, dans les réglages, et
liés depuis les fiches store :

1. **CGU — Conditions Générales d'Utilisation** (Terms of Use)
2. **Politique de Confidentialité** (Privacy Policy) — exigée par Apple & Google
3. **CGV — Conditions Générales de Vente** (si abonnement/achat) + politique de
   remboursement renvoyant aux règles Apple/Google.

### 13.2 CGU — points à couvrir
- Objet de l'app : **outil de bien-être et d'information**, ludique et éducatif.
- **Nature non médicale** du service (renvoi au disclaimer §14).
- Conditions d'accès : **âge minimum** (recommandé **16+ ou 18+**, à cadrer avec
  l'avocat ; l'app n'est pas destinée aux mineurs sans encadrement, ni aux
  personnes souffrant de troubles du comportement alimentaire).
- Compte : responsabilité de l'utilisateur sur ses identifiants.
- Propriété intellectuelle (contenus, marque, animaux = propriété de l'éditeur).
- Abonnement, renouvellement automatique, résiliation, remboursements.
- Limitation de responsabilité (§14), droit applicable, for juridique.
- Modification des CGU, résiliation, suspension.

### 13.3 Politique de confidentialité — points à couvrir
- **Identité du responsable de traitement** (l'éditeur) + contact DPO/e-mail.
- **Données collectées** : identifiant d'auth, e-mail, réponses au
  questionnaire, poids/objectif (si saisis), données d'usage/analytics.
- **Finalités** : fournir le résultat et le programme, améliorer l'app,
  facturation, support.
- **Base légale** (RGPD) : consentement pour les données de « bien-être » et le
  marketing ; exécution du contrat pour le service ; intérêt légitime pour
  l'analytics agrégé.
- **Données de santé** : les réponses sur la faim/le poids peuvent être
  considérées comme **données sensibles** → consentement explicite, chiffrement,
  minimisation, **pas de revente**, pas de partage publicitaire.
- **Sous-traitants** listés : hébergeur (Supabase/Firebase/UE de préférence),
  paiement (RevenueCat/Apple/Google), analytics, **API Claude (Anthropic)** pour
  la génération de programme.
- **IA** : préciser que du texte est envoyé à un fournisseur d'IA pour générer
  le programme, avec consentement, et **sans données identifiantes inutiles**.
- **Transferts hors UE** (si applicable) et garanties (clauses contractuelles
  types).
- **Durée de conservation**, **droits RGPD** (accès, rectification, effacement,
  portabilité, opposition) et **suppression du compte in-app**.
- **Cookies/SDK** et traçage (voir ATT §14.4).
- **Suisse** : conformité **nLPD / revDSG**, mention d'un représentant en Suisse
  si nécessaire.

---

## 14. Disclaimers & limitation de responsabilité (protection juridique)

> Objectif : **positionner l'app comme un test de bien-être basé sur une étude
> scientifique, PAS comme un dispositif médical ni un conseil médical à suivre.**
> C'est la ligne de défense principale contre la responsabilité et contre le
> classement en « dispositif médical ».

### 14.1 Disclaimer principal (à afficher AVANT le test et sur le résultat)
Texte type (à valider par l'avocat) :

> « **Ceci est un test de bien-être à but informatif et ludique.** Il s'inspire
> de travaux scientifiques sur les profils de faim, mais **ne constitue pas un
> diagnostic, un avis médical, ni un traitement**. Les résultats et
> recommandations sont **des suggestions générales que vous n'êtes pas tenu(e)
> de suivre**. Consultez un médecin ou un(e) diététicien(ne) avant tout
> changement d'alimentation, notamment en cas de pathologie, grossesse,
> traitement, ou trouble du comportement alimentaire. »

### 14.2 Limitation de responsabilité (dans les CGU)
- L'éditeur **ne garantit aucun résultat** de perte de poids.
- L'utilisateur reconnaît utiliser l'app **sous sa seule responsabilité**.
- Exclusion de responsabilité pour les dommages liés à l'usage des conseils,
  dans les limites permises par la loi.
- L'app est fournie **« en l'état »**, sans garantie d'exactitude médicale.

### 14.3 Éviter le classement « dispositif médical »
Pour rester **hors** du champ du MDR (UE) et de **Swissmedic** (Suisse) :
- **Ne jamais** revendiquer diagnostiquer, traiter, guérir ou prévenir une
  maladie (y compris l'obésité comme maladie).
- Parler de **bien-être, éducation, mode de vie**, jamais de « traitement ».
- Éviter les allégations chiffrées de perte de poids (déjà acté).
- Ne pas se présenter comme affilié à la Mayo Clinic ou à un auteur : citer la
  recherche comme **source d'inspiration**, avec la référence, sans usurpation.
- ⚠️ **Faire confirmer la qualification par un juriste santé** avant lancement —
  la frontière dépend des allégations exactes.

### 14.4 Obligations plateformes santé
- **Apple** : App Review Guideline **1.4.1** (apps santé) et **5.1.1** (données
  santé) → pas de données santé dans iCloud à des fins publicitaires, disclaimer
  clair. **ATT (App Tracking Transparency)** obligatoire si suivi cross-app.
- **Google Play** : politique **Health apps / Health Connect**, déclaration
  **Data safety** exacte, pas d'usage publicitaire des données de santé.
- **Contenu sensible** : mécanisme de renvoi vers une aide en cas de signaux de
  trouble alimentaire (message + lien vers ressources), et exclusion de cette
  cible dans les CGU.

### 14.5 Sécurité IA (rappel)
Prompt système verrouillé : pas de conseil médical, ton bienveillant, objectifs
sûrs, redirection vers un professionnel, refus des sujets à risque. Voir §6.

---

## 15. Go-to-Market & ASO — atteindre un volume conséquent de téléchargements

> Regard **expert go-to-market**. Aucune garantie de volume — mais voici les
> leviers qui font la différence pour une app grand public simple. La règle
> d'or : **le test est viral, le programme est payant.**

### 15.1 Le moteur de croissance : la viralité du résultat
C'est votre atout n°1. Le résultat « Tu es un 🦁 Lion + 🦊 Renard » est
**intrinsèquement partageable** (comme les tests de personnalité).
- **Carte de résultat partageable** : générer une belle image (animal, nom,
  mini-description) à partager en 1 tap sur Instagram Stories, TikTok, WhatsApp.
- **Boucle** : un ami voit la carte → curiosité → télécharge → passe le test →
  partage. C'est le **coefficient viral (K)** à optimiser.
- CTA in-app : « Partage ton animal et défie tes amis. »

### 15.2 ASO (App Store Optimization) — le canal gratuit prioritaire
| Élément | Recommandation |
|---|---|
| **Nom de l'app** | Nom de marque + mots-clés : ex. « Mon Animal Minceur : Test Faim ». |
| **Sous-titre (iOS) / titre court** | Bénéfice + mot-clé : « Découvre ton type de faim ». |
| **Mots-clés (iOS 100 car.)** | maigrir, perte de poids, régime, faim, métabolisme, test, minceur, nutrition… |
| **Description** | 3 premières lignes = accroche (visible sans « plus »). Bénéfice, preuve (recherche), CTA. |
| **Icône** | Un animal fort et lisible en petit (ex. le Lion), testée A/B. |
| **Captures d'écran** | 1ʳᵉ capture = la promesse (les 4 animaux + « Quel est ton type ? »). Montrer le résultat et le programme. Texte court et gros. |
| **Vidéo aperçu** | 15-20 s : question → résultat animal → programme. |
| **Localisation** | FR d'abord, puis EN, ES, DE, IT, PT — l'ASO localisé démultiplie la portée. |
| **Note & avis** | Demander l'avis **au bon moment** (juste après un résultat satisfaisant), via l'API native. |

### 15.3 Contenu organique (coût quasi nul, fort potentiel)
- **TikTok / Reels / Shorts** : format « POV : t'es un Loup qui a faim 2h après
  manger 🐺 ». Vidéos courtes par animal, très partageables. **C'est le canal
  n°1** pour ce type d'app.
- **UGC** : encourager les utilisateurs à filmer leur résultat.
- **Influenceurs micro/nano** (santé, minceur, lifestyle) : envoi du test,
  codes premium offerts. ROI supérieur aux grosses têtes d'affiche.
- **Pinterest** : fiches par animal (« Programme Renard : gérer la faim
  émotionnelle ») — fort en niche minceur féminine.
- **SEO / blog** : articles « Quel est votre type de faim ? », « 4 profils de
  faim », captant la recherche Google → web-to-app.

### 15.4 Acquisition payante (quand le funnel convertit)
- Ne payer **qu'après** avoir validé un **taux de conversion premium** correct
  en organique (sinon on brûle du budget).
- **TikTok Ads** et **Meta Ads** (Instagram/Facebook) : créas = extraits des
  vidéos organiques les plus performantes.
- **Apple Search Ads** : capter les recherches à forte intention (« maigrir »,
  « régime »). Souvent le meilleur ROAS pour une app de niche.
- Suivre **CPI** (coût par install) et surtout **LTV** (valeur vie client). On
  scale seulement si **LTV > CPI** avec marge.

### 15.5 Monétisation & rétention (le volume ne suffit pas)
- **Paywall optimisé** : le montrer **au pic de motivation** (après le résultat).
  Tester prix, essai gratuit, mensuel vs annuel (A/B via RevenueCat).
- **Onboarding = conversion** : chaque écran justifie la valeur avant le paywall.
- **Rétention** : notifications d'habitudes, suivi du poids, nouveaux contenus,
  coach IA → nourrissent le LTV et les avis positifs (→ meilleur ASO, cercle
  vertueux).
- **Web funnel** (optionnel avancé) : faire le test sur le web puis payer sur le
  web (hors commission Apple/Google) — modèle « quiz funnel » très rentable
  utilisé par les leaders de la minceur.

---

## 16. Contenu opérationnel à préparer AVANT le lancement (checklist)

### 16.1 Assets store
- [ ] Icône (plusieurs variantes à tester)
- [ ] 5-8 captures d'écran par langue (+ textes marketing intégrés)
- [ ] Vidéo d'aperçu (15-20 s)
- [ ] Descriptions + mots-clés ASO par langue
- [ ] Nom + sous-titre optimisés

### 16.2 Assets légaux & compte
- [ ] CGU, Politique de confidentialité, CGV (validées avocat)
- [ ] Écrans de consentement (données de santé, marketing, ATT)
- [ ] Flux Sign in with Apple / Google / e-mail / invité
- [ ] Suppression de compte in-app + page « supprimer mes données »
- [ ] Déclaration **App Privacy (Apple)** et **Data safety (Google)** exactes

### 16.3 Contenu produit
- [ ] Questionnaire finalisé + relu par un(e) diététicien(ne)
- [ ] 4 programmes par animal validés (santé)
- [ ] Textes des 4 animaux + illustrations/avatars définitifs
- [ ] Prompts IA verrouillés (garde-fous)
- [ ] Carte de résultat partageable (design)

### 16.4 Marketing & lancement
- [ ] 10-20 vidéos courtes prêtes (une batterie par animal) pour TikTok/Reels
- [ ] Liste de 20-50 micro-influenceurs à contacter
- [ ] Landing page web + capture d'e-mails (waitlist pré-lancement)
- [ ] Comptes sociaux créés (TikTok, Instagram, Pinterest)
- [ ] Plan de lancement (soft launch sur 1 pays → mesure → scale)
- [ ] Outils analytics + événements clés instrumentés (voir §17)

### 16.5 Technique & conformité
- [ ] Clé API Claude côté serveur (jamais dans l'app)
- [ ] RevenueCat configuré (produits, essai, prix par pays)
- [ ] TestFlight + piste de test fermée Google Play
- [ ] RGPD/nLPD : hébergement, chiffrement, registre des traitements

---

## 17. Indicateurs de succès (KPIs à suivre dès le jour 1)

| Étape du funnel | Indicateur | Pourquoi |
|---|---|---|
| Acquisition | Installs, CPI, source | Volume et coût d'acquisition |
| Activation | % qui **terminent le test** | Cœur de l'expérience ; viser >70 % |
| Viralité | **taux de partage** du résultat, coefficient K | Croissance organique gratuite |
| Conversion | % **invité → compte**, % **free → premium** | Revenu |
| Rétention | J1 / J7 / J30 | Santé du produit, LTV |
| Revenu | **LTV**, MRR, churn abonnement | Rentabilité, seuil pour scaler l'ads |
| Réputation | note moyenne, volume d'avis | Impacte l'ASO et le CPI |

**Règle de décision :** on scale l'acquisition payante uniquement quand
**LTV > CPI** avec marge, et que la rétention J7 est saine. Sinon, on optimise
d'abord le funnel en organique.

---

---

## 18. Conformité « dispositif médical » — stratégie mondiale

> ⚠️ **Avertissement : ce ne sont pas des conseils juridiques.** Ce tableau
> donne la logique de conformité par marché. La qualification finale dépend des
> **allégations exactes** et doit être **confirmée par un conseil réglementaire
> local** dans chaque pays visé.

### 18.1 La stratégie unique qui vaut partout : rester « bien-être »
Tous les régulateurs (US, UE, Suisse, UK, Canada, Australie, Japon…) appliquent
la même logique : **un logiciel devient « dispositif médical » selon sa finalité
et ses allégations**. Un logiciel destiné à **diagnostiquer, traiter, prévenir
ou guérir une maladie** est régulé. Un logiciel de **bien-être / mode de vie**
qui ne fait **aucune allégation médicale** est hors champ presque partout.

**Notre positionnement, valable mondialement :**
- ✅ Bien-être, éducation, mieux comprendre sa faim, habitudes saines.
- ❌ Jamais : « diagnostiquer », « traiter l'obésité », « soigner », « prévenir
  une maladie », ni allégation chiffrée de perte de poids.
- ✅ La recherche (Mayo Clinic) est citée comme **inspiration**, pas comme
  dispositif validé cliniquement.

### 18.2 Cartographie par marché (logiciel santé / SaMD)
| Marché | Autorité | Cadre | Voie recommandée |
|---|---|---|---|
| **États-Unis** | **FDA** | SaMD ; **politique « General Wellness »** (produits bien-être bas risque, sans référence à une maladie = non activement régulés) | Rester dans le périmètre « general wellness ». Pas de soumission FDA si aucune allégation médicale. |
| **Union européenne** | Autorités nationales + Commission | **MDR 2017/745** ; guide **MDCG 2019-11** (qualification des logiciels) | Pas de « finalité médicale » → hors MDR, pas de marquage CE médical. |
| **Suisse** | **Swissmedic** | **ODim / MedDO** (aligné sur le MDR) | Même logique : bien-être = hors champ Swissmedic. |
| **Royaume-Uni** | **MHRA** | UK MDR 2002 + marquage **UKCA** | Carve-out bien-être ; pas de dispositif si pas de finalité médicale. |
| **Canada** | **Santé Canada** | Medical Devices Regulations | Logiciel bien-être hors licence de dispositif. |
| **Australie** | **TGA** | Therapeutic Goods ; exclusions logiciels | Bénéficier des exclusions/exemptions « wellness ». |
| **Japon** | **PMDA / MHLW** | PMD Act | Non-médical si pas d'allégation thérapeutique. |
| **Reste du monde** | Régulateurs locaux | Logique SaMD similaire (souvent calquée sur IMDRF) | Même stratégie « bien-être », confirmée localement. |

### 18.3 Règles d'or produit (pour rester non-médical partout)
1. **Copie & marketing audités** : bannir tout vocabulaire médical (voir liste
   noire dans le guide de style à produire).
2. **Disclaimer omniprésent** (§14) traduit dans chaque langue.
3. **Pas de fonctions médicales** : pas de calcul de risque de maladie, pas de
   lien avec des dispositifs médicaux/objets connectés santé au MVP.
4. **Revue réglementaire par lot de marchés** avant chaque expansion.

---

## 19. Protection des données — par juridiction (lancement mondial)

> ⚠️ Non juridique. Structure de conformité multi-régions. Un **DPO/avocat data**
> par grande région est requis.

| Région | Loi principale | Points spécifiques à gérer |
|---|---|---|
| **UE / EEE** | **RGPD** | Base légale, consentement données de santé, droits, registre, DPO si nécessaire. |
| **Royaume-Uni** | **UK GDPR + DPA 2018** | + **Children's Code (AADC)** si mineurs. |
| **Suisse** | **nLPD / revDSG** | Représentant en Suisse possible ; proche du RGPD. |
| **États-Unis** | **CCPA/CPRA** (Californie) + lois d'État (VA, CO, CT…) ; **COPPA** (<13 ans) | Pas de « vente » de données santé ; opt-out ; **HIPAA ne s'applique pas** à une app grand public (pas d'entité couverte) — ne pas le prétendre. |
| **Canada** | **PIPEDA** (+ Loi 25 Québec) | Consentement, transparence. |
| **Brésil** | **LGPD** | Base légale, DPO local. |
| **Japon** | **APPI** | Transferts, consentement. |
| **Autres** | LGPD-like locales | Vérifier avant chaque marché. |

**Principes transversaux (privacy by design) :**
- **Minimisation** stricte (§12.4) et **chiffrement** au repos et en transit.
- **Hébergement UE** par défaut, régionalisation possible ensuite.
- **Bandeau de consentement** granulaire (santé, analytics, marketing, ATT).
- **Suppression de compte in-app** partout.
- **Cartographie des sous-traitants** identique par région (dont API Claude).

---

## 20. Mineurs (âge minimum 12 ans) — obligations & alertes

> 🔴 **Alerte d'expert (à lire absolument).** Fixer l'âge minimum à **12 ans**
> pour une app **de perte de poids** cumule trois risques majeurs. Ce cahier des
> charges documente les exigences si vous maintenez 12+, **mais recommande** soit
> **16+**, soit un **12+ recadré « habitudes saines / bien-être », sans aucun
> discours minceur pour les mineurs.**

### 20.1 Les trois risques du 12+
1. **Juridique — données d'enfants.** Aux US, collecter des données de moins de
   13 ans déclenche **COPPA** (consentement parental vérifiable, restrictions
   lourdes). En UE, âge du consentement numérique **13–16 ans** selon le pays.
   UK/Californie : **Age Appropriate Design Codes** (protection renforcée des
   <18 ans).
2. **Stores.** Apple/Google peuvent **refuser** ou restreindre une app de
   régime/minceur destinée aux mineurs, et exiger une classification d'âge
   élevée. Apple sanctionne les incitations à une perte de poids rapide.
3. **Santé & éthique — TCA.** Promouvoir la « minceur » à des enfants de 12 ans
   est un **facteur de risque de troubles du comportement alimentaire**.
   Réputation et responsabilité majeures.

### 20.2 Si vous maintenez 12+ : exigences minimales
- **Recadrage du contenu pour les mineurs** : « comprendre sa faim / bouger /
  bien manger », **pas** « maigrir / perdre X kg ».
- **Vérification d'âge** à l'entrée (date de naissance) + **consentement
  parental vérifiable** pour les <13 ans (US) et selon l'âge local en UE.
- **Mode mineur** : pas de suivi de poids/objectif de perte, pas de contenu
  restrictif, garde-fous **anti-TCA** renforcés (détection + redirection vers
  aide + lignes d'écoute par pays).
- **Pas de publicité comportementale** ni de marketing ciblant les mineurs.
- **Design conforme AADC** (UK/Californie) : paramètres protecteurs par défaut.

### 20.3 Recommandation par défaut du cahier des charges
- **Option A (recommandée) : 16+** → supprime COPPA, simplifie les stores et
  écarte le risque TCA principal. Positionnement minceur possible.
- **Option B : 12+ « bien-être famille »** → contenu mineur recadré + garde-fous
  ci-dessus + validation juridique par marché.
- **Décision à acter par le porteur du projet, avec avis médical + juridique.**

---

## 21. Internationalisation (FR/EN) & déploiement mondial

### 21.1 Langues
- **MVP : Français + Anglais** (chaîne de traduction complète : UI, questions,
  résultats, programmes, disclaimers, CGU, fiches store).
- Architecture **i18n dès le départ** (fichiers de traduction externalisés,
  aucune chaîne en dur), format **ICU** pour pluriels/genres.
- Détection auto de la langue du téléphone + sélecteur manuel FR/EN.
- Extensions faciles ensuite : ES, DE, IT, PT, puis autres.

### 21.2 Adaptations locales
- **Unités** : kg/cm (métrique) et **lb/ft-in** (US/UK) — sélection auto.
- **Formats** date/heure/nombres par locale.
- **Prix** par pays via RevenueCat (parité de pouvoir d'achat).
- **Disclaimers & ressources d'aide (TCA)** localisés par pays.
- **Textes légaux** adaptés par juridiction (§18-20).

### 21.3 Déploiement mondial par vagues (soft launch → scale)
1. **Vague 1 — pilote :** 1-2 pays anglophones à faible coût média (ex. Canada,
   Australie) pour tester le funnel **avant** le gros budget.
2. **Vague 2 :** **US** (marché clé, gros volume) + **France** + **Suisse**.
3. **Vague 3 :** reste de l'**Europe** (via localisations), puis
   **international**.
4. À chaque vague : **revue réglementaire + data + langue** du/des marché(s)
   avant ouverture. On n'ouvre pas un pays sans sa conformité.

> Publier « dans toutes les régions du monde » d'un coup est **déconseillé** :
> risque légal non maîtrisé + budget dispersé. Le rollout par vagues protège et
> optimise le coût d'acquisition.

---

*Document rédigé sans hallucination : les éléments non vérifiables sont
explicitement signalés comme choix produit ou comme à valider par un
professionnel. Les sections réglementaires et juridiques (§13-14, §18-20)
donnent la structure et la logique de conformité mais **ne remplacent pas la
validation par des conseils spécialisés** (réglementaire dispositifs médicaux +
protection des données) **dans chaque marché visé**. « SDI » n'a pas été intégré
faute d'identification fiable — à préciser par le porteur du projet. Le choix de
l'âge minimum (12+ vs 16+) engage la responsabilité du porteur et doit être
arrêté avec un avis médical et juridique (§20).*
