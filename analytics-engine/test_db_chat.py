import requests
import time

url = "http://localhost:8000/api/v1/chatbot/chat"

tests = [
    "hello",
    "Quels sont les KPIs?",
    "Donne-moi les ventes",
    "Quels sont les top produits?",
    "Y a-t-il des produits en rupture de stock?",
]

for msg in tests:
    print(f"\n🔹 Test: {msg}")
    start = time.time()
    try:
        response = requests.post(url, json={"sessionId": "test", "message": msg}, timeout=60)
        elapsed = time.time() - start
        data = response.json()
        print(f"⏱️ {elapsed:.2f}s")
        print(f"📝 {data['response'][:200]}...")
    except Exception as e:
        print(f"❌ Error: {e}")
