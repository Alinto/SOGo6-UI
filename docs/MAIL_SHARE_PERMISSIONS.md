# Mail folder sharing — permission mapping

Reference for how the folder-sharing UI's simplified permissions relate to
the advanced (IMAP-equivalent) permissions, and how each advanced permission
maps to its underlying IMAP ACL right.

Source of truth: `SIMPLIFIED_PERMISSIONS` / `ADVANCED_PERMISSIONS` in
[`src/features/mails/utils/permission-mapping.ts`](../src/features/mails/utils/permission-mapping.ts).
French labels: `src/messages/fr/mails/commons.json`.

## Permissions simplifiées ↔ droits avancés liés

| Permission simplifiée | Droits avancés liés (code IMAP) |
|---|---|
| Lecture | Voir le dossier (l), Lire les mails (r) |
| Modification de mail | Marquer comme lu/non lu (s), Modifier les indicateurs des mails (w) |
| Supprimer un mail | Effacer les mails (t), Purger le dossier (e) |
| Déplacer un mail | Insérer, copier et déplacer des mails (i) |
| Administration des droits sur le dossier | Administrer les droits du dossier (a) |
| Administration des sous-dossiers | Créer des sous-dossiers (k) |

⚠️ Deux droits avancés n'ont pas d'équivalent simplifié et ne sont
accessibles qu'en vue avancée : **Envoyer des mails (p)** et
**Supprimer le dossier (x)**.

## Permissions avancées ↔ droit IMAP

| Permission avancée (label) | Code IMAP |
|---|---|
| Voir le dossier | l |
| Lire les mails | r |
| Marquer comme lu/non lu | s |
| Modifier les indicateurs des mails | w |
| Insérer, copier et déplacer des mails | i |
| Envoyer des mails | p |
| Créer des sous-dossiers | k |
| Supprimer le dossier | x |
| Effacer les mails | t |
| Purger le dossier | e |
| Administrer les droits du dossier | a |
