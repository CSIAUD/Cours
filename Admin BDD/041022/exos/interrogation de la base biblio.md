# interrogation de la base biblio

1. Sélectionnez tous les adhérents qui ont pour prénom 'Abel' 

```sql
SELECT * FROM adherent a WHERE a.prenom LIKE 'Abel'
=> 1 résultat
```

2. Combien de fois a été emprunté le livre dont l'id est 15 ? 

```sql
SELECT count(*) from emprunt e WHERE e.id_livre = 15 GROUP BY e.id_livre
2
```

3. Combien de fois a été rendu le livre dont l'id est 15 ?

```sql
SELECT count(*) from emprunt e WHERE e.id_livre = 15 AND e.date_retour IS NOT NULL GROUP BY e.id_livre
2
```

4. Quel est le nombre de d'adhérents ?

```sql
SELECT count(*) from adherent
100
```

5. Combien de livres contient la bibliothèque ?

```sql
SELECT count(*) from livre
788
```

6. Quels sont les livres qui n'ont pas d'auteur ?

```sql
SELECT l.titre FROM livre l INNER JOIN ecrit e ON l.id_livre=e.id_livre WHERE e.id_auteur IS NULL
aucun
```

7. Quels sont les livres qui ont plus d'un auteur ?

```sql

```

8. Quels sont les livres qui n'ont jamais été empruntés ?

```sql
SELECT l.titre FROM livre l WHERE l.id_livre NOT IN (SELECT e.id_livre FROM emprunt e)
=> 302 résultats
```

9.  Quels sont les livres en cours d'emprunt ?

```sql
SELECT l.titre FROM livre l WHERE l.id_livre IN (SELECT e.id_livre FROM emprunt e WHERE e.date_retour IS NULL)
=> 45 résultats
```

10. Quels sont les livres en cours d'emprunt et en retard ?

```sql

```

11. Afficher pour chaque livre le nombre d'exemplaires disponibles ?

```sql
SELECT l.titre, l.nb_exemplaire FROM livre l
=> 788 résultats
```

12. Afficher les id des adhérents et leur nombre d'emprunts ayant fait plus de 5 emprunts après le 01/07/2017

```sql
SELECT e.id_adherent, count(e.id_livre) FROM emprunt e WHERE e.date_emprunt > '2017-07-01' GROUP BY e.id_adherent HAVING count(e.id_livre)>5
=> 54 résultats
```

13. Le nom de l'auteur le plus emprunté 

```sql

```

