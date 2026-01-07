import psycopg2

conn = psycopg2.connect(
    host='localhost', 
    port=5432, 
    database='SalesIQDB', 
    user='postgres', 
    password='Aa123890'
)
cur = conn.cursor()

# List all tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = [r[0] for r in cur.fetchall()]
print("Tables:", tables)

# Get columns for each table
for table in tables:
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'")
    columns = cur.fetchall()
    print(f"\n{table}:")
    for col in columns:
        print(f"  - {col[0]} ({col[1]})")

conn.close()
