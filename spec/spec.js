describe("$.serializeJSON", function () {
  var obj, $form;

  describe('with simple one-level attributes', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="firstName" value="Mario"/>'));
      $form.append($('<input type="text"  name="lastName"  value="Izquierdo"/>'));
    });

    it("serializes into plain attributes", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        firstName: "Mario",
        lastName: "Izquierdo"
      });
    });
  });

  describe('with nested object attributes', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="address[city]"         value="San Francisco"/>'));
      $form.append($('<input type="text"  name="address[state][name]"  value="California"/>'));
      $form.append($('<input type="text"  name="address[state][abbr]"  value="CA"/>'));
    });

    it("serializes into nested object attributes", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        address: {
          city: "San Francisco",
          state: {
            name: "California",
            abbr: "CA"
          }
        }
      });
    });
  });

  describe('with attribute names that are integers', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="arr[0]"    value="zero"/>'));
      $form.append($('<input type="text"  name="arr[1]"    value="one"/>'));
      $form.append($('<input type="text"  name="arr[2][0]" value="two-zero"/>'));
      $form.append($('<input type="text"  name="arr[2][1]" value="two-one"/>'));
    });

    it("serializes into arrays", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        arr: ['zero', 'one', ['two-zero', 'two-one']]
      });
    });
  });

  describe('with empty brackets', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="jobbies[]" value="code"/>'));
      $form.append($('<input type="text"  name="jobbies[]" value="climbing"/>'));
    });

    it("pushes elements into an array", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        jobbies: ['code', 'climbing']
      });
    });
  });

  describe('with attribute names that are similar to integers, but not valid array indexes', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="drinks[1st]" value="coffee"/>'));
      $form.append($('<input type="text"  name="drinks[2nd]" value="beer"/>'));
    });

    it("serializes into object attributes", function() { // only integers are mapped to an array
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        drinks: {
          '1st': "coffee",
          '2nd': "beer"
        }
      });
    });
  });

  describe('with complext array of objects', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="projects[0][name]"        value="serializeJSON" />'));
      $form.append($('<input type="text"  name="projects[0][language]"    value="javascript" />'));

      $form.append($('<input type="text"  name="projects[1][name]"        value="bettertabs" />'));
      $form.append($('<input type="text"  name="projects[1][language]"    value="ruby" />'));

      $form.append($('<input type="text"  name="projects[2][name]"        value="formwell" />'));
      $form.append($('<input type="text"  name="projects[2][languages][]" value="coffeescript" />'));
      $form.append($('<input type="text"  name="projects[2][languages][]" value="javascript" />'));
    });

    it("serializes into array of objects", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        projects: [
          { name: "serializeJSON", language: "javascript" },
          { name: "bettertabs",    language: "ruby" },
          { name: "formwell",      languages: ["coffeescript", "javascript"] },
        ]
      });
    });
  });
});

describe("$.serializeJSON.splitInputNameIntoKeysArray", function() {
  var split = $.serializeJSON.splitInputNameIntoKeysArray;
  it("returns an array with one element from a simple name", function() {
    expect(split('foo')).toEqual(['foo']);
  })
  it("returns an array from a simpe name wrapped in brackets", function() {
    expect(split('[foo]')).toEqual(['foo']);
  })
  it("returns an array from names separated by brackets", function() {
    expect(split('foo[inn][bar]')).toEqual(['foo', 'inn', 'bar']);
    expect(split('foo[inn][bar][0]')).toEqual(['foo', 'inn', 'bar', '0']);
  })
  it("returns an array where empty brakets are an empty string", function() {
    expect(split('arr[][bar]')).toEqual(['arr', '', 'bar']);
    expect(split('arr[][][bar]')).toEqual(['arr', '', '', 'bar']);
    expect(split('arr[][bar][]')).toEqual(['arr', '', 'bar', '']);
  })
});

describe("$.serializeJSON.isValidArrayIndex", function() {
  var validIndex = $.serializeJSON.isValidArrayIndex;
  it("accepts empty strings", function(){ // empty string is used to push elements into the array
    expect(validIndex('')).toBeTruthy();
  });
  it("accepts positive integers", function() {
    expect(validIndex(0)).toBeTruthy();
    expect(validIndex(1)).toBeTruthy();
    expect(validIndex(222)).toBeTruthy();
    expect(validIndex('0')).toBeTruthy();
    expect(validIndex('1')).toBeTruthy();
    expect(validIndex('222')).toBeTruthy();
  });
  it("rejects negative integers", function() {
    expect(validIndex(-1)).toBeFalsy();
    expect(validIndex(-22)).toBeFalsy();
  });
  it("rejects strings", function() {
    expect(validIndex('foo')).toBeFalsy();
  });
  it("rejects objects", function() {
    expect(validIndex({'foo': 'var'})).toBeFalsy();
  });
  it("rejects arrays", function() {
    expect(validIndex([0,1,2])).toBeFalsy();
  });
});

// deepSet aux function is used to assign nested keys like "address[state][abbr]" to an object
describe("$.serializeJSON.deepSet", function () {
  var deepSet = $.serializeJSON.deepSet;
  var arr, obj, v, v2;

  beforeEach(function () {
    obj = {};
    arr = [];
    v = 'val';
    v2 = 'newval';
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

  it("nested arrays with indexes should create a matrix", function () {
    deepSet(arr, ['0', '0', '0'], 1);
    deepSet(arr, ['0', '0', '1'], 2);
    deepSet(arr, ['0', '1', '0'], 3);
    deepSet(arr, ['0', '1', '1'], 4);
    deepSet(arr, ['1', '0', '0'], 5);
    deepSet(arr, ['1', '0', '1'], 6);
    deepSet(arr, ['1', '1', '0'], 7);
    deepSet(arr, ['1', '1', '1'], 8);
    expect(arr).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
  });

  it("nested arrays with empty indexes should push the elements to the most deep array", function () {
    deepSet(arr, ['', '', ''], 1);
    deepSet(arr, ['', '', ''], 2);
    deepSet(arr, ['', '', ''], 3);
    expect(arr).toEqual([[[1, 2, 3]]]);
  });

  it("nested arrays mixing empty indexes with numeric indexes should push when using empty but assign when using numeric", function () {
    deepSet(arr, ['', '0', ''], 1);
    deepSet(arr, ['', '1', ''], 2);
    deepSet(arr, ['', '0', ''], 3);
    deepSet(arr, ['', '1', ''], 4);
    expect(arr).toEqual([[[1], [2]], [[3], [4]]]);
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

  it("array push with empty index and empty value, also creates a new element", function () {
    deepSet(arr, ['', 'foo'], ''); //=> arr === [{foo: ''}]
    deepSet(arr, ['', 'foo'], ''); //=> arr === [{foo: ''}, {foo: ''}, {foo: v}]
    deepSet(arr, ['', 'foo'], v);  //=> arr === [{foo: ''}, {foo: ''}, {foo: v}]
    deepSet(arr, ['', 'foo'], ''); //=> arr === [{foo: ''}, {foo: ''}, {foo: v}, {foo: ''}]
    expect(arr).toEqual([{foo: ''}, {foo: ''}, {foo: v}, {foo: ''}]);
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