import React, { useState } from 'react';

function App() {
  const [angka1, setAngka1] = useState('');
  const [angka2, setAngka2] = useState('');
  const [hasil, setHasil] = useState(null);
  const [mode, setMode] = useState('aritmatika');
  const [jenisGeometri, setJenisGeometri] = useState('persegi');

  const hitung = (operator = null) => {
    const payload = {
      mode: mode,
      angka1: angka1,
      angka2: angka2,
      operator: operator,
      jenisGeometri: jenisGeometri
    };

    fetch('http://localhost:5000/api/hitung', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        setHasil(data.hasil);
      })
      .catch((err) => {
        console.error('Error:', err);
        setHasil('Terjadi kesalahan.');
      });
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '30px', textAlign: 'center' }}>
      <h2>Kalkulator React + Flask</h2>

      {/* Hasil di bagian atas */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #ddd',
          padding: '20px',
          margin: '30px auto',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '600px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
      >
        <h3>Hasil Perhitungan:</h3>
        <div style={{ fontSize: '2rem', color: '#e02a03', marginTop: '10px' }}>
          {hasil !== null ? hasil : 'Belum ada hasil.'}
        </div>
      </div>

      {/* Form Input di bawahnya */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Pilih Mode:
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="aritmatika">Aritmatika</option>
              <option value="geometri">Geometri</option>
            </select>
          </label>
        </div>

        {mode === 'aritmatika' && (
          <>
            <input
              type="number"
              value={angka1}
              onChange={(e) => setAngka1(e.target.value)}
              placeholder="Angka pertama"
              style={{ margin: '10px', padding: '8px', width: '45%' }}
            />
            <input
              type="number"
              value={angka2}
              onChange={(e) => setAngka2(e.target.value)}
              placeholder="Angka kedua"
              style={{ margin: '10px', padding: '8px', width: '45%' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => hitung('+')} style={{ marginRight: '5px' }}>+</button>
              <button onClick={() => hitung('-')} style={{ marginRight: '5px' }}>-</button>
              <button onClick={() => hitung('*')} style={{ marginRight: '5px' }}>×</button>
              <button onClick={() => hitung('/')}>÷</button>
            </div>
          </>
        )}

        {mode === 'geometri' && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Pilih Jenis Geometri:
                <select
                  value={jenisGeometri}
                  onChange={(e) => setJenisGeometri(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px' }}
                >
                  <option value="persegi">Luas Persegi</option>
                  <option value="lingkaran">Luas Lingkaran</option>
                  <option value="kubus">Volume Kubus</option>
                  <option value="bola">Volume Bola</option>
                </select>
              </label>
            </div>
            <input
              type="number"
              value={angka1}
              onChange={(e) => setAngka1(e.target.value)}
              placeholder="Masukkan nilai (sisi / jari-jari)"
              style={{ margin: '10px', padding: '8px', width: '60%' }}
            />
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => hitung()}>Hitung</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
