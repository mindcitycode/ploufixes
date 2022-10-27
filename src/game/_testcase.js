import {
    createWorld,
    Types,
    defineComponent,
    defineQuery,
    addEntity,
    addComponent,
    pipe,
    defineDeserializer,
    defineSerializer,
    registerComponent,
    getAllEntities,
    DESERIALIZE_MODE,
    removeEntity,
    hasComponent,
    deleteWorld,
    entityExists,
} from 'bitecs'

const SomeComponent = defineComponent({ value: Types.i8 })

// zero
const world0 = createWorld()
registerComponent(world0, SomeComponent)
const serialise = defineSerializer(world0)

const eid0 = addEntity(world0)
addComponent(world0, SomeComponent, eid0)
SomeComponent.value[eid0] = 42

removeEntity(world0,eid0)

getAllEntities(world0).forEach(eid => {
    console.log('world0 entity ', eid, 'exists?', entityExists(world0, eid))
})

const data = serialise(world0)
console.log(data)

// one
const world1 = createWorld()
registerComponent(world1, SomeComponent)
const deserialise = defineDeserializer(world1)

deserialise(world1, data)
getAllEntities(world1).forEach(eid => {
    console.log('world1 entity ', eid, 'exists?', entityExists(world1, eid))
})

