from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config

# Database setup
config = Config()
engine = create_engine(config.DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_app():
    app = Flask(__name__)
    app.config.from_object(config)

    # Enable CORS for Next.js frontend and the browser extension
    CORS(app, origins=[
        "http://localhost:3000",  # Next.js dev server
        "chrome-extension://*",  # Chrome/Edge extension
        "moz-extension://*",     # Firefox extension (future)
    ], supports_credentials=True)

    # Register blueprints (routes)
    from app.routes.products import products_bp
    from app.routes.cron import cron_bp
    from app.routes.auth import auth_bp
    from app.routes.collections import collections_bp

    app.register_blueprint(products_bp, url_prefix='/api')
    app.register_blueprint(cron_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(collections_bp, url_prefix='/api')

    return app