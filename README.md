jquery.serializeJSON
====================

Converts an HTML form into JSON, with the same format/rules as Rails parameters. Similar to jQuery `.serialize()` and `.serializeArray()` but handling nested values like `name="user[address][city]"` or `name="user[phones][]"`