import { describe, it, expect } from 'vitest'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanName } from '@/lib/stripe/plans'

describe('PLANS', () => {
  it('has three plan tiers', () => {
    const planNames = Object.keys(PLANS)
    expect(planNames).toEqual(['free', 'basic', 'premium'])
  })

  it('free plan has zero price', () => {
    expect(PLANS.free.price).toBe(0)
  })

  it('basic plan costs more than free', () => {
    expect(PLANS.basic.monthlyPrice).toBeGreaterThan(0)
  })

  it('premium plan costs more than basic', () => {
    expect(PLANS.premium.monthlyPrice).toBeGreaterThan(PLANS.basic.monthlyPrice)
  })

  it('annual pricing is discounted vs monthly', () => {
    expect(PLANS.basic.annualPrice).toBeLessThan(PLANS.basic.monthlyPrice * 12)
    expect(PLANS.premium.annualPrice).toBeLessThan(PLANS.premium.monthlyPrice * 12)
  })

  it('higher plans get more daily humanizations', () => {
    expect(PLANS.basic.dailyHumanizations).toBeGreaterThan(PLANS.free.dailyHumanizations)
    expect(PLANS.premium.dailyHumanizations).toBeGreaterThan(PLANS.basic.dailyHumanizations)
  })

  it('higher plans get more daily scans', () => {
    expect(PLANS.basic.dailyScans).toBeGreaterThan(PLANS.free.dailyScans)
    expect(PLANS.premium.dailyScans).toBeGreaterThan(PLANS.basic.dailyScans)
  })

  it('higher plans get higher word limits', () => {
    expect(PLANS.basic.maxWords).toBeGreaterThan(PLANS.free.maxWords)
    expect(PLANS.premium.maxWords).toBeGreaterThan(PLANS.basic.maxWords)
  })

  it('premium has unlimited history', () => {
    expect(PLANS.premium.historyJobs).toBe(-1)
  })

  it('free has no history', () => {
    expect(PLANS.free.historyJobs).toBe(0)
  })

  it('all plans have features array', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Array.isArray(plan.features)).toBe(true)
      expect(plan.features.length).toBeGreaterThan(0)
    }
  })

  it('premium has no missing features', () => {
    expect(PLANS.premium.notIncluded).toHaveLength(0)
  })

  it('PlanName type covers all plans', () => {
    const names: PlanName[] = ['free', 'basic', 'premium']
    names.forEach(name => {
      expect(PLANS[name]).toBeDefined()
    })
  })
})
