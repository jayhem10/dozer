import { POINT_MULTIPLIER } from '~/constants/survey'
import type { SurveyWeights } from '~/types/survey'

export function usePoints() {
  function calculateTotalPoints(weights: SurveyWeights): number {
    return Object.values(weights).reduce((sum, weight) => {
      return sum + (weight * POINT_MULTIPLIER)
    }, 0)
  }

  function isValidPoints(total: number): boolean {
    return total >= 102 && total <= 103
  }

  return {
    calculateTotalPoints,
    isValidPoints
  }
}