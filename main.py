print(">>> main.py started")
from flask import Flask
from flask_cors import CORS
from flask_restx import Api
from app.routes.landuse_routes import landuse_ns

app = Flask(__name__)
CORS(app)
api = Api(app,doc="/docs")
api.add_namespace(landuse_ns, path="/landuse")

if __name__ == "__main__":
    app.run(debug=True)