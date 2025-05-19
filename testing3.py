def tambah(a, b):
    return a + b

def kurang(a, b):
    return a - b

def kali(a, b):
    return a * b

def bagi(a, b):
    if b == 0:
        return "Error: Tidak bisa dibagi dengan nol!"
    return a / b

print("=== Kalkulator Sederhana ===")
print("Pilih operasi:")
print("1. Penjumlahan (+)")
print("2. Pengurangan (-)")
print("3. Perkalian (*)")
print("4. Pembagian (/)")

pilih = input("Masukkan pilihan (1/2/3/4): ")

try:
    angka1 = float(input("Masukkan angka pertama: "))
    angka2 = float(input("Masukkan angka kedua: "))

    if pilih == '1':
        print("Hasil:", tambah(angka1, angka2))
    elif pilih == '2':
        print("Hasil:", kurang(angka1, angka2))
    elif pilih == '3':
        print("Hasil:", kali(angka1, angka2))
    elif pilih == '4':
        print("Hasil:", bagi(angka1, angka2))
    else:
        print("Pilihan tidak valid.")
except ValueError:
    print("Input harus berupa angka.")
