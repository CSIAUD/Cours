# L'injection SQL
S’applique à :
- SQL Server (toutes les versions prises en charge)
- Azure SQL Database
- Azure SQL Managed Instance
- Azure Synapse Analytics Analytics
- Platform System (PDW)

## Le fonctionnement
Les injections SQL => insertions directes de code dans les entrées utilisateur concaténées avec des commandes SQL et exécutées.
Des attaques par injection moins directes insèrent un code malveillant dans les chaînes destinées à être stockées dans une table ou en tant que métadonnées.
Lorsque les chaînes stockées sont ensuite concaténées dans une commande SQL dynamique, le code nuisible est exécuté.

injection = terminer prématurément une chaîne de texte et ajouter une nouvelle commande.
Terminer la chaîne injectée par une marque de commentaire « -- ». Le texte qui vient à la suite est ignoré au moment de l'exécution.


```SQL
SELECT * FROM OrdersTable WHERE ShipCity = 'Redmond'
                                            Redmond'; drop table OrdersTable-- => Injection
```
Résultat :
```SQL
SELECT * FROM OrdersTable WHERE ShipCity = 'Redmond'; drop table OrdersTable--'  
```


- `;` => Fin de requête
- `--` => Commentaire
- Si le code modifié est syntaxiquement correct, il sera exécuté par le serveur.
- Exécution => Sélection pour OrdersTable où ShipCity est 'Redmond' puis suppression de OrdersTable.

Code syntaxiquement correct ? Indétectable.
:warning: Vérification des entrées utilisateur :warning:

#### Bonnes pratiques

- :warning: Données utilisateurs reçues.
- Prévoir
  - Insertion fichier JPEG aulieu d'un texte
  - Insertion d'une instruction `DROP TABLE` dans un champ texte
  - ...

- Tester taille et type des données reçues
- Tester le contenu des variables pour n'accepter que les valeurs attendues.
- Rejeter les entrées contenant des données binaires, des séquences de caractères d'échappement et des caractères de commentaire

Peut empêcher l'injection de scripts et protéger contre l'utilisation de dépassements de mémoire tampon.

- Si docs XML, validation les données basée sur les schémas.
- :warning: `Transact-SQL` dans un Input
- Utilisation de procédures stockée
- Validation des données avant d'entrer dans les zones de confiance
- Plusieurs niveaux de validation :
  Les précautions prises contres les utilisateurs malintenttionnés peuvent se révéler inéfficaces contre des pirates déterminés.
  Validation dans les Input et à toutes les étapes du programme
  La validation des données dans une application côté client peut empêcher l'injection de scripts simples.
  Si le niveau suivant considère que son entrée a déjà été validée, un utilisateur malveillant capable de contourner un client peut disposer d'un accès complet à un système.
  Pas de conacténation d'une entrée utilisateur => point d'entrée principal

  Un certain nombre de chaines de caractères sont à bloquer :
  - AUX
  - CLOCK$
  - COM1 à COM8
  - CON
  - CONFIG$
  - LPT1 à LPT8
  - NUL et PRN

Certains caractères sont à rejeter :

| Caractère entré | Signification dans Transact-SQL|
| - | - |
| `;` | Délimiteur de requête |
| `'` | Délimiteur de chaîne de données de caractères |
| `--` | Délimiteur de commentaire sur une seule ligne. Le texte suivant -- jusqu’à la fin de cette ligne n’est pas évalué par le serveur |
| `/* ... */` | Délimiteurs de commentaire. Le serveur n’évalue pas le texte qui figure entre les caractères /* et */ |
| `xp_` | Figure au début du nom des procédures stockées étendues de catalogue, telles que xp_cmdshell |

## Utilisation de paramètres SQL de type sécurisé

SQL Server possède une collection `Parameters` qui fournit le contrôle le type et valide la longueur.
=> Les entrées traitées comme des string pas comme du codeéxecutable
=> Permet des contrôles de type et de longueur.
=> Déclenche une exception si la valeur n'est pas dans les limites.

#### Exemple
Utilisation de la collection `Parameters` :
```JS
SqlDataAdapter myCommand = new SqlDataAdapter("AuthorLogin", conn);  
myCommand.SelectCommand.CommandType = CommandType.StoredProcedure;  
SqlParameter param = myCommand.SelectCommand.Parameters.Add(
  "@au_id",  
  SqlDbType.VarChar,
  11
);  
param.Value = Login.Text;  
```

Le paramètre `@au_id` est traité en tant que valeur littérale et pas en tant que code exécutable.
Le type et la longueur de cette valeur sont controlés.
Si la valeur de `@au_id` n'est pas conforme, une exception est déclenchée.

## Utilisation d'entrées paramétrables avec des procédures stockées

Les injections SQL peuvent cibler les procédures stockées notamment si elles utilisent des entrées non filtrées.

#### Exemple
Un exemple de code vulnérable :
```JS
SqlDataAdapter myCommand = new SqlDataAdapter(
  "LoginStoredProcedure '" + Login.Text + "'", 
  conn);
```
Lors de l'utilisation de pocédures stockées, il est impératif d'utiliser des paramètres en entrée.

## Utilisation de la collection Parameters avec des instructions SQL dynamiques

Si l'utilisation de procédure stockée est impossible, ilest quand même possible d'utiliser des paramètres.

#### Exemple

```JS
SqlDataAdapter myCommand = new SqlDataAdapter(  
  "SELECT au_lname, au_fname FROM Authors WHERE au_id = @au_id",
  conn
);  
SQLParameter param = myCommand.SelectCommand.Parameters.Add(
  "@au_id",
  SqlDbType.VarChar, 
  11
);  
param.Value = Login.Text;
```

## Filtrage des entrées

Le filtrage des entrées peut être utile pour éviter des injections SQL par la suppression des caractères d'échappement.
Peu fiable car beaucoup de caractères peuvent poser problème.

#### Exemple
Recherche des délimiteurs de chaine de caractère
```JS
private string SafeSqlLiteral(string inputSQL)  
{  
  return inputSQL.Replace("'", "''");  
}
```

## Clauses LIKE

Même avec `LIKE`, les caractères génériques devront quand même être séparés par des caractères d’échappement :
```JS
s = s.Replace("[", "[[]");
s = s.Replace("%", "[%]");
s = s.Replace("_", "[_]");
```

## Examen du code à la recherche d'injection SQL

Examination du code qui appelle `EXECUTE`, `EXEC` ou `sp_executesql`.
Utilsation de reqêtes similaires à celle-ci pour identifier des procédures qui contiennent ces instructions.

Recherche de 1, 2, 3 ou 4 espaces après les mots `EXECUTE` ou `EXEC`.
```SQL
SELECT object_Name(id) FROM syscomments  
WHERE UPPER(text) LIKE '%EXECUTE (%'  
OR UPPER(text) LIKE '%EXECUTE  (%'  
OR UPPER(text) LIKE '%EXECUTE   (%'  
OR UPPER(text) LIKE '%EXECUTE    (%'  
OR UPPER(text) LIKE '%EXEC (%'  
OR UPPER(text) LIKE '%EXEC  (%'  
OR UPPER(text) LIKE '%EXEC   (%'  
OR UPPER(text) LIKE '%EXEC    (%'  
OR UPPER(text) LIKE '%SP_EXECUTESQL%';  
```

## Enveloppement de paramètres avec `QUOTENAME()` et `REPLACE()`


Dans chaque procédure stockée vérification que les variables utilisées dans du Transact-SQL dynamique sont traitées correctement. 
Les données issues des paramètres d'entrée de la procédure stockée ou lues à partir d'une table doivent être enveloppées dans QUOTENAME() ou REPLACE().
La valeur de @variable transmise à QUOTENAME() est de type sysname et sa longueur maximale de 128 caractères.

| @variable | Wrapper recommandé |
|-|-|
| Nom d'un élément sécurisable | `QUOTENAME(@variable)` |
| Chaîne ≤ à 128 caractères | `QUOTENAME(@variable, '''')` |
| Chaîne de > 128 caractères | `REPLACE(@variable,'''', '''''')` |

Lorsque vous utilisez cette technique, une instruction SET peut être révisée comme suit :
```SQL
-- Basique:  
SET @temp = N'SELECT * FROM authors WHERE au_lname ='''   
 + @au_lname + N'''';  
  
-- Révisée:  
SET @temp = N'SELECT * FROM authors WHERE au_lname = '''   
 + REPLACE(@au_lname,'''','''''') + N'''';  
```

## Injection activée par la troncature des données

Une variable Transact-SQL dynamique affectée à une variable est tronquée si elle est supérieure à la mémoire tampon allouée à cette variable.
Un attaquant capable de forcer la troncature en transmettant une chaine plus longue peut manipuler le résultat.

La procédure stockée créée par le script suivant court un risque d'injection permis par la troncature.

```SQL
CREATE PROCEDURE sp_MySetPassword  
@loginname sysname,  
@old sysname,  
@new sysname  
AS    
DECLARE @command varchar(200)  
SET @command= 'update Users set password='   
    + QUOTENAME(@new, '''') + ' where username='   
    + QUOTENAME(@loginname, '''') + ' AND password = '   
    + QUOTENAME(@old, '''')  
  
-- Execute the command.  
EXEC (@command)  
GO  
```
En transmettant 154 caractères dans une mémoire tampon de 128 caractères, un attaquant peut définir un nouveau mot de passe sans connaître l’ancien.
```SQL
EXEC sp_MySetPassword 'sa', 'dummy',   
'123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012'''''''''''''''''''''''''''''''''''''''''''''''''''   
```
C'est pourquoi il faut utiliser une mémoire tampon volumineuse pour une variable de commande ou pour exécuter le Transct-SQL dans l'instruction EXECUTE.

---

# Connexion over SSL

SSL => Secure Sockets Layer
TLS => Transport Layer Security (Successeur)
Protocoles de sécurisation des écahnges par réseau informatiques (internet)
Fonctionnement client-serveur, sécurisation par :
- Autentification du serveur
- Confidentialité des Données échangées (session chiffrée)
- Intégrité des données échangées
- Authentification du client souvent assurée par la couche applicative (Optionnel)

Mise en oeuvre facilitée car juste à "ajouter" le SSL/TLS pour passer de HTTP à HTTPS

mTLS => mutual TLS

TLS + Autentification obligatoire du client

Type de connexion sécurisée :
- Utilisateur + mot de passe hashé
- unix_socket (plugin) => connexion basée sur les droits de la session (linux)



tcp + transport
trames

login via session user unix_socket plugin
























---
#Sources
- Injections SQL : [Microsoft](https://learn.microsoft.com/fr-fr/sql/relational-databases/security/sql-injection?view=sql-server-ver16)

- Plugins : [MySQL](https://dev.mysql.com/doc/refman/8.0/en/authentication-plugins.html)
- SSL / TLS / mTLS : [medium](https://medium.com/double-pointer/ssl-vs-tls-vs-mtls-f5e836fe6b6d)