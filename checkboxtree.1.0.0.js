/*! CheckBoxTree JavaScript library v1.0.0 | ruiguo yang */
Tree = function () {
    this.path = "icon/o_";
    this.name = "tree";
    this.ostatus = [];
    this.stree = [];
    this.id = +new Date + parseInt(Math.random() * 100000);
    this.initialize.apply(this, arguments);

    this.setChild = function (p, q) {
        for (var i in q) {
            if (q[i][1] == p) { this.stree[q[i][0]] = 2; this.setChild(q[i][0], q); }
        }
    };
    this.getSelectTree = function (p) {
        this.stree = [];
        var otree = [];
        for (var i in this.ostatus) {
            var j = this.ostatus[i] || 0;
            if (j > 0) { this.stree[i] = j; }
            if (j == 2) { this.setChild(i, p); }
        }
        for (var i in this.stree) { otree[i] = p[i]; }
        return otree;
    };
};
Tree.prototype = {
    constructor: Tree,
    initialize: function (config) {
        var me = this, renderTo = config.renderTo;
        me.tree = config.data;
        me.flag = config.flag;
        me.checked = config.checked;
        me.container = ((typeof renderTo === "string") ?
        document.getElementById(renderTo) : renderTo) || document.body;
        me.panel = document.createElement("div");
        me.panel.setAttribute("id", "tree" + me.id);
        me.container.insertBefore(me.panel, null);
        var id = "#" + me.panel.id;
        var sheet = document.createElement('style');
        sheet.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(sheet);
        var bg = "background:transparent url(" + me.path;
        var cssCode = id + " {font-size:12px;}\n" +
                    id + " img {border:0;vertical-align: middle;}\n" +
                    id + " span {vertical-align: bottom;}\n" +
                    id + " .line {padding-left:15px;" + bg + "line.gif) repeat-y 0 0;}\n" +
                    id + " .blank {margin-left:15px;}\n" +
                    id + " img.collapse {padding-right:15px;" + bg + "folder.gif) no-repeat right center;}\n" +
                    id + " img.unfold {padding-right:15px;" + bg + "folderopen.gif) no-repeat right center;}\n" +
                    id + " img.root {padding-right:1px;" + bg + "blank.gif) no-repeat right center;}\n" +
                    id + " img.leaf {padding-right:15px;" + bg + "blank.gif) no-repeat right center;}\n";
        if (! +"\v1") {
            sheet.styleSheet.cssText = cssCode;
        } else if (/a/[-1] == 'a') {
            sheet.innerHTML = cssCode;
        } else {
            sheet.appendChild(document.createTextNode(cssCode));
        }
        // Add the root
        var icon = me.makeImage("nolines_plus", "collapse root");
        var checkbox0 = me.makeImage("checkbox_0", "checkbox_0");
        me.panel.innerHTML = me.makeTree(me.tree[0][0], "b", 0, icon + checkbox0, me.tree[0][2]);
        me.childs = [];
        me.checks = []; // How many sub-nodes has been checked for each node
        me.status = []; //0 no sub-nodes checked,1 part of sub-nodes checked,2 all sub-nodes checked
        me.panel.onclick = function (e) {
            e = e || window.event;
            var node = e.srcElement ? e.srcElement : e.target;
            var current = node.parentNode;
            var currentIndex = current.getAttribute("index");
            var currentPrefix = current.getAttribute("prefix");
            var currentLevel = current.getAttribute("level");
            var subtree = me.getSubtree(currentIndex);
            var children = current.children[3];
            // Add sub-nodes when current node has no sub-nodes or haven't add them.
            if (subtree && !children) {
                children = document.createElement("div");
                var childs = [];
                for (var i in subtree) {
                    var isLimb = me.hasSubtree(subtree[i][0]);
                    var isLast = (i == subtree.length - 1);
                    var prefix = isLast ? "blank" : "line";
                    icon = isLast ? "plusbottom" : "plus";
                    if (isLimb) {
                        icon = me.makeImage(icon, "collapse limb"); // Decorative icon before branch nodes.
                    } else {
                        icon = icon.replace(/plus/, "join");        // Line icon before leaf nodes.
                        icon = me.makeImage(icon, "leaf");          // Decorative icon before leaf nodes.
                    }
                    childs.push(subtree[i][0]);
                    if (me.status[currentIndex] == 2) { checkbox0 = me.makeImage("checkbox_1", "checkbox_1"); }
                    children.innerHTML += me.makeTree(subtree[i][0], prefix, +currentLevel + 1, icon + checkbox0, subtree[i][2])
                }
                me.childs[currentIndex] = childs;
                if (childs != undefined && childs.length > 0 && me.status[currentIndex] == 2) {
                    for (var i in childs) { me.status[childs[i]] = 2; }
                }
                children.className = (currentPrefix == "line") ? "line" : "blank";
                current.insertBefore(children, null);
            }
            if (/collapse/.test(node.className)) {            // When fold/unfold icon is clicked.
                node.src = node.src.replace(/plus/, "minus"); // Change the fold/unfold icon.
                node.className = node.className.replace("collapse", "unfold"); // Change the decorative icon.
                children && (children.style.display = "block");
            } else if (/unfold/.test(node.className)) {
                node.src = node.src.replace(/minus/, "plus"); // Change the connective line icon.
                node.className = node.className.replace("unfold", "collapse"); // Change the decorative icon.
                children && (children.style.display = "none");
            }
            if (/checkbox/.test(node.className)) { // When checkbox icon is clicked.
                var checked = me.isChecked(node);
                me.status[parseInt(current.getAttribute("index"))] = checked ? 0 : 2;
                me.setJuniorCheckbox(current, checked)
                me.setPriorCheckbox(current, checked);
            }
            me.ostatus = me.status;
        }
        me.unfoldTree(me.panel.childNodes[0]);
        me.filterCheckedNodes();
        me.setCheckedNodes();
        me.ostatus = me.status;
    },
    // Remove nodes which are not leaf nodes.
    filterCheckedNodes: function () {
        var idx = 0;
        var copy = this.checked;
        this.checked = [];
        for (var i in copy) {
            if (this.childs[copy[i]].length == 0) {
                this.checked[idx] = copy[i];
                idx += 1;
            }
        }
    },
    setCheckedNodes: function () {
        for (var i in this.checked) {
            var current = document.getElementById("treeNodeDiv" + this.flag + this.checked[i]);
            this.status[this.checked[i]] = 2;
            this.setJuniorCheckbox(current, false);
            this.setPriorCheckbox(current, false);
        }
    },
    unfoldTree: function (current) {
        var node = current.childNodes[2];
        var currentIndex = current.getAttribute("index");
        var currentPrefix = current.getAttribute("prefix");
        var currentLevel = current.getAttribute("level");
        var children = current.children[3];
        var subtree = this.getSubtree(currentIndex);
        var checkbox0 = this.makeImage("checkbox_0", "checkbox_0");
        if (subtree && !children) {
            children = document.createElement("div");
            var childs = [];
            for (var i in subtree) {
                var isLimb = this.hasSubtree(subtree[i][0]);
                var isLast = (i == subtree.length - 1);
                var prefix = isLast ? "blank" : "line";
                icon = isLast ? "plusbottom" : "plus";
                if (isLimb) {
                    icon = this.makeImage(icon, "collapse limb");
                } else {
                    icon = icon.replace(/plus/, "join");
                    icon = this.makeImage(icon, "leaf");
                }
                childs.push(subtree[i][0]);
                if (this.status[currentIndex] == 2) { checkbox0 = this.makeImage("checkbox_1", "checkbox_1"); }
                children.innerHTML += this.makeTree(subtree[i][0], prefix, +currentLevel + 1, icon + checkbox0, subtree[i][2])
            }
            this.childs[currentIndex] = childs;
            if (childs != undefined && childs.length > 0 && this.status[currentIndex] == 2) {
                for (var i in childs) { this.status[childs[i]] = 2; }
            }
            children.className = (currentPrefix == "line") ? "line" : "blank";
            current.insertBefore(children, null);
            for (var i in childs) {
                var node = document.getElementById("treeNodeDiv" + this.flag + childs[i]);
                this.unfoldTree(node);
            }
            parseInt(currentIndex) != 0 && children && (children.style.display = "none");
        }
    },
    setJuniorCheckbox: function (node, /*Boolean*/checked) {
        var checkbox = node.children[1];
        var replaceCheckbox = checked ? "checkbox_0" : "checkbox_1";
        checkbox.src = checkbox.src.replace(/checkbox_\d/, replaceCheckbox);
        checkbox.className = replaceCheckbox;
        var index = node.getAttribute("index");
        if (!!this.childs[index]) {
            var length = this.childs[index].length;
            this.checks[index] = checked ? 0 : length;
            this.status[index] = checked ? 0 : 2;
            if (length > 0) {
                var children = node.children[3].children;
                while (--length >= 0) {
                    this.status[this.childs[index][length]] = this.status[index];
                    this.setJuniorCheckbox(children[length], checked);
                }
            }
        }
    },
    setPriorCheckbox: function (node, /*Boolean*/checked) {   // Set its higher level's checkbox status.
        var index = parseInt(node.getAttribute("index"));     // The index of current node.
        var prior = node.parentNode.parentNode;               // Its father node.
        var priorIndex = parseInt(this.tree[index][1]);       // Father node's index.
        var priorCheckbox = prior.children[1];                // Checkbox style of its father node.
        var priorLevel = parseInt(prior.getAttribute("level")); // Level of its father node.
        var priorCount = this.checks[priorIndex] || 0;          // How many sub-nodes are selected in its father sub-node set.
        priorCount = this.getPriorChildrenChecked(checked, index, priorIndex);
        if (priorCount == -1) { return; }
        this.checks[priorIndex] = priorCount;
        if (!!priorCheckbox) {
            // When priorIndex != -1, priorCheckbox is not exist,
            // and me.childs[priorIndex] is undefined.
            var replaceCheckbox = this.status[priorIndex] == 0 ? "checkbox_0" : (this.status[priorIndex] == 2 ? "checkbox_1" : "checkbox_2");
            // checkbox_1 is all selected checkbox style, and checkbox_2 is part selected checkbox style.
            // When certain nodes' all sub-nodes are select, let checked is false when set its father's style.
            priorCheckbox.src = priorCheckbox.src.replace(/checkbox_\d/, replaceCheckbox);
            priorCheckbox.className = replaceCheckbox;
        }
        if (priorLevel > 0) { // The root doesn't have priorCheckbox, and priorLevel==-1
            this.setPriorCheckbox(prior, checked);
        }
    },
    isChecked: function (node) {// If its checkbox style is checkbox_0, return false, else return true(checkbox_1 or checkbox_2).
        return parseInt(node.src.slice(-5, -4)) > 0;
    },
    makeImage: function (image) {
        var status = "";
        if (arguments[1] != null) {
            status = "class='" + arguments[1] + "'";
        }
        return "<img src='" + this.path + image + ".gif' " + status + " />"
    },
    getPriorChildrenChecked: function (/*Boolean*/checked, currentIndex, priorIndex) {
        // If current node doesn't have father node.
        if (this.childs[priorIndex] == undefined || this.childs[priorIndex].length == 0) { return -1; }
        var cnt1 = 0, cnt2 = 0, cnt = 0;
        var priorCount = this.childs[priorIndex].length - 1;
        for (var i in this.childs[priorIndex]) {
            var j = this.status[this.childs[priorIndex][i]] || 0;
            cnt += 1;
            if (j == 1) { cnt1 += 1; }
            if (j == 2) { cnt2 += 1; }
        }
        this.status[priorIndex] = 1;
        if (cnt1 + cnt2 == 0) { priorCount = 0; this.status[priorIndex] = 0; }
        if (cnt2 == cnt) { priorCount = cnt2; this.status[priorIndex] = 2; }
        return priorCount;
    },
    makeTree: function (index, prefix, level, images, text) {
        var builder = [];
        builder.push("<div index='");
        builder.push(index);
        builder.push("' id='")
        builder.push("treeNodeDiv" + this.flag + index);
        builder.push("' prefix='")
        builder.push(prefix);
        builder.push("' level='")
        builder.push(level);
        builder.push("'>");
        builder.push(images);
        builder.push("<span>");
        builder.push(text);
        builder.push("</span></div>")
        return builder.join('');
    },
    hasSubtree: function (p) {
        var tree = this.tree;
        for (var i in tree) {
            if (this.tree[i][1] == p) {
                return true;
            }
        }
        return false;
    },
    getSubtree: function (p) {
        var subtree = [];
        var tree = this.tree;
        p = parseInt(p);
        for (var i in tree) {
            if (tree[i][1] == p) {
                subtree.push(tree[i]);
            }
        }
        return subtree;
    }
}