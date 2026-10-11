<?php
if(PHP_SAPI!=='cli')exit(1);
$config=json_decode(stream_get_contents(STDIN),true);
$db=new PDO('sqlite:'.(getenv('READ_DATA_DIR') ?: __DIR__.'/data').'/library.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
$db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, hash TEXT, role TEXT); CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY,user_id TEXT,expires INTEGER); CREATE TABLE IF NOT EXISTS attempts(ip TEXT PRIMARY KEY,count INTEGER,expires INTEGER); CREATE TABLE IF NOT EXISTS books(id TEXT PRIMARY KEY,title TEXT,category TEXT,pages INTEGER,size INTEGER,created INTEGER,storage TEXT); CREATE TABLE IF NOT EXISTS progress(user_id TEXT,book_id TEXT,page INTEGER,updated INTEGER,PRIMARY KEY(user_id,book_id)); CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY,owner TEXT,title TEXT,category TEXT,pages INTEGER,size INTEGER,expires INTEGER,created INTEGER);');
if(!$db->query("SELECT id FROM users WHERE role='admin'")->fetchColumn()){$s=$db->prepare('INSERT INTO users VALUES (?,?,?,?)');$s->execute(['admin',$config['username'],password_hash($config['password'],PASSWORD_DEFAULT),'admin']);}
echo "Local database initialized\n";
