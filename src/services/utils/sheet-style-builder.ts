import { Workbook } from "excel4node";

export default class SheetStyleBuilder {
  private style: any = {}

  fullBorder() {
    this.style.border = {
      left: {
        style: 'thin',
        color: '#000000'
      },
      right: {
        style: 'thin',
        color: '#000000'
      },
      top: {
        style: 'thin',
        color: '#000000'
      },
      bottom: {
        style: 'thin',
        color: '#000000'
      }
    }

    return this;
  }

  alignment(alignment: 'left' | 'center' | 'right') {
    this.style.alignment = {
      horizontal: alignment,
      vertical: 'center'
    }

    return this;
  }

  fillColor(color: string) {
    this.style.fill = {
      type: 'pattern',
      patternType: 'solid',
      fgColor: color
    }

    return this;
  }

  font({size, color, bold}: {size?: number, color?: string, bold?: boolean} = {}) {
    this.style.font = {
      size: size || 12,
      color: color || '#000000',
      bold: bold || false
    }

    return this;
  }

  numberFormat(format: string) {
    this.style.numberFormat = format;
    return this;
  }

  build(workbook: Workbook) {
    return workbook.createStyle(this.style);
  }
}
