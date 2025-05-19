import React, { useState } from 'react';

function App() {
  const [angka1, setAngka1] = useState('');
  const [angka2, setAngka2] = useState('');
  const [hasil, setHasil] = useState(null);

  const hitungJumlah = () => {
    const a = parseFloat(angka1);
    const b = parseFloat(angka2);

    if (isNaN(a) || isNaN(b)) {
      setHasil("Masukkan dua angka valid.");
    } else {
      setHasil(a + b);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Kalkulator Penjumlahan Dua Angka</h2>
      <input
        type="number"
        placeholder="Angka pertama"
        value={angka1}
        onChange={(e) => setAngka1(e.target.value)}
      /><br /><br />
      <input
        type="number"
        placeholder="Angka kedua"
        value={angka2}
        onChange={(e) => setAngka2(e.target.value)}
      /><br /><br />
      <button onClick={hitungJumlah}>Jumlahkan</button>

      <h3>Hasil: {hasil !== null ? hasil : '-'}</h3>
    </div>
  );
}

export default App;
