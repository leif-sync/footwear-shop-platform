// Acepta formatos #RGB, #RRGGBB

export const hexPattern = /^#[A-F0-9]{6}$/;

export class HexColorError extends Error {
  constructor(params: { invalidHexColor: string }) {
    super(`Invalid hex color format: ${params.invalidHexColor}`);
  }
}

export class HexColor {
  private readonly value: string;

  constructor(color: string) {
    const normalizedColor = this.normalizeColor(color);

    if (!this.isValidHexColor(normalizedColor)) {
      throw new HexColorError({ invalidHexColor: normalizedColor });
    }

    this.value = normalizedColor;
  }

  static clone(hexColor: HexColor): HexColor {
    return new HexColor(hexColor.getValue());
  }

  private normalizeColor(color: string): string {
    // Elimina espacios y convierte a mayúsculas
    let normalized = color.trim().toUpperCase();

    // Añade # si no lo tiene
    if (!normalized.startsWith("#")) {
      normalized = "#" + normalized;
    }

    // Convierte formato corto a largo (ej: #FFF a #FFFFFF)
    if (normalized.length === 4) {
      return (
        "#" +
        normalized[1] +
        normalized[1] +
        normalized[2] +
        normalized[2] +
        normalized[3] +
        normalized[3]
      );
    }

    return normalized;
  }

  private isValidHexColor(color: string): boolean {
    return hexPattern.test(color);
  }

  withoutHash(): string {
    return this.value.substring(1);
  }

  getValue(): string {
    return this.value;
  }
}
