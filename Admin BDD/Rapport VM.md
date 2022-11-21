# TP VM multi-instances MariaDB
## Cyprien Siaud

### Installation de MariaDB
Après m'être connecté en root via SSH
```bash
    apt install mariadb-server
```

systemctl status mysql
systemctl stop mysql
systemctl status mysql
systemctl disable mysql
cd /etc/mysql/mariadb.conf.d/
mv -v 50-server.cnf 50-server.cnf.zz
nano 50-server-multi.cnf

```bash
[mysqld_multi]
mysqld     = /usr/bin/mysqld_safe
mysqladmin = /usr/bin/mysqladmin
log    = /var/log/mysql/mysqld_multi.log
user=multi_admin
password=Vamshi06
```

---

wget https://github.com/datacharmer/test_db

---

    ps aux | grep mysql
    ss -lntp
    ls -alth /run/mysql

source .bashrc

    commande : mysql
MARIADB :
SHOW VARIABLES LIKE "%socket%"

whereis mysql

---

config pour 1 instance :
datadir
- blog
- istmp
- mysql
- performance.schema

port
socket
pid.file

---

mysql_multi --help 
mysql_multi start 1-4
--log=/tmp/log 
less /tmp/log

~~bin=mysqld_safe~~

---
dans dossier avec employees.sql
mysql < employees.sql

---
man mysql > pour connexion mysql

---
1 fichier de conf pour 4 instances (1/instance si service)