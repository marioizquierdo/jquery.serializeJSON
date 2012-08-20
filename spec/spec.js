describe("deepSet", function() {
  var deepSet = $._deepSet;
  var obj;

  beforeEach(function() {
    obj = {};
  });

  it("['foo']", function() {
    deepSet(obj, ['foo'], 'val');
    expect(obj['foo']).toEqual('val');
  });

});

describe("$.serializeJSON", function() {
  var obj;

  beforeEach(function() {
    obj = $('#myform').serializeJSON();
  });

  it("should apply to a form", function() {
    expect(obj).not.toBeNull();
    expect(obj['foo']).toEqual('foo');
  });

});