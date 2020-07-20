interface PlayerMp {
	customData: TYPES.PlayerCustomData
	sharedData: SHARED.TYPES.SharedData
	vector2: SHARED.TYPES.Vector2
}

interface String {
  padding(n: number, c?: string): string
}

interface DummyEntityMpPool extends EntityMpPool<DummyEntity> {
	forEachByType(type: number, fn: (dummyEntity: DummyEntity) => void): void;
}

interface DummyEntity {
	[key: string]: any
}

interface EntityMp {
	setAlpha(alphaLevel: number, skin: boolean): void;
}

declare namespace RageEnums {
	const enum EventKey {
    PLAYER_READY = "playerReady",
  }
}

interface Mp {
	_events: any
}