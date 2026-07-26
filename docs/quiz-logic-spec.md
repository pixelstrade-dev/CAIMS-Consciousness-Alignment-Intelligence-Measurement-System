# HungerPrint — Spécification autonome du questionnaire & de la logique

> Pour l'implémentation (FlutterFlow ou autre). **Indépendant du HTML** du
> prototype : ne pas recopier le HTML, seulement implémenter les questions, les
> pondérations et la logique de résultat ci-dessous. UI à refaire proprement.

## 1. Les 4 types (animal = phénotype de faim)
- `lion` = Hungry Brain (cerveau affamé)
- `loup` = Hungry Gut (intestin affamé)
- `renard` = Emotional Hunger (faim émotionnelle)
- `ours` = Slow Burn (métabolisme lent)

## 2. Questions & pondérations (JSON)

```json
{
  "questions": [
    {"q": "À la fin d'un repas normal, comment te sens-tu ?",
     "options": [
       {"t": "Encore un peu faim, je pourrais reprendre", "w": {"lion": 2}},
       {"t": "Rassasié… mais j'ai de nouveau faim très vite", "w": {"loup": 2}},
       {"t": "Ça dépend surtout de mon humeur", "w": {"renard": 2}},
       {"t": "Bien calé longtemps, pourtant je prends du poids", "w": {"ours": 2}}
     ]},
    {"q": "Tes portions habituelles, c'est plutôt…",
     "options": [
       {"t": "Grandes — il m'en faut beaucoup pour être calé", "w": {"lion": 2}},
       {"t": "Normales, mais je grignote après", "w": {"loup": 2}},
       {"t": "Variables, selon le stress et l'envie", "w": {"renard": 2}},
       {"t": "Petites — je mange peu, en réalité", "w": {"ours": 2}}
     ]},
    {"q": "Combien de temps après un repas as-tu de nouveau faim ?",
     "options": [
       {"t": "Moins de 2 heures", "w": {"loup": 2}},
       {"t": "3 à 4 heures, c'est régulier", "w": {"lion": 1}},
       {"t": "Je n'ai pas vraiment faim, je mange par habitude", "w": {"renard": 2}},
       {"t": "J'ai peu faim, mais je stocke facilement", "w": {"ours": 2}}
     ]},
    {"q": "Quand tu es stressé(e), triste ou tu t'ennuies…",
     "options": [
       {"t": "Je mange pour me réconforter", "w": {"renard": 2}},
       {"t": "Je mange plus, en grande quantité", "w": {"renard": 1, "lion": 1}},
       {"t": "Ça me coupe plutôt l'appétit", "w": {"ours": 1}},
       {"t": "Aucun effet, je mange pareil", "w": {"loup": 1}}
     ]},
    {"q": "Le grignotage entre les repas…",
     "options": [
       {"t": "Souvent — un petit creux revient vite", "w": {"loup": 2}},
       {"t": "Surtout par ennui ou émotion", "w": {"renard": 2}},
       {"t": "De grosses quantités quand je m'y mets", "w": {"lion": 2}},
       {"t": "Rarement, ce n'est pas mon truc", "w": {"ours": 1}}
     ]},
    {"q": "Devant un buffet à volonté, tu te vois plutôt…",
     "options": [
       {"t": "Me resservir plusieurs fois", "w": {"lion": 2}},
       {"t": "Bien manger, puis avoir faim 2 h après", "w": {"loup": 2}},
       {"t": "Manger selon l'ambiance et l'humeur", "w": {"renard": 2}},
       {"t": "Manger peu, mais le corps stocke", "w": {"ours": 2}}
     ]},
    {"q": "Ton énergie au quotidien ?",
     "options": [
       {"t": "Bonne, plutôt stable", "w": {"lion": 1}},
       {"t": "Souvent fatigué(e), j'ai facilement froid", "w": {"ours": 2}},
       {"t": "En dents de scie selon l'humeur", "w": {"renard": 2}},
       {"t": "Basse quand j'ai faim, ça me déconcentre", "w": {"loup": 2}}
     ]},
    {"q": "Ton niveau d'activité physique ?",
     "options": [
       {"t": "Actif(ve) presque tous les jours", "w": {"lion": 1}},
       {"t": "Sédentaire, je bouge peu", "w": {"ours": 2}},
       {"t": "Ça dépend de ma motivation", "w": {"renard": 1}},
       {"t": "Variable, mais j'ai toujours faim après le sport", "w": {"loup": 1}}
     ]},
    {"q": "Prends-tu du poids facilement, même en mangeant peu ?",
     "options": [
       {"t": "Oui, clairement, c'est frustrant", "w": {"ours": 2}},
       {"t": "Seulement quand je mange de grosses portions", "w": {"lion": 2}},
       {"t": "Surtout quand je grignote par émotion", "w": {"renard": 2}},
       {"t": "Quand j'ai des fringales incontrôlables", "w": {"loup": 2}}
     ]},
    {"q": "Te réveilles-tu la nuit, ou très tôt, avec la faim ?",
     "options": [
       {"t": "Oui, ça m'arrive souvent", "w": {"loup": 2}},
       {"t": "Non, mais je mange tard le soir par envie", "w": {"renard": 2}},
       {"t": "Non, je n'ai pas très faim le matin", "w": {"ours": 1}},
       {"t": "Non, et le matin j'ai une grosse faim", "w": {"lion": 1}}
     ]},
    {"q": "Après avoir (trop) mangé, ressens-tu de la culpabilité ?",
     "options": [
       {"t": "Oui, souvent", "w": {"renard": 2}},
       {"t": "Seulement les jours où je me suis lâché(e)", "w": {"lion": 1}},
       {"t": "Rarement", "w": {"loup": 1}},
       {"t": "Non, mais je m'en veux de ne pas maigrir", "w": {"ours": 1}}
     ]},
    {"q": "Selon toi, qu'est-ce qui t'aiderait le plus ?",
     "options": [
       {"t": "Manger à ma faim, mais moins calorique", "w": {"lion": 2}},
       {"t": "Tenir plus longtemps sans fringale", "w": {"loup": 2}},
       {"t": "Mieux gérer mes émotions face à la nourriture", "w": {"renard": 2}},
       {"t": "Relancer mon métabolisme et bouger plus", "w": {"ours": 2}}
     ]}
  ]
}
```

## 3. Algorithme de résultat (pseudo-code)

```
scores = {lion:0, loup:0, renard:0, ours:0}
pour chaque réponse choisie: pour chaque (type, poids) de w: scores[type] += poids

trier les types par score décroissant -> [dominant, second, ...]
dominant = types[0]
hasSecondary = (scores[second] > 0) ET (scores[second] >= 0.60 * scores[dominant])
secondary = hasSecondary ? second : null

// pour les barres d'affichage
maxScore = scores[dominant]  // (si 0, mettre 1)
pour chaque type: pourcentage[type] = round(scores[type] / maxScore * 100)

// libellé
si hasSecondary: titre = nomAnimal[dominant] + " · " + nomAnimal[secondary]
sinon:          titre = "Tu es un " + nomAnimal[dominant]
```

## 4. Programmes par animal (contenu premium)

**🦁 Lion (Hungry Brain) — volume & densité.** *Pourquoi :* ton cerveau réclame du
volume avant de se sentir rassasié.
- Commence chaque repas par une grande portion de légumes ou une soupe.
- Moitié de l'assiette en légumes, un quart de protéines, un quart de féculents.
- Mise sur les aliments rassasiants et peu denses : légumes, fruits, légumineuses, protéines maigres.
- Bois un grand verre d'eau et laisse 10 min avant de te resservir.
- À limiter : aliments très caloriques et peu volumineux (chips, sauces, sucreries).

**🐺 Loup (Hungry Gut) — stabilité glycémique.** *Pourquoi :* ta satiété ne dure pas.
- Des protéines à chaque repas (œufs, poisson, volaille, tofu, yaourt grec).
- Ajoute fibres et bonnes graisses (légumes, avoine, oléagineux).
- Structure 3 vrais repas plutôt que de multiplier les grignotages.
- Évite les sucres rapides seuls (pic puis fringale).
- À limiter : collations sucrées à jeun (viennoiseries, sodas, bonbons).

**🦊 Renard (Emotional Hunger) — gestion émotionnelle.** *Pourquoi :* ta faim est
souvent déclenchée par les émotions.
- Avant de manger : « Faim du ventre, ou de la tête ? »
- Repère tes déclencheurs (stress, ennui, fatigue) sur 3 jours.
- Alternative rapide : marche 5 min, respiration, verre d'eau, appel à un proche.
- Mange sans écran pour ressentir la satiété.
- À limiter : grignotage automatique devant les écrans (portion dans une assiette).

**🐻 Ours (Slow Burn) — activation métabolique.** *Pourquoi :* ton corps brûle lentement.
- Bouge chaque jour : 7 000–10 000 pas, en augmentant progressivement.
- 2 séances de renforcement musculaire par semaine.
- Soigne ton sommeil (7–8 h).
- Garde assez de protéines pour préserver la masse musculaire.
- À limiter : régimes trop restrictifs (effet yo-yo).

## 5. Événements GA4 à logguer
`app_open`, `language_selected`, `consent_updated`, `test_started`,
`question_answered` (index, type), `test_completed`, `animal_result`
(dominant, secondary), `result_shared`, `program_preview_viewed`,
`paywall_viewed`, `trial_started`, `subscription_started`, `purchase_restored`,
`ad_impression` (format), `push_opt_in`, `push_opened`, `account_created`,
`account_deleted`, `retention_dN`.

---

## 6. Base scientifique de référence & niveau de preuve (IMPORTANT)
- **Réel / vérifiable :** les 4 phénotypes (Hungry Brain, Hungry Gut, Emotional
  Hunger, Slow Burn) proviennent des travaux du Dr Andres Acosta (Mayo Clinic),
  publiés dans la revue *Obesity* (2021), essai pragmatique sur ~450 patients
  (traitement guidé par phénotype → 79 % de patients perdant >10 % du poids vs 35 %).
  Référence : https://onlinelibrary.wiley.com/doi/10.1002/oby.23120
- **Design produit (NON issu de l'étude) :** les noms d'animaux (Lion/Loup/Renard/
  Ours) et leur correspondance aux phénotypes ; les 12 questions, leurs options et
  leurs pondérations ; le seuil de 60 % pour le type secondaire ; les 4 programmes.
- **Niveau de preuve :** l'étude a mesuré les phénotypes par des tests physiologiques
  et des questionnaires validés (apport calorique à un buffet, vidange gastrique,
  échelles de satiété, échelle d'anxiété HADS…), **PAS** par ce quiz de 12 questions.
  Ce questionnaire est donc un **proxy grand public simplifié, non validé
  cliniquement** : c'est un outil de bien-être, pas un instrument diagnostique.
  À faire relire par un(e) diététicien(ne)/médecin avant publication.
