import { describe, it, expect } from 'vitest'
import {
  BRAZIL_STATES,
  ufFromStateName,
  stateNameFromUf,
} from './brazil'

describe('brazil location helpers', () => {
  it('lists all 27 federative units', () => {
    expect(BRAZIL_STATES).toHaveLength(27)
    expect(BRAZIL_STATES.map((s) => s.uf)).toContain('SP')
    expect(BRAZIL_STATES.map((s) => s.uf)).toContain('DF')
  })

  it('maps state name → UF (accent/case insensitive)', () => {
    expect(ufFromStateName('São Paulo')).toBe('SP')
    expect(ufFromStateName('são paulo')).toBe('SP')
    expect(ufFromStateName('  Rio de Janeiro ')).toBe('RJ')
    expect(ufFromStateName('Nárnia')).toBeNull()
    expect(ufFromStateName(null)).toBeNull()
    expect(ufFromStateName(undefined)).toBeNull()
  })

  it('maps UF → state name', () => {
    expect(stateNameFromUf('SP')).toBe('São Paulo')
    expect(stateNameFromUf('sp')).toBe('São Paulo')
    expect(stateNameFromUf('ZZ')).toBeNull()
    expect(stateNameFromUf(null)).toBeNull()
  })
})
