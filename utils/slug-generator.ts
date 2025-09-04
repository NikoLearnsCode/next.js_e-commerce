/**
 * Genererar en slug från en sträng genom att:
 * - Konvertera till små bokstäver
 * - Ersätta svenska tecken (åäö) med engelska motsvarigheter
 * - Ta bort specialtecken
 * - Ersätta mellanslag med bindestreck
 * - Ta bort dubbletter av bindestreck
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åäö]/g, (char) => {
      const map: {[key: string]: string} = {å: 'a', ä: 'a', ö: 'o'};
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
