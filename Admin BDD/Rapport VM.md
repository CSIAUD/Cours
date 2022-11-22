# TP VM multi-instances MariaDB
## Cyprien Siaud

### Installation de MariaDB
Après m'être connecté via SSH et avoir fait la commande `su`:

```bash
    apt update
    apt install mariadb-server
```
---

### Vérification de l'installation & arrêt

```bash
root@siaud:/home/cyprien# systemctl status mysql
 mariadb.service MariaDB 10.5.15 database server

    Loaded: loaded (/lib/systemd/system/mariadb.service; enabled; vendor preset: enabled)
    Active: active (running) since Mon 2022-11-21 20:55:12 CET; 2min 55s ago
      Docs: man:mariadbd (8)
            https://mariadb.com/kb/en/library/systemd/
   Process: 1444 ExecStartPre=/usr/bin/install -m 755 -o mysql -g root -d /var/run/mysqld (code=ex
   Process: 1445 ExecStartPre=/bin/sh -c systemctl unset-environment HSREP_START_POSITION (code=e
   Process: 1447 ExecStartPre=/bin/sh -c [ ! -e /usr/bin/galera_recovery ] && VAR= || VAR= cd /u
   Process: 1506 ExecStartPost-/bin/sh -c systemctl unset-environment WSREP_START_POSITION (code=
   Process: 1508 ExecStartPost=/etc/mysql/debian-start (code=exited, status=0/SUCCESS)
  Main PID: 1494 (mariadbd)
    Status: "Taking your SQL requests now..."
     Tasks: 9 (limit: 4638)
    Memory: 69.6M
       CPU: 200ms
    CGroup: /system.slice/mariadb.service
             -1494 /usr/sbin/mariadbd
```

```
    systemctl stop mysql
    systemctl disable mysql
```
```
root@siaud:/home/cyprien# systemctl disable mysql
Removed /etc/systemd/system/multi-user.target.wants/mariadb.service.
```
---

### Création du fichier de configuration

En prennant exemple sur la comande `mysqld_multi --example` je crée le fichier `mysql_multi.cnf` dans `/etc/mysql/conf.d` avec le code :

```bash
[mysqld1]
user = mysql
pid-file = /var/lib/mysql/mysqldi.pid
socket = /var/lib/mysql1/mysqldı.sock
port = 3307
datadir = /var/lib/mysqli
tmpdir = /tmp
log-error = /var/log/mysqldi.log

[mysqld2]
user = mysql
pid-file = /var/lib/mysql/mysqld2.pid
socket = /var/lib/mysql1/mysqld2.sock
port = 3308
datadir = /var/lib/mysq12
tmpdir = /tmp
log-error = /var/log/mysqld2.log

[mysqld3]
user = mysql
pid-file = /var/lib/mysql/mysqld3.pid
socket = /var/lib/mysql/mysqld3.sock
port = 3309
datadir = /var/lib/mysq13
tmpdir = /tmp
log-error = /var/log/mysqld3.log

[mysqld4]
user = mysql
pid-file = /var/lib/mysql/mysqld4.pid
socket = /var/lib/mysql/mysql.sock
port = 3310
datadir = /var/lib/mysql4
tmpdir = /tmp
log-error = /var/log/mysqld4.log

```
---

### Initialisation des datadir

Grace au fichier de configuration précédemment créé et à la commande `mysql_multi start`.

Résultat (pour chaque instance) :

```bash

Installing new database in /var/lib/mysq14

Installing MariaDB/MYSQL system tables in '/var/lib/mysq14' OK

To start mysqld at boot time you have to copy support-files/mysql.server to the right place for your system

Two all-privilege accounts were created. One is root@localhost, it has no password, but you need to be system 'root' user to connect. Use, for example, sudo mysql The second is mysql@localhost, it has no password either, but you need to be the system 'mysql' user to connect. After connecting you can set the password, if you would need to be able to connect as any of these users with a password and without sudo

See the MariaDB Knowledgebase at [https://mariadb.com/kb](https://mariadb.com/kb)

You can start the MariaDB daemon with: cd /usr'; /usr/bin/mysqld_safe --datadir='/var/lib/mysql4'

You can test the MariaDB daemon with [mysql-test-run.pl](http://mysql-test-run.pl/) cd /usr/mysql-test'; per1 [mysql-test-run.pl](http://mysql-test-run.pl/)

Please report any problems at [https://mariadb.org/jira](https://mariadb.org/jira)

The latest information about MariaDB is available at [https://mariadb.org/](https://mariadb.org/).

Consider joining MariaDB's strong and vibrant community: [https://mariadb.org/get-involved/](https://mariadb.org/get-involved/)

```

Vérification du lancement des instances grace à la commande `mysqld_multi report` :

```
root@siaud:/etc/mysql/conf.d# mysqld_multi report
Reporting MariaDB servers
MariaDB server from group: mysqld1 is running
MariaDB server from group: mysqld2 is running
MariaDB server from group: mysqld3 is running
MariaDB server from group: mysqld4 is running
```
