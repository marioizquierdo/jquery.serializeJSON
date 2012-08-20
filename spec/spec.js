describe("$.serializeJSON", function () {
  var obj;

  beforeEach(function () {
    obj = $('#user-form').serializeJSON();
  });

  it("should serialize the form inputs", function () {
    expect(obj).not.toBeNull();
    expect(obj).toEqual({
      fullName: "Mario Izquierdo",

      address: {
        city: "San Francisco",
        state: {
          name: "California",
          abbr: "CA"
        }
      },

      jobbies: ["code", "climbing"],

      projects: [
        { name: "serializeJSON", language: "javascript" },
        { name: "bettertabs",    language: "ruby" }
      ]
    });
  });
});

// $.deepSet is used to assign complex keys like "address[state][abbr]" to an object
describe("deepSet", function () {
  var deepSet = $.deepSet;
  var arr, obj, v, v2;

  beforeEach(function () {
    obj = {};
    arr = [];
    v = 'val';
    v2 = 'newval'
  });

  it("simple attr ['foo']", function () {
    deepSet(obj, ['foo'], v);
    expect(obj).toEqual({foo: v});
  });

  it("simple attr ['foo'] twice should set the last value", function () {
    deepSet(obj, ['foo'], v);
    deepSet(obj, ['foo'], v2);
    expect(obj).toEqual({foo: v2});
  });

  it("nested attr ['inn', 'foo']", function () {
    deepSet(obj, ['inn', 'foo'], v);
    expect(obj).toEqual({inn: {foo: v}});
  });

  it("nested attr ['inn', 'foo'] twice should set the last value", function () {
    deepSet(obj, ['inn', 'foo'], v);
    deepSet(obj, ['inn', 'foo'], v2);
    expect(obj).toEqual({inn: {foo: v2}});
  });

  it("multiple assign attr ['foo'] and ['inn', 'foo']", function () {
    deepSet(obj, ['foo'], v);
    deepSet(obj, ['inn', 'foo'], v);
    expect(obj).toEqual({foo: v, inn: {foo: v}});
  });

  it("very nested attr ['inn', 'inn', 'inn', 'foo']", function () {
    deepSet(obj, ['inn', 'inn', 'inn', 'foo'], v);
    expect(obj).toEqual({inn: {inn: {inn: {foo: v}}}});
  });

  it("simple array ['0']", function () {
    deepSet(arr, ['0'], v);
    expect(arr).toEqual([v]);
  });

  it("nested simple array ['arr', '0']", function () {
    deepSet(obj, ['arr', '0'], v);
    expect(obj).toEqual({'arr': [v]});
  });

  it("nested simple array multiple values", function () {
    deepSet(obj, ['arr', '1'], v2);
    deepSet(obj, ['arr', '0'], v);
    expect(obj).toEqual({'arr': [v, v2]});
  });

  it("array assign with empty index should push the element", function () {
    deepSet(arr, [''], 1);
    deepSet(arr, [''], 2);
    deepSet(arr, [''], 3);
    expect(arr).toEqual([1,2,3]);
  });

  it("nested array assign with empty index should push the element", function () {
    deepSet(obj, ['arr', ''], 1);
    deepSet(obj, ['arr', ''], 2);
    deepSet(obj, ['arr', ''], 3);
    expect(obj).toEqual({arr: [1,2,3]});
  });

  it("nested object as array element ['arr', '0', 'foo']", function () {
    deepSet(obj, ['arr', '0', 'foo'], v);
    expect(obj).toEqual({arr: [{foo: v}]});
  });

  it("array of objects", function (){
    deepSet(arr, ['0', 'foo'], v);
    deepSet(arr, ['0', 'bar'], v);
    deepSet(arr, ['1', 'foo'], v2);
    deepSet(arr, ['1', 'bar'], v2);
    expect(arr).toEqual([{foo: v, bar: v}, {foo: v2, bar: v2}]);
  });

  it("array push with empty index, if repeat same object element key then it creates a new element", function () {
    deepSet(arr, [''], v);        //=> arr === [v]
    deepSet(arr, ['', 'foo'], v); //=> arr === [v, {foo: v}]
    deepSet(arr, ['', 'bar'], v); //=> arr === [v, {foo: v, bar: v}]
    deepSet(arr, ['', 'bar'], v); //=> arr === [v, {foo: v, bar: v}, {bar: v}]
    expect(arr).toEqual([v, {foo: v, bar: v}, {bar: v}]);
  });

  it("should set all different nested values", function () {
    deepSet(obj, ['foo'], v);
    deepSet(obj, ['inn', 'foo'], v);
    deepSet(obj, ['inn', 'arr', '0'], v);
    deepSet(obj, ['inn', 'arr', '1'], v2);
    deepSet(obj, ['inn', 'arr', '2', 'foo'], v);
    deepSet(obj, ['inn', 'arr', '2', 'bar'], v);
    deepSet(obj, ['inn', 'arr', ''], v);
    deepSet(obj, ['inn', 'arr', ''], v2);
    deepSet(obj, ['inn', 'arr', '', 'foo'], v2);
    deepSet(obj, ['inn', 'arr', '', 'bar'], v2);
    deepSet(obj, ['inn', 'arr', '2', 'inn', 'foo'], v);
    expect(obj).toEqual({foo: v, inn: {foo: v, arr: [v, v2, {foo: v, bar: v, inn: {foo: v}}, v, v2, {foo: v2, bar: v2}]}})
  });

});