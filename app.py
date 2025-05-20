from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

@app.route('/api/hitung', methods=['POST'])
def hitung():
    print("masuk hitung")
    data = request.get_json()
    print(data)
    mode = data.get('mode')
    angka1 = data.get('angka1')
    angka2 = data.get('angka2')
    operator = data.get('operator')
    jenis_geometri = data.get('jenisGeometri')

    try:
        a = float(angka1)
        b = float(angka2) if angka2 is not None else None
    except (TypeError, ValueError):
        return jsonify({'hasil': 'Input tidak valid'}), 400

    if mode == 'aritmatika':
        if operator == '+':
            hasil = a + b
        elif operator == '-':
            hasil = a - b
        elif operator == '*':
            hasil = a * b
        elif operator == '/':
            if b == 0:
                hasil = 'Tidak bisa dibagi dengan nol'
            else:
                hasil = a / b
        else:
            hasil = 'Operator tidak dikenali'

    elif mode == 'geometri':
        if jenis_geometri == 'Persegi':
            hasil = a * a
        elif jenis_geometri == 'Lingkaran':
            hasil = math.pi * a * a
        elif jenis_geometri == 'Kubus':
            hasil = a ** 3
        elif jenis_geometri == 'Bola':
            hasil = (4 / 3) * math.pi * a ** 3
        else:
            hasil = 'Jenis geometri tidak dikenali'
    else:
        hasil = 'Mode tidak dikenali'

    return jsonify({'hasil': hasil})
