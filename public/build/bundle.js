
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\ROI.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\components\\ROI.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let button;
    	let t11;
    	let p1;
    	let t12;
    	let t13_value = /*roi*/ ctx[2].toFixed(2) + "";
    	let t13;
    	let t14;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Retorno de Inversión (ROI)";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "El ROI mide la rentabilidad de una inversión en relación con su costo.";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Inversión:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Ganancia:";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Calcular ROI";
    			t11 = space();
    			p1 = element("p");
    			t12 = text("ROI: ");
    			t13 = text(t13_value);
    			t14 = text("%");
    			attr_dev(h2, "class", "svelte-1dx4cdq");
    			add_location(h2, file$3, 15, 2, 256);
    			attr_dev(p0, "class", "description svelte-1dx4cdq");
    			add_location(p0, file$3, 16, 2, 295);
    			attr_dev(label0, "for", "investment");
    			attr_dev(label0, "class", "svelte-1dx4cdq");
    			add_location(label0, file$3, 20, 2, 408);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "id", "investment");
    			attr_dev(input0, "placeholder", "Ingrese la cantidad de inversión");
    			attr_dev(input0, "class", "svelte-1dx4cdq");
    			add_location(input0, file$3, 21, 2, 454);
    			attr_dev(label1, "for", "gain");
    			attr_dev(label1, "class", "svelte-1dx4cdq");
    			add_location(label1, file$3, 28, 2, 593);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "gain");
    			attr_dev(input1, "placeholder", "Ingrese la cantidad de ganancia");
    			attr_dev(input1, "class", "svelte-1dx4cdq");
    			add_location(input1, file$3, 29, 2, 632);
    			attr_dev(button, "class", "calculate svelte-1dx4cdq");
    			add_location(button, file$3, 36, 2, 758);
    			attr_dev(p1, "class", "result svelte-1dx4cdq");
    			add_location(p1, file$3, 37, 2, 833);
    			attr_dev(div, "class", "card svelte-1dx4cdq");
    			add_location(div, file$3, 14, 0, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, label0);
    			append_dev(div, t5);
    			append_dev(div, input0);
    			set_input_value(input0, /*investment*/ ctx[0]);
    			append_dev(div, t6);
    			append_dev(div, label1);
    			append_dev(div, t8);
    			append_dev(div, input1);
    			set_input_value(input1, /*gain*/ ctx[1]);
    			append_dev(div, t9);
    			append_dev(div, button);
    			append_dev(div, t11);
    			append_dev(div, p1);
    			append_dev(p1, t12);
    			append_dev(p1, t13);
    			append_dev(p1, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*calculateROI*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*investment*/ 1 && to_number(input0.value) !== /*investment*/ ctx[0]) {
    				set_input_value(input0, /*investment*/ ctx[0]);
    			}

    			if (dirty & /*gain*/ 2 && to_number(input1.value) !== /*gain*/ ctx[1]) {
    				set_input_value(input1, /*gain*/ ctx[1]);
    			}

    			if (dirty & /*roi*/ 4 && t13_value !== (t13_value = /*roi*/ ctx[2].toFixed(2) + "")) set_data_dev(t13, t13_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ROI', slots, []);
    	let investment = 0;
    	let gain = 0;
    	let roi = 0;

    	function calculateROI() {
    		if (investment > 0) {
    			$$invalidate(2, roi = (gain - investment) / investment * 100);
    		} else {
    			$$invalidate(2, roi = 0);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ROI> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		investment = to_number(this.value);
    		$$invalidate(0, investment);
    	}

    	function input1_input_handler() {
    		gain = to_number(this.value);
    		$$invalidate(1, gain);
    	}

    	$$self.$capture_state = () => ({ investment, gain, roi, calculateROI });

    	$$self.$inject_state = $$props => {
    		if ('investment' in $$props) $$invalidate(0, investment = $$props.investment);
    		if ('gain' in $$props) $$invalidate(1, gain = $$props.gain);
    		if ('roi' in $$props) $$invalidate(2, roi = $$props.roi);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		investment,
    		gain,
    		roi,
    		calculateROI,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class ROI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ROI",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\PaybackPeriod.svelte generated by Svelte v3.59.2 */

    const file$2 = "src\\components\\PaybackPeriod.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let button;
    	let t11;
    	let p1;
    	let t12;
    	let t13_value = /*paybackPeriod*/ ctx[2].toFixed(2) + "";
    	let t13;
    	let t14;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Periodo de Recuperación";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "El Periodo de Recuperación es el tiempo necesario para recuperar el costo de una inversión.";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Inversión Inicial:";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Ingreso Anual:";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			button = element("button");
    			button.textContent = "Calcular Periodo de Recuperación";
    			t11 = space();
    			p1 = element("p");
    			t12 = text("Periodo de Recuperación: ");
    			t13 = text(t13_value);
    			t14 = text(" años");
    			attr_dev(h2, "class", "svelte-1oauim1");
    			add_location(h2, file$2, 15, 2, 317);
    			attr_dev(p0, "class", "description svelte-1oauim1");
    			add_location(p0, file$2, 16, 2, 353);
    			attr_dev(label0, "for", "initialInvestment");
    			attr_dev(label0, "class", "svelte-1oauim1");
    			add_location(label0, file$2, 20, 2, 487);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "id", "initialInvestment");
    			attr_dev(input0, "placeholder", "Ingrese la inversión inicial");
    			attr_dev(input0, "class", "svelte-1oauim1");
    			add_location(input0, file$2, 21, 2, 548);
    			attr_dev(label1, "for", "annualCashInflow");
    			attr_dev(label1, "class", "svelte-1oauim1");
    			add_location(label1, file$2, 28, 2, 697);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "annualCashInflow");
    			attr_dev(input1, "placeholder", "Ingrese el ingreso anual");
    			attr_dev(input1, "class", "svelte-1oauim1");
    			add_location(input1, file$2, 29, 2, 753);
    			attr_dev(button, "class", "calculate svelte-1oauim1");
    			add_location(button, file$2, 36, 2, 896);
    			attr_dev(p1, "class", "result svelte-1oauim1");
    			add_location(p1, file$2, 39, 2, 1011);
    			attr_dev(div, "class", "card svelte-1oauim1");
    			add_location(div, file$2, 14, 0, 295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, label0);
    			append_dev(div, t5);
    			append_dev(div, input0);
    			set_input_value(input0, /*initialInvestment*/ ctx[0]);
    			append_dev(div, t6);
    			append_dev(div, label1);
    			append_dev(div, t8);
    			append_dev(div, input1);
    			set_input_value(input1, /*annualCashInflow*/ ctx[1]);
    			append_dev(div, t9);
    			append_dev(div, button);
    			append_dev(div, t11);
    			append_dev(div, p1);
    			append_dev(p1, t12);
    			append_dev(p1, t13);
    			append_dev(p1, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*calculatePaybackPeriod*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*initialInvestment*/ 1 && to_number(input0.value) !== /*initialInvestment*/ ctx[0]) {
    				set_input_value(input0, /*initialInvestment*/ ctx[0]);
    			}

    			if (dirty & /*annualCashInflow*/ 2 && to_number(input1.value) !== /*annualCashInflow*/ ctx[1]) {
    				set_input_value(input1, /*annualCashInflow*/ ctx[1]);
    			}

    			if (dirty & /*paybackPeriod*/ 4 && t13_value !== (t13_value = /*paybackPeriod*/ ctx[2].toFixed(2) + "")) set_data_dev(t13, t13_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaybackPeriod', slots, []);
    	let initialInvestment = 0;
    	let annualCashInflow = 0;
    	let paybackPeriod = 0;

    	function calculatePaybackPeriod() {
    		if (annualCashInflow > 0) {
    			$$invalidate(2, paybackPeriod = initialInvestment / annualCashInflow);
    		} else {
    			$$invalidate(2, paybackPeriod = 0);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaybackPeriod> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		initialInvestment = to_number(this.value);
    		$$invalidate(0, initialInvestment);
    	}

    	function input1_input_handler() {
    		annualCashInflow = to_number(this.value);
    		$$invalidate(1, annualCashInflow);
    	}

    	$$self.$capture_state = () => ({
    		initialInvestment,
    		annualCashInflow,
    		paybackPeriod,
    		calculatePaybackPeriod
    	});

    	$$self.$inject_state = $$props => {
    		if ('initialInvestment' in $$props) $$invalidate(0, initialInvestment = $$props.initialInvestment);
    		if ('annualCashInflow' in $$props) $$invalidate(1, annualCashInflow = $$props.annualCashInflow);
    		if ('paybackPeriod' in $$props) $$invalidate(2, paybackPeriod = $$props.paybackPeriod);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		initialInvestment,
    		annualCashInflow,
    		paybackPeriod,
    		calculatePaybackPeriod,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class PaybackPeriod extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaybackPeriod",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\EVM.svelte generated by Svelte v3.59.2 */

    const file$1 = "src\\components\\EVM.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p0;
    	let t3;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let button;
    	let t14;
    	let p1;
    	let t15;
    	let t16_value = /*cpi*/ ctx[3].toFixed(2) + "";
    	let t16;
    	let t17;
    	let t18_value = /*spi*/ ctx[4].toFixed(2) + "";
    	let t18;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Gestión de Valor Ganado (EVM)";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "EVM es una técnica de gestión de proyectos para medir el desempeño y progreso del proyecto.";
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Valor Ganado (EV):";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Valor Planificado (PV):";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Costo Actual (AC):";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			button = element("button");
    			button.textContent = "Calcular EVM";
    			t14 = space();
    			p1 = element("p");
    			t15 = text("CPI: ");
    			t16 = text(t16_value);
    			t17 = text(" | SPI: ");
    			t18 = text(t18_value);
    			attr_dev(h2, "class", "svelte-1oauim1");
    			add_location(h2, file$1, 23, 2, 442);
    			attr_dev(p0, "class", "description svelte-1oauim1");
    			add_location(p0, file$1, 24, 2, 484);
    			attr_dev(label0, "for", "ev");
    			attr_dev(label0, "class", "svelte-1oauim1");
    			add_location(label0, file$1, 28, 2, 618);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "id", "ev");
    			attr_dev(input0, "placeholder", "Ingrese el valor ganado");
    			attr_dev(input0, "class", "svelte-1oauim1");
    			add_location(input0, file$1, 29, 2, 664);
    			attr_dev(label1, "for", "pv");
    			attr_dev(label1, "class", "svelte-1oauim1");
    			add_location(label1, file$1, 36, 2, 778);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "id", "pv");
    			attr_dev(input1, "placeholder", "Ingrese el valor planificado");
    			attr_dev(input1, "class", "svelte-1oauim1");
    			add_location(input1, file$1, 37, 2, 829);
    			attr_dev(label2, "for", "ac");
    			attr_dev(label2, "class", "svelte-1oauim1");
    			add_location(label2, file$1, 44, 2, 948);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "id", "ac");
    			attr_dev(input2, "placeholder", "Ingrese el costo actual");
    			attr_dev(input2, "class", "svelte-1oauim1");
    			add_location(input2, file$1, 45, 2, 994);
    			attr_dev(button, "class", "calculate svelte-1oauim1");
    			add_location(button, file$1, 52, 2, 1108);
    			attr_dev(p1, "class", "result svelte-1oauim1");
    			add_location(p1, file$1, 55, 2, 1193);
    			attr_dev(div, "class", "card svelte-1oauim1");
    			add_location(div, file$1, 22, 0, 420);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, label0);
    			append_dev(div, t5);
    			append_dev(div, input0);
    			set_input_value(input0, /*ev*/ ctx[0]);
    			append_dev(div, t6);
    			append_dev(div, label1);
    			append_dev(div, t8);
    			append_dev(div, input1);
    			set_input_value(input1, /*pv*/ ctx[1]);
    			append_dev(div, t9);
    			append_dev(div, label2);
    			append_dev(div, t11);
    			append_dev(div, input2);
    			set_input_value(input2, /*ac*/ ctx[2]);
    			append_dev(div, t12);
    			append_dev(div, button);
    			append_dev(div, t14);
    			append_dev(div, p1);
    			append_dev(p1, t15);
    			append_dev(p1, t16);
    			append_dev(p1, t17);
    			append_dev(p1, t18);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*calculateEVM*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ev*/ 1 && to_number(input0.value) !== /*ev*/ ctx[0]) {
    				set_input_value(input0, /*ev*/ ctx[0]);
    			}

    			if (dirty & /*pv*/ 2 && to_number(input1.value) !== /*pv*/ ctx[1]) {
    				set_input_value(input1, /*pv*/ ctx[1]);
    			}

    			if (dirty & /*ac*/ 4 && to_number(input2.value) !== /*ac*/ ctx[2]) {
    				set_input_value(input2, /*ac*/ ctx[2]);
    			}

    			if (dirty & /*cpi*/ 8 && t16_value !== (t16_value = /*cpi*/ ctx[3].toFixed(2) + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*spi*/ 16 && t18_value !== (t18_value = /*spi*/ ctx[4].toFixed(2) + "")) set_data_dev(t18, t18_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('EVM', slots, []);
    	let ev = 0; // Valor Ganado
    	let pv = 0; // Valor Planificado
    	let ac = 0; // Costo Actual
    	let cpi = 0; // Índice de Rendimiento de Costo
    	let spi = 0; // Índice de Rendimiento de Cronograma

    	function calculateEVM() {
    		if (ac > 0) {
    			$$invalidate(3, cpi = ev / ac);
    		} else {
    			$$invalidate(3, cpi = 0);
    		}

    		if (pv > 0) {
    			$$invalidate(4, spi = ev / pv);
    		} else {
    			$$invalidate(4, spi = 0);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EVM> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		ev = to_number(this.value);
    		$$invalidate(0, ev);
    	}

    	function input1_input_handler() {
    		pv = to_number(this.value);
    		$$invalidate(1, pv);
    	}

    	function input2_input_handler() {
    		ac = to_number(this.value);
    		$$invalidate(2, ac);
    	}

    	$$self.$capture_state = () => ({ ev, pv, ac, cpi, spi, calculateEVM });

    	$$self.$inject_state = $$props => {
    		if ('ev' in $$props) $$invalidate(0, ev = $$props.ev);
    		if ('pv' in $$props) $$invalidate(1, pv = $$props.pv);
    		if ('ac' in $$props) $$invalidate(2, ac = $$props.ac);
    		if ('cpi' in $$props) $$invalidate(3, cpi = $$props.cpi);
    		if ('spi' in $$props) $$invalidate(4, spi = $$props.spi);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		ev,
    		pv,
    		ac,
    		cpi,
    		spi,
    		calculateEVM,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class EVM extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EVM",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    // (37:31) 
    function create_if_block_2(ctx) {
    	let evm;
    	let current;
    	evm = new EVM({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(evm.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(evm, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(evm.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(evm.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(evm, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(37:31) ",
    		ctx
    	});

    	return block;
    }

    // (35:42) 
    function create_if_block_1(ctx) {
    	let paybackperiod;
    	let current;
    	paybackperiod = new PaybackPeriod({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(paybackperiod.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paybackperiod, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paybackperiod.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paybackperiod.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paybackperiod, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(35:42) ",
    		ctx
    	});

    	return block;
    }

    // (33:1) {#if activeTab === 'ROI'}
    function create_if_block(ctx) {
    	let roi;
    	let current;
    	roi = new ROI({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(roi.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(roi, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roi.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roi.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(roi, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:1) {#if activeTab === 'ROI'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let button0;
    	let t0;
    	let button0_class_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_class_value;
    	let t3;
    	let button2;
    	let t4;
    	let button2_class_value;
    	let t5;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*activeTab*/ ctx[0] === 'ROI') return 0;
    		if (/*activeTab*/ ctx[0] === 'Payback Period') return 1;
    		if (/*activeTab*/ ctx[0] === 'EVM') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			button0 = element("button");
    			t0 = text("ROI");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Payback Period");
    			t3 = space();
    			button2 = element("button");
    			t4 = text("EVM");
    			t5 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			attr_dev(button0, "class", button0_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'ROI' ? 'active' : ''}`) + " svelte-1getu7i"));
    			add_location(button0, file, 10, 1, 267);

    			attr_dev(button1, "class", button1_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'Payback Period'
			? 'active'
			: ''}`) + " svelte-1getu7i"));

    			add_location(button1, file, 16, 1, 400);
    			attr_dev(button2, "class", button2_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'EVM' ? 'active' : ''}`) + " svelte-1getu7i"));
    			add_location(button2, file, 22, 1, 566);
    			attr_dev(nav, "class", "tabs svelte-1getu7i");
    			add_location(nav, file, 9, 2, 247);
    			attr_dev(main, "class", "content svelte-1getu7i");
    			add_location(main, file, 31, 2, 739);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, button0);
    			append_dev(button0, t0);
    			append_dev(nav, t1);
    			append_dev(nav, button1);
    			append_dev(button1, t2);
    			append_dev(nav, t3);
    			append_dev(nav, button2);
    			append_dev(button2, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activeTab*/ 1 && button0_class_value !== (button0_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'ROI' ? 'active' : ''}`) + " svelte-1getu7i"))) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (!current || dirty & /*activeTab*/ 1 && button1_class_value !== (button1_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'Payback Period'
			? 'active'
			: ''}`) + " svelte-1getu7i"))) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (!current || dirty & /*activeTab*/ 1 && button2_class_value !== (button2_class_value = "" + (null_to_empty(`tab-button ${/*activeTab*/ ctx[0] === 'EVM' ? 'active' : ''}`) + " svelte-1getu7i"))) {
    				attr_dev(button2, "class", button2_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let activeTab = 'ROI'; // Default tab
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, activeTab = 'ROI');
    	const click_handler_1 = () => $$invalidate(0, activeTab = 'Payback Period');
    	const click_handler_2 = () => $$invalidate(0, activeTab = 'EVM');
    	$$self.$capture_state = () => ({ ROI, PaybackPeriod, EVM, activeTab });

    	$$self.$inject_state = $$props => {
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, click_handler, click_handler_1, click_handler_2];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
