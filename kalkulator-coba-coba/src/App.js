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
    <div style={{ padding: '30px', fontFamily: 'Arial', textAlign: 'center' }}>
      <h2>Kalkulator React + Flask</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Pilih Mode: 
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ marginLeft: '10px' }}>
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
            style={{ margin: '10px', padding: '8px' }}
          />
          <input
            type="number"
            value={angka2}
            onChange={(e) => setAngka2(e.target.value)}
            placeholder="Angka kedua"
            style={{ margin: '10px', padding: '8px' }}
          />
          <div>
            <button onClick={() => hitung('+')}>+</button>
            <button onClick={() => hitung('-')}>-</button>
            <button onClick={() => hitung('*')}>×</button>
            <button onClick={() => hitung('/')}>÷</button>
          </div>
        </>
      )}

      {mode === 'geometri' && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Pilih Jenis Geometri: 
              <select value={jenisGeometri} onChange={(e) => setJenisGeometri(e.target.value)} style={{ marginLeft: '10px' }}>
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
            placeholder="Masukkan nilai (misal sisi atau jari-jari)"
            style={{ margin: '10px', padding: '8px' }}
          />
          <div>
            <button onClick={() => hitung()}>Hitung</button>
          </div>
        </>
      )}

      <h3>Hasil: {hasil !== null ? hasil : '-'}</h3>
    </div>
  );
}

export default App;
