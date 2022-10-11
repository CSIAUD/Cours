#L'injection SQL
##Le fonctionnement
Les injections SQL prennent principalement la forme d'insertions directes de code dans les entrées utilisateur qui sont concaténées avec des commandes SQL et exécutées.
Des attaques par injection moins directes insèrent un code malveillant dans les chaînes destinées à être stockées dans une table ou en tant que métadonnées.
Lorsque les chaînes stockées sont ensuite concaténées dans une commande SQL dynamique, le code nuisible est exécuté.

Le processus d'injection consiste à terminer prématurément une chaîne de texte et à ajouter une nouvelle commande.
Étant donné que la commande insérée peut avoir d'autres chaînes ajoutées préalablement à son exécution, l'attaquant termine la chaîne injectée par une marque de commentaire « -- ». Le texte qui vient à la suite est ignoré au moment de l'exécution.

####Exemples

Le script suivant montre un exemple d'injection SQL simple.
Il crée une requête SQL en concaténant des chaînes codées de manière irréversible avec une chaîne entrée par l'utilisateur :
```
var Shipcity;
ShipCity = Request.form ("ShipCity");
var sql = "select * from OrdersTable where ShipCity = '" + ShipCity + "'";
```

L'utilisateur est invité à entrer le nom d'une ville. Si l'utilisateur entre Redmond, la requête assemblée par le script ressemble à ce qui suit :
```
SELECT * FROM OrdersTable WHERE ShipCity = 'Redmond'
```

Mais supposons que l'utilisateur entre ce qui suit :
```
Redmond'; drop table OrdersTable--
```

Dans ce cas, la requête assemblée par le script est la suivante :
```
SELECT * FROM OrdersTable WHERE ShipCity = 'Redmond'; drop table OrdersTable--'  
```

- Le point-virgule `;` indique la fin d'une requête et le début d'une autre.
- Le double tiret `--` signifie que le reste de la ligne courante est un commentaire et qu'elle doit être ignorée.
- Si le code modifié est syntaxiquement correct, il sera exécuté par le serveur.
- Lorsque SQL Server exécute cette instruction, SQL Server va d'abord sélectionner tous les enregistrements OrdersTable où ShipCity est Redmond.
- Ensuite, SQL Server supprime OrdersTable.

Tant que le code SQL injecté est syntaxiquement correct, il n'est pas possible de détecter par programme cette modification.
Par conséquent, il est impératif de valider toutes les entrées utilisateur et vérifier très attentivement le code qui exécute les commandes SQL construites dans le serveur utilisé.

##Validation de TOUTES les données

Il est impératif de valider les entrées utilisateur en testant le type, la longueur, le format et la plage.
Plusieurs paramètres sont à prendre en compte lors de la mise en place des consignes à suivre contre les entrées malveillantes notamment l'architecture et les scénarios de déploiement de l'application.
Tout programme conçu pour s'exécuter dans un environnement sécurisé peut être copié dans  un environnement non sécurisé.

####Quelques bonnes pratiques

- Se méfier de TOUTES les données utilisateurs reçues.
- Anticiper le comportement de l'application si :
  - Un utilisateur malintensionné entre un fichier JPEG alors qu'un code postal est attendu
  - Un utilisateur insert une instruction `DROP TABLE` dans un champ texte
  - ...

- Tester la taille et le type des données reçues pour y appliquer des limites strictes (Cela peut permettre d'éviter les dépassemnt volontaires de mémoire tampon).
- Tester le contenu des variables pour n'accepter que les valeurs attendues.
- Rejeter les entrées contenant des données binaires, des séquences de caractères d'échappement et des caractères de commentaire

Cela peut empêcher l'injection de scripts et protéger contre l'utilisation de dépassements de mémoire tampon.

- Lors de l'utilisation de documents XML, il est impératif de valider les données en fonction de leurs schémas.
- La Création d'instruction `Transact-SQL` à partir de l'entrée utilisateur est également à proscrire.
- L'utilisation de procédures stockée est quant à elle est grandemment recommandée pour la  validation des données uiilisateurs.
- Dans des environnements à plusieurs niveaux, toutes les données doivent être validées avant leur acceptation dans la zone de confiance. Les données qui ne passent pas le processus de validation doivent être rejetées et une erreur doit être renvoyée au niveau précédent.
- L'implémentation de plusieurs niveaux de validation :
  Les précautions prises contres les utilisateurs malintenttionnés peuvent se révéler inéfficaces contre des pirates déterminés.

  Une meilleure pratique consiste à valider les entrées dans l'interface utilisateur, puis à tous les points ultérieurs auxquels elles rencontrent une limite de confiance.

  Par exemple, la validation des données dans une application côté client peut empêcher l'injection de scripts simples.
  En revanche, si le niveau suivant considère que son entrée a déjà été validée, un utilisateur malveillant capable de contourner un client peut disposer d'un accès complet à un système.

  La concaténation d'une entrée utilisateur non validée est à proscrire, c'est le point d'entrée principal pour l'injection de scripts.

  Un certain nombre de chaines de caractères sont à bloquer dans les champs à partir desquels il est possible de construire des noms de fichiers :
  - AUX
  - CLOCK$
  - COM1 à COM8
  - CON
  - CONFIG$
  - LPT1 à LPT8
  - NUL et PRN

Si possible, certains caractères sont à rejeter :

| Caractère entré | Signification dans Transact-SQL|
| - | - |
| `;` | Délimiteur de requête |
| `'` | Délimiteur de chaîne de données de caractères |
| `--` | Délimiteur de commentaire sur une seule ligne. Le texte suivant -- jusqu’à la fin de cette ligne n’est pas évalué par le serveur |
| `/* ... */` | Délimiteurs de commentaire. Le serveur n’évalue pas le texte qui figure entre les caractères /* et */ |
| `xp_` | Figure au début du nom des procédures stockées étendues de catalogue, telles que xp_cmdshell |

##Utilisation de paramètres SQL de type sécurisé

SQL Server possède une collection `Parameters` qui fournit le contrôle le type et valide la longueur.
Avec l'utilisation de cette même collection, les entrées sont traitées comme des valeurs littérales et non comme du code exécutable.
L'utilisation de la collection `Parameters` présente un avantage de taille, elle permet des contrôles de type et de longueur.
Si une valeur n'est pas comprise dans les limites établies, elle déclenche une exception.

####Exemple
Utilisation de la collection `Parameters` :
```
SqlDataAdapter myCommand = new SqlDataAdapter("AuthorLogin", conn);  
myCommand.SelectCommand.CommandType = CommandType.StoredProcedure;  
SqlParameter parm = myCommand.SelectCommand.Parameters.Add("@au_id",  
     SqlDbType.VarChar, 11);  
parm.Value = Login.Text;  
```

Dans cet exemple, le paramètre `@au_id` est traité en tant que valeur littérale et non pas en tant que code exécutable.
Le type et la longueur de cette valeur font l'objet d'un contrôle.
Si la valeur du paramètre `@au_id` n'est pas conforme aux contraintes de type et de longueur, une exception est déclenchée.

##Utilisation d'entrées paramétrables avec des procédures stockées

Les injections SQL peuvent cibler les procédures stockées notamment si elles utilisent des entrées non filtrées.

####Exemple
Un exemple de code vulnérable :
```
SqlDataAdapter myCommand = new SqlDataAdapter("LoginStoredProcedure '" + Login.Text + "'", conn);
```
Lors de l'utilisation de pocédures stockées, il est impératif d'utiliser des paramètres en entrée.

##Utilisation de la collection Parameters avec des instructions SQL dynamiques

Si l'utilisation de procédure stockée est impossible, ilest quand même possible d'utiliser des paramètres.

####Exemple

```
SqlDataAdapter myCommand = new SqlDataAdapter(  
  "SELECT au_lname, au_fname FROM Authors WHERE au_id = @au_id",
  conn
);  
SQLParameter parm = myCommand.SelectCommand.Parameters.Add("@au_id",SqlDbType.VarChar, 11);  
Parm.Value = Login.Text;
```

##Filtrage des entrées

Le filtrage des entrées peut également être utile pour protéger des risques d'injection SQL par la suppression des caractères d'échappement.
Cela reste un moyen de défense peu fiable à cause du nombre élevé de caractères suceptibles de causer des problèmes.

####Exemple
Un bout de code permettant de rechercher les délimiteurs de chaine de caractère
```
private string SafeSqlLiteral(string inputSQL)  
{  
  return inputSQL.Replace("'", "''");  
}
```

##Clauses LIKE

Même avec l'utilisation de la clause `LIKE`, les caractères génériques devront quand même être séparés par des caractères d’échappement :
```
s = s.Replace("[", "[[]");  
s = s.Replace("%", "[%]");  
s = s.Replace("_", "[_]");  
```

##Examen du code à la recherche d'injection SQL

Il est nécessaire d'examiner l'ensemble du code qui appelle `EXECUTE`, `EXEC` ou `sp_executesql`.
L'utilsation de reqêtes similaires à l'exemple suivant afin de faciliter l'identification des procédures contenant ces instructions est également possible.

Cette requête recherche les 1, 2, 3 ou 4 espaces après les mots `EXECUTE` ou `EXEC`.
```
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

##Enveloppement de paramètres avec `QUOTENAME()` et `REPLACE()`


Dans chaque procédure stockée sélectionnée, vérifiez que toutes les variables utilisées dans du Transact-SQL dynamique sont traitées correctement. 
Les données issues des paramètres d'entrée de la procédure stockée ou lues à partir d'une table doivent être enveloppées dans QUOTENAME() ou REPLACE().
Gardez à l’esprit que la valeur de @variable transmise à QUOTENAME() est de type sysname et sa longueur maximale de 128 caractères.

| @variable | Wrapper recommandé |
|-|-|
| Nom d'un élément sécurisable | `QUOTENAME(@variable)` |
| Chaîne ≤ à 128 caractères | `QUOTENAME(@variable, '''')` |
| Chaîne de > 128 caractères | `REPLACE(@variable,'''', '''''')` |





































---
#Sources
- Injections SQL : [Microsoft](https://learn.microsoft.com/fr-fr/sql/relational-databases/security/sql-injection?view=sql-server-ver16)