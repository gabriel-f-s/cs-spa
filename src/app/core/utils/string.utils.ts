export class StringUtils {
  /**
   * Extrai as iniciais de um nome.
   * Se tiver duas ou mais palavras, pega a primeira letra da primeira e segunda palavra.
   * Se tiver apenas uma palavra, pega as duas primeiras letras.
   * @param name O nome para extrair as iniciais
   * @param fallback O texto padrão caso o nome seja vazio ou nulo (ex: 'US' para Usuário)
   */
  static getInitials(name: string | null | undefined, fallback: string = 'US'): string {
    if (!name || name.trim().length === 0) return fallback;

    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return words[0].substring(0, Math.min(2, words[0].length)).toUpperCase();
    }
  }
}
