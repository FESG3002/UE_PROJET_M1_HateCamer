# 🇨🇲 Détection de Messages Haineux dans le Contexte Camerounais

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Hugging Face](https://img.shields.io/badge/🤗-Hugging%20Face-yellow)](https://huggingface.co/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)

> **Détection intelligente de discours haineux adaptée au contexte linguistique et culturel camerounais**

Un système de détection automatique de messages haineux spécialement conçu pour le contexte camerounais multilingue (français, pidgin English, expressions locales). Le projet inclut un modèle IA optimisé, une API de classification, et une extension Chrome pour WhatsApp Web.

## 🎯 Objectifs du Projet

- **Objectif principal** : Développer un modèle de détection spécialement adapté au contexte linguistique camerounais
- **Application pratique** : Extension Chrome pour détecter les messages haineux en temps réel sur WhatsApp Web
- **Impact social** : Contribuer à un environnement numérique plus sain et inclusif

## ✨ Fonctionnalités Principales

### 🤖 Modèle IA Spécialisé
- **Base** : DistilCamemBERT fine-tuné en 2 phases
- **Vocabulaire étendu** : +1,247 tokens spécifiques au contexte camerounais
- **Performance** : 73% d'accuracy avec optimisation pour maximiser le rappel
- **Langues supportées** : Français, Pidgin English, expressions locales

### 🌐 API de Classification
- **Endpoint REST** : Classification en temps réel
- **Scores de confiance** : Prédictions avec niveaux de certitude
- **Déploiement** : [https://fesg1234-hate-camer.hf.space/docs](https://fesg1234-hate-camer.hf.space/docs)

### 🔧 Extension Chrome
- **Intégration WhatsApp Web** : Détection automatique des messages
- **Alertes visuelles** : Marquage des contenus potentiellement haineux
- **Interface intuitive** : Pop-up d'information et d'alerte

## 📁 Structure du Projet

```
📦 hate-speech-detection-cameroon/
├── 📁 Extension/          # Extension Chrome pour WhatsApp Web
│   ├── manifest.json      # Configuration de l'extension
│   ├── content.js         # Script d'injection WhatsApp
│   ├── popup.html         # Interface utilisateur
│   └── assets/           # Images et styles
├── 📁 Notebook/          # Notebooks Jupyter de développement
│   ├── data_collection.ipynb    # Collecte et scraping
│   ├── model_training.ipynb     # Entraînement du modèle
│   ├── evaluation.ipynb         # Évaluation et métriques
│   └── api_development.ipynb    # Développement API
├── 📁 docs/              # Documentation technique
│   ├── architecture.md   # Architecture du système
│   ├── dataset_info.md   # Description du dataset
│   └── deployment.md     # Guide de déploiement
└── 📄 README.md          # Ce fichier
```

## 🚀 Installation et Utilisation

### Prérequis
```bash
- Python 3.8+
- Node.js (pour l'extension)
- Chrome/Chromium browser
```

### 1. Installation des dépendances Python
```bash
# Cloner le repository
git clone https://github.com/votre-username/hate-speech-detection-cameroon.git
cd hate-speech-detection-cameroon

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Utilisation de l'API
```python
import requests

# Exemple d'utilisation de l'API
url = "https://fesg1234-hate-camer.hf.space/predict"
message = "Votre message à analyser"

response = requests.post(url, json={"text": message})
result = response.json()

print(f"Prédiction: {result['prediction']}")
print(f"Confiance: {result['confidence']}")
```

### 3. Installation de l'Extension Chrome
1. Ouvrir Chrome et aller à `chrome://extensions/`
2. Activer le "Mode développeur"
3. Cliquer sur "Charger l'extension non empaquetée"
4. Sélectionner le dossier `Extension/`
5. L'extension est maintenant active sur WhatsApp Web

## 📊 Performances du Modèle

| Métrique | Valeur |
|----------|--------|
| **Accuracy** | 73% |
| **Précision (classe haineuse)** | 67% |
| **Rappel (classe haineuse)** | 52% |
| **F1-Score (macro)** | 69% |
| **Latence d'inférence** | 320ms |

### 🎯 Stratégie d'Évaluation
- **Priorité au rappel** : Maximiser la détection des messages haineux
- **Corpus spécialisé** : 3,600 messages annotés collaborativement
- **Validation croisée** : Tests sur expressions camerounaises authentiques

## 🗃️ Dataset

### Composition
- **Total** : 3,600 messages annotés
- **Sources** : WhatsApp, YouTube, Facebook (contexte camerounais)
- **Distribution** :
  - Messages haineux : 1,538 (42.7%)
  - Messages non-haineux : 2,062 (57.3%)

### Annotation Collaborative
- **Plateforme** : `collect-hate-msg.institut-visa.com`
- **Annotateurs** : 3 par message minimum
- **Consensus** : Vote majoritaire (2/3)
- **Langues** : Français, Pidgin English, expressions locales

## 🛠️ Technologies Utilisées

### Machine Learning
- **Transformers** : Hugging Face
- **PyTorch** : Framework de deep learning
- **Scikit-learn** : Métriques et preprocessing

### Développement Web
- **FastAPI** : API REST
- **JavaScript** : Extension Chrome
- **HTML/CSS** : Interface utilisateur

### Outils de Développement
- **Jupyter** : Notebooks interactifs
- **Selenium** : Web scraping
- **Git** : Versioning

## 🎓 Méthodologie

### Approche en 2 Phases
1. **Phase 1 - Adaptation au domaine** :
   - Fine-tuning via Masked Language Modeling (MLM)
   - Extension du vocabulaire (+1,247 tokens)
   - 50 époques avec early stopping

2. **Phase 2 - Classification** :
   - Fine-tuning pour classification binaire
   - Rééquilibrage des classes
   - 20 époques avec optimisation du rappel

### Pipeline de Prétraitement
```python
def preprocess_text(text):
    text = remove_entity(text)      # Suppression HTML
    text = change_user(text)        # Normalisation mentions
    text = remove_url(text)         # Suppression URLs
    text = remove_noise_symbols(text)  # Nettoyage bruit
    text = remove_punctuation(text) # Ponctuation excessive
    text = text.lower()             # Minuscules
    text = remove_stopwords(text)   # Stop words français
    text = remove_names(text)       # Noms propres (SpaCy)
    return text
```

## ⚖️ Considérations Éthiques

### Protection des Données
- **Anonymisation** : Suppression automatique des identifiants personnels
- **Minimisation** : Collecte limitée aux données nécessaires
- **Conformité RGPD** : Respect des réglementations de protection des données

### Biais et Équité
- **Identification des biais** : Analyse démographique du dataset
- **Stratégies d'atténuation** : Diversification des sources d'annotation
- **Monitoring continu** : Surveillance des performances par sous-groupes

### Responsabilité
⚠️ **Important** : Ce modèle est conçu comme un outil d'assistance à la décision, pas de substitution à l'analyse humaine. Une vérification manuelle reste nécessaire pour les décisions sensibles.

## 🚀 Déploiement

### API en Production
L'API est déployée sur Hugging Face Spaces :
- **URL** : https://fesg1234-hate-camer.hf.space/docs
- **Documentation** : Interface Swagger intégrée
- **Monitoring** : Métriques de performance en temps réel

### Extension Chrome
1. Package disponible dans `Extension/`
2. Installation manuelle via Chrome Developer Mode
3. Compatible avec WhatsApp Web uniquement

## 📈 Perspectives d'Amélioration

### Court Terme
- [ ] Optimisation des performances (réduction latence)
- [ ] Interface utilisateur améliorée
- [ ] Tests de robustesse étendus

### Moyen Terme
- [ ] Support de langues nationales camerounaises
- [ ] Apprentissage actif avec feedback utilisateur
- [ ] Version mobile (Android/iOS)

### Long Terme
- [ ] Détection multimodale (texte + images + émoticônes)
- [ ] Extension à d'autres contextes africains
- [ ] Intégration avec autres plateformes sociales

## 👥 Équipe de Développement

| Nom | matricule | github|
|-----|-----------|-----------|
| **FOTSING ENGOULOU SIMON GAETAN** | 21Q2024 | https://github.com/FESG3002/ | 
| **NDONKOU FRANCK** | 21T2254 | | 
| **TCHIAZE FOUOSSO ROMERO** | 21T2474 | | 


**Encadrant** : Dr. Messi Thomas

**Institution** : Université de Yaoundé I - Master Data Science

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Guidelines de Contribution
- Respecter les standards de code existants
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire
- Suivre les principes éthiques du projet

## 📞 Contact & Support

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Email** : [fotsingengoulou@gmail.com] pour les questions académiques
- **Documentation** : Consultez le dossier `docs/` pour plus de détails techniques

## 🙏 Remerciements

- **Université de Yaoundé I** : Cadre académique et ressources
- **Communauté open-source** : Hugging Face, PyTorch, FastAPI
- **Annotateurs bénévoles** : Contribution essentielle à la qualité du dataset
- **Dr. Messi Thomas** : Supervision et guidance académique

---

**⭐ Si ce projet vous intéresse, n'hésitez pas à lui donner une étoile !**

*Ce projet contribue à l'effort de recherche sur le traitement automatique du langage naturel en contexte africain plus precisement Camerounais et à la création d'un environnement numérique plus sûr pour les utilisateurs camerounais.*
