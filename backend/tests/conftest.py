"""
conftest.py — shared pytest fixtures for Wafferly backend tests.
Creates a temporary in-memory SQLite database so tests are isolated
from the real SQL Server database.
"""
import pytest
from app import create_app
from app.models.product import Base, User, Session as UserSession
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid, bcrypt


@pytest.fixture(scope="session")
def app():
    """Create a Flask app configured for testing with SQLite."""
    test_app = create_app()
    test_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    return test_app


@pytest.fixture(scope="session")
def _engine(app):
    """Create an in-memory SQLite engine and build schema."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    # Create collections table (mirrors migrate_collections.py)
    from sqlalchemy import text
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS collections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """))
        # Add collection_id to products if not exists
        try:
            conn.execute(text("ALTER TABLE products ADD COLUMN collection_id INTEGER REFERENCES collections(id)"))
        except Exception:
            pass
    return engine


@pytest.fixture()
def db_session(_engine):
    """Provide a clean SQLAlchemy session that rolls back after each test."""
    connection = _engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def test_user(db_session):
    """Create a test user and return it."""
    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode("utf-8")
    user = User(email="test@wafferly.com", password_hash=hashed, last_login_at=datetime.utcnow())
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def auth_token(db_session, test_user):
    """Create a valid session token for the test user."""
    session = UserSession(
        user_id=test_user.id,
        token=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    db_session.add(session)
    db_session.commit()
    db_session.refresh(session)
    return session.token


@pytest.fixture()
def client(app):
    return app.test_client()
