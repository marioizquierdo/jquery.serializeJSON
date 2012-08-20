(function($) {

    var isObject = function(obj) {
        return obj === Object(obj);
    };

    // Access the object in a deep key and assigns the value
    // deepSet(obj, ['foo'], v)                //=> obj['foo'] = v
    // deepSet(obj, ['foo', 'inn'], v)         //=> obj['foo']['inn'] = v // Create the inner obj['foo'] object, if needed
    // deepSet(obj, ['foo', 'inn', 'inn'], v)  //=> obj['foo']['inn']['inn'] = v
    // deepSet(obj, ['0'], v)                  //=> obj[0] = v // obj may be an Array
    // deepSet(obj, [''], v)                   //=> obj.push(v) // assume obj as array, and add a new value to the end
    // deepSet(obj, ['arr', '0'], v)           //=> obj['arr']['0'] = v // obj['arr'] is created as Array if needed
    // deepSet(obj, ['arr', ''], v)            //=> obj['arr'].push(v)
    // deepSet(obj, ['foo', 'arr', '0'], v)    //=> obj['foo']['arr'][0] = v // obj['foo'] is created as object and obj['foo']['arr'] as a Array, if needed
    // deepSet(obj, ['arr', '0', 'foo'], v)    //=> obj['arr']['0']['foo'] = v // obj['foo'] is created as object and obj['foo']['arr'] as a Array and obj['foo']['arr'][0] as object, if needed
    //                               >> obj = []
    // deepSet(obj, [''], v)         >> obj = [v]
    // deepSet(obj, ['', 'foo'], v)  >> obj = [v, {foo: v}]
    // deepSet(obj, ['', 'bar'], v)  >> obj = [v, {foo: v, bar: v}]
    $._deepSet = function(obj, keys, value) {
        if (!keys || keys.length === 0) throw new Error("ArgumentError: keys param expected to be an array with least one key");

        var key = keys[0];
        var next = keys[1];
        if (next) {
            var tail = keys.slice(1);
            var defaultIfNotDefined = (next === '' || !isNaN(parseInt('4', 10))) ? [] : {}; // Array or Object depending on next key
            if (key === '') { // Empty key with more next keys means to merge keys in the object element
                var last = obj[obj.length - 1];
                if (isObject(last)) {
                    key = last;
                } else { // if the array does not have an object as last element, create one
                    obj.push({});
                    key = last + 1;
                }
            }
            var innerObj = obj[key] || (obj[key] = defaultIfNotDefined);
            $._deepSet(innerObj, tail, value); // Recursive access the innerObj
        } else {
            if (key === '') {
                obj.push(value);
            } else {
                obj[key] = value;
            }
        }
    }


    $.fn.serializeJSON = function() {

        var obj = {};
        var formAsArray = this.serializeArray();

        $.each(formAsArray, function(i, input) {
            var name = input.name;
            var value = input.value;

            // Split the input name in programatically readable keys
            // name = "foo"              => keys = ['foo']
            // name = "[foo]"            => keys = ['foo']
            // name = "foo[inn][bar]"    => keys = ['foo', 'inn', 'bar']
            // name = "foo[inn][arr][0]" => keys = ['foo', 'inn', 'arr', '0']
            // name = "arr[][val]"       => keys = ['arr', '', 'val']
            var keys = $.map(name.split('['), function(key) {
                var last = key[key.length - 1];
                return last == ']' ? key.substring(0, key.length - 1) : key;
            });
            if (keys[0] === '') keys.shift(); // "[foo][inn]" should be same as "foo[inn]"

            // Set value in the object using the keys
            $._deepSet(obj, keys, value);
        });
        return obj;
    };
})(jQuery);