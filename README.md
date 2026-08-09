# cae-fiszki

Aplikacja do nauki słownictwa pod Cambridge C1 Advanced. Działa offline, instaluje się na ekranie głównym, synchronizuje postęp przez GitHub API.

**Adres:** https://mrozicki-hub.github.io/cae-fiszki/

## Co robi

- Algorytm powtórek **FSRS-5** — adaptacyjny, nie stałe kubełki
- Siedem typów kart odwzorowujących sekcje Use of English
- Wpisywanie odpowiedzi z tolerancją literówek — nauka produkcji, nie samego rozpoznawania
- Tryb nocny bez wpisywania i bez lektora, obsługa jednym kciukiem
- Pełna historia powtórek w `reviews.js` — do późniejszej optymalizacji
- Scalanie postępu per-karta, więc dwa urządzenia się nie kasują

## Pliki

| Plik | Rola |
|---|---|
| `cards.js` | talia — jedyny plik, który edytujesz ręcznie |
| `config.js` | typy kart, renderowanie, formularze |
| `app.js` | silnik: kolejka, oceny, synchronizacja |
| `fsrs.js` | algorytm powtórek |
| `progress.js` | stan nauki (generowany) |
| `reviews.js` | historia powtórek (generowana) |
| `sw.js` | obsługa offline — podnieś `VERSION` po zmianie kodu |

## Zasada nadrzędna

**Nigdy nie zmieniaj pola `id` istniejącej karty.** To klucz do historii nauki. Treść możesz poprawiać bez konsekwencji.

Pełna instrukcja i lista źródeł materiału: `INSTRUKCJA.md`.
