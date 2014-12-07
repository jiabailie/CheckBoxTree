CheckBoxTree
============

The simplest checkbox tree.

It's very simple to use it.

```javascript
/*
 * renderTo: The id of div which you want to put the checkbox tree;
 * data:     The data you want to display it, which format is [id, parentid, nodename], -1 is always the root it;
 * checked:  The data which is included in the previous parameter, and you want these nodes are checked.
 */
tree = new Tree({ renderTo: "test", data: data, checked: checked });

/*
 * When you want to get the values are checked, you can use below method,
 * data is the full data set of current checkbox tree showed.
 */
var msg = tree.getSelectTree(data);
```


