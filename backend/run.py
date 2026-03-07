from app import create_app
import os

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # Read the port from the environment, or default to 5000
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(debug=True, port=port)