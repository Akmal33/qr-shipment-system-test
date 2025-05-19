import React, { useState } from 'react';

function App() {
  const [angka1, setAngka1] = useState('');
  const [angka2, setAngka2] = useState('');
  const [hasil, setHasil] = useState(null);

  const hitung = (operator) => {
    const a = parseFloat(angka1);
    const b = parseFloat(angka2);

    if (isNaN(a) || isNaN(b)) {
      setHasil("Masukkan angka yang valid.");
      return;
    }

    switch (operator) {
      case '+':
        setHasil(a + b);
        break;
      case '-':
        setHasil(a - b);
        break;
      case '*':
        setHasil(a * b);
        break;
      case '/':
        if (b === 0) {
          setHasil("Tidak bisa dibagi dengan nol.");
        } else {
          setHasil(a / b);
        }
        break;
      default:
        setHasil("Operasi tidak dikenal.");
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial', textAlign: 'center' }}>
      <h2>Kalkulator React</h2>
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
      <h3>Hasil: {hasil !== null ? hasil : '-'}</h3>
    </div>
  );
}

export default App;
