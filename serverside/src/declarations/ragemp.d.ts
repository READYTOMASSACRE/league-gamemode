/**
 * Extend entity mp interface
 */
interface EntityMp {
  sharedData: SHARED.TYPES.SharedData
  playingTime?: number
  muted: number
}

/**
 * Extend string interface
 */
interface String {
  padding(n: number, c?: string): string
}

/**
 * Correct dummies pool interface
 */
interface DummyEntityMpPool {
	"new"(dummyEntityType: number, dimension: number, sharedVariables: KeyValueCollection): DummyEntityMp;
}

/**
 * Correct dummy interface
 */
interface DummyEntityMp {
  setVariable: (key: string, value: any) => void
  setVariables: (object: any) => void
  getVariable: (key: string) => any
  [key: string]: any
}

interface PedMp extends PlayerMp {}

/**
 * Extend Rage enums
 */
declare namespace RageEnums {
	const enum EventKey {
    PACKAGES_LOADED = 'packagesLoaded'
  }
}