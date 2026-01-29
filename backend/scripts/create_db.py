from pathlib import Path
import sqlite3
import sys

BASE = Path(__file__).resolve().parent.parent
DB_DIR = BASE / 'dbsqlite3'
DB_FILE = DB_DIR / 'db.sqlite3'
SCHEMA = DB_DIR / 'schema.sql'

DB_DIR.mkdir(parents=True, exist_ok=True)

if not SCHEMA.exists():
    sys.exit(f"Falta el archivo de esquema: {SCHEMA}")

conn = sqlite3.connect(str(DB_FILE))
with conn:
    with open(SCHEMA, 'r', encoding='utf-8') as f:
        sql = f.read()
    conn.executescript(sql)

print(f"Base de datos creada en: {DB_FILE}")
