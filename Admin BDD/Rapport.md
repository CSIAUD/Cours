# TP Réplication BDD
## Cyprien Siaud

### Création des Alisa pour les BDD
```bash
alias my1='mysql -S /var/lib/mysql1/mysql1.sock'
alias my2='mysql -S /var/lib/mysql2/mysql2.sock'
alias my3='mysql -S /var/lib/mysql3/mysql3.sock'
alias my4='mysql -S /var/lib/mysql4/mysql4.sock'
```

---

### Création de la BDD

```SQL
CREATE DATABASE siaud;
use siaud
CREATE TABLE devices (id INT PRIMARY KEY NOT NULL, name VARCHAR(100), type VARCHAR(100));
INSERT INTO devices VALUES (0, 'perso', 'phone');
```

---

### Réplication
Ajout des paramètres dpour la réplication dans `/etc/mysql/conf.d/mysql_multi.cnf`:

Pour le master :
```bash
log-bin
server_id=1
log-basename=master1
binlog-format=mixed
```

Pour le slave :
```bash
log-bin
server_id=2
log-basename=slave1
binlog-format=mixed
...
```

Cration d'un utilisateur pour la réplication (depuis le mysql général) :
```SQL
CREATE USER 'replication_user'@'localhost' IDENTIFIED BY 'bigs3cret';
GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'localhost';
```

Récupération de la position du binary log du master :
```SQL
FLUSH TABLES WITH READ LOCK;
Query OK, 0 rows affected (0.012 sec)

SHOW MASTER STATUS;
+--------------------+----------+--------------+------------------+
| File               | Position | Binlog_Do_DB | Binlog_Ignore_DB |
+--------------------+----------+--------------+------------------+
| master1-bin.000004 |      702 |              |                  |
+--------------------+----------+--------------+------------------+
1 row in set (0.000 sec)

```

exécution de `UNLOCK TABLES` pour libérer l'utilisation de la BDD.

### Allumage du Slave

```sql

CHANGE MASTER TO
  MASTER_HOST='localhost',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='bigs3cret',
  MASTER_PORT=3307,
  MASTER_LOG_FILE='master1-bin.000004',
  MASTER_LOG_POS=702,
  MASTER_CONNECT_RETRY=10;

START SLAVE;

SHOW SLAVE STATUS \G
```

Résultat :
```bash
Slave_IO_Running: Yes
Slave_SQL_Running: Yes
```
