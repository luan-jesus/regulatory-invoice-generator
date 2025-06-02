import { ReferenceDate } from "../../types";
import { RangeResult } from "../excel4node/env-invoice-sheet";
import { MetadataService } from "../utils/metadata-service";
import EnvironmentMovementService from "./environment-movement-service";

export default class EnvironmentService {
  private environmentMovementService: Map<string, EnvironmentMovementService>;
  private metadataService: MetadataService;

  constructor(environmentMovementService: Map<string, EnvironmentMovementService>, metadataService: MetadataService) {
    this.environmentMovementService = environmentMovementService;
    this.metadataService = metadataService;
  }

  async getEnvironmentsStatus(referenceDate: ReferenceDate): Promise<Record<string, string>[]> {
    const environmentStatus = []
    let i = 0;

    for (const movementService of this.environmentMovementService.values()) {
      console.log(`(${++i} / ${this.environmentMovementService.size}) - fetching status from: ${movementService.environment.name}`)

      const previousDate = this.getPreviousDate(referenceDate);
      const responseOld = await movementService.findEnvironmentResume(previousDate.month, previousDate.year);
      const responseActual = await movementService.findEnvironmentResume(referenceDate.month, referenceDate.year);
      
      const oldData = responseOld.content[0] as Record<string, any>;
      const actualData = responseActual.content[0] as Record<string, any>;

      const ranges = await this.metadataService.fetchEnvironmentRange(movementService.environment.id);
      
      environmentStatus.push({
        name: movementService.environment.name,
        description: movementService.environment.description,
        actualQuantity: actualData['quantidade'],
        actualValue: this.getRangeValue(parseInt(actualData['quantidade'] ?? 0), ranges.content),
        previousQuantity: oldData['quantidade'],
        previousValue: this.getRangeValue(parseInt(oldData['quantidade'] ?? 0), ranges.content),
        status: 'SUCESSO'
      })
    }

    return environmentStatus;
  }

  getRangeValue(recordsCount: number, ranges: Record<string, string>[]): string {
    return Array.from(this.getCalculatedRange(recordsCount, ranges).values()).reduce((acc, range) => acc + range.rangeValue, 0).toString()
  }

  getCalculatedRange(recordsCount: number, ranges: Record<string, string>[]): Map<number, RangeResult> {
    const rangeValues: Map<number, RangeResult> = new Map();

    for (const range of ranges) {
      if (range['billing_type'] === 'FIXED') {
        rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: recordsCount >= parseInt(range['range_end']) ? parseInt(range['range_end']) : recordsCount,
          unitValue: 'fixo',
          rangeValue: parseFloat(range['unit_value'])
        });
        recordsCount -= parseInt(range['range_end']);
        continue;
      }

      if (recordsCount <= 0) {
        break;
      }

      const rangeStart = parseInt(range['range_start']) - 1;
      const rangeEnd = parseInt(range['range_end'] ?? 0);
      const unitValue = parseFloat(range['unit_value']);

      if (rangeEnd !== 0 && (recordsCount - (rangeEnd - rangeStart)) > 0) {
        rangeValues.set(parseInt(range['sequence']), {
          rangeQuantity: (rangeEnd - rangeStart),
          unitValue: range['unit_value'],
          rangeValue: unitValue * (rangeEnd - rangeStart)
        });
        recordsCount -= (rangeEnd - rangeStart);
        continue;
      }

      rangeValues.set(parseInt(range['sequence']), {
        rangeQuantity: recordsCount,
        unitValue: range['unit_value'],
        rangeValue: unitValue * recordsCount
      });
      break;
    }

    return rangeValues;
  }

  private getPreviousDate(referenceDate: ReferenceDate): ReferenceDate {
    const actualMonth = parseInt(referenceDate.month);

    return {
      month: actualMonth === 1 ? '12' : (actualMonth - 1).toString().padStart(2, '0'),
      year: actualMonth === 1 ? (parseInt(referenceDate.year) - 1).toString() : referenceDate.year.toString()
    }
  }
}