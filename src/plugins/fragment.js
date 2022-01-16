const freeze = (object, property, value) => {
  Object.defineProperty(object, property, {
    configurable: true,
    get() {
      return value;
    },
    set(v) {
      console.warn(`tried to set frozen property ${property} with ${v}`);
    },
  });
};

const unfreeze = (object, property, value = null) => {
  Object.defineProperty(object, property, {
    configurable: true,
    writable: true,
    value: value,
  });
};

var seq = 0;
const nanoid = () => {
  seq++;
  return `fr${seq}`;
};

export const Fragment = {
  abstract: true,
  name: 'Fragment',

  props: {
    name: {
      type: String,
      default: () => nanoid(),
    },
  },
  mounted() {
    this.__container = this.$el;
    const container = this.$el;
    const parent = container.parentNode;

    container.__isFragment = true;
    container.__isMounted = false;

    const head = document.createComment(`fragment#${this.name}#head`);
    const tail = document.createComment(`fragment#${this.name}#tail`);

    container.__head = head;
    container.__tail = tail;

    let tpl = document.createDocumentFragment();
    tpl.appendChild(head);

    Array.from(container.childNodes).forEach((node) => {
      // container.appendChild(node, true)
      let notFrChild = !Object.prototype.hasOwnProperty.call(
        node,
        '__isFragmentChild__'
      );
      tpl.appendChild(node);
      if (notFrChild) {
        freeze(node, 'parentNode', container);
        freeze(node, '__isFragmentChild__', true);
      }
    });

    tpl.appendChild(tail);

    let next = container.nextSibling;
    parent.insertBefore(tpl, container, true);
    parent.removeChild(container);
    freeze(container, 'parentNode', parent);
    freeze(container, 'nextSibling', next);
    if (next) freeze(next, 'previousSibling', container);

    container.__isMounted = true;
  },
  render(h) {
    const children = this.$slots.default;

    // add fragment attribute on the children
    if (children && children.length) {
      children.forEach((child) => {
        let data = {
          ...child.data,
          attrs: { fragment: this.name, ...(child.data || {}).attrs },
        };
        child.data = data;
      });
    } else {
      console.log('fragment without children render invoking');
    }

    return h(
      'div',
      {
        attrs: { fragment: this.name },
        // key: getRandomStr(),
      },
      children
    );
  },
};

export const Plugin = {
  install: function (Vue) {
    const orgRemoveChild = window.Node.prototype.removeChild;
    window.Node.prototype.removeChild = function (node) {
      // console.debug('==== Remove child called ===', node)
      if (this.__isFragment) {
        if (this.parentNode) {
          // console.debug("=== parent === isFragment:", this.parentNode.__isFragment, this.parentNode.attributes.fragment)
          let ret = this.parentNode.removeChild(node);
          unfreeze(node, 'parentNode');
          return ret;
        }
      } else if (node.__isFragment && node.__isMounted) {
        // console.error("=== removing fragment ===", node)
        while (node.__head.nextSibling !== node.__tail)
          orgRemoveChild.call(this, node.__head.nextSibling);

        orgRemoveChild.call(this, node.__head);
        orgRemoveChild.call(this, node.__tail);
        let prev = node.__head.previousSibling,
          next = node.__tail.nextSibling;
        if (prev) freeze(prev, 'nextSibling', next);
        if (next) freeze(next, 'previousSibling', prev);

        unfreeze(node, 'parentNode');
        return node;
      } else {
        // console.warn("== real remove ==", this, node, node.__isFragment, node.previousSibling, node.nextSibling)
        let prev = node.previousSibling,
          next = node.nextSibling;
        let ret = orgRemoveChild.call(this, node);
        if (prev) freeze(prev, 'nextSibling', next);
        if (next) freeze(next, 'previousSibling', prev);
        return ret;
      }
    };

    const orgInsertBefore = window.Node.prototype.insertBefore;
    window.Node.prototype.insertBefore = function (
      node,
      ref,
      inFragment = false
    ) {
      // console.log('==== insert Before called ===', node, ref)
      let realRef =
        !!ref && !!ref.__isFragment && !!ref.__isMounted ? ref.__head : ref;
      if (this.__isFragment) {
        let notFrChild = !Object.prototype.hasOwnProperty.call(
            node,
            '__isFragmentChild__'
          ),
          freezeParent = !inFragment || notFrChild;

        notFrChild && freeze(node, '__isFragmentChild__', true);
        let ret = this.parentNode
          ? this.parentNode.insertBefore(node, ref)
          : orgInsertBefore.call(this, node, realRef);
        freezeParent && freeze(node, 'parentNode', this);

        return ret;
      } else if (node.__isFragment && node.__isMounted) {
        // console.log("===trying to insert " + node.attributes.fragment.value + " before " + ref)
        if (node === ref) {
          console.error('something must be wrong');
          return;
        }
        freeze(node, 'parentNode', this);
        if (node.previousSibling)
          freeze(node.previousSibling, 'nextSibling', node.nextSibling);
        if (node.nextSibling)
          freeze(node.nextSibling, 'previousSibling', node.previousSibling);
        freeze(node, 'nextSibling', ref);
        freeze(node, 'previousSibling', ref.previousSibling);
        if (ref.previousSibling)
          freeze(ref.previousSibling, 'nextSibling', node);
        freeze(ref, 'previousSibling', node);

        let tpl = document.createDocumentFragment(),
          ele = node.__head;
        while (ele !== node.__tail) {
          tpl.appendChild(ele);
          ele = ele.nextSibling;
        }
        tpl.appendChild(node.__tail);
        orgInsertBefore.call(this, tpl, realRef);
        return node;
      } else {
        return orgInsertBefore.call(this, node, realRef);
      }
    };

    const orgAppendChild = window.Node.prototype.appendChild;
    window.Node.prototype.appendChild = function (node, inFragment = false) {
      // console.debug("==== append child called === is fragment: ", !!this.__isFragment, node)
      if (this.__isFragment) {
        // console.log("==== container append child called ===", inFragment, this.attributes.fragment.value, node)
        if (this.parentNode) {
          let notFrChild = !Object.prototype.hasOwnProperty.call(
              node,
              '__isFragmentChild__'
            ),
            freezeParent = !inFragment || notFrChild;

          notFrChild && freeze(node, '__isFragmentChild__', true);
          let ret = this.parentNode.insertBefore(node, this.__tail, inFragment);
          freezeParent && freeze(node, 'parentNode', this);

          return ret;
        }
      } else {
        return orgAppendChild.call(this, node);
      }
    };

    Vue.component('fragment', Fragment);
  },
};
