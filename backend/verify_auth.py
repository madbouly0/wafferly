import requests
import json
import time

BASE_URL = "http://localhost:5000/api"
TEST_EMAIL = "test-wafferly@example.com"
TEST_PASSWORD = "Password123"

def run_tests():
    print("Test 1: Register")
    res = requests.post(f"{BASE_URL}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code in [201, 409] # 409 means it already exists which is fine for repeated runs
    if res.status_code == 201:
        session_token = res.json().get("session_token")
    print("✅ Passed")
    print("-" * 40)

    print("Test 2: Login")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    
    session_token = res.json().get("session_token")
    print("✅ Passed")
    print("-" * 40)
    
    print("Test 3: Get Me")
    headers = {"Authorization": f"Bearer {session_token}"}
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    print("✅ Passed")
    print("-" * 40)

    print("Test 4: Get Dashboard")
    res = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    print("✅ Passed")
    print("-" * 40)

    print("Test 5: Logout")
    res = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    print("✅ Passed")
    print("-" * 40)

    print("Test 6: Get Me (After Logout)")
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 401
    print("✅ Passed")
    print("-" * 40)

    print("All backend Email/Password tests passed successfully! 🎉")

if __name__ == "__main__":
    run_tests()
