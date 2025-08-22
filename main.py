from flask import Flask, send_from_directory
from flask_restx import Api
from flask_cors import CORS 
from pathlib import Path
from app.routes.landuse_routes import landuse_ns

APP_DIR = Path(__file__).resolve().parent / "app"
STATIC_DIR = APP_DIR / "static" / "tiles"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}}) 

# ✅ Serve pmtiles explicitly
@app.route("/static/tiles/<path:filename>")
def serve_pmtiles(filename):
    return send_from_directory(STATIC_DIR, filename, mimetype="application/vnd.pmtiles")

# ✅ Add no-cache headers (fix stale .pmtiles issue)
@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# ✅ Register API
api = Api(app)
api.add_namespace(landuse_ns, path="/landuse")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
