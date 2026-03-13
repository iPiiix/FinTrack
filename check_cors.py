import requests

url = "https://fintrack-api-wawb.onrender.com/auth/register"
headers = {
    "Origin": "https://fin-track-tan-alpha.vercel.app",
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "content-type"
}

print(f"Testing OPTIONS request to {url}...")
try:
    response = requests.options(url, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    print("Headers:")
    for k, v in response.headers.items():
        print(f"  {k}: {v}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting POST /auth/register with dummy data...")
payload = {
    "nombre": "Test",
    "apellidos": "User",
    "email": "test_diagnostics@example.com",
    "contrasena": "Password123!",
    "fecha_nacimiento": "2000-01-01",
    "turnstile_token": "dummy"
}
try:
    response = requests.post(url, json=payload, headers={"Origin": "https://fin-track-tan-alpha.vercel.app"}, timeout=10)
    print(f"Status: {response.status_code}")
    print("Headers:")
    for k, v in response.headers.items():
        print(f"  {k}: {v}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")

print("\nTesting version endpoint...")
try:
    response = requests.get("https://fintrack-api-wawb.onrender.com/", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
