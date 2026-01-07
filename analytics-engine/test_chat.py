import requests
import time

url = "http://localhost:8000/api/v1/chatbot/chat"

# Test 1: Simple greeting
print("Test 1: hello")
start = time.time()
response = requests.post(url, json={"sessionId": "test", "message": "hello"})
elapsed = time.time() - start
print(f"Response ({elapsed:.2f}s): {response.json()}")

# Test 2: French greeting
print("\nTest 2: bonjour")
start = time.time()
response = requests.post(url, json={"sessionId": "test", "message": "bonjour"})
elapsed = time.time() - start
print(f"Response ({elapsed:.2f}s): {response.json()}")

# Test 3: Real question (uses LLM)
print("\nTest 3: Quels sont les KPIs?")
start = time.time()
response = requests.post(url, json={"sessionId": "test", "message": "Quels sont les KPIs?"})
elapsed = time.time() - start
print(f"Response ({elapsed:.2f}s): {response.json()}")
