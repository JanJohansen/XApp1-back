import { BB } from "./BB"

jest.setTimeout(500)

let bb = new BB()

beforeEach(() => {
	bb = new BB()
})

afterEach(() => {
	// bb = null
})
beforeAll(() => {
	console.clear()
	console.log("***********************************************************************")
})

test("Subscribe to BB <Object>.", (done) => {
	bb.on("testObjectItem", (value, name) => {
		// expect(value).toStrictEqual({})
		expect(value).toMatchObject({ prop:"val" })
		done()
	})
	bb.pub("testObjectItem", {prop: "val"})
})
// test("Subscribe to BB <String>.", (done) => {
// 	bb.on("testStringItem", (value, name) => {
// 		expect(value).toBe("valueString")
// 		done()
// 	})
// 	bb.pub("testStringItem", "valueString")
// })
// test("Subscribe to BB <Number>.", (done) => {
// 	bb.on("testNumberItem", (value, name) => {
// 		expect(value).toStrictEqual(42)
// 		done()
// 	})
// 	bb.pub("testNumberItem", 42)
// })
// test("Subscribe to BB <Object>, but write sub-object-value first.", (done) => {
// 	bb.on("testNumberItem", (value, name) => {
// 		expect(value).toStrictEqual({})
// 		done()
// 	})
// 	// bb.pub("testNumberItem.propertyValue", 42)
// 	bb.pub("testNumberItem", {})
// })
test("Object index (oIndex) creation.", (done) => {
	bb.pub("Obj1", {})
	bb.pub("Obj2", {})
	bb.pub("Obj3", {})
	bb.sub("oIndex", (value, name) => {
		// expect(value).toStrictEqual({ oIndex: {}, Obj1: {}, Obj2: {}, Obj3: {} })
		console.log("V:", value)
		expect(value).toHaveProperty("Obj1")
		expect(value).toHaveProperty("Obj2")
		expect(value).toHaveProperty("Obj3")
		expect(value).toHaveProperty("oIndex")
		done()
	})
})

// Create type index - listing what types are available
test("Index-list creation.", (done) => {
	bb.pub("Obj1", { type: "Type1" })
	bb.pub("Obj2", { type: "Type2" })

	bb.sub("idx:type", (value, name) => {
		// expect(value).to StrictEqual({ Type1: {}, Type2: {} })
		expect(value).toHaveProperty("Type1")
		expect(value).toHaveProperty("Type2")
		done()
	})
})

// Create type index - listing what _types of specific types_ are available
test("'Value index' content update.", (done) => {
	bb.pub("Obj1", { type: "Type1" })
	bb.pub("Obj2", { type: "Type1" })
	bb.pub("Obj3", { type: "Type2" })

	bb.sub("idx:type=Type1", (value, name) => {
		// expect(value).toStrictEqual({ Obj1: {}, Obj2: {} })
		expect(value).toHaveProperty("Obj1")
		expect(value).toHaveProperty("Obj2")

		done()
	})
})


// Create type-array index - listing what _types of specific types_ are available
test("'Array index creation.", (done) => {
	bb.pub("Obj1", { type: ["Type1", "Type2" ])
	bb.pub("Obj2", { type: "Type1" })
	bb.pub("Obj3", { type: "Type2" })

	bb.sub("idx:type=Type1", (value, name) => {
		// expect(value).toStrictEqual({ Obj1: {}, Obj2: {} })
		expect(value).toHaveProperty("Obj1")
		expect(value).toHaveProperty("Obj2")

		done()
	})
})
