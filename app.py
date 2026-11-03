import os
import json
import time
from functools import wraps
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'katalog-snack-ibu-secret-2026')

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'database.json')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_db():
    if not os.path.exists(DATA_FILE):
        return {
            "store": {
                "name": "Dapur Snack Ibu",
                "tagline": "Camilan Renyah & Lezat Buatan Rumah",
                "logo_url": "/static/images/default-logo.svg",
                "whatsapp_number": "6281234567890",
                "admin_password": "admin"
            },
            "snacks": [],
            "packages": []
        }
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if 'admin_password' not in data.get('store', {}):
            data.setdefault('store', {})['admin_password'] = 'admin'
        return data

def save_db(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            return jsonify({"success": False, "error": "Akses ditolak. Silakan login terlebih dahulu."}), 401
        return f(*args, **kwargs)
    return decorated_function

# Public catalog page
@app.route('/')
def index():
    return render_template('index.html')

# Admin login page & API
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        payload = request.get_json() or {}
        password = payload.get('password', '').strip()
        db = load_db()
        actual_password = db.get('store', {}).get('admin_password', 'admin')
        if password == actual_password:
            session['is_admin'] = True
            return jsonify({"success": True})
        return jsonify({"success": False, "error": "Password salah! Silakan coba lagi."}), 401
    
    if session.get('is_admin'):
        return redirect('/admin')
    return render_template('login.html')

# Admin management page (Protected)
@app.route('/admin')
def admin():
    if not session.get('is_admin'):
        return redirect('/admin/login')
    return render_template('admin.html')

# Admin logout
@app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    return redirect('/')

# Uploaded images route
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# API: Get all public data (Password admin disembunyikan dari publik)
@app.route('/api/data', methods=['GET'])
def get_data():
    db = load_db()
    public_data = json.loads(json.dumps(db))
    if 'store' in public_data:
        public_data['store'].pop('admin_password', None)
    return jsonify(public_data)

# API: Update store settings (name, tagline, whatsapp, password)
@app.route('/api/settings', methods=['POST'])
@admin_required
def update_settings():
    db = load_db()
    payload = request.get_json() or {}
    
    if 'name' in payload and payload['name'].strip():
        db['store']['name'] = payload['name'].strip()
    if 'tagline' in payload:
        db['store']['tagline'] = payload['tagline'].strip()
    if 'whatsapp_number' in payload:
        cleaned_wa = ''.join(c for c in payload['whatsapp_number'] if c.isdigit())
        db['store']['whatsapp_number'] = cleaned_wa
    if 'logo_url' in payload and payload['logo_url'].strip():
        db['store']['logo_url'] = payload['logo_url'].strip()
    if 'admin_password' in payload and payload['admin_password'].strip():
        db['store']['admin_password'] = payload['admin_password'].strip()

    save_db(db)
    res_store = dict(db['store'])
    res_store.pop('admin_password', None)
    return jsonify({"success": True, "store": res_store})

# API: Upload image (Logo or food image)
@app.route('/api/upload', methods=['POST'])
@admin_required
def upload_image():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "Tidak ada file yang diunggah"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "File kosong"}), 400
    
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit('.', 1)[1].lower()
        new_name = f"img_{int(time.time() * 1000)}.{ext}"
        safe_path = os.path.join(app.config['UPLOAD_FOLDER'], new_name)
        file.save(safe_path)
        file_url = f"/uploads/{new_name}"
        return jsonify({"success": True, "url": file_url})
    
    return jsonify({"success": False, "error": "Format file tidak didukung (gunakan PNG, JPG, JPEG, atau WebP)"}), 400

# API: Snacks CRUD
@app.route('/api/snacks', methods=['POST'])
@admin_required
def add_snack():
    db = load_db()
    payload = request.get_json() or {}
    
    name = payload.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "Nama snack wajib diisi"}), 400
    
    new_id = 1
    if db['snacks']:
        new_id = max(s['id'] for s in db['snacks']) + 1

    snack = {
        "id": new_id,
        "name": name,
        "price": int(payload.get('price', 0)),
        "description": payload.get('description', '').strip(),
        "image_url": payload.get('image_url', '').strip() or "/static/images/default-logo.svg",
        "badge": payload.get('badge', '').strip()
    }
    db['snacks'].append(snack)
    save_db(db)
    return jsonify({"success": True, "snack": snack})

@app.route('/api/snacks/<int:snack_id>', methods=['PUT'])
@admin_required
def update_snack(snack_id):
    db = load_db()
    payload = request.get_json() or {}
    
    snack = next((s for s in db['snacks'] if s['id'] == snack_id), None)
    if not snack:
        return jsonify({"success": False, "error": "Snack tidak ditemukan"}), 404
    
    if 'name' in payload and payload['name'].strip():
        snack['name'] = payload['name'].strip()
    if 'price' in payload:
        snack['price'] = int(payload['price'])
    if 'description' in payload:
        snack['description'] = payload['description'].strip()
    if 'image_url' in payload and payload['image_url'].strip():
        snack['image_url'] = payload['image_url'].strip()
    if 'badge' in payload:
        snack['badge'] = payload['badge'].strip()

    save_db(db)
    return jsonify({"success": True, "snack": snack})

@app.route('/api/snacks/<int:snack_id>', methods=['DELETE'])
@admin_required
def delete_snack(snack_id):
    db = load_db()
    initial_len = len(db['snacks'])
    db['snacks'] = [s for s in db['snacks'] if s['id'] != snack_id]
    
    if len(db['snacks']) == initial_len:
        return jsonify({"success": False, "error": "Snack tidak ditemukan"}), 404
    
    save_db(db)
    return jsonify({"success": True, "message": "Snack berhasil dihapus"})

# API: Packages CRUD
@app.route('/api/packages', methods=['POST'])
@admin_required
def add_package():
    db = load_db()
    payload = request.get_json() or {}
    
    name = payload.get('name', '').strip()
    if not name:
        return jsonify({"success": False, "error": "Nama paket snack wajib diisi"}), 400
    
    new_id = 1
    if db['packages']:
        new_id = max(p['id'] for p in db['packages']) + 1

    items_raw = payload.get('items', [])
    if isinstance(items_raw, str):
        items = [i.strip() for i in items_raw.split('\n') if i.strip()]
    else:
        items = [str(i).strip() for i in items_raw if str(i).strip()]

    pkg = {
        "id": new_id,
        "name": name,
        "price": int(payload.get('price', 0)),
        "description": payload.get('description', '').strip(),
        "items": items,
        "image_url": payload.get('image_url', '').strip() or "/static/images/default-logo.svg",
        "badge": payload.get('badge', '').strip()
    }
    db['packages'].append(pkg)
    save_db(db)
    return jsonify({"success": True, "package": pkg})

@app.route('/api/packages/<int:package_id>', methods=['PUT'])
@admin_required
def update_package(package_id):
    db = load_db()
    payload = request.get_json() or {}
    
    pkg = next((p for p in db['packages'] if p['id'] == package_id), None)
    if not pkg:
        return jsonify({"success": False, "error": "Paket tidak ditemukan"}), 404
    
    if 'name' in payload and payload['name'].strip():
        pkg['name'] = payload['name'].strip()
    if 'price' in payload:
        pkg['price'] = int(payload['price'])
    if 'description' in payload:
        pkg['description'] = payload['description'].strip()
    if 'items' in payload:
        items_raw = payload['items']
        if isinstance(items_raw, str):
            pkg['items'] = [i.strip() for i in items_raw.split('\n') if i.strip()]
        else:
            pkg['items'] = [str(i).strip() for i in items_raw if str(i).strip()]
    if 'image_url' in payload and payload['image_url'].strip():
        pkg['image_url'] = payload['image_url'].strip()
    if 'badge' in payload:
        pkg['badge'] = payload['badge'].strip()

    save_db(db)
    return jsonify({"success": True, "package": pkg})

@app.route('/api/packages/<int:package_id>', methods=['DELETE'])
@admin_required
def delete_package(package_id):
    db = load_db()
    initial_len = len(db['packages'])
    db['packages'] = [p for p in db['packages'] if p['id'] != package_id]
    
    if len(db['packages']) == initial_len:
        return jsonify({"success": False, "error": "Paket tidak ditemukan"}), 404
    
    save_db(db)
    return jsonify({"success": True, "message": "Paket berhasil dihapus"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Memulai server Katalog Snack Ibu di http://127.0.0.1:{port} ...")
    app.run(host='0.0.0.0', port=port, debug=True)
