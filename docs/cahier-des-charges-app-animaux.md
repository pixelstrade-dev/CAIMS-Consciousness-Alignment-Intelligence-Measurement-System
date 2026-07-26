# Cahier des charges — Application mobile « Mon Animal Minceur »

> Application de perte de poids basée sur la détection du **type de faim** de
> l'utilisateur, via un questionnaire, avec un programme personnalisé généré
> par IA.

**Version :** 1.0 · **Date :** 2026-07-26 · **Statut :** MVP à développer

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

*Document rédigé sans hallucination : les éléments non vérifiables sont
explicitement signalés comme choix produit ou comme à valider par un
professionnel.*
