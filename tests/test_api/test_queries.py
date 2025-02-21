import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.template import QueryTemplate
from app.models.user import User

client = TestClient(app)

def test_execute_query(test_db, test_user):
    # Create a test template
    template = QueryTemplate(
        name="Test Template",
        description="Test Description",
        database_uri="sqlite:///test.db",
        example_queries=[
            {
                "question": "What is the total sales?",
                "query": "SELECT SUM(amount) FROM sales"
            }
        ],
        user_id=test_user.id
    )
    test_db.add(template)
    test_db.commit()

    # Test query execution
    response = client.post(
        f"/api/v1/queries/{template.id}",
        headers={"X-API-Key": test_user.api_key},
        json={"question": "What is the total sales?"}
    )
    
    assert response.status_code == 200
    assert "status" in response.json()
    assert "result" in response.json()

def test_execute_query_template_not_found(test_db, test_user):
    response = client.post(
        "/api/v1/queries/999",
        headers={"X-API-Key": test_user.api_key},
        json={"question": "What is the total sales?"}
    )
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Template not found"

def test_execute_query_unauthorized():
    response = client.post(
        "/api/v1/queries/1",
        headers={"X-API-Key": "invalid_key"},
        json={"question": "What is the total sales?"}
    )
    
    assert response.status_code == 401 