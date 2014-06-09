// serializeJSON
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

  describe('with empty brackets (arrays)', function() {
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

  describe('with attribute names that are integers', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text"  name="foo[0]"    value="zero"/>'));
      $form.append($('<input type="text"  name="foo[1]"    value="one"/>'));
      $form.append($('<input type="text"  name="foo[2][0]" value="two-zero"/>'));
      $form.append($('<input type="text"  name="foo[2][1]" value="two-one"/>'));
    });

    it("still creates objects with keys that are strings", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        'foo': {
          '0': 'zero',
          '1': 'one',
          '2': {
            '0': 'two-zero',
            '1': 'two-one'
          }
        }
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
      $form.append($('<input type="text"  name="projects[][name]"        value="serializeJSON" />'));
      $form.append($('<input type="text"  name="projects[][language]"    value="javascript" />'));

      $form.append($('<input type="text"  name="projects[][name]"        value="bettertabs" />'));
      $form.append($('<input type="text"  name="projects[][language]"    value="ruby" />'));

      $form.append($('<input type="text"  name="projects[][name]"        value="formwell" />'));
      $form.append($('<input type="text"  name="projects[][languages][]" value="coffeescript" />'));
      $form.append($('<input type="text"  name="projects[][languages][]" value="javascript" />'));
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

  describe('checkboxes with hidden fields for falsy values', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="hidden"    name="truthy" value="0"/>'));
      $form.append($('<input type="checkbox"  name="truthy" value="1" checked="checked"/>')); // should keep "1"
      $form.append($('<input type="hidden"    name="falsy"  value="0"/>'));
      $form.append($('<input type="checkbox"  name="falsy"  value="1"/>')); // should keep "0"
    });

    it("uses the checkbox value if checked, otherwise uses the hidden value", function() {
      obj = $form.serializeJSON();
      expect(obj).toEqual({
        truthy: '1',
        falsy: '0'
      });
    });

  });

  // options
  describe('parsed values', function() {
    beforeEach(function() {
      $form = $('<form>');
      $form.append($('<input type="text" name="Numeric 0"     value="0"/>'));
      $form.append($('<input type="text" name="Numeric 1"     value="1"/>'));
      $form.append($('<input type="text" name="Numeric 2.2"   value="2.2"/>'));
      $form.append($('<input type="text" name="Numeric -2.25" value="-2.25"/>'));
      $form.append($('<input type="text" name="Bool true"     value="true"/>'));
      $form.append($('<input type="text" name="Bool false"    value="false"/>'));
      $form.append($('<input type="text" name="Null"          value="null"/>'));
      $form.append($('<input type="text" name="String"        value="text is always string"/>'));
      $form.append($('<input type="text" name="Empty"         value=""/>'));
    });

    describe('with defaultOptions', function() {
      it("returns strings", function() {
        obj = $form.serializeJSON({}); // empty object should be translated to default options
        expect(obj).toEqual({
          "Numeric 0":     "0",
          "Numeric 1":     "1",
          "Numeric 2.2":   "2.2",
          "Numeric -2.25": "-2.25",
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          "null",
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });

    describe('with parseNumbers true', function() {
      it("returns numbers for the numeric string values", function() {
        obj = $form.serializeJSON({parseNumbers: true});
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     1,
          "Numeric 2.2":   2.2,
          "Numeric -2.25": -2.25,
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          "null",
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });

    describe('with parseBooleans true', function() {
      it("returns booleans for the 'true'/'false' values", function() {
        obj = $form.serializeJSON({parseBooleans: true});
        expect(obj).toEqual({
          "Numeric 0":     "0",
          "Numeric 1":     "1",
          "Numeric 2.2":   "2.2",
          "Numeric -2.25": "-2.25",
          "Bool true":     true,
          "Bool false":    false,
          "Null":          "null",
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });

    describe('with parseNulls', function() {
      it("returns null for the 'null' values", function() {
        obj = $form.serializeJSON({parseNulls: true}); // empty object should be translated to default options
        expect(obj).toEqual({
          "Numeric 0":     "0",
          "Numeric 1":     "1",
          "Numeric 2.2":   "2.2",
          "Numeric -2.25": "-2.25",
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });

    describe('with parseAll true', function() {
      it("parses all possible values", function() {
        obj = $form.serializeJSON({parseAll: true});
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     1,
          "Numeric 2.2":   2.2,
          "Numeric -2.25": -2.25,
          "Bool true":     true,
          "Bool false":    false,
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });

    describe('with parseWithFunction custom parser', function() {
      it("uses the passed in function to parse values", function() {
        var myParser = function(val) { return val === "true" ? 1 : 0};
        obj = $form.serializeJSON({parseWithFunction: myParser});
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     0,
          "Numeric 2.2":   0,
          "Numeric -2.25": 0,
          "Bool true":     1,
          "Bool false":    0,
          "Null":          0,
          "String":        0,
          "Empty":         0
        });
      });

      it("can be combined with other parse options", function() {
        var myParser = function(val) { return typeof(val) === "number" ? 1 : 0};
        obj = $form.serializeJSON({parseNumbers: true, parseWithFunction: myParser});
        expect(obj).toEqual({
          "Numeric 0":     1,
          "Numeric 1":     1,
          "Numeric 2.2":   1,
          "Numeric -2.25": 1,
          "Bool true":     0,
          "Bool false":    0,
          "Null":          0,
          "String":        0,
          "Empty":         0
        });
      });
    });

    describe('with useIntKeysAsArrayIndex true', function() {
      it("uses int keys as array indexes instead of object properties", function() {
        $form = $('<form>');
        $form.append($('<input type="text" name="foo[0]" value="0"/>'));
        $form.append($('<input type="text" name="foo[1]" value="1"/>'));
        $form.append($('<input type="text" name="foo[5]" value="5"/>'));

        obj = $form.serializeJSON({useIntKeysAsArrayIndex: false}); // default
        expect(obj).toEqual({"foo": {'0': '0', '1': '1', '5': '5'}});

        obj = $form.serializeJSON({useIntKeysAsArrayIndex: true}); // with option useIntKeysAsArrayIndex true
        expect(obj).toEqual({"foo": ['0', '1', undefined, undefined, undefined, '5']});

        obj = $form.serializeJSON({useIntKeysAsArrayIndex: true, parseNumbers: true}); // same but also parsing numbers
        expect(obj).toEqual({"foo": [0, 1, undefined, undefined, undefined, 5]});
      })
    });

    describe('with modified defaults', function() {
      var defaults = $.serializeJSON.defaultOptions;
      afterEach(function() {
        $.serializeJSON.defaultOptions = defaults; // restore defaults
      });

      it('uses those options by default', function() {
        $.serializeJSON.defaultOptions = {parseBooleans: true, parseNulls: true};
        obj = $form.serializeJSON({});
        expect(obj).toEqual({
          "Numeric 0":     "0",
          "Numeric 1":     "1",
          "Numeric 2.2":   "2.2",
          "Numeric -2.25": "-2.25",
          "Bool true":     true,
          "Bool false":    false,
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });

        $.serializeJSON.defaultOptions = {parseNumbers: true, parseNulls: true};
        obj = $form.serializeJSON({});
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     1,
          "Numeric 2.2":   2.2,
          "Numeric -2.25": -2.25,
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });
      });

      it('merges options with defaults', function() {
        var myParser = function(val) { return typeof(val) === "number" ? 1 : 0};
        $.serializeJSON.defaultOptions = {parseWithFunction: myParser};
        obj = $form.serializeJSON({parseNumbers: true});
        expect(obj).toEqual({
          "Numeric 0":     1,
          "Numeric 1":     1,
          "Numeric 2.2":   1,
          "Numeric -2.25": 1,
          "Bool true":     0,
          "Bool false":    0,
          "Null":          0,
          "String":        0,
          "Empty":         0
        });
      });

      it('can be overriden with different options', function() {
        $.serializeJSON.defaultOptions = {parseBooleans: true, parseNulls: true};
        obj = $form.serializeJSON({parseBooleans: false}); // override default parseBooleans: true
        expect(obj).toEqual({
          "Numeric 0":     "0",
          "Numeric 1":     "1",
          "Numeric 2.2":   "2.2",
          "Numeric -2.25": "-2.25",
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });
      });

      it('parseAll will override all other parse options', function() {
        $.serializeJSON.defaultOptions = {parseNumbers: true, parseBooleans: false, parseNulls: false, parseAll: true};
        obj = $form.serializeJSON({parseNumbers: false}); // but default parseAll is true
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     1,
          "Numeric 2.2":   2.2,
          "Numeric -2.25": -2.25,
          "Bool true":     true,
          "Bool false":    false,
          "Null":          null,
          "String":        "text is always string",
          "Empty":         ""
        });

        obj = $form.serializeJSON({parseAll: false}); // but default parseNumbers is true
        expect(obj).toEqual({
          "Numeric 0":     0,
          "Numeric 1":     1,
          "Numeric 2.2":   2.2,
          "Numeric -2.25": -2.25,
          "Bool true":     "true",
          "Bool false":    "false",
          "Null":          "null",
          "String":        "text is always string",
          "Empty":         ""
        });
      });
    });
  });
});

// splitInputNameIntoKeysArray
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

// isValidArrayIndex
describe("$.serializeJSON.isValidArrayIndex", function() {
  var validIndex = $.serializeJSON.isValidArrayIndex;
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
  it("rejects strings, objects and arrays", function() {
    expect(validIndex('')).toBeFalsy();
    expect(validIndex('foo')).toBeFalsy();
    expect(validIndex({'foo': 'var'})).toBeFalsy();
    expect(validIndex([0,1,2])).toBeFalsy();
  });
});

// deepSet
// used to assign nested keys like "address[state][abbr]" to an object
describe("$.serializeJSON.deepSet", function () {
  var deepSet = $.serializeJSON.deepSet;
  var arr, obj, v, v2;

  beforeEach(function () {
    obj = {};
    arr = [];
    v = 'v';
    v2 = 'v2';
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

  it("nested arrays with empty indexes should push the elements to the most deep array", function () {
    deepSet(arr, ['', '', ''], 1);
    deepSet(arr, ['', '', ''], 2);
    deepSet(arr, ['', '', ''], 3);
    expect(arr).toEqual([[[1, 2, 3]]]);
  });

  describe('with useIntKeysAsArrayIndex option', function(){
    var intIndx = {useIntKeysAsArrayIndex: true}

    it("simple array ['0']", function () {
      arr = [];
      deepSet(arr, ['0'], v);
      expect(arr).toEqual([v]); // still sets the value in the array because the 1st argument is an array

      arr = [];
      deepSet(arr, ['0'], v, intIndx);
      expect(arr).toEqual([v]);
    });

    it("nested simple array ['arr', '0']", function () {
      obj = {};
      deepSet(obj, ['arr', '0'], v);
      expect(obj).toEqual({'arr': {'0': v}});

      obj = {};
      deepSet(obj, ['arr', '0'], v, intIndx);
      expect(obj).toEqual({'arr': [v]});
    });

    it("nested simple array multiple values", function () {
      obj = {};
      deepSet(obj, ['arr', '1'], v2);
      deepSet(obj, ['arr', '0'], v);
      expect(obj).toEqual({'arr': {'0': v, '1': v2}});

      obj = {};
      deepSet(obj, ['arr', '1'], v2, intIndx);
      deepSet(obj, ['arr', '0'], v, intIndx);
      expect(obj).toEqual({'arr': [v, v2]});
    });

    it("nested arrays with indexes should create a matrix", function () {
      arr = [];
      deepSet(arr, ['0', '0', '0'], 1);
      deepSet(arr, ['0', '0', '1'], 2);
      deepSet(arr, ['0', '1', '0'], 3);
      deepSet(arr, ['0', '1', '1'], 4);
      deepSet(arr, ['1', '0', '0'], 5);
      deepSet(arr, ['1', '0', '1'], 6);
      deepSet(arr, ['1', '1', '0'], 7);
      deepSet(arr, ['1', '1', '1'], 8);
      expect(arr).toEqual([{ '0': {'0': 1, '1': 2}, '1': {'0': 3, '1': 4}}, {'0': {'0': 5, '1': 6}, '1': {'0': 7, '1': 8}}]);

      arr = [];
      deepSet(arr, ['0', '0', '0'], 1, intIndx);
      deepSet(arr, ['0', '0', '1'], 2, intIndx);
      deepSet(arr, ['0', '1', '0'], 3, intIndx);
      deepSet(arr, ['0', '1', '1'], 4, intIndx);
      deepSet(arr, ['1', '0', '0'], 5, intIndx);
      deepSet(arr, ['1', '0', '1'], 6, intIndx);
      deepSet(arr, ['1', '1', '0'], 7, intIndx);
      deepSet(arr, ['1', '1', '1'], 8, intIndx);
      expect(arr).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
    });

    it("nested object as array element ['arr', '0', 'foo']", function () {
      obj = {};
      deepSet(obj, ['arr', '0', 'foo'], v);
      expect(obj).toEqual({arr: {'0': {foo: v}}});

      obj = {};
      deepSet(obj, ['arr', '0', 'foo'], v, intIndx);
      expect(obj).toEqual({arr: [{foo: v}]});
    });

    it("array of objects", function (){
      obj = {};
      deepSet(obj, ['arr', '0', 'foo'], v);
      deepSet(obj, ['arr', '0', 'bar'], v);
      deepSet(obj, ['arr', '1', 'foo'], v2);
      deepSet(obj, ['arr', '1', 'bar'], v2);
      expect(obj).toEqual({'arr': {'0': {foo: v, bar: v}, '1': {foo: v2, bar: v2}}});

      obj = {};
      deepSet(obj, ['arr', '0', 'foo'], v, intIndx);
      deepSet(obj, ['arr', '0', 'bar'], v, intIndx);
      deepSet(obj, ['arr', '1', 'foo'], v2, intIndx);
      deepSet(obj, ['arr', '1', 'bar'], v2, intIndx);
      expect(obj).toEqual({'arr': [{foo: v, bar: v}, {foo: v2, bar: v2}]});
    });

    it("nested arrays mixing empty indexes with numeric indexes should push when using empty but assign when using numeric", function () {
      obj = {};
      deepSet(obj, ['arr', '', '0', ''], 1);
      deepSet(obj, ['arr', '', '1', ''], 2);
      deepSet(obj, ['arr', '', '0', ''], 3);
      deepSet(obj, ['arr', '', '1', ''], 4);
      expect(obj).toEqual({'arr': [{'0': [1, 3], '1': [2, 4]}]});

      obj = {};
      deepSet(obj, ['arr', '', '0', ''], 1, intIndx);
      deepSet(obj, ['arr', '', '1', ''], 2, intIndx);
      deepSet(obj, ['arr', '', '0', ''], 3, intIndx);
      deepSet(obj, ['arr', '', '1', ''], 4, intIndx);
      expect(obj).toEqual({'arr': [[[1, 3], [2, 4]]]});
    });

    it("should set all different nested values", function () {
      deepSet(obj, ['foo'], v, intIndx);
      deepSet(obj, ['inn', 'foo'], v, intIndx);
      deepSet(obj, ['inn', 'arr', '0'], v, intIndx);
      deepSet(obj, ['inn', 'arr', '1'], v2, intIndx);
      deepSet(obj, ['inn', 'arr', '2', 'foo'], v, intIndx);
      deepSet(obj, ['inn', 'arr', '2', 'bar'], v), intIndx;
      deepSet(obj, ['inn', 'arr', ''], v, intIndx);
      deepSet(obj, ['inn', 'arr', ''], v2, intIndx);
      deepSet(obj, ['inn', 'arr', '', 'foo'], v2, intIndx);
      deepSet(obj, ['inn', 'arr', '', 'bar'], v2, intIndx);
      deepSet(obj, ['inn', 'arr', '2', 'inn', 'foo'], v, intIndx);
      expect(obj).toEqual({foo: v, inn: {foo: v, arr: [v, v2, {foo: v, bar: v, inn: {foo: v}}, v, v2, {foo: v2, bar: v2}]}})
    });
  });
});