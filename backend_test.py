import requests
import sys
import json
from datetime import datetime

class VastuBlueprintAPITester:
    def __init__(self, base_url="https://vastu-blueprint-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None
        self.session = requests.Session()  # Use session for cookies
        self.auth_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30, use_auth=True):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth header if available and requested
        if use_auth and self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data=user_data,
            use_auth=False
        )
        
        if success and isinstance(response, dict):
            if 'token' in response:
                self.auth_token = response['token']
                print(f"   ✅ Auth token received and stored")
            print(f"   User ID: {response.get('id')}")
            print(f"   User email: {response.get('email')}")
        
        return success, response

    def test_login_admin(self):
        """Test admin login"""
        login_data = {
            "email": "admin@vastuplan.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data,
            use_auth=False
        )
        
        if success and isinstance(response, dict):
            if 'token' in response:
                self.auth_token = response['token']
                print(f"   ✅ Auth token received and stored")
            print(f"   User ID: {response.get('id')}")
            print(f"   User role: {response.get('role')}")
        
        return success, response

    def test_get_me(self):
        """Test getting current user info"""
        return self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )

    def test_logout(self):
        """Test user logout"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "api/auth/logout",
            200
        )
        
        if success:
            print(f"   ✅ Logout successful")
        
        return success, response

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "api/", 200, use_auth=False)

    def test_list_projects(self):
        """Test listing user projects"""
        return self.run_test(
            "List Projects",
            "GET",
            "api/projects",
            200
        )

    def test_generate_project(self):
        """Test project generation with AI"""
        project_data = {
            "plot_length": 40,
            "plot_width": 60,
            "facing_direction": "east",
            "num_floors": 1,
            "bedrooms": 3,
            "kitchen": 1,
            "bathrooms": 2,
            "pooja_room": 1,
            "parking": 1,
            "style": "modern",
            "budget_range": "medium"
        }
        
        success, response = self.run_test(
            "Generate Project with AI",
            "POST",
            "api/projects/generate",
            200,
            data=project_data,
            timeout=60  # AI generation takes time
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.project_id = response['id']
            print(f"   Generated project ID: {self.project_id}")
            print(f"   Project name: {response.get('name', 'N/A')}")
            print(f"   Vastu score: {response.get('vastu_overall_score', 'N/A')}")
            print(f"   Number of rooms: {len(response.get('rooms', []))}")
            
            # Validate response structure
            required_fields = ['id', 'name', 'rooms', 'vastu_overall_score']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️ Missing fields: {missing_fields}")
                return False, response
            
            # Validate rooms structure
            rooms = response.get('rooms', [])
            if rooms:
                room = rooms[0]
                room_fields = ['id', 'name', 'room_type', 'x', 'y', 'width', 'height', 'vastu_score']
                missing_room_fields = [field for field in room_fields if field not in room]
                if missing_room_fields:
                    print(f"   ⚠️ Missing room fields: {missing_room_fields}")
                else:
                    print(f"   ✅ Room structure validated")
            
        return success, response

    def test_get_project(self):
        """Test getting project by ID"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        return self.run_test(
            "Get Project by ID",
            "GET",
            f"api/projects/{self.project_id}",
            200
        )

    def test_update_rooms(self):
        """Test updating room positions"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        # First get the current project to get rooms
        success, project_data = self.test_get_project()
        if not success:
            return False, {}
        
        rooms = project_data.get('rooms', [])
        if not rooms:
            print("❌ No rooms to update")
            return False, {}
        
        # Modify first room position slightly
        updated_rooms = rooms.copy()
        if updated_rooms:
            updated_rooms[0]['x'] = updated_rooms[0]['x'] + 1
            updated_rooms[0]['y'] = updated_rooms[0]['y'] + 1
        
        return self.run_test(
            "Update Room Positions",
            "PUT",
            f"api/projects/{self.project_id}/rooms",
            200,
            data=updated_rooms
        )

    def test_copilot_chat(self):
        """Test AI copilot chat"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        chat_data = {
            "project_id": self.project_id,
            "message": "How can I improve the Vastu score of this layout?"
        }
        
        return self.run_test(
            "AI Copilot Chat",
            "POST",
            "api/copilot",
            200,
            data=chat_data,
            timeout=60  # AI response takes time
        )

    def test_cost_estimate(self):
        """Test cost estimation"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        success, response = self.run_test(
            "Cost Estimation",
            "GET",
            f"api/projects/{self.project_id}/cost-estimate",
            200
        )
        
        if success and isinstance(response, dict):
            required_fields = ['total_area', 'construction_cost', 'cost_per_sqft', 'boq']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️ Missing cost fields: {missing_fields}")
            else:
                print(f"   ✅ Cost structure validated")
                print(f"   Total area: {response.get('total_area')} sq.ft")
                print(f"   Construction cost: ₹{response.get('construction_cost', 0):,.0f}")
        
        return success, response

    def test_get_revisions(self):
        """Test getting project revisions"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        success, response = self.run_test(
            "Get Project Revisions",
            "GET",
            f"api/projects/{self.project_id}/revisions",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} revisions")
            if response:
                revision = response[0]
                required_fields = ['id', 'project_id', 'version', 'label', 'rooms', 'vastu_overall_score', 'created_at']
                missing_fields = [field for field in required_fields if field not in revision]
                if missing_fields:
                    print(f"   ⚠️ Missing revision fields: {missing_fields}")
                else:
                    print(f"   ✅ Revision structure validated")
                    print(f"   Latest revision: v{revision.get('version')} - {revision.get('label')}")
                    self.latest_revision_id = revision.get('id')
        
        return success, response

    def test_restore_revision(self):
        """Test restoring a revision"""
        if not self.project_id or not hasattr(self, 'latest_revision_id'):
            print("❌ Skipping - No project ID or revision ID available")
            return False, {}
        
        return self.run_test(
            "Restore Revision",
            "POST",
            f"api/projects/{self.project_id}/revisions/{self.latest_revision_id}/restore",
            200
        )

    def test_compare_revisions(self):
        """Test comparing two revisions"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        # First get revisions to get IDs for comparison
        success, revisions = self.test_get_revisions()
        if not success or len(revisions) < 2:
            print("❌ Skipping - Need at least 2 revisions for comparison")
            return False, {}
        
        rev_id_a = revisions[0]['id']
        rev_id_b = revisions[1]['id']
        
        success, response = self.run_test(
            "Compare Revisions",
            "GET",
            f"api/projects/{self.project_id}/revisions/compare/{rev_id_a}/{rev_id_b}",
            200
        )
        
        if success and isinstance(response, dict):
            required_fields = ['revision_a', 'revision_b', 'score_diff', 'room_changes']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"   ⚠️ Missing comparison fields: {missing_fields}")
            else:
                print(f"   ✅ Comparison structure validated")
                print(f"   Score difference: {response.get('score_diff', 0):.1f}")
                print(f"   Room changes: {len(response.get('room_changes', []))}")
        
        return success, response

    def test_update_plumbing(self):
        """Test updating plumbing elements"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        # Get current project to get plumbing elements
        success, project_data = self.test_get_project()
        if not success:
            return False, {}
        
        plumbing = project_data.get('plumbing', [])
        if not plumbing:
            print("❌ No plumbing elements to update")
            return False, {}
        
        # Modify first plumbing element position
        updated_plumbing = plumbing.copy()
        if updated_plumbing:
            updated_plumbing[0]['x'] = updated_plumbing[0]['x'] + 1
            updated_plumbing[0]['y'] = updated_plumbing[0]['y'] + 1
        
        return self.run_test(
            "Update Plumbing Elements",
            "PUT",
            f"api/projects/{self.project_id}/plumbing",
            200,
            data=updated_plumbing
        )

    def test_update_electrical(self):
        """Test updating electrical elements"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        # Get current project to get electrical elements
        success, project_data = self.test_get_project()
        if not success:
            return False, {}
        
        electrical = project_data.get('electrical', [])
        if not electrical:
            print("❌ No electrical elements to update")
            return False, {}
        
        # Modify first electrical element position
        updated_electrical = electrical.copy()
        if updated_electrical:
            updated_electrical[0]['x'] = updated_electrical[0]['x'] + 1
            updated_electrical[0]['y'] = updated_electrical[0]['y'] + 1
        
        return self.run_test(
            "Update Electrical Elements",
            "PUT",
            f"api/projects/{self.project_id}/electrical",
            200,
            data=updated_electrical
        )

    def test_delete_project(self):
        """Test deleting a project"""
        if not self.project_id:
            print("❌ Skipping - No project ID available")
            return False, {}
        
        return self.run_test(
            "Delete Project",
            "DELETE",
            f"api/projects/{self.project_id}",
            200
        )

def main():
    print("🏗️ Starting Vastu Blueprint API Testing...")
    print("=" * 60)
    
    tester = VastuBlueprintAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_register_user,
        tester.test_login_admin,  # Switch to admin for full access
        tester.test_get_me,
        tester.test_list_projects,
        tester.test_generate_project,
        tester.test_get_project,
        tester.test_update_rooms,
        tester.test_update_plumbing,
        tester.test_update_electrical,
        tester.test_copilot_chat,
        tester.test_cost_estimate,
        tester.test_get_revisions,
        tester.test_restore_revision,
        tester.test_compare_revisions,
        tester.test_delete_project,
        tester.test_logout
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())