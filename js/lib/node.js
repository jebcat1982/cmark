"use strict";

function isContainer(node) {
    switch (node._type) {
    case 'Document':
    case 'BlockQuote':
    case 'List':
    case 'Item':
    case 'Paragraph':
    case 'Header':
    case 'Emph':
    case 'Strong':
    case 'Link':
    case 'Image':
        return true;
    default:
        return false;
    }
}

var resumeAt = function(node, entering) {
    this.current = node;
    this.entering = (entering === true);
};

var next = function(){
    var cur = this.current;
    var entering = this.entering;

    if (cur === null) {
        return null;
    }

    var container = isContainer(cur);

    if (entering && container) {
        if (cur.firstChild) {
            this.current = cur.firstChild;
            this.entering = true;
        } else {
            // stay on node but exit
            this.entering = false;
        }

    } else if (cur.next === null) {
        this.current = cur.parent;
        this.entering = false;

    } else {
        this.current = cur.next;
        this.entering = true;
    }

    return {entering: entering, node: cur};
};

var NodeWalker = function(root) {
    return { current: root,
             root: root,
             entering: true,
             next: next,
             resumeAt: resumeAt };
};

var Node = function(nodeType, sourcepos) {
    this._type = nodeType;
    this.parent = null;
    this.firstChild = null;
    this.lastChild = null;
    this.prev = null;
    this.next = null;
    this.sourcepos = sourcepos;
    this.last_line_blank = false;
    this.open = true;
    this.strings = null;
    this.string_content = null;
    this.literal = null;
    this.list_data = null;
    this.info = null;
    this.destination = null;
    this.title = null;
    this.fence_char = null;
    this.fence_length = 0;
    this.fence_offset = null;
    this.level = null;
};

Node.prototype.isContainer = function() {
    return isContainer(this);
};

Node.prototype.type = function() {
    return this._type;
};

Node.prototype.appendChild = function(child) {
    child.unlink();
    child.parent = this;
    if (this.lastChild) {
        this.lastChild.next = child;
        child.prev = this.lastChild;
        this.lastChild = child;
    } else {
        this.firstChild = child;
        this.lastChild = child;
    }
};

Node.prototype.prependChild = function(child) {
    child.unlink();
    child.parent = this;
    if (this.firstChild) {
        this.firstChild.prev = child;
        child.next = this.firstChild;
        this.firstChild = child;
    } else {
        this.firstChild = child;
        this.lastChild = child;
    }
};

Node.prototype.unlink = function() {
    if (this.prev) {
        this.prev.next = this.next;
    } else if (this.parent) {
        this.parent.firstChild = this.next;
    }
    if (this.next) {
        this.next.prev = this.prev;
    } else if (this.parent) {
        this.parent.lastChild = this.prev;
    }
    this.parent = null;
    this.next = null;
    this.prev = null;
};

Node.prototype.insertAfter = function(sibling) {
    sibling.unlink();
    sibling.next = this.next;
    if (sibling.next) {
        sibling.next.prev = sibling;
    }
    sibling.prev = this;
    this.next = sibling;
    sibling.parent = this.parent;
    if (!sibling.next) {
        sibling.parent.lastChild = sibling;
    }
};

Node.prototype.insertBefore = function(sibling) {
    sibling.unlink();
    sibling.prev = this.prev;
    if (sibling.prev) {
        sibling.prev.next = sibling;
    }
    sibling.next = this;
    this.prev = sibling;
    sibling.parent = this.parent;
    if (!sibling.prev) {
        sibling.parent.firstChild = sibling;
    }
};

Node.prototype.walker = function() {
    var walker = new NodeWalker(this);
    return walker;
};

module.exports = Node;


/* Example of use of walker:

 var walker = w.walker();
 var event;

 while (event = walker.next()) {
 console.log(event.entering, event.node.type());
 }

 */
