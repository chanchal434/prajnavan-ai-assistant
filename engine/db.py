import sqlite3

def init_db():
    con = sqlite3.connect('Prajñāvan.db')
    cursor = con.cursor()

    # Chat History Table: Stores conversation for LLM memory
    cursor.execute('''CREATE TABLE IF NOT EXISTS chat_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        sender TEXT NOT NULL,
                        message TEXT NOT NULL)''')

    # System Commands Table: For opening local applications
    cursor.execute('''CREATE TABLE IF NOT EXISTS sys_command (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL UNIQUE,
                        path TEXT NOT NULL)''')

    # Web Commands Table: For opening specific URLs
    cursor.execute('''CREATE TABLE IF NOT EXISTS web_command (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL UNIQUE,
                        url TEXT NOT NULL)''')

    con.commit()
    con.close()

if __name__ == '__main__':
    init_db()
