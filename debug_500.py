import requests
import json

url = "https://fintrack-api-wawb.onrender.com/auth/register"
payload = {
    "nombre": "Santi",
    "apellidos": "Perez",
    "email": "santiperez_diagnostic_03@gmail.com",
    "contrasena": "TestPassword123!",
    "fecha_nacimiento": "2005-11-24",
    "turnstile_token": "dummy" # This is important
}

print(f"Sending POST to {url}...")
try:
    response = requests.post(url, json=payload, headers={"Origin": "https://fin-track-tan-alpha.vercel.app"}, timeout=15)
    print(f"Status Code: {response.status_code}")
    print("Response Headers:")
    for k, v in response.headers.items():
        print(f"  {k}: {v}")
    print("\nResponse Body:")
    print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
