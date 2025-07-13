# KAYA-MD

🤖 **KAYA-MD** est un bot WhatsApp multifonctionnel développé avec Node.js et Baileys, conçu pour automatiser la gestion de groupes, envoyer des messages personnalisés, gérer des commandes avancées et bien plus encore.

---

## Fonctionnalités

- ✅ Gestion des messages de bienvenue et d’adieu dans les groupes  
- 🚫 Anti-link pour bloquer les liens indésirables  
- 🎨 Commandes de personnalisation du texte (fancy, styles)  
- 📚 Système de leçons éducatives intégrées avec IA (OpenAI)  
- ⚙️ Activation/désactivation des statuts (typing, recording)  
- 🚮 Purge massive des membres (admin uniquement)  
- 🔒 Sécurité et contrôle d’accès pour propriétaires et admins  

---

## Liens importants

- 💬 **Groupe WhatsApp** : [Rejoindre le groupe](https://chat.whatsapp.com/TON-LIEN-GROUPE)  
- 📺 **Chaîne WhatsApp** : [Rejoindre la chaîne](https://whatsapp.com/channel/0029Vb6FFPM002T3SKA6bb2D)  
- 📢 **Canal Telegram** : [Rejoindre le canal](https://t.me/techword1)  

---

## Installation

1. Clone le dépôt :  
    ```bash
    git clone https://github.com/ton-utilisateur/ton-repo.git  
    cd ton-repo  
    ```

2. Installe les dépendances :  
    ```bash
    npm install  
    ```

3. Configure ton fichier `config.js` avec tes clés API, owners, et autres paramètres.

4. **Déploiement sur panel**  
   Le bot peut être déployé facilement sur un panel de gestion (ex: Pterodactyl, cPanel, etc.) en configurant les variables d'environnement et en démarrant le fichier principal (`kaya.js`). Assure-toi que Node.js est bien installé sur ton serveur.

5. Lance le bot :  
    ```bash
    node kaya.js  
    ```

---

## Commandes principales

| Commande             | Description                                              |
| -------------------- | --------------------------------------------------------|
| `.welcome on`        | Active le message de bienvenue dans le groupe            |
| `.bye on`            | Active le message d’adieu dans le groupe                  |
| `.antilink on`       | Active la suppression des messages contenant des liens   |
| `.purge`             | Expulse tous les membres du groupe sauf le bot et owner  |
| `.fancy <style> <texte>` | Transforme le texte avec un style spécial             |
| `.lecon`             | Liste les leçons disponibles ou envoie une leçon spécifique |

---

## Contribution

Les contributions sont les bienvenues !  
Merci de créer une branche, faire des commits clairs et ouvrir une Pull Request.

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

## Contact

📧 Pour toute question, contacte [kaya@example.com]  

🌐 [Lien vers ton site ou ton profil GitHub]

---

*Développé avec ❤️ par Kaya.*
