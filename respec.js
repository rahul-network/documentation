(window.respecVersion = "28.0.4"),
  (function () {
    "use strict";
    const e = !!window.require;
    if (!e) {
      const e = function (e, t) {
        const n = e.map((e) => {
          if (!(e in window.require.modules))
            throw new Error("Unsupported dependency name: " + e);
          return window.require.modules[e];
        });
        Promise.all(n).then((e) => t(...e));
      };
      (e.modules = {}), (window.require = e);
    }
    function t(t, n) {
      e || (window.require.modules[t] = n);
    }
    const n = document.documentElement;
    n &&
      !n.hasAttribute("lang") &&
      ((n.lang = "en"), n.hasAttribute("dir") || (n.dir = "ltr"));
    const r = {},
      s = n.lang;
    var i = Object.freeze({
      __proto__: null,
      name: "core/l10n",
      l10n: r,
      lang: s,
      run: function (e) {
        e.l10n = r[s] || r.en;
      },
    });
    let o, a;
    const c = new WeakMap(),
      l = new WeakMap(),
      u = new WeakMap(),
      d = new WeakMap(),
      p = new WeakMap();
    let h = {
      get(e, t, n) {
        if (e instanceof IDBTransaction) {
          if ("done" === t) return l.get(e);
          if ("objectStoreNames" === t) return e.objectStoreNames || u.get(e);
          if ("store" === t)
            return n.objectStoreNames[1]
              ? void 0
              : n.objectStore(n.objectStoreNames[0]);
        }
        return g(e[t]);
      },
      set: (e, t, n) => ((e[t] = n), !0),
      has: (e, t) =>
        (e instanceof IDBTransaction && ("done" === t || "store" === t)) ||
        t in e,
    };
    function f(e) {
      return e !== IDBDatabase.prototype.transaction ||
        "objectStoreNames" in IDBTransaction.prototype
        ? (
            a ||
            (a = [
              IDBCursor.prototype.advance,
              IDBCursor.prototype.continue,
              IDBCursor.prototype.continuePrimaryKey,
            ])
          ).includes(e)
          ? function (...t) {
              return e.apply(b(this), t), g(c.get(this));
            }
          : function (...t) {
              return g(e.apply(b(this), t));
            }
        : function (t, ...n) {
            const r = e.call(b(this), t, ...n);
            return u.set(r, t.sort ? t.sort() : [t]), g(r);
          };
    }
    function m(e) {
      return "function" == typeof e
        ? f(e)
        : (e instanceof IDBTransaction &&
            (function (e) {
              if (l.has(e)) return;
              const t = new Promise((t, n) => {
                const r = () => {
                    e.removeEventListener("complete", s),
                      e.removeEventListener("error", i),
                      e.removeEventListener("abort", i);
                  },
                  s = () => {
                    t(), r();
                  },
                  i = () => {
                    n(e.error || new DOMException("AbortError", "AbortError")),
                      r();
                  };
                e.addEventListener("complete", s),
                  e.addEventListener("error", i),
                  e.addEventListener("abort", i);
              });
              l.set(e, t);
            })(e),
          (t = e),
          (
            o ||
            (o = [
              IDBDatabase,
              IDBObjectStore,
              IDBIndex,
              IDBCursor,
              IDBTransaction,
            ])
          ).some((e) => t instanceof e)
            ? new Proxy(e, h)
            : e);
      var t;
    }
    function g(e) {
      if (e instanceof IDBRequest)
        return (function (e) {
          const t = new Promise((t, n) => {
            const r = () => {
                e.removeEventListener("success", s),
                  e.removeEventListener("error", i);
              },
              s = () => {
                t(g(e.result)), r();
              },
              i = () => {
                n(e.error), r();
              };
            e.addEventListener("success", s), e.addEventListener("error", i);
          });
          return (
            t
              .then((t) => {
                t instanceof IDBCursor && c.set(t, e);
              })
              .catch(() => {}),
            p.set(t, e),
            t
          );
        })(e);
      if (d.has(e)) return d.get(e);
      const t = m(e);
      return t !== e && (d.set(e, t), p.set(t, e)), t;
    }
    const b = (e) => p.get(e);
    const y = ["get", "getKey", "getAll", "getAllKeys", "count"],
      w = ["put", "add", "delete", "clear"],
      v = new Map();
    function k(e, t) {
      if (!(e instanceof IDBDatabase) || t in e || "string" != typeof t) return;
      if (v.get(t)) return v.get(t);
      const n = t.replace(/FromIndex$/, ""),
        r = t !== n,
        s = w.includes(n);
      if (
        !(n in (r ? IDBIndex : IDBObjectStore).prototype) ||
        (!s && !y.includes(n))
      )
        return;
      const i = async function (e, ...t) {
        const i = this.transaction(e, s ? "readwrite" : "readonly");
        let o = i.store;
        return (
          r && (o = o.index(t.shift())),
          (await Promise.all([o[n](...t), s && i.done]))[0]
        );
      };
      return v.set(t, i), i;
    }
    h = ((e) => ({
      ...e,
      get: (t, n, r) => k(t, n) || e.get(t, n, r),
      has: (t, n) => !!k(t, n) || e.has(t, n),
    }))(h);
    var $ = Object.freeze({
      __proto__: null,
      deleteDB: function (e, { blocked: t } = {}) {
        const n = indexedDB.deleteDatabase(e);
        return (
          t && n.addEventListener("blocked", () => t()), g(n).then(() => {})
        );
      },
      openDB: function (
        e,
        t,
        { blocked: n, upgrade: r, blocking: s, terminated: i } = {}
      ) {
        const o = indexedDB.open(e, t),
          a = g(o);
        return (
          r &&
            o.addEventListener("upgradeneeded", (e) => {
              r(g(o.result), e.oldVersion, e.newVersion, g(o.transaction));
            }),
          n && o.addEventListener("blocked", () => n()),
          a
            .then((e) => {
              i && e.addEventListener("close", () => i()),
                s && e.addEventListener("versionchange", () => s());
            })
            .catch(() => {}),
          a
        );
      },
      unwrap: b,
      wrap: g,
    });
    function x(
      e,
      t,
      n,
      r,
      s,
      { level: i = "error", autofix: o, ruleName: a } = {}
    ) {
      function c(n) {
        return n > 0 ? e.slice(t, t + n) : e.slice(Math.max(t + n, 0), t);
      }
      function l(n, { precedes: r } = {}) {
        const s = n.map((e) => e.trivia + e.value).join(""),
          i = e[t];
        return "eof" === i.type
          ? s
          : r
          ? s + i.trivia
          : s.slice(i.trivia.length);
      }
      const u =
          "eof" !== e[t].type ? e[t].line : e.length > 1 ? e[t - 1].line : 1,
        d = (function (e) {
          const t = e.split("\n");
          return t[t.length - 1];
        })(l(c(-5), { precedes: !0 })),
        p = c(5),
        h = l(p),
        f = d + h.split("\n")[0] + "\n" + (" ".repeat(d.length) + "^"),
        m = "Syntax" === s ? "since" : "inside",
        g = `${s} error at line ${u}${e.name ? " in " + e.name : ""}${
          n && n.name
            ? `, ${m} \`${n.partial ? "partial " : ""}${(function (e) {
                const t = [e];
                for (; e && e.parent; ) {
                  const { parent: n } = e;
                  t.unshift(n), (e = n);
                }
                return t
                  .map((e) =>
                    (function (e, t) {
                      let n = e;
                      return t && (n += " " + t), n;
                    })(e.type, e.name)
                  )
                  .join(" -> ");
              })(n)}\``
            : ""
        }:\n${f}`;
      return {
        message: `${g} ${r}`,
        bareMessage: r,
        context: g,
        line: u,
        sourceName: e.name,
        level: i,
        ruleName: a,
        autofix: o,
        input: h,
        tokens: p,
      };
    }
    function _(e, t, n, r) {
      return x(e, t, n, r, "Syntax");
    }
    function C(e, t, n, r, s = {}) {
      return (s.ruleName = n), x(t.source, e.index, t, r, "Validation", s);
    }
    class S {
      constructor({ source: e, tokens: t }) {
        Object.defineProperties(this, {
          source: { value: e },
          tokens: { value: t, writable: !0 },
          parent: { value: null, writable: !0 },
          this: { value: this },
        });
      }
      toJSON() {
        const e = { type: void 0, name: void 0, inheritance: void 0 };
        let t = this;
        for (; t !== Object.prototype; ) {
          const n = Object.getOwnPropertyDescriptors(t);
          for (const [t, r] of Object.entries(n))
            (r.enumerable || r.get) && (e[t] = this[t]);
          t = Object.getPrototypeOf(t);
        }
        return e;
      }
    }
    function R(e, t, { useNullableInner: n } = {}) {
      if (!e.union) {
        const r = t.unique.get(e.idlType);
        if (!r) return;
        if ("typedef" === r.type) {
          const { typedefIncludesDictionary: n } = t.cache;
          if (n.has(r)) return n.get(r);
          t.cache.typedefIncludesDictionary.set(r, void 0);
          const s = R(r.idlType, t);
          if ((t.cache.typedefIncludesDictionary.set(r, s), s))
            return { reference: e, dictionary: s.dictionary };
        }
        if ("dictionary" === r.type && (n || !e.nullable))
          return { reference: e, dictionary: r };
      }
      for (const n of e.subtype) {
        const e = R(n, t);
        if (e) return n.union ? e : { reference: n, dictionary: e.dictionary };
      }
    }
    function E(e, t) {
      if (t.cache.dictionaryIncludesRequiredField.has(e))
        return t.cache.dictionaryIncludesRequiredField.get(e);
      t.cache.dictionaryIncludesRequiredField.set(e, void 0);
      let n = e.members.some((e) => e.required);
      if (!n && e.inheritance) {
        const r = t.unique.get(e.inheritance);
        r ? E(r, t) && (n = !0) : (n = !0);
      }
      return t.cache.dictionaryIncludesRequiredField.set(e, n), n;
    }
    class A extends Array {
      constructor({ source: e, tokens: t }) {
        super(),
          Object.defineProperties(this, {
            source: { value: e },
            tokens: { value: t },
            parent: { value: null, writable: !0 },
          });
      }
    }
    class T extends S {
      static parser(e, t) {
        return () => {
          const n = e.consumeKind(t);
          if (n) return new T({ source: e.source, tokens: { value: n } });
        };
      }
      get value() {
        return V(this.tokens.value.value);
      }
      write(e) {
        return e.ts.wrap([
          e.token(this.tokens.value),
          e.token(this.tokens.separator),
        ]);
      }
    }
    class L extends T {
      static parse(e) {
        const t = e.consumeKind("eof");
        if (t) return new L({ source: e.source, tokens: { value: t } });
      }
      get type() {
        return "eof";
      }
    }
    function P(e, t) {
      return K(e, { parser: T.parser(e, t), listName: t + " list" });
    }
    const I = ["identifier", "decimal", "integer", "string"],
      D = new Map([
        ...[
          "NoInterfaceObject",
          "LenientSetter",
          "LenientThis",
          "TreatNonObjectAsNull",
          "Unforgeable",
        ].map((e) => [e, "Legacy" + e]),
        ["NamedConstructor", "LegacyFactoryFunction"],
        ["OverrideBuiltins", "LegacyOverrideBuiltIns"],
        ["TreatNullAs", "LegacyNullToEmptyString"],
      ]);
    function N(e) {
      for (const t of I) {
        const n = P(e, t);
        if (n.length) return n;
      }
      e.error(
        "Expected identifiers, strings, decimals, or integers but none found"
      );
    }
    class j extends S {
      static parse(e) {
        const t = { assign: e.consume("=") },
          n = ie(new j({ source: e.source, tokens: t }));
        if (((n.list = []), t.assign)) {
          if (((t.asterisk = e.consume("*")), t.asterisk)) return n.this;
          t.secondaryName = e.consumeKind(...I);
        }
        return (
          (t.open = e.consume("(")),
          t.open
            ? ((n.list = n.rhsIsList ? N(e) : Q(e)),
              (t.close =
                e.consume(")") ||
                e.error(
                  "Unexpected token in extended attribute argument list"
                )))
            : n.hasRhs &&
              !t.secondaryName &&
              e.error("No right hand side to extended attribute assignment"),
          n.this
        );
      }
      get rhsIsList() {
        return (
          this.tokens.assign &&
          !this.tokens.asterisk &&
          !this.tokens.secondaryName
        );
      }
      get rhsType() {
        return this.rhsIsList
          ? this.list[0].tokens.value.type + "-list"
          : this.tokens.asterisk
          ? "*"
          : this.tokens.secondaryName
          ? this.tokens.secondaryName.type
          : null;
      }
      write(e) {
        const { rhsType: t } = this;
        return e.ts.wrap([
          e.token(this.tokens.assign),
          e.token(this.tokens.asterisk),
          e.reference_token(this.tokens.secondaryName, this.parent),
          e.token(this.tokens.open),
          ...this.list.map((n) =>
            "identifier-list" === t ? e.identifier(n, this.parent) : n.write(e)
          ),
          e.token(this.tokens.close),
        ]);
      }
    }
    class O extends S {
      static parse(e) {
        const t = e.consumeKind("identifier");
        if (t)
          return new O({
            source: e.source,
            tokens: { name: t },
            params: j.parse(e),
          });
      }
      constructor({ source: e, tokens: t, params: n }) {
        super({ source: e, tokens: t }),
          (n.parent = this),
          Object.defineProperty(this, "params", { value: n });
      }
      get type() {
        return "extended-attribute";
      }
      get name() {
        return this.tokens.name.value;
      }
      get rhs() {
        const { rhsType: e, tokens: t, list: n } = this.params;
        if (!e) return null;
        return {
          type: e,
          value: this.params.rhsIsList
            ? n
            : this.params.tokens.secondaryName
            ? V(t.secondaryName.value)
            : null,
        };
      }
      get arguments() {
        const { rhsIsList: e, list: t } = this.params;
        return !t || e ? [] : t;
      }
      *validate(e) {
        const { name: t } = this;
        if ("LegacyNoInterfaceObject" === t) {
          const e =
            "`[LegacyNoInterfaceObject]` extended attribute is an undesirable feature that may be removed from Web IDL in the future. Refer to the [relevant upstream PR](https://github.com/whatwg/webidl/pull/609) for more information.";
          yield C(this.tokens.name, this, "no-nointerfaceobject", e, {
            level: "warning",
          });
        } else if (D.has(t)) {
          const e = `\`[${t}]\` extended attribute is a legacy feature that is now renamed to \`[${D.get(
            t
          )}]\`. Refer to the [relevant upstream PR](https://github.com/whatwg/webidl/pull/870) for more information.`;
          yield C(this.tokens.name, this, "renamed-legacy", e, {
            level: "warning",
            autofix:
              ((n = this),
              () => {
                const { name: e } = n;
                (n.tokens.name.value = D.get(e)),
                  "TreatNullAs" === e && (n.params.tokens = {});
              }),
          });
        }
        var n;
        for (const t of this.arguments) yield* t.validate(e);
      }
      write(e) {
        return e.ts.wrap([
          e.ts.trivia(this.tokens.name.trivia),
          e.ts.extendedAttribute(
            e.ts.wrap([
              e.ts.extendedAttributeReference(this.name),
              this.params.write(e),
            ])
          ),
          e.token(this.tokens.separator),
        ]);
      }
    }
    class z extends A {
      static parse(e) {
        const t = {};
        if (((t.open = e.consume("[")), !t.open)) return new z({});
        const n = new z({ source: e.source, tokens: t });
        return (
          n.push(...K(e, { parser: O.parse, listName: "extended attribute" })),
          (t.close =
            e.consume("]") ||
            e.error("Unexpected closing token of extended attribute")),
          n.length || e.error("Found an empty extended attribute"),
          e.probe("[") &&
            e.error(
              "Illegal double extended attribute lists, consider merging them"
            ),
          n
        );
      }
      *validate(e) {
        for (const t of this) yield* t.validate(e);
      }
      write(e) {
        return this.length
          ? e.ts.wrap([
              e.token(this.tokens.open),
              ...this.map((t) => t.write(e)),
              e.token(this.tokens.close),
            ])
          : "";
      }
    }
    function M(e, t) {
      const n = e.consume("?");
      n && (t.tokens.nullable = n),
        e.probe("?") && e.error("Can't nullable more than once");
    }
    function U(e, t) {
      let n =
        (function (e, t) {
          const n = e.consume(
            "FrozenArray",
            "ObservableArray",
            "Promise",
            "sequence",
            "record"
          );
          if (!n) return;
          const r = ie(new W({ source: e.source, tokens: { base: n } }));
          switch (
            ((r.tokens.open =
              e.consume("<") || e.error("No opening bracket after " + n.value)),
            n.value)
          ) {
            case "Promise": {
              e.probe("[") &&
                e.error("Promise type cannot have extended attribute");
              const n = ee(e, t) || e.error("Missing Promise subtype");
              r.subtype.push(n);
              break;
            }
            case "sequence":
            case "FrozenArray":
            case "ObservableArray": {
              const s = X(e, t) || e.error(`Missing ${n.value} subtype`);
              r.subtype.push(s);
              break;
            }
            case "record": {
              e.probe("[") &&
                e.error("Record key cannot have extended attribute");
              const n =
                  e.consume(...ce) ||
                  e.error("Record key must be one of: " + ce.join(", ")),
                s = new W({ source: e.source, tokens: { base: n } });
              (s.tokens.separator =
                e.consume(",") ||
                e.error("Missing comma after record key type")),
                (s.type = t);
              const i = X(e, t) || e.error("Error parsing generic type record");
              r.subtype.push(s, i);
              break;
            }
          }
          return (
            r.idlType || e.error("Error parsing generic type " + n.value),
            (r.tokens.close =
              e.consume(">") ||
              e.error("Missing closing bracket after " + n.value)),
            r.this
          );
        })(e, t) || J(e);
      if (!n) {
        const t = e.consumeKind("identifier") || e.consume(...ce, ...ae);
        if (!t) return;
        (n = new W({ source: e.source, tokens: { base: t } })),
          e.probe("<") && e.error("Unsupported generic type " + t.value);
      }
      return (
        "Promise" === n.generic &&
          e.probe("?") &&
          e.error("Promise type cannot be nullable"),
        (n.type = t || null),
        M(e, n),
        n.nullable &&
          "any" === n.idlType &&
          e.error("Type `any` cannot be made nullable"),
        n
      );
    }
    class W extends S {
      static parse(e, t) {
        return (
          U(e, t) ||
          (function (e, t) {
            const n = {};
            if (((n.open = e.consume("(")), !n.open)) return;
            const r = ie(new W({ source: e.source, tokens: n }));
            for (r.type = t || null; ; ) {
              const t =
                X(e) ||
                e.error("No type after open parenthesis or 'or' in union type");
              "any" === t.idlType &&
                e.error("Type `any` cannot be included in a union type"),
                "Promise" === t.generic &&
                  e.error("Type `Promise` cannot be included in a union type"),
                r.subtype.push(t);
              const n = e.consume("or");
              if (!n) break;
              t.tokens.separator = n;
            }
            return (
              r.idlType.length < 2 &&
                e.error(
                  "At least two types are expected in a union type but found less"
                ),
              (n.close = e.consume(")") || e.error("Unterminated union type")),
              M(e, r),
              r.this
            );
          })(e, t)
        );
      }
      constructor({ source: e, tokens: t }) {
        super({ source: e, tokens: t }),
          Object.defineProperty(this, "subtype", { value: [], writable: !0 }),
          (this.extAttrs = new z({}));
      }
      get generic() {
        return this.subtype.length && this.tokens.base
          ? this.tokens.base.value
          : "";
      }
      get nullable() {
        return Boolean(this.tokens.nullable);
      }
      get union() {
        return Boolean(this.subtype.length) && !this.tokens.base;
      }
      get idlType() {
        if (this.subtype.length) return this.subtype;
        return V(
          [this.tokens.prefix, this.tokens.base, this.tokens.postfix]
            .filter((e) => e)
            .map((e) => e.value)
            .join(" ")
        );
      }
      *validate(e) {
        if ((yield* this.extAttrs.validate(e), "void" === this.idlType)) {
          const e =
            "`void` is now replaced by `undefined`. Refer to the [relevant GitHub issue](https://github.com/whatwg/webidl/issues/60) for more information.";
          yield C(this.tokens.base, this, "replace-void", e, {
            autofix:
              ((t = this),
              () => {
                t.tokens.base.value = "undefined";
              }),
          });
        }
        var t;
        const n = !this.union && e.unique.get(this.idlType),
          r = this.union
            ? this
            : n && "typedef" === n.type
            ? n.idlType
            : void 0;
        if (r && this.nullable) {
          const { reference: t } = R(r, e) || {};
          if (t) {
            const e = (this.union ? t : this).tokens.base,
              n = "Nullable union cannot include a dictionary type.";
            yield C(e, this, "no-nullable-union-dict", n);
          }
        } else for (const t of this.subtype) yield* t.validate(e);
      }
      write(e) {
        return e.ts.wrap([
          this.extAttrs.write(e),
          (() => {
            if (this.union || this.generic)
              return e.ts.wrap([
                e.token(this.tokens.base, e.ts.generic),
                e.token(this.tokens.open),
                ...this.subtype.map((t) => t.write(e)),
                e.token(this.tokens.close),
              ]);
            const t = this.tokens.prefix || this.tokens.base,
              n = this.tokens.prefix
                ? [
                    this.tokens.prefix.value,
                    e.ts.trivia(this.tokens.base.trivia),
                  ]
                : [],
              r = e.reference(
                e.ts.wrap([
                  ...n,
                  this.tokens.base.value,
                  e.token(this.tokens.postfix),
                ]),
                { unescaped: this.idlType, context: this }
              );
            return e.ts.wrap([e.ts.trivia(t.trivia), r]);
          })(),
          e.token(this.tokens.nullable),
          e.token(this.tokens.separator),
        ]);
      }
    }
    class q extends S {
      static parse(e) {
        const t = e.consume("=");
        if (!t) return null;
        const n =
            Y(e) ||
            e.consumeKind("string") ||
            e.consume("null", "[", "{") ||
            e.error("No value for default"),
          r = [n];
        if ("[" === n.value) {
          const t =
            e.consume("]") || e.error("Default sequence value must be empty");
          r.push(t);
        } else if ("{" === n.value) {
          const t =
            e.consume("}") || e.error("Default dictionary value must be empty");
          r.push(t);
        }
        return new q({
          source: e.source,
          tokens: { assign: t },
          expression: r,
        });
      }
      constructor({ source: e, tokens: t, expression: n }) {
        super({ source: e, tokens: t }),
          (n.parent = this),
          Object.defineProperty(this, "expression", { value: n });
      }
      get type() {
        return Z(this.expression[0]).type;
      }
      get value() {
        return Z(this.expression[0]).value;
      }
      get negative() {
        return Z(this.expression[0]).negative;
      }
      write(e) {
        return e.ts.wrap([
          e.token(this.tokens.assign),
          ...this.expression.map((t) => e.token(t)),
        ]);
      }
    }
    class F extends S {
      static parse(e) {
        const t = e.position,
          n = {},
          r = ie(new F({ source: e.source, tokens: n }));
        return (
          (r.extAttrs = z.parse(e)),
          (n.optional = e.consume("optional")),
          (r.idlType = X(e, "argument-type")),
          r.idlType
            ? (n.optional || (n.variadic = e.consume("...")),
              (n.name = e.consumeKind("identifier") || e.consume(...le)),
              n.name
                ? ((r.default = n.optional ? q.parse(e) : null), r.this)
                : e.unconsume(t))
            : e.unconsume(t)
        );
      }
      get type() {
        return "argument";
      }
      get optional() {
        return !!this.tokens.optional;
      }
      get variadic() {
        return !!this.tokens.variadic;
      }
      get name() {
        return V(this.tokens.name.value);
      }
      *validate(e) {
        yield* this.extAttrs.validate(e), yield* this.idlType.validate(e);
        const t = R(this.idlType, e, { useNullableInner: !0 });
        if (t)
          if (this.idlType.nullable) {
            const e = "Dictionary arguments cannot be nullable.";
            yield C(this.tokens.name, this, "no-nullable-dict-arg", e);
          } else if (this.optional) {
            if (!this.default) {
              const e =
                "Optional dictionary arguments must have a default value of `{}`.";
              yield C(this.tokens.name, this, "dict-arg-default", e, {
                autofix: B(this),
              });
            }
          } else if (
            this.parent &&
            !E(t.dictionary, e) &&
            (function (e) {
              const t = e.parent.arguments || e.parent.list,
                n = t.indexOf(e);
              return !t.slice(n + 1).some((e) => !e.optional);
            })(this)
          ) {
            const e =
              "Dictionary argument must be optional if it has no required fields";
            yield C(this.tokens.name, this, "dict-arg-optional", e, {
              autofix:
                ((n = this),
                () => {
                  const e = se(n.idlType);
                  (n.tokens.optional = {
                    ...e,
                    type: "optional",
                    value: "optional",
                  }),
                    (e.trivia = " "),
                    B(n)();
                }),
            });
          }
        var n;
      }
      write(e) {
        return e.ts.wrap([
          this.extAttrs.write(e),
          e.token(this.tokens.optional),
          e.ts.type(this.idlType.write(e)),
          e.token(this.tokens.variadic),
          e.name_token(this.tokens.name, { data: this }),
          this.default ? this.default.write(e) : "",
          e.token(this.tokens.separator),
        ]);
      }
    }
    function B(e) {
      return () => {
        e.default = q.parse(new he(" = {}"));
      };
    }
    class H extends S {
      static parse(e, { special: t, regular: n } = {}) {
        const r = { special: t },
          s = ie(new H({ source: e.source, tokens: r }));
        return t &&
          "stringifier" === t.value &&
          ((r.termination = e.consume(";")), r.termination)
          ? ((s.arguments = []), s)
          : (t || n || (r.special = e.consume("getter", "setter", "deleter")),
            (s.idlType = ee(e) || e.error("Missing return type")),
            (r.name = e.consumeKind("identifier") || e.consume("includes")),
            (r.open = e.consume("(") || e.error("Invalid operation")),
            (s.arguments = Q(e)),
            (r.close = e.consume(")") || e.error("Unterminated operation")),
            (r.termination =
              e.consume(";") ||
              e.error("Unterminated operation, expected `;`")),
            s.this);
      }
      get type() {
        return "operation";
      }
      get name() {
        const { name: e } = this.tokens;
        return e ? V(e.value) : "";
      }
      get special() {
        return this.tokens.special ? this.tokens.special.value : "";
      }
      *validate(e) {
        if (
          (yield* this.extAttrs.validate(e),
          !this.name && ["", "static"].includes(this.special))
        ) {
          const e =
            "Regular or static operations must have both a return type and an identifier.";
          yield C(this.tokens.open, this, "incomplete-op", e);
        }
        this.idlType && (yield* this.idlType.validate(e));
        for (const t of this.arguments) yield* t.validate(e);
      }
      write(e) {
        const { parent: t } = this,
          n = this.idlType
            ? [
                e.ts.type(this.idlType.write(e)),
                e.name_token(this.tokens.name, { data: this, parent: t }),
                e.token(this.tokens.open),
                e.ts.wrap(this.arguments.map((t) => t.write(e))),
                e.token(this.tokens.close),
              ]
            : [];
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            this.tokens.name
              ? e.token(this.tokens.special)
              : e.token(this.tokens.special, e.ts.nameless, {
                  data: this,
                  parent: t,
                }),
            ...n,
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: t }
        );
      }
    }
    class G extends S {
      static parse(
        e,
        { special: t, noInherit: n = !1, readonly: r = !1 } = {}
      ) {
        const s = e.position,
          i = { special: t },
          o = ie(new G({ source: e.source, tokens: i }));
        if (
          (t || n || (i.special = e.consume("inherit")),
          "inherit" === o.special &&
            e.probe("readonly") &&
            e.error("Inherited attributes cannot be read-only"),
          (i.readonly = e.consume("readonly")),
          r &&
            !i.readonly &&
            e.probe("attribute") &&
            e.error("Attributes must be readonly in this context"),
          (i.base = e.consume("attribute")),
          i.base)
        )
          return (
            (o.idlType =
              X(e, "attribute-type") || e.error("Attribute lacks a type")),
            (i.name =
              e.consumeKind("identifier") ||
              e.consume("async", "required") ||
              e.error("Attribute lacks a name")),
            (i.termination =
              e.consume(";") ||
              e.error("Unterminated attribute, expected `;`")),
            o.this
          );
        e.unconsume(s);
      }
      get type() {
        return "attribute";
      }
      get special() {
        return this.tokens.special ? this.tokens.special.value : "";
      }
      get readonly() {
        return !!this.tokens.readonly;
      }
      get name() {
        return V(this.tokens.name.value);
      }
      *validate(e) {
        switch (
          (yield* this.extAttrs.validate(e),
          yield* this.idlType.validate(e),
          this.idlType.generic)
        ) {
          case "sequence":
          case "record": {
            const e = `Attributes cannot accept ${this.idlType.generic} types.`;
            yield C(this.tokens.name, this, "attr-invalid-type", e);
            break;
          }
          default: {
            const { reference: t } = R(this.idlType, e) || {};
            if (t) {
              const e = (this.idlType.union ? t : this.idlType).tokens.base,
                n = "Attributes cannot accept dictionary types.";
              yield C(e, this, "attr-invalid-type", n);
            }
          }
        }
      }
      write(e) {
        const { parent: t } = this;
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.special),
            e.token(this.tokens.readonly),
            e.token(this.tokens.base),
            e.ts.type(this.idlType.write(e)),
            e.name_token(this.tokens.name, { data: this, parent: t }),
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: t }
        );
      }
    }
    function V(e) {
      return e.startsWith("_") ? e.slice(1) : e;
    }
    function K(e, { parser: t, allowDangler: n, listName: r = "list" }) {
      const s = t(e);
      if (!s) return [];
      s.tokens.separator = e.consume(",");
      const i = [s];
      for (; s.tokens.separator; ) {
        const s = t(e);
        if (!s) {
          n || e.error("Trailing comma in " + r);
          break;
        }
        if (
          ((s.tokens.separator = e.consume(",")),
          i.push(s),
          !s.tokens.separator)
        )
          break;
      }
      return i;
    }
    function Y(e) {
      return (
        e.consumeKind("decimal", "integer") ||
        e.consume("true", "false", "Infinity", "-Infinity", "NaN")
      );
    }
    function Z({ type: e, value: t }) {
      switch (e) {
        case "decimal":
        case "integer":
          return { type: "number", value: t };
        case "string":
          return { type: "string", value: t.slice(1, -1) };
      }
      switch (t) {
        case "true":
        case "false":
          return { type: "boolean", value: "true" === t };
        case "Infinity":
        case "-Infinity":
          return { type: "Infinity", negative: t.startsWith("-") };
        case "[":
          return { type: "sequence", value: [] };
        case "{":
          return { type: "dictionary" };
        default:
          return { type: t };
      }
    }
    function J(e) {
      const { source: t } = e,
        n =
          (function () {
            const n = e.consume("unsigned"),
              r = e.consume("short", "long");
            if (r) {
              const s = e.consume("long");
              return new W({
                source: t,
                tokens: { prefix: n, base: r, postfix: s },
              });
            }
            n && e.error("Failed to parse integer type");
          })() ||
          (function () {
            const n = e.consume("unrestricted"),
              r = e.consume("float", "double");
            if (r) return new W({ source: t, tokens: { prefix: n, base: r } });
            n && e.error("Failed to parse float type");
          })();
      if (n) return n;
      const r = e.consume("bigint", "boolean", "byte", "octet", "undefined");
      return r ? new W({ source: t, tokens: { base: r } }) : void 0;
    }
    function Q(e) {
      return K(e, { parser: F.parse, listName: "arguments list" });
    }
    function X(e, t) {
      const n = z.parse(e),
        r = W.parse(e, t);
      return r && (ie(r).extAttrs = n), r;
    }
    function ee(e, t) {
      const n = W.parse(e, t || "return-type");
      if (n) return n;
      const r = e.consume("void");
      if (r) {
        const t = new W({ source: e.source, tokens: { base: r } });
        return (t.type = "return-type"), t;
      }
    }
    function te(e) {
      const t = e.consume("stringifier");
      if (!t) return;
      return (
        G.parse(e, { special: t }) ||
        H.parse(e, { special: t }) ||
        e.error("Unterminated stringifier")
      );
    }
    function ne(e) {
      const t = e.split("\n");
      if (t.length) {
        const e = t[t.length - 1].match(/^\s+/);
        if (e) return e[0];
      }
      return "";
    }
    function re(e) {
      return () => {
        if (e.extAttrs.length) {
          const t = new he("Exposed=Window,"),
            n = O.parse(t);
          n.tokens.separator = t.consume(",");
          const r = e.extAttrs[0];
          /^\s/.test(r.tokens.name.trivia) ||
            (r.tokens.name.trivia = " " + r.tokens.name.trivia),
            e.extAttrs.unshift(n);
        } else {
          ie(e).extAttrs = z.parse(new he("[Exposed=Window]"));
          const t = e.tokens.base.trivia;
          (e.extAttrs.tokens.open.trivia = t),
            (e.tokens.base.trivia = "\n" + ne(t));
        }
      };
    }
    function se(e) {
      if (e.extAttrs.length) return e.extAttrs.tokens.open;
      if ("operation" === e.type && !e.special) return se(e.idlType);
      return Object.values(e.tokens).sort((e, t) => e.index - t.index)[0];
    }
    function ie(e, t) {
      return (
        t || (t = e),
        e
          ? new Proxy(e, {
              get(e, t) {
                const n = e[t];
                return Array.isArray(n) ? ie(n, e) : n;
              },
              set(e, n, r) {
                if (((e[n] = r), !r)) return !0;
                if (Array.isArray(r))
                  for (const e of r) void 0 !== e.parent && (e.parent = t);
                else void 0 !== r.parent && (r.parent = t);
                return !0;
              },
            })
          : e
      );
    }
    const oe = {
        decimal:
          /-?(?=[0-9]*\.|[0-9]+[eE])(([0-9]+\.[0-9]*|[0-9]*\.[0-9]+)([Ee][-+]?[0-9]+)?|[0-9]+[Ee][-+]?[0-9]+)/y,
        integer: /-?(0([Xx][0-9A-Fa-f]+|[0-7]*)|[1-9][0-9]*)/y,
        identifier: /[_-]?[A-Za-z][0-9A-Z_a-z-]*/y,
        string: /"[^"]*"/y,
        whitespace: /[\t\n\r ]+/y,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//y,
        other: /[^\t\n\r 0-9A-Za-z]/y,
      },
      ae = [
        "ArrayBuffer",
        "DataView",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Uint8Array",
        "Uint16Array",
        "Uint32Array",
        "Uint8ClampedArray",
        "BigInt64Array",
        "BigUint64Array",
        "Float32Array",
        "Float64Array",
        "any",
        "object",
        "symbol",
      ],
      ce = ["ByteString", "DOMString", "USVString"],
      le = [
        "async",
        "attribute",
        "callback",
        "const",
        "constructor",
        "deleter",
        "dictionary",
        "enum",
        "getter",
        "includes",
        "inherit",
        "interface",
        "iterable",
        "maplike",
        "namespace",
        "partial",
        "required",
        "setlike",
        "setter",
        "static",
        "stringifier",
        "typedef",
        "unrestricted",
      ],
      ue = [
        "-Infinity",
        "FrozenArray",
        "Infinity",
        "NaN",
        "ObservableArray",
        "Promise",
        "bigint",
        "boolean",
        "byte",
        "double",
        "false",
        "float",
        "long",
        "mixin",
        "null",
        "octet",
        "optional",
        "or",
        "readonly",
        "record",
        "sequence",
        "short",
        "true",
        "undefined",
        "unsigned",
        "void",
      ].concat(le, ce, ae),
      de = [
        "(",
        ")",
        ",",
        "...",
        ":",
        ";",
        "<",
        "=",
        ">",
        "?",
        "*",
        "[",
        "]",
        "{",
        "}",
      ],
      pe = ["_constructor", "toString", "_toString"];
    class he {
      constructor(e) {
        (this.source = (function (e) {
          const t = [];
          let n = 0,
            r = "",
            s = 1,
            i = 0;
          for (; n < e.length; ) {
            const a = e.charAt(n);
            let c = -1;
            if (
              (/[\t\n\r ]/.test(a)
                ? (c = o("whitespace", { noFlushTrivia: !0 }))
                : "/" === a && (c = o("comment", { noFlushTrivia: !0 })),
              -1 !== c)
            ) {
              const e = t.pop().value;
              (s += (e.match(/\n/g) || []).length), (r += e), (i -= 1);
            } else if (/[-0-9.A-Z_a-z]/.test(a)) {
              if (
                ((c = o("decimal")), -1 === c && (c = o("integer")), -1 === c)
              ) {
                c = o("identifier");
                const e = t.length - 1,
                  n = t[e];
                if (-1 !== c) {
                  if (pe.includes(n.value)) {
                    const r =
                      V(n.value) +
                      " is a reserved identifier and must not be used.";
                    throw new fe(_(t, e, null, r));
                  }
                  ue.includes(n.value) && (n.type = "inline");
                }
              }
            } else '"' === a && (c = o("string"));
            for (const o of de)
              if (e.startsWith(o, n)) {
                t.push({
                  type: "inline",
                  value: o,
                  trivia: r,
                  line: s,
                  index: i,
                }),
                  (r = ""),
                  (n += o.length),
                  (c = n);
                break;
              }
            if ((-1 === c && (c = o("other")), -1 === c))
              throw new Error("Token stream not progressing");
            (n = c), (i += 1);
          }
          return (
            t.push({ type: "eof", value: "", trivia: r, line: s, index: i }), t
          );
          function o(o, { noFlushTrivia: a } = {}) {
            const c = oe[o];
            c.lastIndex = n;
            const l = c.exec(e);
            return l
              ? (t.push({ type: o, value: l[0], trivia: r, line: s, index: i }),
                a || (r = ""),
                c.lastIndex)
              : -1;
          }
        })(e)),
          (this.position = 0);
      }
      error(e) {
        throw new fe(_(this.source, this.position, this.current, e));
      }
      probeKind(e) {
        return (
          this.source.length > this.position &&
          this.source[this.position].type === e
        );
      }
      probe(e) {
        return (
          this.probeKind("inline") && this.source[this.position].value === e
        );
      }
      consumeKind(...e) {
        for (const t of e) {
          if (!this.probeKind(t)) continue;
          const e = this.source[this.position];
          return this.position++, e;
        }
      }
      consume(...e) {
        if (!this.probeKind("inline")) return;
        const t = this.source[this.position];
        for (const n of e) if (t.value === n) return this.position++, t;
      }
      consumeIdentifier(e) {
        if (
          this.probeKind("identifier") &&
          this.source[this.position].value === e
        )
          return this.consumeKind("identifier");
      }
      unconsume(e) {
        this.position = e;
      }
    }
    class fe extends Error {
      constructor({
        message: e,
        bareMessage: t,
        context: n,
        line: r,
        sourceName: s,
        input: i,
        tokens: o,
      }) {
        super(e),
          (this.name = "WebIDLParseError"),
          (this.bareMessage = t),
          (this.context = n),
          (this.line = r),
          (this.sourceName = s),
          (this.input = i),
          (this.tokens = o);
      }
    }
    class me extends T {
      static parse(e) {
        const t = e.consumeKind("string");
        if (t) return new me({ source: e.source, tokens: { value: t } });
      }
      get type() {
        return "enum-value";
      }
      get value() {
        return super.value.slice(1, -1);
      }
      write(e) {
        const { parent: t } = this;
        return e.ts.wrap([
          e.ts.trivia(this.tokens.value.trivia),
          e.ts.definition(
            e.ts.wrap([
              '"',
              e.ts.name(this.value, { data: this, parent: t }),
              '"',
            ]),
            { data: this, parent: t }
          ),
          e.token(this.tokens.separator),
        ]);
      }
    }
    class ge extends S {
      static parse(e) {
        const t = {};
        if (((t.base = e.consume("enum")), !t.base)) return;
        t.name = e.consumeKind("identifier") || e.error("No name for enum");
        const n = ie(new ge({ source: e.source, tokens: t }));
        return (
          (e.current = n.this),
          (t.open = e.consume("{") || e.error("Bodyless enum")),
          (n.values = K(e, {
            parser: me.parse,
            allowDangler: !0,
            listName: "enumeration",
          })),
          e.probeKind("string") && e.error("No comma between enum values"),
          (t.close = e.consume("}") || e.error("Unexpected value in enum")),
          n.values.length || e.error("No value in enum"),
          (t.termination =
            e.consume(";") || e.error("No semicolon after enum")),
          n.this
        );
      }
      get type() {
        return "enum";
      }
      get name() {
        return V(this.tokens.name.value);
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.base),
            e.name_token(this.tokens.name, { data: this }),
            e.token(this.tokens.open),
            e.ts.wrap(this.values.map((t) => t.write(e))),
            e.token(this.tokens.close),
            e.token(this.tokens.termination),
          ]),
          { data: this }
        );
      }
    }
    class be extends S {
      static parse(e) {
        const t = e.consumeKind("identifier");
        if (!t) return;
        const n = { target: t };
        if (((n.includes = e.consume("includes")), n.includes))
          return (
            (n.mixin =
              e.consumeKind("identifier") ||
              e.error("Incomplete includes statement")),
            (n.termination =
              e.consume(";") ||
              e.error("No terminating ; for includes statement")),
            new be({ source: e.source, tokens: n })
          );
        e.unconsume(t.index);
      }
      get type() {
        return "includes";
      }
      get target() {
        return V(this.tokens.target.value);
      }
      get includes() {
        return V(this.tokens.mixin.value);
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.reference_token(this.tokens.target, this),
            e.token(this.tokens.includes),
            e.reference_token(this.tokens.mixin, this),
            e.token(this.tokens.termination),
          ]),
          { data: this }
        );
      }
    }
    class ye extends S {
      static parse(e) {
        const t = {},
          n = ie(new ye({ source: e.source, tokens: t }));
        if (((t.base = e.consume("typedef")), t.base))
          return (
            (n.idlType =
              X(e, "typedef-type") || e.error("Typedef lacks a type")),
            (t.name =
              e.consumeKind("identifier") || e.error("Typedef lacks a name")),
            (e.current = n.this),
            (t.termination =
              e.consume(";") || e.error("Unterminated typedef, expected `;`")),
            n.this
          );
      }
      get type() {
        return "typedef";
      }
      get name() {
        return V(this.tokens.name.value);
      }
      *validate(e) {
        yield* this.idlType.validate(e);
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.base),
            e.ts.type(this.idlType.write(e)),
            e.name_token(this.tokens.name, { data: this }),
            e.token(this.tokens.termination),
          ]),
          { data: this }
        );
      }
    }
    class we extends S {
      static parse(e, t) {
        const n = { base: t },
          r = ie(new we({ source: e.source, tokens: n }));
        return (
          (n.name =
            e.consumeKind("identifier") || e.error("Callback lacks a name")),
          (e.current = r.this),
          (n.assign =
            e.consume("=") || e.error("Callback lacks an assignment")),
          (r.idlType = ee(e) || e.error("Callback lacks a return type")),
          (n.open =
            e.consume("(") ||
            e.error("Callback lacks parentheses for arguments")),
          (r.arguments = Q(e)),
          (n.close = e.consume(")") || e.error("Unterminated callback")),
          (n.termination =
            e.consume(";") || e.error("Unterminated callback, expected `;`")),
          r.this
        );
      }
      get type() {
        return "callback";
      }
      get name() {
        return V(this.tokens.name.value);
      }
      *validate(e) {
        yield* this.extAttrs.validate(e), yield* this.idlType.validate(e);
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.base),
            e.name_token(this.tokens.name, { data: this }),
            e.token(this.tokens.assign),
            e.ts.type(this.idlType.write(e)),
            e.token(this.tokens.open),
            ...this.arguments.map((t) => t.write(e)),
            e.token(this.tokens.close),
            e.token(this.tokens.termination),
          ]),
          { data: this }
        );
      }
    }
    class ve extends S {
      static parse(e, t, { inheritable: n, allowedMembers: r }) {
        const { tokens: s, type: i } = t;
        for (
          s.name =
            e.consumeKind("identifier") || e.error("Missing name in " + i),
            e.current = t,
            t = ie(t),
            n &&
              Object.assign(
                s,
                (function (e) {
                  const t = e.consume(":");
                  return t
                    ? {
                        colon: t,
                        inheritance:
                          e.consumeKind("identifier") ||
                          e.error("Inheritance lacks a type"),
                      }
                    : {};
                })(e)
              ),
            s.open = e.consume("{") || e.error("Bodyless " + i),
            t.members = [];
          ;

        ) {
          if (((s.close = e.consume("}")), s.close))
            return (
              (s.termination =
                e.consume(";") || e.error("Missing semicolon after " + i)),
              t.this
            );
          const n = z.parse(e);
          let o;
          for (const [t, ...n] of r) if (((o = ie(t(e, ...n))), o)) break;
          o || e.error("Unknown member"),
            (o.extAttrs = n),
            t.members.push(o.this);
        }
      }
      get partial() {
        return !!this.tokens.partial;
      }
      get name() {
        return V(this.tokens.name.value);
      }
      get inheritance() {
        return this.tokens.inheritance
          ? V(this.tokens.inheritance.value)
          : null;
      }
      *validate(e) {
        for (const t of this.members) t.validate && (yield* t.validate(e));
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.callback),
            e.token(this.tokens.partial),
            e.token(this.tokens.base),
            e.token(this.tokens.mixin),
            e.name_token(this.tokens.name, { data: this }),
            (() =>
              this.tokens.inheritance
                ? e.ts.wrap([
                    e.token(this.tokens.colon),
                    e.ts.trivia(this.tokens.inheritance.trivia),
                    e.ts.inheritance(
                      e.reference(this.tokens.inheritance.value, {
                        context: this,
                      })
                    ),
                  ])
                : "")(),
            e.token(this.tokens.open),
            e.ts.wrap(this.members.map((t) => t.write(e))),
            e.token(this.tokens.close),
            e.token(this.tokens.termination),
          ]),
          { data: this }
        );
      }
    }
    class ke extends S {
      static parse(e) {
        const t = {};
        if (((t.base = e.consume("const")), !t.base)) return;
        let n = J(e);
        if (!n) {
          const t =
            e.consumeKind("identifier") || e.error("Const lacks a type");
          n = new W({ source: e.source, tokens: { base: t } });
        }
        e.probe("?") && e.error("Unexpected nullable constant type"),
          (n.type = "const-type"),
          (t.name =
            e.consumeKind("identifier") || e.error("Const lacks a name")),
          (t.assign =
            e.consume("=") || e.error("Const lacks value assignment")),
          (t.value = Y(e) || e.error("Const lacks a value")),
          (t.termination =
            e.consume(";") || e.error("Unterminated const, expected `;`"));
        const r = new ke({ source: e.source, tokens: t });
        return (ie(r).idlType = n), r;
      }
      get type() {
        return "const";
      }
      get name() {
        return V(this.tokens.name.value);
      }
      get value() {
        return Z(this.tokens.value);
      }
      write(e) {
        const { parent: t } = this;
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.base),
            e.ts.type(this.idlType.write(e)),
            e.name_token(this.tokens.name, { data: this, parent: t }),
            e.token(this.tokens.assign),
            e.token(this.tokens.value),
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: t }
        );
      }
    }
    class $e extends S {
      static parse(e) {
        const t = e.position,
          n = {},
          r = ie(new $e({ source: e.source, tokens: n }));
        if (
          ((n.readonly = e.consume("readonly")),
          n.readonly || (n.async = e.consume("async")),
          (n.base = n.readonly
            ? e.consume("maplike", "setlike")
            : n.async
            ? e.consume("iterable")
            : e.consume("iterable", "maplike", "setlike")),
          !n.base)
        )
          return void e.unconsume(t);
        const { type: s } = r,
          i = "maplike" === s,
          o = i || "iterable" === s,
          a = r.async && "iterable" === s;
        n.open =
          e.consume("<") ||
          e.error(`Missing less-than sign \`<\` in ${s} declaration`);
        const c =
          X(e) || e.error(`Missing a type argument in ${s} declaration`);
        return (
          (r.idlType = [c]),
          (r.arguments = []),
          o &&
            ((c.tokens.separator = e.consume(",")),
            c.tokens.separator
              ? r.idlType.push(X(e))
              : i &&
                e.error(`Missing second type argument in ${s} declaration`)),
          (n.close =
            e.consume(">") ||
            e.error(`Missing greater-than sign \`>\` in ${s} declaration`)),
          e.probe("(") &&
            (a
              ? ((n.argsOpen = e.consume("(")),
                r.arguments.push(...Q(e)),
                (n.argsClose =
                  e.consume(")") ||
                  e.error("Unterminated async iterable argument list")))
              : e.error("Arguments are only allowed for `async iterable`")),
          (n.termination =
            e.consume(";") ||
            e.error(`Missing semicolon after ${s} declaration`)),
          r.this
        );
      }
      get type() {
        return this.tokens.base.value;
      }
      get readonly() {
        return !!this.tokens.readonly;
      }
      get async() {
        return !!this.tokens.async;
      }
      *validate(e) {
        for (const t of this.idlType) yield* t.validate(e);
        for (const t of this.arguments) yield* t.validate(e);
      }
      write(e) {
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.readonly),
            e.token(this.tokens.async),
            e.token(this.tokens.base, e.ts.generic),
            e.token(this.tokens.open),
            e.ts.wrap(this.idlType.map((t) => t.write(e))),
            e.token(this.tokens.close),
            e.token(this.tokens.argsOpen),
            e.ts.wrap(this.arguments.map((t) => t.write(e))),
            e.token(this.tokens.argsClose),
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: this.parent }
        );
      }
    }
    class xe extends S {
      static parse(e) {
        const t = e.consume("constructor");
        if (!t) return;
        const n = { base: t };
        n.open = e.consume("(") || e.error("No argument list in constructor");
        const r = Q(e);
        (n.close = e.consume(")") || e.error("Unterminated constructor")),
          (n.termination =
            e.consume(";") || e.error("No semicolon after constructor"));
        const s = new xe({ source: e.source, tokens: n });
        return (ie(s).arguments = r), s;
      }
      get type() {
        return "constructor";
      }
      *validate(e) {
        this.idlType && (yield* this.idlType.validate(e));
        for (const t of this.arguments) yield* t.validate(e);
      }
      write(e) {
        const { parent: t } = this;
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.base, e.ts.nameless, { data: this, parent: t }),
            e.token(this.tokens.open),
            e.ts.wrap(this.arguments.map((t) => t.write(e))),
            e.token(this.tokens.close),
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: t }
        );
      }
    }
    function _e(e) {
      const t = e.consume("static");
      if (!t) return;
      return (
        G.parse(e, { special: t }) ||
        H.parse(e, { special: t }) ||
        e.error("No body in static member")
      );
    }
    class Ce extends ve {
      static parse(e, t, { partial: n = null } = {}) {
        const r = { partial: n, base: t };
        return ve.parse(e, new Ce({ source: e.source, tokens: r }), {
          inheritable: !n,
          allowedMembers: [
            [ke.parse],
            [xe.parse],
            [_e],
            [te],
            [$e.parse],
            [G.parse],
            [H.parse],
          ],
        });
      }
      get type() {
        return "interface";
      }
      *validate(e) {
        if (
          (yield* this.extAttrs.validate(e),
          !this.partial && this.extAttrs.every((e) => "Exposed" !== e.name))
        ) {
          const e =
            "Interfaces must have `[Exposed]` extended attribute. To fix, add, for example, `[Exposed=Window]`. Please also consider carefully if your interface should also be exposed in a Worker scope. Refer to the [WebIDL spec section on Exposed](https://heycam.github.io/webidl/#Exposed) for more information.";
          yield C(this.tokens.name, this, "require-exposed", e, {
            autofix: re(this),
          });
        }
        const t = this.extAttrs.filter((e) => "Constructor" === e.name);
        for (const e of t) {
          const t =
            "Constructors should now be represented as a `constructor()` operation on the interface instead of `[Constructor]` extended attribute. Refer to the [WebIDL spec section on constructor operations](https://heycam.github.io/webidl/#idl-constructors) for more information.";
          yield C(e.tokens.name, this, "constructor-member", t, {
            autofix: Se(this, e),
          });
        }
        if (this.extAttrs.some((e) => "Global" === e.name)) {
          const e = this.extAttrs.filter(
            (e) => "LegacyFactoryFunction" === e.name
          );
          for (const t of e) {
            const e =
              "Interfaces marked as `[Global]` cannot have factory functions.";
            yield C(t.tokens.name, this, "no-constructible-global", e);
          }
          const t = this.members.filter((e) => "constructor" === e.type);
          for (const e of t) {
            const t =
              "Interfaces marked as `[Global]` cannot have constructors.";
            yield C(e.tokens.base, this, "no-constructible-global", t);
          }
        }
        yield* super.validate(e),
          this.partial ||
            (yield* (function* (e, t) {
              const n = new Set(o(t).map((e) => e.name)),
                r = e.partials.get(t.name) || [],
                s = e.mixinMap.get(t.name) || [];
              for (const e of [...r, ...s]) {
                const r = o(e);
                yield* i(r, n, e, t);
                for (const e of r) n.add(e.name);
              }
              function* i(e, t, n, r) {
                for (const s of e) {
                  const { name: e } = s;
                  if (e && t.has(e)) {
                    const t = `The operation "${e}" has already been defined for the base interface "${r.name}" either in itself or in a mixin`;
                    yield C(s.tokens.name, n, "no-cross-overload", t);
                  }
                }
              }
              function o(e) {
                return e.members.filter(({ type: e }) => "operation" === e);
              }
            })(e, this));
      }
    }
    function Se(e, t) {
      return (
        (e = ie(e)),
        () => {
          const n = ne(e.extAttrs.tokens.open.trivia),
            r = e.members.length
              ? ne(se(e.members[0]).trivia)
              : (function (e) {
                  const t = ne(e),
                    n = t.includes("\t") ? "\t" : "  ";
                  return t + n;
                })(n),
            s = xe.parse(new he(`\n${r}constructor();`));
          (s.extAttrs = new z({})), (ie(s).arguments = t.arguments);
          const i = (function (e, t) {
            const n = e.slice().reverse().findIndex(t);
            return -1 === n ? n : e.length - n - 1;
          })(e.members, (e) => "constructor" === e.type);
          e.members.splice(i + 1, 0, s);
          const { close: o } = e.tokens;
          o.trivia.includes("\n") || (o.trivia += "\n" + n);
          const { extAttrs: a } = e,
            c = a.indexOf(t),
            l = a.splice(c, 1);
          a.length
            ? a.length === c
              ? (a[c - 1].tokens.separator = void 0)
              : a[c].tokens.name.trivia.trim() ||
                (a[c].tokens.name.trivia = l[0].tokens.name.trivia)
            : (a.tokens.open = a.tokens.close = void 0);
        }
      );
    }
    class Re extends ve {
      static parse(e, t, { partial: n } = {}) {
        const r = { partial: n, base: t };
        if (((r.mixin = e.consume("mixin")), r.mixin))
          return ve.parse(e, new Re({ source: e.source, tokens: r }), {
            allowedMembers: [
              [ke.parse],
              [te],
              [G.parse, { noInherit: !0 }],
              [H.parse, { regular: !0 }],
            ],
          });
      }
      get type() {
        return "interface mixin";
      }
    }
    class Ee extends S {
      static parse(e) {
        const t = {},
          n = ie(new Ee({ source: e.source, tokens: t }));
        return (
          (n.extAttrs = z.parse(e)),
          (t.required = e.consume("required")),
          (n.idlType =
            X(e, "dictionary-type") ||
            e.error("Dictionary member lacks a type")),
          (t.name =
            e.consumeKind("identifier") ||
            e.error("Dictionary member lacks a name")),
          (n.default = q.parse(e)),
          t.required &&
            n.default &&
            e.error("Required member must not have a default"),
          (t.termination =
            e.consume(";") ||
            e.error("Unterminated dictionary member, expected `;`")),
          n.this
        );
      }
      get type() {
        return "field";
      }
      get name() {
        return V(this.tokens.name.value);
      }
      get required() {
        return !!this.tokens.required;
      }
      *validate(e) {
        yield* this.idlType.validate(e);
      }
      write(e) {
        const { parent: t } = this;
        return e.ts.definition(
          e.ts.wrap([
            this.extAttrs.write(e),
            e.token(this.tokens.required),
            e.ts.type(this.idlType.write(e)),
            e.name_token(this.tokens.name, { data: this, parent: t }),
            this.default ? this.default.write(e) : "",
            e.token(this.tokens.termination),
          ]),
          { data: this, parent: t }
        );
      }
    }
    class Ae extends ve {
      static parse(e, { partial: t } = {}) {
        const n = { partial: t };
        if (((n.base = e.consume("dictionary")), n.base))
          return ve.parse(e, new Ae({ source: e.source, tokens: n }), {
            inheritable: !t,
            allowedMembers: [[Ee.parse]],
          });
      }
      get type() {
        return "dictionary";
      }
    }
    class Te extends ve {
      static parse(e, { partial: t } = {}) {
        const n = { partial: t };
        if (((n.base = e.consume("namespace")), n.base))
          return ve.parse(e, new Te({ source: e.source, tokens: n }), {
            allowedMembers: [
              [G.parse, { noInherit: !0, readonly: !0 }],
              [ke.parse],
              [H.parse, { regular: !0 }],
            ],
          });
      }
      get type() {
        return "namespace";
      }
      *validate(e) {
        if (!this.partial && this.extAttrs.every((e) => "Exposed" !== e.name)) {
          const e =
            "Namespaces must have [Exposed] extended attribute. To fix, add, for example, [Exposed=Window]. Please also consider carefully if your namespace should also be exposed in a Worker scope. Refer to the [WebIDL spec section on Exposed](https://heycam.github.io/webidl/#Exposed) for more information.";
          yield C(this.tokens.name, this, "require-exposed", e, {
            autofix: re(this),
          });
        }
        yield* super.validate(e);
      }
    }
    class Le extends ve {
      static parse(e, t, { partial: n = null } = {}) {
        const r = { callback: t };
        if (((r.base = e.consume("interface")), r.base))
          return ve.parse(e, new Le({ source: e.source, tokens: r }), {
            inheritable: !n,
            allowedMembers: [[ke.parse], [H.parse, { regular: !0 }]],
          });
      }
      get type() {
        return "callback interface";
      }
    }
    function Pe(e, t) {
      const n = e.source;
      function r(t) {
        e.error(t);
      }
      function s(...t) {
        return e.consume(...t);
      }
      function i(t) {
        const n = s("interface");
        if (!n) return;
        return (
          Re.parse(e, n, t) ||
          Ce.parse(e, n, t) ||
          r("Interface has no proper body")
        );
      }
      function o() {
        if (t.productions)
          for (const n of t.productions) {
            const t = n(e);
            if (t) return t;
          }
        return (
          (function () {
            const t = s("callback");
            if (t)
              return e.probe("interface") ? Le.parse(e, t) : we.parse(e, t);
          })() ||
          i() ||
          (function () {
            const t = s("partial");
            if (t)
              return (
                Ae.parse(e, { partial: t }) ||
                i({ partial: t }) ||
                Te.parse(e, { partial: t }) ||
                r("Partial doesn't apply to anything")
              );
          })() ||
          Ae.parse(e) ||
          ge.parse(e) ||
          ye.parse(e) ||
          be.parse(e) ||
          Te.parse(e)
        );
      }
      const a = (function () {
        if (!n.length) return [];
        const s = [];
        for (;;) {
          const t = z.parse(e),
            n = o();
          if (!n) {
            t.length && r("Stray extended attributes");
            break;
          }
          (ie(n).extAttrs = t), s.push(n);
        }
        const i = L.parse(e);
        return t.concrete && s.push(i), s;
      })();
      return e.position < n.length && r("Unrecognised tokens"), a;
    }
    function Ie(e) {
      return e;
    }
    const De = {
      wrap: (e) => e.join(""),
      trivia: Ie,
      name: Ie,
      reference: Ie,
      type: Ie,
      generic: Ie,
      nameless: Ie,
      inheritance: Ie,
      definition: Ie,
      extendedAttribute: Ie,
      extendedAttributeReference: Ie,
    };
    class Ne {
      constructor(e) {
        this.ts = Object.assign({}, De, e);
      }
      reference(e, { unescaped: t, context: n }) {
        return (
          t || (t = e.startsWith("_") ? e.slice(1) : e),
          this.ts.reference(e, t, n)
        );
      }
      token(e, t = Ie, ...n) {
        if (!e) return "";
        const r = t(e.value, ...n);
        return this.ts.wrap([this.ts.trivia(e.trivia), r]);
      }
      reference_token(e, t) {
        return this.token(e, this.reference.bind(this), { context: t });
      }
      name_token(e, t) {
        return this.token(e, this.ts.name, t);
      }
      identifier(e, t) {
        return this.ts.wrap([
          this.reference_token(e.tokens.value, t),
          this.token(e.tokens.separator),
        ]);
      }
    }
    function je(e, t) {
      const n = new Map(),
        r = e.filter((e) => "includes" === e.type);
      for (const e of r) {
        const r = t.get(e.includes);
        if (!r) continue;
        const s = n.get(e.target);
        s ? s.push(r) : n.set(e.target, [r]);
      }
      return n;
    }
    function* Oe(e) {
      const t = (function (e) {
        const t = new Map(),
          n = new Set(),
          r = new Map();
        for (const s of e)
          if (s.partial) {
            const e = r.get(s.name);
            e ? e.push(s) : r.set(s.name, [s]);
          } else s.name && (t.has(s.name) ? n.add(s) : t.set(s.name, s));
        return {
          all: e,
          unique: t,
          partials: r,
          duplicates: n,
          mixinMap: je(e, t),
          cache: {
            typedefIncludesDictionary: new WeakMap(),
            dictionaryIncludesRequiredField: new WeakMap(),
          },
        };
      })(e);
      for (const e of t.all) e.validate && (yield* e.validate(t));
      yield* (function* ({ unique: e, duplicates: t }) {
        for (const n of t) {
          const { name: t } = n,
            r = `The name "${t}" of type "${e.get(t).type}" was already seen`;
          yield C(n.tokens.name, n, "no-duplicate", r);
        }
      })(t);
    }
    var ze = Object.freeze({
      __proto__: null,
      parse: function (e, t = {}) {
        const n = new he(e);
        return (
          void 0 !== t.sourceName && (n.source.name = t.sourceName), Pe(n, t)
        );
      },
      write: function (e, { templates: t = De } = {}) {
        t = Object.assign({}, De, t);
        const n = new Ne(t);
        return t.wrap(e.map((e) => e.write(n)));
      },
      validate: function (e) {
        return [...Oe(((t = e), t.flat ? t.flat() : [].concat(...t)))];
        var t;
      },
      WebIDLParseError: fe,
    });
    const Me = /^[!#$%&'*+-.^`|~\w]+$/,
      Ue = /[\u000A\u000D\u0009\u0020]/u,
      We = /^[\u0009\u{0020}-\{u0073}\u{0080}-\u{00FF}]+$/u;
    function qe(e, t, n) {
      ((t && "" !== t && !e.has(t) && We.test(n)) || null === n) &&
        e.set(t.toLowerCase(), n);
    }
    function Fe() {
      return {
        baseUrl: null,
        breaks: !1,
        extensions: null,
        gfm: !0,
        headerIds: !0,
        headerPrefix: "",
        highlight: null,
        langPrefix: "language-",
        mangle: !0,
        pedantic: !1,
        renderer: null,
        sanitize: !1,
        sanitizer: null,
        silent: !1,
        smartLists: !1,
        smartypants: !1,
        tokenizer: null,
        walkTokens: null,
        xhtml: !1,
      };
    }
    let Be = {
      baseUrl: null,
      breaks: !1,
      extensions: null,
      gfm: !0,
      headerIds: !0,
      headerPrefix: "",
      highlight: null,
      langPrefix: "language-",
      mangle: !0,
      pedantic: !1,
      renderer: null,
      sanitize: !1,
      sanitizer: null,
      silent: !1,
      smartLists: !1,
      smartypants: !1,
      tokenizer: null,
      walkTokens: null,
      xhtml: !1,
    };
    const He = /[&<>"']/,
      Ge = /[&<>"']/g,
      Ve = /[<>"']|&(?!#?\w+;)/,
      Ke = /[<>"']|&(?!#?\w+;)/g,
      Ye = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      },
      Ze = (e) => Ye[e];
    function Je(e, t) {
      if (t) {
        if (He.test(e)) return e.replace(Ge, Ze);
      } else if (Ve.test(e)) return e.replace(Ke, Ze);
      return e;
    }
    const Qe = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;
    function Xe(e) {
      return e.replace(Qe, (e, t) =>
        "colon" === (t = t.toLowerCase())
          ? ":"
          : "#" === t.charAt(0)
          ? "x" === t.charAt(1)
            ? String.fromCharCode(parseInt(t.substring(2), 16))
            : String.fromCharCode(+t.substring(1))
          : ""
      );
    }
    const et = /(^|[^\[])\^/g;
    function tt(e, t) {
      (e = e.source || e), (t = t || "");
      const n = {
        replace: (t, r) => (
          (r = (r = r.source || r).replace(et, "$1")), (e = e.replace(t, r)), n
        ),
        getRegex: () => new RegExp(e, t),
      };
      return n;
    }
    const nt = /[^\w:]/g,
      rt = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;
    function st(e, t, n) {
      if (e) {
        let e;
        try {
          e = decodeURIComponent(Xe(n)).replace(nt, "").toLowerCase();
        } catch (e) {
          return null;
        }
        if (
          0 === e.indexOf("javascript:") ||
          0 === e.indexOf("vbscript:") ||
          0 === e.indexOf("data:")
        )
          return null;
      }
      t &&
        !rt.test(n) &&
        (n = (function (e, t) {
          it[" " + e] ||
            (ot.test(e)
              ? (it[" " + e] = e + "/")
              : (it[" " + e] = pt(e, "/", !0)));
          const n = -1 === (e = it[" " + e]).indexOf(":");
          return "//" === t.substring(0, 2)
            ? n
              ? t
              : e.replace(at, "$1") + t
            : "/" === t.charAt(0)
            ? n
              ? t
              : e.replace(ct, "$1") + t
            : e + t;
        })(t, n));
      try {
        n = encodeURI(n).replace(/%25/g, "%");
      } catch (e) {
        return null;
      }
      return n;
    }
    const it = {},
      ot = /^[^:]+:\/*[^/]*$/,
      at = /^([^:]+:)[\s\S]*$/,
      ct = /^([^:]+:\/*[^/]*)[\s\S]*$/;
    const lt = { exec: function () {} };
    function ut(e) {
      let t,
        n,
        r = 1;
      for (; r < arguments.length; r++)
        for (n in ((t = arguments[r]), t))
          Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
      return e;
    }
    function dt(e, t) {
      const n = e
        .replace(/\|/g, (e, t, n) => {
          let r = !1,
            s = t;
          for (; --s >= 0 && "\\" === n[s]; ) r = !r;
          return r ? "|" : " |";
        })
        .split(/ \|/);
      let r = 0;
      if (
        (n[0].trim() || n.shift(),
        n[n.length - 1].trim() || n.pop(),
        n.length > t)
      )
        n.splice(t);
      else for (; n.length < t; ) n.push("");
      for (; r < n.length; r++) n[r] = n[r].trim().replace(/\\\|/g, "|");
      return n;
    }
    function pt(e, t, n) {
      const r = e.length;
      if (0 === r) return "";
      let s = 0;
      for (; s < r; ) {
        const i = e.charAt(r - s - 1);
        if (i !== t || n) {
          if (i === t || !n) break;
          s++;
        } else s++;
      }
      return e.substr(0, r - s);
    }
    function ht(e) {
      e &&
        e.sanitize &&
        !e.silent &&
        console.warn(
          "marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options"
        );
    }
    function ft(e, t) {
      if (t < 1) return "";
      let n = "";
      for (; t > 1; ) 1 & t && (n += e), (t >>= 1), (e += e);
      return n + e;
    }
    function mt(e, t, n, r) {
      const s = t.href,
        i = t.title ? Je(t.title) : null,
        o = e[1].replace(/\\([\[\]])/g, "$1");
      if ("!" !== e[0].charAt(0)) {
        r.state.inLink = !0;
        const e = {
          type: "link",
          raw: n,
          href: s,
          title: i,
          text: o,
          tokens: r.inlineTokens(o, []),
        };
        return (r.state.inLink = !1), e;
      }
      return { type: "image", raw: n, href: s, title: i, text: Je(o) };
    }
    class gt {
      constructor(e) {
        this.options = e || Be;
      }
      space(e) {
        const t = this.rules.block.newline.exec(e);
        if (t)
          return t[0].length > 1 ? { type: "space", raw: t[0] } : { raw: "\n" };
      }
      code(e) {
        const t = this.rules.block.code.exec(e);
        if (t) {
          const e = t[0].replace(/^ {1,4}/gm, "");
          return {
            type: "code",
            raw: t[0],
            codeBlockStyle: "indented",
            text: this.options.pedantic ? e : pt(e, "\n"),
          };
        }
      }
      fences(e) {
        const t = this.rules.block.fences.exec(e);
        if (t) {
          const e = t[0],
            n = (function (e, t) {
              const n = e.match(/^(\s+)(?:```)/);
              if (null === n) return t;
              const r = n[1];
              return t
                .split("\n")
                .map((e) => {
                  const t = e.match(/^\s+/);
                  if (null === t) return e;
                  const [n] = t;
                  return n.length >= r.length ? e.slice(r.length) : e;
                })
                .join("\n");
            })(e, t[3] || "");
          return {
            type: "code",
            raw: e,
            lang: t[2] ? t[2].trim() : t[2],
            text: n,
          };
        }
      }
      heading(e) {
        const t = this.rules.block.heading.exec(e);
        if (t) {
          let e = t[2].trim();
          if (/#$/.test(e)) {
            const t = pt(e, "#");
            this.options.pedantic
              ? (e = t.trim())
              : (t && !/ $/.test(t)) || (e = t.trim());
          }
          const n = {
            type: "heading",
            raw: t[0],
            depth: t[1].length,
            text: e,
            tokens: [],
          };
          return this.lexer.inline(n.text, n.tokens), n;
        }
      }
      hr(e) {
        const t = this.rules.block.hr.exec(e);
        if (t) return { type: "hr", raw: t[0] };
      }
      blockquote(e) {
        const t = this.rules.block.blockquote.exec(e);
        if (t) {
          const e = t[0].replace(/^ *> ?/gm, "");
          return {
            type: "blockquote",
            raw: t[0],
            tokens: this.lexer.blockTokens(e, []),
            text: e,
          };
        }
      }
      list(e) {
        let t = this.rules.block.list.exec(e);
        if (t) {
          let n,
            r,
            s,
            i,
            o,
            a,
            c,
            l,
            u,
            d,
            p = t[1].trim();
          const h = p.length > 1,
            f = {
              type: "list",
              raw: "",
              ordered: h,
              start: h ? +p.slice(0, -1) : "",
              loose: !1,
              items: [],
            };
          (p = h ? "\\d{1,9}\\" + p.slice(-1) : "\\" + p),
            this.options.pedantic && (p = h ? p : "[*+-]");
          const m = new RegExp(
            `^( {0,3}${p})((?: [^\\n]*| *)(?:\\n[^\\n]*)*(?:\\n|$))`
          );
          for (; e && !this.rules.block.hr.test(e) && (t = m.exec(e)); ) {
            (u = t[2].split("\n")),
              this.options.pedantic
                ? ((i = 2), (d = u[0].trimLeft()))
                : ((i = t[2].search(/[^ ]/)),
                  (i = t[1].length + (i > 4 ? 1 : i)),
                  (d = u[0].slice(i - t[1].length))),
              (a = !1),
              (n = t[0]),
              !u[0] &&
                /^ *$/.test(u[1]) &&
                ((n = t[1] + u.slice(0, 2).join("\n") + "\n"),
                (f.loose = !0),
                (u = []));
            const p = new RegExp(
              `^ {0,${Math.min(3, i - 1)}}(?:[*+-]|\\d{1,9}[.)])`
            );
            for (o = 1; o < u.length; o++) {
              if (
                ((l = u[o]),
                this.options.pedantic &&
                  (l = l.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ")),
                p.test(l))
              ) {
                n = t[1] + u.slice(0, o).join("\n") + "\n";
                break;
              }
              if (a) {
                if (!(l.search(/[^ ]/) >= i) && l.trim()) {
                  n = t[1] + u.slice(0, o).join("\n") + "\n";
                  break;
                }
                d += "\n" + l.slice(i);
              } else
                l.trim() || (a = !0),
                  l.search(/[^ ]/) >= i
                    ? (d += "\n" + l.slice(i))
                    : (d += "\n" + l);
            }
            f.loose || (c ? (f.loose = !0) : /\n *\n *$/.test(n) && (c = !0)),
              this.options.gfm &&
                ((r = /^\[[ xX]\] /.exec(d)),
                r &&
                  ((s = "[ ] " !== r[0]), (d = d.replace(/^\[[ xX]\] +/, "")))),
              f.items.push({
                type: "list_item",
                raw: n,
                task: !!r,
                checked: s,
                loose: !1,
                text: d,
              }),
              (f.raw += n),
              (e = e.slice(n.length));
          }
          (f.items[f.items.length - 1].raw = n.trimRight()),
            (f.items[f.items.length - 1].text = d.trimRight()),
            (f.raw = f.raw.trimRight());
          const g = f.items.length;
          for (o = 0; o < g; o++)
            (this.lexer.state.top = !1),
              (f.items[o].tokens = this.lexer.blockTokens(f.items[o].text, [])),
              f.items[o].tokens.some((e) => "space" === e.type) &&
                ((f.loose = !0), (f.items[o].loose = !0));
          return f;
        }
      }
      html(e) {
        const t = this.rules.block.html.exec(e);
        if (t) {
          const e = {
            type: "html",
            raw: t[0],
            pre:
              !this.options.sanitizer &&
              ("pre" === t[1] || "script" === t[1] || "style" === t[1]),
            text: t[0],
          };
          return (
            this.options.sanitize &&
              ((e.type = "paragraph"),
              (e.text = this.options.sanitizer
                ? this.options.sanitizer(t[0])
                : Je(t[0])),
              (e.tokens = []),
              this.lexer.inline(e.text, e.tokens)),
            e
          );
        }
      }
      def(e) {
        const t = this.rules.block.def.exec(e);
        if (t) {
          t[3] && (t[3] = t[3].substring(1, t[3].length - 1));
          return {
            type: "def",
            tag: t[1].toLowerCase().replace(/\s+/g, " "),
            raw: t[0],
            href: t[2],
            title: t[3],
          };
        }
      }
      table(e) {
        const t = this.rules.block.table.exec(e);
        if (t) {
          const e = {
            type: "table",
            header: dt(t[1]).map((e) => ({ text: e })),
            align: t[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
            rows: t[3] ? t[3].replace(/\n$/, "").split("\n") : [],
          };
          if (e.header.length === e.align.length) {
            e.raw = t[0];
            let n,
              r,
              s,
              i,
              o = e.align.length;
            for (n = 0; n < o; n++)
              /^ *-+: *$/.test(e.align[n])
                ? (e.align[n] = "right")
                : /^ *:-+: *$/.test(e.align[n])
                ? (e.align[n] = "center")
                : /^ *:-+ *$/.test(e.align[n])
                ? (e.align[n] = "left")
                : (e.align[n] = null);
            for (o = e.rows.length, n = 0; n < o; n++)
              e.rows[n] = dt(e.rows[n], e.header.length).map((e) => ({
                text: e,
              }));
            for (o = e.header.length, r = 0; r < o; r++)
              (e.header[r].tokens = []),
                this.lexer.inlineTokens(e.header[r].text, e.header[r].tokens);
            for (o = e.rows.length, r = 0; r < o; r++)
              for (i = e.rows[r], s = 0; s < i.length; s++)
                (i[s].tokens = []),
                  this.lexer.inlineTokens(i[s].text, i[s].tokens);
            return e;
          }
        }
      }
      lheading(e) {
        const t = this.rules.block.lheading.exec(e);
        if (t) {
          const e = {
            type: "heading",
            raw: t[0],
            depth: "=" === t[2].charAt(0) ? 1 : 2,
            text: t[1],
            tokens: [],
          };
          return this.lexer.inline(e.text, e.tokens), e;
        }
      }
      paragraph(e) {
        const t = this.rules.block.paragraph.exec(e);
        if (t) {
          const e = {
            type: "paragraph",
            raw: t[0],
            text:
              "\n" === t[1].charAt(t[1].length - 1) ? t[1].slice(0, -1) : t[1],
            tokens: [],
          };
          return this.lexer.inline(e.text, e.tokens), e;
        }
      }
      text(e) {
        const t = this.rules.block.text.exec(e);
        if (t) {
          const e = { type: "text", raw: t[0], text: t[0], tokens: [] };
          return this.lexer.inline(e.text, e.tokens), e;
        }
      }
      escape(e) {
        const t = this.rules.inline.escape.exec(e);
        if (t) return { type: "escape", raw: t[0], text: Je(t[1]) };
      }
      tag(e) {
        const t = this.rules.inline.tag.exec(e);
        if (t)
          return (
            !this.lexer.state.inLink && /^<a /i.test(t[0])
              ? (this.lexer.state.inLink = !0)
              : this.lexer.state.inLink &&
                /^<\/a>/i.test(t[0]) &&
                (this.lexer.state.inLink = !1),
            !this.lexer.state.inRawBlock &&
            /^<(pre|code|kbd|script)(\s|>)/i.test(t[0])
              ? (this.lexer.state.inRawBlock = !0)
              : this.lexer.state.inRawBlock &&
                /^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0]) &&
                (this.lexer.state.inRawBlock = !1),
            {
              type: this.options.sanitize ? "text" : "html",
              raw: t[0],
              inLink: this.lexer.state.inLink,
              inRawBlock: this.lexer.state.inRawBlock,
              text: this.options.sanitize
                ? this.options.sanitizer
                  ? this.options.sanitizer(t[0])
                  : Je(t[0])
                : t[0],
            }
          );
      }
      link(e) {
        const t = this.rules.inline.link.exec(e);
        if (t) {
          const e = t[2].trim();
          if (!this.options.pedantic && /^</.test(e)) {
            if (!/>$/.test(e)) return;
            const t = pt(e.slice(0, -1), "\\");
            if ((e.length - t.length) % 2 == 0) return;
          } else {
            const e = (function (e, t) {
              if (-1 === e.indexOf(t[1])) return -1;
              const n = e.length;
              let r = 0,
                s = 0;
              for (; s < n; s++)
                if ("\\" === e[s]) s++;
                else if (e[s] === t[0]) r++;
                else if (e[s] === t[1] && (r--, r < 0)) return s;
              return -1;
            })(t[2], "()");
            if (e > -1) {
              const n = (0 === t[0].indexOf("!") ? 5 : 4) + t[1].length + e;
              (t[2] = t[2].substring(0, e)),
                (t[0] = t[0].substring(0, n).trim()),
                (t[3] = "");
            }
          }
          let n = t[2],
            r = "";
          if (this.options.pedantic) {
            const e = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(n);
            e && ((n = e[1]), (r = e[3]));
          } else r = t[3] ? t[3].slice(1, -1) : "";
          return (
            (n = n.trim()),
            /^</.test(n) &&
              (n =
                this.options.pedantic && !/>$/.test(e)
                  ? n.slice(1)
                  : n.slice(1, -1)),
            mt(
              t,
              {
                href: n ? n.replace(this.rules.inline._escapes, "$1") : n,
                title: r ? r.replace(this.rules.inline._escapes, "$1") : r,
              },
              t[0],
              this.lexer
            )
          );
        }
      }
      reflink(e, t) {
        let n;
        if (
          (n = this.rules.inline.reflink.exec(e)) ||
          (n = this.rules.inline.nolink.exec(e))
        ) {
          let e = (n[2] || n[1]).replace(/\s+/g, " ");
          if (((e = t[e.toLowerCase()]), !e || !e.href)) {
            const e = n[0].charAt(0);
            return { type: "text", raw: e, text: e };
          }
          return mt(n, e, n[0], this.lexer);
        }
      }
      emStrong(e, t, n = "") {
        let r = this.rules.inline.emStrong.lDelim.exec(e);
        if (!r) return;
        if (r[3] && n.match(/[\p{L}\p{N}]/u)) return;
        const s = r[1] || r[2] || "";
        if (!s || (s && ("" === n || this.rules.inline.punctuation.exec(n)))) {
          const n = r[0].length - 1;
          let s,
            i,
            o = n,
            a = 0;
          const c =
            "*" === r[0][0]
              ? this.rules.inline.emStrong.rDelimAst
              : this.rules.inline.emStrong.rDelimUnd;
          for (
            c.lastIndex = 0, t = t.slice(-1 * e.length + n);
            null != (r = c.exec(t));

          ) {
            if (((s = r[1] || r[2] || r[3] || r[4] || r[5] || r[6]), !s))
              continue;
            if (((i = s.length), r[3] || r[4])) {
              o += i;
              continue;
            }
            if ((r[5] || r[6]) && n % 3 && !((n + i) % 3)) {
              a += i;
              continue;
            }
            if (((o -= i), o > 0)) continue;
            if (((i = Math.min(i, i + o + a)), Math.min(n, i) % 2)) {
              const t = e.slice(1, n + r.index + i);
              return {
                type: "em",
                raw: e.slice(0, n + r.index + i + 1),
                text: t,
                tokens: this.lexer.inlineTokens(t, []),
              };
            }
            const t = e.slice(2, n + r.index + i - 1);
            return {
              type: "strong",
              raw: e.slice(0, n + r.index + i + 1),
              text: t,
              tokens: this.lexer.inlineTokens(t, []),
            };
          }
        }
      }
      codespan(e) {
        const t = this.rules.inline.code.exec(e);
        if (t) {
          let e = t[2].replace(/\n/g, " ");
          const n = /[^ ]/.test(e),
            r = /^ /.test(e) && / $/.test(e);
          return (
            n && r && (e = e.substring(1, e.length - 1)),
            (e = Je(e, !0)),
            { type: "codespan", raw: t[0], text: e }
          );
        }
      }
      br(e) {
        const t = this.rules.inline.br.exec(e);
        if (t) return { type: "br", raw: t[0] };
      }
      del(e) {
        const t = this.rules.inline.del.exec(e);
        if (t)
          return {
            type: "del",
            raw: t[0],
            text: t[2],
            tokens: this.lexer.inlineTokens(t[2], []),
          };
      }
      autolink(e, t) {
        const n = this.rules.inline.autolink.exec(e);
        if (n) {
          let e, r;
          return (
            "@" === n[2]
              ? ((e = Je(this.options.mangle ? t(n[1]) : n[1])),
                (r = "mailto:" + e))
              : ((e = Je(n[1])), (r = e)),
            {
              type: "link",
              raw: n[0],
              text: e,
              href: r,
              tokens: [{ type: "text", raw: e, text: e }],
            }
          );
        }
      }
      url(e, t) {
        let n;
        if ((n = this.rules.inline.url.exec(e))) {
          let e, r;
          if ("@" === n[2])
            (e = Je(this.options.mangle ? t(n[0]) : n[0])), (r = "mailto:" + e);
          else {
            let t;
            do {
              (t = n[0]), (n[0] = this.rules.inline._backpedal.exec(n[0])[0]);
            } while (t !== n[0]);
            (e = Je(n[0])), (r = "www." === n[1] ? "http://" + e : e);
          }
          return {
            type: "link",
            raw: n[0],
            text: e,
            href: r,
            tokens: [{ type: "text", raw: e, text: e }],
          };
        }
      }
      inlineText(e, t) {
        const n = this.rules.inline.text.exec(e);
        if (n) {
          let e;
          return (
            (e = this.lexer.state.inRawBlock
              ? this.options.sanitize
                ? this.options.sanitizer
                  ? this.options.sanitizer(n[0])
                  : Je(n[0])
                : n[0]
              : Je(this.options.smartypants ? t(n[0]) : n[0])),
            { type: "text", raw: n[0], text: e }
          );
        }
      }
    }
    const bt = {
      newline: /^(?: *(?:\n|$))+/,
      code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
      fences:
        /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3}bull)( [^\n]+?)?(?:\n|$)/,
      html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      table: lt,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      _paragraph:
        /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
      text: /^[^\n]+/,
      _label: /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/,
      _title: /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/,
    };
    (bt.def = tt(bt.def)
      .replace("label", bt._label)
      .replace("title", bt._title)
      .getRegex()),
      (bt.bullet = /(?:[*+-]|\d{1,9}[.)])/),
      (bt.listItemStart = tt(/^( *)(bull) */)
        .replace("bull", bt.bullet)
        .getRegex()),
      (bt.list = tt(bt.list)
        .replace(/bull/g, bt.bullet)
        .replace(
          "hr",
          "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))"
        )
        .replace("def", "\\n+(?=" + bt.def.source + ")")
        .getRegex()),
      (bt._tag =
        "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul"),
      (bt._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/),
      (bt.html = tt(bt.html, "i")
        .replace("comment", bt._comment)
        .replace("tag", bt._tag)
        .replace(
          "attribute",
          / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/
        )
        .getRegex()),
      (bt.paragraph = tt(bt._paragraph)
        .replace("hr", bt.hr)
        .replace("heading", " {0,3}#{1,6} ")
        .replace("|lheading", "")
        .replace("blockquote", " {0,3}>")
        .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
        .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
        .replace(
          "html",
          "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)"
        )
        .replace("tag", bt._tag)
        .getRegex()),
      (bt.blockquote = tt(bt.blockquote)
        .replace("paragraph", bt.paragraph)
        .getRegex()),
      (bt.normal = ut({}, bt)),
      (bt.gfm = ut({}, bt.normal, {
        table:
          "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)",
      })),
      (bt.gfm.table = tt(bt.gfm.table)
        .replace("hr", bt.hr)
        .replace("heading", " {0,3}#{1,6} ")
        .replace("blockquote", " {0,3}>")
        .replace("code", " {4}[^\\n]")
        .replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n")
        .replace("list", " {0,3}(?:[*+-]|1[.)]) ")
        .replace(
          "html",
          "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)"
        )
        .replace("tag", bt._tag)
        .getRegex()),
      (bt.pedantic = ut({}, bt.normal, {
        html: tt(
          "^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))"
        )
          .replace("comment", bt._comment)
          .replace(
            /tag/g,
            "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b"
          )
          .getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: lt,
        paragraph: tt(bt.normal._paragraph)
          .replace("hr", bt.hr)
          .replace("heading", " *#{1,6} *[^\n]")
          .replace("lheading", bt.lheading)
          .replace("blockquote", " {0,3}>")
          .replace("|fences", "")
          .replace("|list", "")
          .replace("|html", "")
          .getRegex(),
      }));
    const yt = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: lt,
      tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      reflinkSearch: "reflink|nolink(?!\\()",
      emStrong: {
        lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
        rDelimAst:
          /^[^_*]*?\_\_[^_*]*?\*[^_*]*?(?=\_\_)|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
        rDelimUnd:
          /^[^_*]*?\*\*[^_*]*?\_[^_*]*?(?=\*\*)|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/,
      },
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: lt,
      text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
      punctuation: /^([\spunctuation])/,
    };
    function wt(e) {
      return e
        .replace(/---/g, "—")
        .replace(/--/g, "–")
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1‘")
        .replace(/'/g, "’")
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1“")
        .replace(/"/g, "”")
        .replace(/\.{3}/g, "…");
    }
    function vt(e) {
      let t,
        n,
        r = "";
      const s = e.length;
      for (t = 0; t < s; t++)
        (n = e.charCodeAt(t)),
          Math.random() > 0.5 && (n = "x" + n.toString(16)),
          (r += "&#" + n + ";");
      return r;
    }
    (yt._punctuation = "!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~"),
      (yt.punctuation = tt(yt.punctuation)
        .replace(/punctuation/g, yt._punctuation)
        .getRegex()),
      (yt.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g),
      (yt.escapedEmSt = /\\\*|\\_/g),
      (yt._comment = tt(bt._comment)
        .replace("(?:--\x3e|$)", "--\x3e")
        .getRegex()),
      (yt.emStrong.lDelim = tt(yt.emStrong.lDelim)
        .replace(/punct/g, yt._punctuation)
        .getRegex()),
      (yt.emStrong.rDelimAst = tt(yt.emStrong.rDelimAst, "g")
        .replace(/punct/g, yt._punctuation)
        .getRegex()),
      (yt.emStrong.rDelimUnd = tt(yt.emStrong.rDelimUnd, "g")
        .replace(/punct/g, yt._punctuation)
        .getRegex()),
      (yt._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g),
      (yt._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/),
      (yt._email =
        /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/),
      (yt.autolink = tt(yt.autolink)
        .replace("scheme", yt._scheme)
        .replace("email", yt._email)
        .getRegex()),
      (yt._attribute =
        /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/),
      (yt.tag = tt(yt.tag)
        .replace("comment", yt._comment)
        .replace("attribute", yt._attribute)
        .getRegex()),
      (yt._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/),
      (yt._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/),
      (yt._title =
        /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/),
      (yt.link = tt(yt.link)
        .replace("label", yt._label)
        .replace("href", yt._href)
        .replace("title", yt._title)
        .getRegex()),
      (yt.reflink = tt(yt.reflink).replace("label", yt._label).getRegex()),
      (yt.reflinkSearch = tt(yt.reflinkSearch, "g")
        .replace("reflink", yt.reflink)
        .replace("nolink", yt.nolink)
        .getRegex()),
      (yt.normal = ut({}, yt)),
      (yt.pedantic = ut({}, yt.normal, {
        strong: {
          start: /^__|\*\*/,
          middle:
            /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g,
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g,
        },
        link: tt(/^!?\[(label)\]\((.*?)\)/)
          .replace("label", yt._label)
          .getRegex(),
        reflink: tt(/^!?\[(label)\]\s*\[([^\]]*)\]/)
          .replace("label", yt._label)
          .getRegex(),
      })),
      (yt.gfm = ut({}, yt.normal, {
        escape: tt(yt.escape).replace("])", "~|])").getRegex(),
        _extended_email:
          /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal:
          /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
      })),
      (yt.gfm.url = tt(yt.gfm.url, "i")
        .replace("email", yt.gfm._extended_email)
        .getRegex()),
      (yt.breaks = ut({}, yt.gfm, {
        br: tt(yt.br).replace("{2,}", "*").getRegex(),
        text: tt(yt.gfm.text)
          .replace("\\b_", "\\b_| {2,}\\n")
          .replace(/\{2,\}/g, "*")
          .getRegex(),
      }));
    class kt {
      constructor(e) {
        (this.tokens = []),
          (this.tokens.links = Object.create(null)),
          (this.options = e || Be),
          (this.options.tokenizer = this.options.tokenizer || new gt()),
          (this.tokenizer = this.options.tokenizer),
          (this.tokenizer.options = this.options),
          (this.tokenizer.lexer = this),
          (this.inlineQueue = []),
          (this.state = { inLink: !1, inRawBlock: !1, top: !0 });
        const t = { block: bt.normal, inline: yt.normal };
        this.options.pedantic
          ? ((t.block = bt.pedantic), (t.inline = yt.pedantic))
          : this.options.gfm &&
            ((t.block = bt.gfm),
            this.options.breaks ? (t.inline = yt.breaks) : (t.inline = yt.gfm)),
          (this.tokenizer.rules = t);
      }
      static get rules() {
        return { block: bt, inline: yt };
      }
      static lex(e, t) {
        return new kt(t).lex(e);
      }
      static lexInline(e, t) {
        return new kt(t).inlineTokens(e);
      }
      lex(e) {
        let t;
        for (
          e = e.replace(/\r\n|\r/g, "\n").replace(/\t/g, "    "),
            this.blockTokens(e, this.tokens);
          (t = this.inlineQueue.shift());

        )
          this.inlineTokens(t.src, t.tokens);
        return this.tokens;
      }
      blockTokens(e, t = []) {
        let n, r, s, i;
        for (this.options.pedantic && (e = e.replace(/^ +$/gm, "")); e; )
          if (
            !(
              this.options.extensions &&
              this.options.extensions.block &&
              this.options.extensions.block.some(
                (r) =>
                  !!(n = r.call({ lexer: this }, e, t)) &&
                  ((e = e.substring(n.raw.length)), t.push(n), !0)
              )
            )
          )
            if ((n = this.tokenizer.space(e)))
              (e = e.substring(n.raw.length)), n.type && t.push(n);
            else if ((n = this.tokenizer.code(e)))
              (e = e.substring(n.raw.length)),
                (r = t[t.length - 1]),
                !r || ("paragraph" !== r.type && "text" !== r.type)
                  ? t.push(n)
                  : ((r.raw += "\n" + n.raw),
                    (r.text += "\n" + n.text),
                    (this.inlineQueue[this.inlineQueue.length - 1].src =
                      r.text));
            else if ((n = this.tokenizer.fences(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.heading(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.hr(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.blockquote(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.list(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.html(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.def(e)))
              (e = e.substring(n.raw.length)),
                (r = t[t.length - 1]),
                !r || ("paragraph" !== r.type && "text" !== r.type)
                  ? this.tokens.links[n.tag] ||
                    (this.tokens.links[n.tag] = {
                      href: n.href,
                      title: n.title,
                    })
                  : ((r.raw += "\n" + n.raw),
                    (r.text += "\n" + n.raw),
                    (this.inlineQueue[this.inlineQueue.length - 1].src =
                      r.text));
            else if ((n = this.tokenizer.table(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.lheading(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else {
              if (
                ((s = e),
                this.options.extensions && this.options.extensions.startBlock)
              ) {
                let t = 1 / 0;
                const n = e.slice(1);
                let r;
                this.options.extensions.startBlock.forEach(function (e) {
                  (r = e.call({ lexer: this }, n)),
                    "number" == typeof r && r >= 0 && (t = Math.min(t, r));
                }),
                  t < 1 / 0 && t >= 0 && (s = e.substring(0, t + 1));
              }
              if (this.state.top && (n = this.tokenizer.paragraph(s)))
                (r = t[t.length - 1]),
                  i && "paragraph" === r.type
                    ? ((r.raw += "\n" + n.raw),
                      (r.text += "\n" + n.text),
                      this.inlineQueue.pop(),
                      (this.inlineQueue[this.inlineQueue.length - 1].src =
                        r.text))
                    : t.push(n),
                  (i = s.length !== e.length),
                  (e = e.substring(n.raw.length));
              else if ((n = this.tokenizer.text(e)))
                (e = e.substring(n.raw.length)),
                  (r = t[t.length - 1]),
                  r && "text" === r.type
                    ? ((r.raw += "\n" + n.raw),
                      (r.text += "\n" + n.text),
                      this.inlineQueue.pop(),
                      (this.inlineQueue[this.inlineQueue.length - 1].src =
                        r.text))
                    : t.push(n);
              else if (e) {
                const t = "Infinite loop on byte: " + e.charCodeAt(0);
                if (this.options.silent) {
                  console.error(t);
                  break;
                }
                throw new Error(t);
              }
            }
        return (this.state.top = !0), t;
      }
      inline(e, t) {
        this.inlineQueue.push({ src: e, tokens: t });
      }
      inlineTokens(e, t = []) {
        let n,
          r,
          s,
          i,
          o,
          a,
          c = e;
        if (this.tokens.links) {
          const e = Object.keys(this.tokens.links);
          if (e.length > 0)
            for (
              ;
              null != (i = this.tokenizer.rules.inline.reflinkSearch.exec(c));

            )
              e.includes(i[0].slice(i[0].lastIndexOf("[") + 1, -1)) &&
                (c =
                  c.slice(0, i.index) +
                  "[" +
                  ft("a", i[0].length - 2) +
                  "]" +
                  c.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
        }
        for (; null != (i = this.tokenizer.rules.inline.blockSkip.exec(c)); )
          c =
            c.slice(0, i.index) +
            "[" +
            ft("a", i[0].length - 2) +
            "]" +
            c.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
        for (; null != (i = this.tokenizer.rules.inline.escapedEmSt.exec(c)); )
          c =
            c.slice(0, i.index) +
            "++" +
            c.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
        for (; e; )
          if (
            (o || (a = ""),
            (o = !1),
            !(
              this.options.extensions &&
              this.options.extensions.inline &&
              this.options.extensions.inline.some(
                (r) =>
                  !!(n = r.call({ lexer: this }, e, t)) &&
                  ((e = e.substring(n.raw.length)), t.push(n), !0)
              )
            ))
          )
            if ((n = this.tokenizer.escape(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.tag(e)))
              (e = e.substring(n.raw.length)),
                (r = t[t.length - 1]),
                r && "text" === n.type && "text" === r.type
                  ? ((r.raw += n.raw), (r.text += n.text))
                  : t.push(n);
            else if ((n = this.tokenizer.link(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.reflink(e, this.tokens.links)))
              (e = e.substring(n.raw.length)),
                (r = t[t.length - 1]),
                r && "text" === n.type && "text" === r.type
                  ? ((r.raw += n.raw), (r.text += n.text))
                  : t.push(n);
            else if ((n = this.tokenizer.emStrong(e, c, a)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.codespan(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.br(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.del(e)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if ((n = this.tokenizer.autolink(e, vt)))
              (e = e.substring(n.raw.length)), t.push(n);
            else if (this.state.inLink || !(n = this.tokenizer.url(e, vt))) {
              if (
                ((s = e),
                this.options.extensions && this.options.extensions.startInline)
              ) {
                let t = 1 / 0;
                const n = e.slice(1);
                let r;
                this.options.extensions.startInline.forEach(function (e) {
                  (r = e.call({ lexer: this }, n)),
                    "number" == typeof r && r >= 0 && (t = Math.min(t, r));
                }),
                  t < 1 / 0 && t >= 0 && (s = e.substring(0, t + 1));
              }
              if ((n = this.tokenizer.inlineText(s, wt)))
                (e = e.substring(n.raw.length)),
                  "_" !== n.raw.slice(-1) && (a = n.raw.slice(-1)),
                  (o = !0),
                  (r = t[t.length - 1]),
                  r && "text" === r.type
                    ? ((r.raw += n.raw), (r.text += n.text))
                    : t.push(n);
              else if (e) {
                const t = "Infinite loop on byte: " + e.charCodeAt(0);
                if (this.options.silent) {
                  console.error(t);
                  break;
                }
                throw new Error(t);
              }
            } else (e = e.substring(n.raw.length)), t.push(n);
        return t;
      }
    }
    class $t {
      constructor(e) {
        this.options = e || Be;
      }
      code(e, t, n) {
        const r = (t || "").match(/\S*/)[0];
        if (this.options.highlight) {
          const t = this.options.highlight(e, r);
          null != t && t !== e && ((n = !0), (e = t));
        }
        return (
          (e = e.replace(/\n$/, "") + "\n"),
          r
            ? '<pre><code class="' +
              this.options.langPrefix +
              Je(r, !0) +
              '">' +
              (n ? e : Je(e, !0)) +
              "</code></pre>\n"
            : "<pre><code>" + (n ? e : Je(e, !0)) + "</code></pre>\n"
        );
      }
      blockquote(e) {
        return "<blockquote>\n" + e + "</blockquote>\n";
      }
      html(e) {
        return e;
      }
      heading(e, t, n, r) {
        return this.options.headerIds
          ? "<h" +
              t +
              ' id="' +
              this.options.headerPrefix +
              r.slug(n) +
              '">' +
              e +
              "</h" +
              t +
              ">\n"
          : "<h" + t + ">" + e + "</h" + t + ">\n";
      }
      hr() {
        return this.options.xhtml ? "<hr/>\n" : "<hr>\n";
      }
      list(e, t, n) {
        const r = t ? "ol" : "ul";
        return (
          "<" +
          r +
          (t && 1 !== n ? ' start="' + n + '"' : "") +
          ">\n" +
          e +
          "</" +
          r +
          ">\n"
        );
      }
      listitem(e) {
        return "<li>" + e + "</li>\n";
      }
      checkbox(e) {
        return (
          "<input " +
          (e ? 'checked="" ' : "") +
          'disabled="" type="checkbox"' +
          (this.options.xhtml ? " /" : "") +
          "> "
        );
      }
      paragraph(e) {
        return "<p>" + e + "</p>\n";
      }
      table(e, t) {
        return (
          t && (t = "<tbody>" + t + "</tbody>"),
          "<table>\n<thead>\n" + e + "</thead>\n" + t + "</table>\n"
        );
      }
      tablerow(e) {
        return "<tr>\n" + e + "</tr>\n";
      }
      tablecell(e, t) {
        const n = t.header ? "th" : "td";
        return (
          (t.align ? "<" + n + ' align="' + t.align + '">' : "<" + n + ">") +
          e +
          "</" +
          n +
          ">\n"
        );
      }
      strong(e) {
        return "<strong>" + e + "</strong>";
      }
      em(e) {
        return "<em>" + e + "</em>";
      }
      codespan(e) {
        return "<code>" + e + "</code>";
      }
      br() {
        return this.options.xhtml ? "<br/>" : "<br>";
      }
      del(e) {
        return "<del>" + e + "</del>";
      }
      link(e, t, n) {
        if (null === (e = st(this.options.sanitize, this.options.baseUrl, e)))
          return n;
        let r = '<a href="' + Je(e) + '"';
        return t && (r += ' title="' + t + '"'), (r += ">" + n + "</a>"), r;
      }
      image(e, t, n) {
        if (null === (e = st(this.options.sanitize, this.options.baseUrl, e)))
          return n;
        let r = '<img src="' + e + '" alt="' + n + '"';
        return (
          t && (r += ' title="' + t + '"'),
          (r += this.options.xhtml ? "/>" : ">"),
          r
        );
      }
      text(e) {
        return e;
      }
    }
    class xt {
      strong(e) {
        return e;
      }
      em(e) {
        return e;
      }
      codespan(e) {
        return e;
      }
      del(e) {
        return e;
      }
      html(e) {
        return e;
      }
      text(e) {
        return e;
      }
      link(e, t, n) {
        return "" + n;
      }
      image(e, t, n) {
        return "" + n;
      }
      br() {
        return "";
      }
    }
    class _t {
      constructor() {
        this.seen = {};
      }
      serialize(e) {
        return e
          .toLowerCase()
          .trim()
          .replace(/<[!\/a-z].*?>/gi, "")
          .replace(
            /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
            ""
          )
          .replace(/\s/g, "-");
      }
      getNextSafeSlug(e, t) {
        let n = e,
          r = 0;
        if (this.seen.hasOwnProperty(n)) {
          r = this.seen[e];
          do {
            r++, (n = e + "-" + r);
          } while (this.seen.hasOwnProperty(n));
        }
        return t || ((this.seen[e] = r), (this.seen[n] = 0)), n;
      }
      slug(e, t = {}) {
        const n = this.serialize(e);
        return this.getNextSafeSlug(n, t.dryrun);
      }
    }
    class Ct {
      constructor(e) {
        (this.options = e || Be),
          (this.options.renderer = this.options.renderer || new $t()),
          (this.renderer = this.options.renderer),
          (this.renderer.options = this.options),
          (this.textRenderer = new xt()),
          (this.slugger = new _t());
      }
      static parse(e, t) {
        return new Ct(t).parse(e);
      }
      static parseInline(e, t) {
        return new Ct(t).parseInline(e);
      }
      parse(e, t = !0) {
        let n,
          r,
          s,
          i,
          o,
          a,
          c,
          l,
          u,
          d,
          p,
          h,
          f,
          m,
          g,
          b,
          y,
          w,
          v,
          k = "";
        const $ = e.length;
        for (n = 0; n < $; n++)
          if (
            ((d = e[n]),
            this.options.extensions &&
              this.options.extensions.renderers &&
              this.options.extensions.renderers[d.type] &&
              ((v = this.options.extensions.renderers[d.type].call(
                { parser: this },
                d
              )),
              !1 !== v ||
                ![
                  "space",
                  "hr",
                  "heading",
                  "code",
                  "table",
                  "blockquote",
                  "list",
                  "html",
                  "paragraph",
                  "text",
                ].includes(d.type)))
          )
            k += v || "";
          else
            switch (d.type) {
              case "space":
                continue;
              case "hr":
                k += this.renderer.hr();
                continue;
              case "heading":
                k += this.renderer.heading(
                  this.parseInline(d.tokens),
                  d.depth,
                  Xe(this.parseInline(d.tokens, this.textRenderer)),
                  this.slugger
                );
                continue;
              case "code":
                k += this.renderer.code(d.text, d.lang, d.escaped);
                continue;
              case "table":
                for (l = "", c = "", i = d.header.length, r = 0; r < i; r++)
                  c += this.renderer.tablecell(
                    this.parseInline(d.header[r].tokens),
                    { header: !0, align: d.align[r] }
                  );
                for (
                  l += this.renderer.tablerow(c),
                    u = "",
                    i = d.rows.length,
                    r = 0;
                  r < i;
                  r++
                ) {
                  for (a = d.rows[r], c = "", o = a.length, s = 0; s < o; s++)
                    c += this.renderer.tablecell(
                      this.parseInline(a[s].tokens),
                      { header: !1, align: d.align[s] }
                    );
                  u += this.renderer.tablerow(c);
                }
                k += this.renderer.table(l, u);
                continue;
              case "blockquote":
                (u = this.parse(d.tokens)), (k += this.renderer.blockquote(u));
                continue;
              case "list":
                for (
                  p = d.ordered,
                    h = d.start,
                    f = d.loose,
                    i = d.items.length,
                    u = "",
                    r = 0;
                  r < i;
                  r++
                )
                  (g = d.items[r]),
                    (b = g.checked),
                    (y = g.task),
                    (m = ""),
                    g.task &&
                      ((w = this.renderer.checkbox(b)),
                      f
                        ? g.tokens.length > 0 &&
                          "paragraph" === g.tokens[0].type
                          ? ((g.tokens[0].text = w + " " + g.tokens[0].text),
                            g.tokens[0].tokens &&
                              g.tokens[0].tokens.length > 0 &&
                              "text" === g.tokens[0].tokens[0].type &&
                              (g.tokens[0].tokens[0].text =
                                w + " " + g.tokens[0].tokens[0].text))
                          : g.tokens.unshift({ type: "text", text: w })
                        : (m += w)),
                    (m += this.parse(g.tokens, f)),
                    (u += this.renderer.listitem(m, y, b));
                k += this.renderer.list(u, p, h);
                continue;
              case "html":
                k += this.renderer.html(d.text);
                continue;
              case "paragraph":
                k += this.renderer.paragraph(this.parseInline(d.tokens));
                continue;
              case "text":
                for (
                  u = d.tokens ? this.parseInline(d.tokens) : d.text;
                  n + 1 < $ && "text" === e[n + 1].type;

                )
                  (d = e[++n]),
                    (u +=
                      "\n" + (d.tokens ? this.parseInline(d.tokens) : d.text));
                k += t ? this.renderer.paragraph(u) : u;
                continue;
              default: {
                const e = 'Token with "' + d.type + '" type was not found.';
                if (this.options.silent) return void console.error(e);
                throw new Error(e);
              }
            }
        return k;
      }
      parseInline(e, t) {
        t = t || this.renderer;
        let n,
          r,
          s,
          i = "";
        const o = e.length;
        for (n = 0; n < o; n++)
          if (
            ((r = e[n]),
            this.options.extensions &&
              this.options.extensions.renderers &&
              this.options.extensions.renderers[r.type] &&
              ((s = this.options.extensions.renderers[r.type].call(
                { parser: this },
                r
              )),
              !1 !== s ||
                ![
                  "escape",
                  "html",
                  "link",
                  "image",
                  "strong",
                  "em",
                  "codespan",
                  "br",
                  "del",
                  "text",
                ].includes(r.type)))
          )
            i += s || "";
          else
            switch (r.type) {
              case "escape":
                i += t.text(r.text);
                break;
              case "html":
                i += t.html(r.text);
                break;
              case "link":
                i += t.link(r.href, r.title, this.parseInline(r.tokens, t));
                break;
              case "image":
                i += t.image(r.href, r.title, r.text);
                break;
              case "strong":
                i += t.strong(this.parseInline(r.tokens, t));
                break;
              case "em":
                i += t.em(this.parseInline(r.tokens, t));
                break;
              case "codespan":
                i += t.codespan(r.text);
                break;
              case "br":
                i += t.br();
                break;
              case "del":
                i += t.del(this.parseInline(r.tokens, t));
                break;
              case "text":
                i += t.text(r.text);
                break;
              default: {
                const e = 'Token with "' + r.type + '" type was not found.';
                if (this.options.silent) return void console.error(e);
                throw new Error(e);
              }
            }
        return i;
      }
    }
    function St(e, t, n) {
      if (null == e)
        throw new Error("marked(): input parameter is undefined or null");
      if ("string" != typeof e)
        throw new Error(
          "marked(): input parameter is of type " +
            Object.prototype.toString.call(e) +
            ", string expected"
        );
      if (
        ("function" == typeof t && ((n = t), (t = null)),
        ht((t = ut({}, St.defaults, t || {}))),
        n)
      ) {
        const r = t.highlight;
        let s;
        try {
          s = kt.lex(e, t);
        } catch (e) {
          return n(e);
        }
        const i = function (e) {
          let i;
          if (!e)
            try {
              t.walkTokens && St.walkTokens(s, t.walkTokens),
                (i = Ct.parse(s, t));
            } catch (t) {
              e = t;
            }
          return (t.highlight = r), e ? n(e) : n(null, i);
        };
        if (!r || r.length < 3) return i();
        if ((delete t.highlight, !s.length)) return i();
        let o = 0;
        return (
          St.walkTokens(s, function (e) {
            "code" === e.type &&
              (o++,
              setTimeout(() => {
                r(e.text, e.lang, function (t, n) {
                  if (t) return i(t);
                  null != n && n !== e.text && ((e.text = n), (e.escaped = !0)),
                    o--,
                    0 === o && i();
                });
              }, 0));
          }),
          void (0 === o && i())
        );
      }
      try {
        const n = kt.lex(e, t);
        return t.walkTokens && St.walkTokens(n, t.walkTokens), Ct.parse(n, t);
      } catch (e) {
        if (
          ((e.message +=
            "\nPlease report this to https://github.com/markedjs/marked."),
          t.silent)
        )
          return (
            "<p>An error occurred:</p><pre>" + Je(e.message + "", !0) + "</pre>"
          );
        throw e;
      }
    }
    (St.options = St.setOptions =
      function (e) {
        var t;
        return ut(St.defaults, e), (t = St.defaults), (Be = t), St;
      }),
      (St.getDefaults = Fe),
      (St.defaults = Be),
      (St.use = function (...e) {
        const t = ut({}, ...e),
          n = St.defaults.extensions || { renderers: {}, childTokens: {} };
        let r;
        e.forEach((e) => {
          if (
            (e.extensions &&
              ((r = !0),
              e.extensions.forEach((e) => {
                if (!e.name) throw new Error("extension name required");
                if (e.renderer) {
                  const t = n.renderers ? n.renderers[e.name] : null;
                  n.renderers[e.name] = t
                    ? function (...n) {
                        let r = e.renderer.apply(this, n);
                        return !1 === r && (r = t.apply(this, n)), r;
                      }
                    : e.renderer;
                }
                if (e.tokenizer) {
                  if (!e.level || ("block" !== e.level && "inline" !== e.level))
                    throw new Error(
                      "extension level must be 'block' or 'inline'"
                    );
                  n[e.level]
                    ? n[e.level].unshift(e.tokenizer)
                    : (n[e.level] = [e.tokenizer]),
                    e.start &&
                      ("block" === e.level
                        ? n.startBlock
                          ? n.startBlock.push(e.start)
                          : (n.startBlock = [e.start])
                        : "inline" === e.level &&
                          (n.startInline
                            ? n.startInline.push(e.start)
                            : (n.startInline = [e.start])));
                }
                e.childTokens && (n.childTokens[e.name] = e.childTokens);
              })),
            e.renderer)
          ) {
            const n = St.defaults.renderer || new $t();
            for (const t in e.renderer) {
              const r = n[t];
              n[t] = (...s) => {
                let i = e.renderer[t].apply(n, s);
                return !1 === i && (i = r.apply(n, s)), i;
              };
            }
            t.renderer = n;
          }
          if (e.tokenizer) {
            const n = St.defaults.tokenizer || new gt();
            for (const t in e.tokenizer) {
              const r = n[t];
              n[t] = (...s) => {
                let i = e.tokenizer[t].apply(n, s);
                return !1 === i && (i = r.apply(n, s)), i;
              };
            }
            t.tokenizer = n;
          }
          if (e.walkTokens) {
            const n = St.defaults.walkTokens;
            t.walkTokens = function (t) {
              e.walkTokens.call(this, t), n && n.call(this, t);
            };
          }
          r && (t.extensions = n), St.setOptions(t);
        });
      }),
      (St.walkTokens = function (e, t) {
        for (const n of e)
          switch ((t.call(St, n), n.type)) {
            case "table":
              for (const e of n.header) St.walkTokens(e.tokens, t);
              for (const e of n.rows)
                for (const n of e) St.walkTokens(n.tokens, t);
              break;
            case "list":
              St.walkTokens(n.items, t);
              break;
            default:
              St.defaults.extensions &&
              St.defaults.extensions.childTokens &&
              St.defaults.extensions.childTokens[n.type]
                ? St.defaults.extensions.childTokens[n.type].forEach(function (
                    e
                  ) {
                    St.walkTokens(n[e], t);
                  })
                : n.tokens && St.walkTokens(n.tokens, t);
          }
      }),
      (St.parseInline = function (e, t) {
        if (null == e)
          throw new Error(
            "marked.parseInline(): input parameter is undefined or null"
          );
        if ("string" != typeof e)
          throw new Error(
            "marked.parseInline(): input parameter is of type " +
              Object.prototype.toString.call(e) +
              ", string expected"
          );
        ht((t = ut({}, St.defaults, t || {})));
        try {
          const n = kt.lexInline(e, t);
          return (
            t.walkTokens && St.walkTokens(n, t.walkTokens), Ct.parseInline(n, t)
          );
        } catch (e) {
          if (
            ((e.message +=
              "\nPlease report this to https://github.com/markedjs/marked."),
            t.silent)
          )
            return (
              "<p>An error occurred:</p><pre>" +
              Je(e.message + "", !0) +
              "</pre>"
            );
          throw e;
        }
      }),
      (St.Parser = Ct),
      (St.parser = Ct.parse),
      (St.Renderer = $t),
      (St.TextRenderer = xt),
      (St.Lexer = kt),
      (St.lexer = kt.lex),
      (St.Tokenizer = gt),
      (St.Slugger = _t),
      (St.parse = St),
      Ct.parse,
      kt.lex;
    "undefined" != typeof globalThis
      ? globalThis
      : "undefined" != typeof window
      ? window
      : "undefined" != typeof global
      ? global
      : "undefined" != typeof self && self;
    var Rt,
      Et = { exports: {} };
    (Rt = Et),
      (function (e, t) {
        Rt.exports = t();
      })(0, function () {
        var e = [],
          t = [],
          n = {},
          r = {},
          s = {};
        function i(e) {
          return "string" == typeof e ? new RegExp("^" + e + "$", "i") : e;
        }
        function o(e, t) {
          return e === t
            ? t
            : e === e.toLowerCase()
            ? t.toLowerCase()
            : e === e.toUpperCase()
            ? t.toUpperCase()
            : e[0] === e[0].toUpperCase()
            ? t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()
            : t.toLowerCase();
        }
        function a(e, t) {
          return e.replace(/\$(\d{1,2})/g, function (e, n) {
            return t[n] || "";
          });
        }
        function c(e, t) {
          return e.replace(t[0], function (n, r) {
            var s = a(t[1], arguments);
            return o("" === n ? e[r - 1] : n, s);
          });
        }
        function l(e, t, r) {
          if (!e.length || n.hasOwnProperty(e)) return t;
          for (var s = r.length; s--; ) {
            var i = r[s];
            if (i[0].test(t)) return c(t, i);
          }
          return t;
        }
        function u(e, t, n) {
          return function (r) {
            var s = r.toLowerCase();
            return t.hasOwnProperty(s)
              ? o(r, s)
              : e.hasOwnProperty(s)
              ? o(r, e[s])
              : l(s, r, n);
          };
        }
        function d(e, t, n, r) {
          return function (r) {
            var s = r.toLowerCase();
            return (
              !!t.hasOwnProperty(s) ||
              (!e.hasOwnProperty(s) && l(s, s, n) === s)
            );
          };
        }
        function p(e, t, n) {
          return (n ? t + " " : "") + (1 === t ? p.singular(e) : p.plural(e));
        }
        return (
          (p.plural = u(s, r, e)),
          (p.isPlural = d(s, r, e)),
          (p.singular = u(r, s, t)),
          (p.isSingular = d(r, s, t)),
          (p.addPluralRule = function (t, n) {
            e.push([i(t), n]);
          }),
          (p.addSingularRule = function (e, n) {
            t.push([i(e), n]);
          }),
          (p.addUncountableRule = function (e) {
            "string" != typeof e
              ? (p.addPluralRule(e, "$0"), p.addSingularRule(e, "$0"))
              : (n[e.toLowerCase()] = !0);
          }),
          (p.addIrregularRule = function (e, t) {
            (t = t.toLowerCase()),
              (e = e.toLowerCase()),
              (s[e] = t),
              (r[t] = e);
          }),
          [
            ["I", "we"],
            ["me", "us"],
            ["he", "they"],
            ["she", "they"],
            ["them", "them"],
            ["myself", "ourselves"],
            ["yourself", "yourselves"],
            ["itself", "themselves"],
            ["herself", "themselves"],
            ["himself", "themselves"],
            ["themself", "themselves"],
            ["is", "are"],
            ["was", "were"],
            ["has", "have"],
            ["this", "these"],
            ["that", "those"],
            ["echo", "echoes"],
            ["dingo", "dingoes"],
            ["volcano", "volcanoes"],
            ["tornado", "tornadoes"],
            ["torpedo", "torpedoes"],
            ["genus", "genera"],
            ["viscus", "viscera"],
            ["stigma", "stigmata"],
            ["stoma", "stomata"],
            ["dogma", "dogmata"],
            ["lemma", "lemmata"],
            ["schema", "schemata"],
            ["anathema", "anathemata"],
            ["ox", "oxen"],
            ["axe", "axes"],
            ["die", "dice"],
            ["yes", "yeses"],
            ["foot", "feet"],
            ["eave", "eaves"],
            ["goose", "geese"],
            ["tooth", "teeth"],
            ["quiz", "quizzes"],
            ["human", "humans"],
            ["proof", "proofs"],
            ["carve", "carves"],
            ["valve", "valves"],
            ["looey", "looies"],
            ["thief", "thieves"],
            ["groove", "grooves"],
            ["pickaxe", "pickaxes"],
            ["passerby", "passersby"],
          ].forEach(function (e) {
            return p.addIrregularRule(e[0], e[1]);
          }),
          [
            [/s?$/i, "s"],
            [/[^\u0000-\u007F]$/i, "$0"],
            [/([^aeiou]ese)$/i, "$1"],
            [/(ax|test)is$/i, "$1es"],
            [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
            [/(e[mn]u)s?$/i, "$1s"],
            [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
            [
              /(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,
              "$1i",
            ],
            [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
            [/(seraph|cherub)(?:im)?$/i, "$1im"],
            [/(her|at|gr)o$/i, "$1oes"],
            [
              /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i,
              "$1a",
            ],
            [
              /(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i,
              "$1a",
            ],
            [/sis$/i, "ses"],
            [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
            [/([^aeiouy]|qu)y$/i, "$1ies"],
            [/([^ch][ieo][ln])ey$/i, "$1ies"],
            [/(x|ch|ss|sh|zz)$/i, "$1es"],
            [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
            [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
            [/(pe)(?:rson|ople)$/i, "$1ople"],
            [/(child)(?:ren)?$/i, "$1ren"],
            [/eaux$/i, "$0"],
            [/m[ae]n$/i, "men"],
            ["thou", "you"],
          ].forEach(function (e) {
            return p.addPluralRule(e[0], e[1]);
          }),
          [
            [/s$/i, ""],
            [/(ss)$/i, "$1"],
            [
              /(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i,
              "$1fe",
            ],
            [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
            [/ies$/i, "y"],
            [
              /\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i,
              "$1ie",
            ],
            [/\b(mon|smil)ies$/i, "$1ey"],
            [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
            [/(seraph|cherub)im$/i, "$1"],
            [
              /(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i,
              "$1",
            ],
            [
              /(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i,
              "$1sis",
            ],
            [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
            [/(test)(?:is|es)$/i, "$1is"],
            [
              /(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,
              "$1us",
            ],
            [
              /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i,
              "$1um",
            ],
            [
              /(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i,
              "$1on",
            ],
            [/(alumn|alg|vertebr)ae$/i, "$1a"],
            [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
            [/(matr|append)ices$/i, "$1ix"],
            [/(pe)(rson|ople)$/i, "$1rson"],
            [/(child)ren$/i, "$1"],
            [/(eau)x?$/i, "$1"],
            [/men$/i, "man"],
          ].forEach(function (e) {
            return p.addSingularRule(e[0], e[1]);
          }),
          [
            "adulthood",
            "advice",
            "agenda",
            "aid",
            "aircraft",
            "alcohol",
            "ammo",
            "analytics",
            "anime",
            "athletics",
            "audio",
            "bison",
            "blood",
            "bream",
            "buffalo",
            "butter",
            "carp",
            "cash",
            "chassis",
            "chess",
            "clothing",
            "cod",
            "commerce",
            "cooperation",
            "corps",
            "debris",
            "diabetes",
            "digestion",
            "elk",
            "energy",
            "equipment",
            "excretion",
            "expertise",
            "firmware",
            "flounder",
            "fun",
            "gallows",
            "garbage",
            "graffiti",
            "hardware",
            "headquarters",
            "health",
            "herpes",
            "highjinks",
            "homework",
            "housework",
            "information",
            "jeans",
            "justice",
            "kudos",
            "labour",
            "literature",
            "machinery",
            "mackerel",
            "mail",
            "media",
            "mews",
            "moose",
            "music",
            "mud",
            "manga",
            "news",
            "only",
            "personnel",
            "pike",
            "plankton",
            "pliers",
            "police",
            "pollution",
            "premises",
            "rain",
            "research",
            "rice",
            "salmon",
            "scissors",
            "series",
            "sewage",
            "shambles",
            "shrimp",
            "software",
            "species",
            "staff",
            "swine",
            "tennis",
            "traffic",
            "transportation",
            "trout",
            "tuna",
            "wealth",
            "welfare",
            "whiting",
            "wildebeest",
            "wildlife",
            "you",
            /pok[eé]mon$/i,
            /[^aeiou]ese$/i,
            /deer$/i,
            /fish$/i,
            /measles$/i,
            /o[iu]s$/i,
            /pox$/i,
            /sheep$/i,
          ].forEach(p.addUncountableRule),
          p
        );
      });
    var At = Et.exports,
      Tt = (function (e) {
        var t = {};
        try {
          t.WeakMap = WeakMap;
        } catch (u) {
          t.WeakMap = (function (e, t) {
            var n = t.defineProperty,
              r = t.hasOwnProperty,
              s = i.prototype;
            return (
              (s.delete = function (e) {
                return this.has(e) && delete e[this._];
              }),
              (s.get = function (e) {
                return this.has(e) ? e[this._] : void 0;
              }),
              (s.has = function (e) {
                return r.call(e, this._);
              }),
              (s.set = function (e, t) {
                return n(e, this._, { configurable: !0, value: t }), this;
              }),
              i
            );
            function i(t) {
              n(this, "_", { value: "_@ungap/weakmap" + e++ }),
                t && t.forEach(o, this);
            }
            function o(e) {
              this.set(e[0], e[1]);
            }
          })(Math.random(), Object);
        }
        var n = t.WeakMap,
          r = {};
        try {
          r.WeakSet = WeakSet;
        } catch (u) {
          !(function (e, t) {
            var n = s.prototype;
            function s() {
              t(this, "_", { value: "_@ungap/weakmap" + e++ });
            }
            (n.add = function (e) {
              return (
                this.has(e) || t(e, this._, { value: !0, configurable: !0 }),
                this
              );
            }),
              (n.has = function (e) {
                return this.hasOwnProperty.call(e, this._);
              }),
              (n.delete = function (e) {
                return this.has(e) && delete e[this._];
              }),
              (r.WeakSet = s);
          })(Math.random(), Object.defineProperty);
        }
        function s(e, t, n, r, s, i) {
          for (var o = ("selectedIndex" in t), a = o; r < s; ) {
            var c,
              l = e(n[r], 1);
            t.insertBefore(l, i),
              o &&
                a &&
                l.selected &&
                ((a = !a),
                (c = t.selectedIndex),
                (t.selectedIndex =
                  c < 0 ? r : d.call(t.querySelectorAll("option"), l))),
              r++;
          }
        }
        function i(e, t) {
          return e == t;
        }
        function o(e) {
          return e;
        }
        function a(e, t, n, r, s, i, o) {
          var a = i - s;
          if (a < 1) return -1;
          for (; a <= n - t; ) {
            for (var c = t, l = s; c < n && l < i && o(e[c], r[l]); ) c++, l++;
            if (l === i) return t;
            t = c + 1;
          }
          return -1;
        }
        function c(e, t, n, r, s) {
          return n < r ? e(t[n], 0) : 0 < n ? e(t[n - 1], -0).nextSibling : s;
        }
        function l(e, t, n, r) {
          for (; n < r; ) h(e(t[n++], -1));
        }
        var u = r.WeakSet,
          d = [].indexOf,
          p = function (e, t, n) {
            for (var r = 1, s = t; r < s; ) {
              var i = ((r + s) / 2) >>> 0;
              n < e[i] ? (s = i) : (r = 1 + i);
            }
            return r;
          },
          h = function (e) {
            return (
              e.remove ||
              function () {
                var e = this.parentNode;
                e && e.removeChild(this);
              }
            ).call(e);
          };
        function f(e, t, n, r) {
          for (
            var u = (r = r || {}).compare || i,
              d = r.node || o,
              h = null == r.before ? null : d(r.before, 0),
              f = t.length,
              m = f,
              g = 0,
              b = n.length,
              y = 0;
            g < m && y < b && u(t[g], n[y]);

          )
            g++, y++;
          for (; g < m && y < b && u(t[m - 1], n[b - 1]); ) m--, b--;
          var w = g === m,
            v = y === b;
          if (w && v) return n;
          if (w && y < b) return s(d, e, n, y, b, c(d, t, g, f, h)), n;
          if (v && g < m) return l(d, t, g, m), n;
          var k = m - g,
            $ = b - y,
            x = -1;
          if (k < $) {
            if (-1 < (x = a(n, y, b, t, g, m, u)))
              return (
                s(d, e, n, y, x, d(t[g], 0)),
                s(d, e, n, x + k, b, c(d, t, m, f, h)),
                n
              );
          } else if ($ < k && -1 < (x = a(t, g, m, n, y, b, u)))
            return l(d, t, g, x), l(d, t, x + $, m), n;
          return (
            k < 2 || $ < 2
              ? (s(d, e, n, y, b, d(t[g], 0)), l(d, t, g, m))
              : k == $ &&
                (function (e, t, n, r, s, i) {
                  for (; r < s && i(n[r], e[t - 1]); ) r++, t--;
                  return 0 === t;
                })(n, b, t, g, m, u)
              ? s(d, e, n, y, b, c(d, t, m, f, h))
              : (function (e, t, n, r, i, o, a, c, u, d, h, f, m) {
                  !(function (e, t, n, r, i, o, a, c, u) {
                    for (var d = [], p = e.length, h = a, f = 0; f < p; )
                      switch (e[f++]) {
                        case 0:
                          i++, h++;
                          break;
                        case 1:
                          d.push(r[i]),
                            s(t, n, r, i++, i, h < c ? t(o[h], 0) : u);
                          break;
                        case -1:
                          h++;
                      }
                    for (f = 0; f < p; )
                      switch (e[f++]) {
                        case 0:
                          a++;
                          break;
                        case -1:
                          -1 < d.indexOf(o[a]) ? a++ : l(t, o, a++, a);
                      }
                  })(
                    (function (e, t, n, r, s, i, o) {
                      var a,
                        c,
                        l,
                        u,
                        d,
                        p,
                        h = n + i,
                        f = [];
                      e: for (b = 0; b <= h; b++) {
                        if (50 < b) return null;
                        for (
                          p = b - 1,
                            u = b ? f[b - 1] : [0, 0],
                            d = f[b] = [],
                            a = -b;
                          a <= b;
                          a += 2
                        ) {
                          for (
                            c =
                              (l =
                                a === -b ||
                                (a !== b && u[p + a - 1] < u[p + a + 1])
                                  ? u[p + a + 1]
                                  : u[p + a - 1] + 1) - a;
                            l < i && c < n && o(r[s + l], e[t + c]);

                          )
                            l++, c++;
                          if (l === i && c === n) break e;
                          d[b + a] = l;
                        }
                      }
                      for (
                        var m = Array(b / 2 + h / 2),
                          g = m.length - 1,
                          b = f.length - 1;
                        0 <= b;
                        b--
                      ) {
                        for (
                          ;
                          0 < l && 0 < c && o(r[s + l - 1], e[t + c - 1]);

                        )
                          (m[g--] = 0), l--, c--;
                        if (!b) break;
                        (p = b - 1),
                          (u = b ? f[b - 1] : [0, 0]),
                          (a = l - c) == -b ||
                          (a !== b && u[p + a - 1] < u[p + a + 1])
                            ? (c--, (m[g--] = 1))
                            : (l--, (m[g--] = -1));
                      }
                      return m;
                    })(n, r, o, a, c, d, f) ||
                      (function (e, t, n, r, s, i, o, a) {
                        var c = 0,
                          l = r < a ? r : a,
                          u = Array(l++),
                          d = Array(l);
                        d[0] = -1;
                        for (var h = 1; h < l; h++) d[h] = o;
                        for (var f = s.slice(i, o), m = t; m < n; m++) {
                          var g,
                            b = f.indexOf(e[m]);
                          -1 < b &&
                            -1 < (c = p(d, l, (g = b + i))) &&
                            ((d[c] = g),
                            (u[c] = { newi: m, oldi: g, prev: u[c - 1] }));
                        }
                        for (c = --l, --o; d[c] > o; ) --c;
                        l = a + r - c;
                        var y = Array(l),
                          w = u[c];
                        for (--n; w; ) {
                          for (var v = w.newi, k = w.oldi; v < n; )
                            (y[--l] = 1), --n;
                          for (; k < o; ) (y[--l] = -1), --o;
                          (y[--l] = 0), --n, --o, (w = w.prev);
                        }
                        for (; t <= n; ) (y[--l] = 1), --n;
                        for (; i <= o; ) (y[--l] = -1), --o;
                        return y;
                      })(n, r, i, o, a, c, u, d),
                    e,
                    t,
                    n,
                    r,
                    a,
                    c,
                    h,
                    m
                  );
                })(d, e, n, y, b, $, t, g, m, k, f, u, h),
            n
          );
        }
        var m = {};
        function g(t, n) {
          n = n || {};
          var r = e.createEvent("CustomEvent");
          return r.initCustomEvent(t, !!n.bubbles, !!n.cancelable, n.detail), r;
        }
        m.CustomEvent =
          "function" == typeof CustomEvent
            ? CustomEvent
            : ((g["prototype"] = new g("").constructor.prototype), g);
        var b = m.CustomEvent,
          y = {};
        try {
          y.Map = Map;
        } catch (u) {
          y.Map = function () {
            var e = 0,
              t = [],
              n = [];
            return {
              delete: function (s) {
                var i = r(s);
                return i && (t.splice(e, 1), n.splice(e, 1)), i;
              },
              forEach: function (e, r) {
                t.forEach(function (t, s) {
                  e.call(r, n[s], t, this);
                }, this);
              },
              get: function (t) {
                return r(t) ? n[e] : void 0;
              },
              has: r,
              set: function (s, i) {
                return (n[r(s) ? e : t.push(s) - 1] = i), this;
              },
            };
            function r(n) {
              return -1 < (e = t.indexOf(n));
            }
          };
        }
        var w = y.Map;
        function v() {
          return this;
        }
        function k(e, t) {
          var n = "_" + e + "$";
          return {
            get: function () {
              return this[n] || $(this, n, t.call(this, e));
            },
            set: function (e) {
              $(this, n, e);
            },
          };
        }
        var $ = function (e, t, n) {
          return Object.defineProperty(e, t, {
            configurable: !0,
            value:
              "function" == typeof n
                ? function () {
                    return (e._wire$ = n.apply(this, arguments));
                  }
                : n,
          })[t];
        };
        Object.defineProperties(v.prototype, {
          ELEMENT_NODE: { value: 1 },
          nodeType: { value: -1 },
        });
        var x,
          _,
          C,
          S,
          R,
          E,
          A = {},
          T = {},
          L = [],
          P = T.hasOwnProperty,
          I = 0,
          D = {
            attributes: A,
            define: function (e, t) {
              e.indexOf("-") < 0
                ? (e in T || (I = L.push(e)), (T[e] = t))
                : (A[e] = t);
            },
            invoke: function (e, t) {
              for (var n = 0; n < I; n++) {
                var r = L[n];
                if (P.call(e, r)) return T[r](e[r], t);
              }
            },
          },
          N =
            Array.isArray ||
            ((_ = (x = {}.toString).call([])),
            function (e) {
              return x.call(e) === _;
            }),
          j =
            ((C = e),
            (S = "fragment"),
            (E =
              "content" in z((R = "template"))
                ? function (e) {
                    var t = z(R);
                    return (t.innerHTML = e), t.content;
                  }
                : function (e) {
                    var t,
                      n = z(S),
                      r = z(R);
                    return (
                      O(
                        n,
                        /^[^\S]*?<(col(?:group)?|t(?:head|body|foot|r|d|h))/i.test(
                          e
                        )
                          ? ((t = RegExp.$1),
                            (r.innerHTML = "<table>" + e + "</table>"),
                            r.querySelectorAll(t))
                          : ((r.innerHTML = e), r.childNodes)
                      ),
                      n
                    );
                  }),
            function (e, t) {
              return (
                "svg" === t
                  ? function (e) {
                      var t = z(S),
                        n = z("div");
                      return (
                        (n.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg">' +
                          e +
                          "</svg>"),
                        O(t, n.firstChild.childNodes),
                        t
                      );
                    }
                  : E
              )(e);
            });
        function O(e, t) {
          for (var n = t.length; n--; ) e.appendChild(t[0]);
        }
        function z(e) {
          return e === S
            ? C.createDocumentFragment()
            : C.createElementNS("http://www.w3.org/1999/xhtml", e);
        }
        var M,
          U,
          W,
          q,
          F,
          B,
          H,
          G,
          V,
          K =
            ((U = "appendChild"),
            (W = "cloneNode"),
            (q = "createTextNode"),
            (B = (F = "importNode") in (M = e)),
            (H = M.createDocumentFragment())[U](M[q]("g")),
            H[U](M[q]("")),
            (B ? M[F](H, !0) : H[W](!0)).childNodes.length < 2
              ? function e(t, n) {
                  for (
                    var r = t[W](), s = t.childNodes || [], i = s.length, o = 0;
                    n && o < i;
                    o++
                  )
                    r[U](e(s[o], n));
                  return r;
                }
              : B
              ? M[F]
              : function (e, t) {
                  return e[W](!!t);
                }),
          Y =
            "".trim ||
            function () {
              return String(this).replace(/^\s+|\s+/g, "");
            },
          Z = "-" + Math.random().toFixed(6) + "%",
          J = !1;
        try {
          (G = e.createElement("template")),
            (V = "tabindex"),
            ("content" in G &&
              ((G.innerHTML = "<p " + V + '="' + Z + '"></p>'),
              G.content.childNodes[0].getAttribute(V) == Z)) ||
              ((Z = "_dt: " + Z.slice(1, -1) + ";"), (J = !0));
        } catch (u) {}
        var Q = "\x3c!--" + Z + "--\x3e",
          X = /^(?:style|textarea)$/i,
          ee =
            /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i,
          te = " \\f\\n\\r\\t",
          ne = "[^" + te + "\\/>\"'=]+",
          re = "[" + te + "]+" + ne,
          se = "<([A-Za-z]+[A-Za-z0-9:._-]*)((?:",
          ie =
            "(?:\\s*=\\s*(?:'[^']*?'|\"[^\"]*?\"|<[^>]*?>|" +
            ne.replace("\\/", "") +
            "))?)",
          oe = new RegExp(se + re + ie + "+)([" + te + "]*/?>)", "g"),
          ae = new RegExp(se + re + ie + "*)([" + te + "]*/>)", "g"),
          ce = new RegExp("(" + re + "\\s*=\\s*)(['\"]?)" + Q + "\\2", "gi");
        function le(e, t, n, r) {
          return "<" + t + n.replace(ce, ue) + r;
        }
        function ue(e, t, n) {
          return t + (n || '"') + Z + (n || '"');
        }
        function de(e, t, n) {
          return ee.test(t) ? e : "<" + t + n + "></" + t + ">";
        }
        var pe = J
          ? function (e, t) {
              var n = t.join(" ");
              return t.slice.call(e, 0).sort(function (e, t) {
                return n.indexOf(e.name) <= n.indexOf(t.name) ? -1 : 1;
              });
            }
          : function (e, t) {
              return t.slice.call(e, 0);
            };
        function he(t, n, r, s) {
          for (var i = t.childNodes, o = i.length, a = 0; a < o; ) {
            var c = i[a];
            switch (c.nodeType) {
              case 1:
                var l = s.concat(a);
                !(function (t, n, r, s) {
                  for (
                    var i,
                      o = t.attributes,
                      a = [],
                      c = [],
                      l = pe(o, r),
                      u = l.length,
                      d = 0;
                    d < u;

                  ) {
                    var p = l[d++],
                      h = p.value === Z;
                    if (h || 1 < (i = p.value.split(Q)).length) {
                      var f = p.name;
                      if (a.indexOf(f) < 0) {
                        a.push(f);
                        var m = r
                            .shift()
                            .replace(
                              h
                                ? /^(?:|[\S\s]*?\s)(\S+?)\s*=\s*('|")?$/
                                : new RegExp(
                                    "^(?:|[\\S\\s]*?\\s)(" +
                                      f +
                                      ")\\s*=\\s*('|\")[\\S\\s]*",
                                    "i"
                                  ),
                              "$1"
                            ),
                          g = o[m] || o[m.toLowerCase()];
                        if (h) n.push(fe(g, s, m, null));
                        else {
                          for (var b = i.length - 2; b--; ) r.shift();
                          n.push(fe(g, s, m, i));
                        }
                      }
                      c.push(p);
                    }
                  }
                  for (
                    var y =
                      (d = 0) < (u = c.length) &&
                      J &&
                      !("ownerSVGElement" in t);
                    d < u;

                  ) {
                    var w = c[d++];
                    y && (w.value = ""), t.removeAttribute(w.name);
                  }
                  var v = t.nodeName;
                  if (/^script$/i.test(v)) {
                    var k = e.createElement(v);
                    for (u = o.length, d = 0; d < u; )
                      k.setAttributeNode(o[d++].cloneNode(!0));
                    (k.textContent = t.textContent),
                      t.parentNode.replaceChild(k, t);
                  }
                })(c, n, r, l),
                  he(c, n, r, l);
                break;
              case 8:
                var u = c.textContent;
                if (u === Z)
                  r.shift(),
                    n.push(
                      X.test(t.nodeName)
                        ? me(t, s)
                        : { type: "any", node: c, path: s.concat(a) }
                    );
                else
                  switch (u.slice(0, 2)) {
                    case "/*":
                      if ("*/" !== u.slice(-2)) break;
                    case "👻":
                      t.removeChild(c), a--, o--;
                  }
                break;
              case 3:
                X.test(t.nodeName) &&
                  Y.call(c.textContent) === Q &&
                  (r.shift(), n.push(me(t, s)));
            }
            a++;
          }
        }
        function fe(e, t, n, r) {
          return { type: "attr", node: e, path: t, name: n, sparse: r };
        }
        function me(e, t) {
          return { type: "text", node: e, path: t };
        }
        var ge,
          be =
            ((ge = new n()),
            {
              get: function (e) {
                return ge.get(e);
              },
              set: function (e, t) {
                return ge.set(e, t), t;
              },
            });
        function ye(e, t) {
          var n = (
              e.convert ||
              function (e) {
                return e.join(Q).replace(ae, de).replace(oe, le);
              }
            )(t),
            r = e.transform;
          r && (n = r(n));
          var s = j(n, e.type);
          ve(s);
          var i = [];
          return (
            he(s, i, t.slice(0), []),
            {
              content: s,
              updates: function (n) {
                for (var r = [], s = i.length, o = 0, a = 0; o < s; ) {
                  var c = i[o++],
                    l = (function (e, t) {
                      for (var n = t.length, r = 0; r < n; )
                        e = e.childNodes[t[r++]];
                      return e;
                    })(n, c.path);
                  switch (c.type) {
                    case "any":
                      r.push({ fn: e.any(l, []), sparse: !1 });
                      break;
                    case "attr":
                      var u = c.sparse,
                        d = e.attribute(l, c.name, c.node);
                      null === u
                        ? r.push({ fn: d, sparse: !1 })
                        : ((a += u.length - 2),
                          r.push({ fn: d, sparse: !0, values: u }));
                      break;
                    case "text":
                      r.push({ fn: e.text(l), sparse: !1 }),
                        (l.textContent = "");
                  }
                }
                return (
                  (s += a),
                  function () {
                    var e = arguments.length;
                    if (s !== e - 1)
                      throw new Error(
                        e -
                          1 +
                          " values instead of " +
                          s +
                          "\n" +
                          t.join("${value}")
                      );
                    for (var i = 1, o = 1; i < e; ) {
                      var a = r[i - o];
                      if (a.sparse) {
                        var c = a.values,
                          l = c[0],
                          u = 1,
                          d = c.length;
                        for (o += d - 2; u < d; ) l += arguments[i++] + c[u++];
                        a.fn(l);
                      } else a.fn(arguments[i++]);
                    }
                    return n;
                  }
                );
              },
            }
          );
        }
        var we = [];
        function ve(e) {
          for (var t = e.childNodes, n = t.length; n--; ) {
            var r = t[n];
            1 !== r.nodeType &&
              0 === Y.call(r.textContent).length &&
              e.removeChild(r);
          }
        }
        var ke,
          $e,
          xe =
            ((ke = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i),
            ($e = /([^A-Z])([A-Z]+)/g),
            function (e, t) {
              return "ownerSVGElement" in e
                ? (function (e, t) {
                    var n;
                    return (
                      ((n = t
                        ? t.cloneNode(!0)
                        : (e.setAttribute("style", "--hyper:style;"),
                          e.getAttributeNode("style"))).value = ""),
                      e.setAttributeNode(n),
                      Ce(n, !0)
                    );
                  })(e, t)
                : Ce(e.style, !1);
            });
        function _e(e, t, n) {
          return t + "-" + n.toLowerCase();
        }
        function Ce(e, t) {
          var n, r;
          return function (s) {
            var i, o, a, c;
            switch (typeof s) {
              case "object":
                if (s) {
                  if ("object" === n) {
                    if (!t && r !== s) for (o in r) o in s || (e[o] = "");
                  } else t ? (e.value = "") : (e.cssText = "");
                  for (o in ((i = t ? {} : e), s))
                    (a =
                      "number" != typeof (c = s[o]) || ke.test(o)
                        ? c
                        : c + "px"),
                      !t && /^--/.test(o) ? i.setProperty(o, a) : (i[o] = a);
                  (n = "object"),
                    t
                      ? (e.value = (function (e) {
                          var t,
                            n = [];
                          for (t in e)
                            n.push(t.replace($e, _e), ":", e[t], ";");
                          return n.join("");
                        })((r = i)))
                      : (r = s);
                  break;
                }
              default:
                r != s &&
                  ((n = "string"),
                  (r = s),
                  t ? (e.value = s || "") : (e.cssText = s || ""));
            }
          };
        }
        var Se,
          Re,
          Ee =
            ((Se = [].slice),
            ((Re = Ae.prototype).ELEMENT_NODE = 1),
            (Re.nodeType = 111),
            (Re.remove = function (e) {
              var t,
                n = this.childNodes,
                r = this.firstChild,
                s = this.lastChild;
              return (
                (this._ = null),
                e && 2 === n.length
                  ? s.parentNode.removeChild(s)
                  : ((t = this.ownerDocument.createRange()).setStartBefore(
                      e ? n[1] : r
                    ),
                    t.setEndAfter(s),
                    t.deleteContents()),
                r
              );
            }),
            (Re.valueOf = function (e) {
              var t = this._,
                n = null == t;
              if (
                (n &&
                  (t = this._ = this.ownerDocument.createDocumentFragment()),
                n || e)
              )
                for (var r = this.childNodes, s = 0, i = r.length; s < i; s++)
                  t.appendChild(r[s]);
              return t;
            }),
            Ae);
        function Ae(e) {
          var t = (this.childNodes = Se.call(e, 0));
          (this.firstChild = t[0]),
            (this.lastChild = t[t.length - 1]),
            (this.ownerDocument = t[0].ownerDocument),
            (this._ = null);
        }
        function Te(e) {
          return { html: e };
        }
        function Le(e, t) {
          switch (e.nodeType) {
            case We:
              return 1 / t < 0
                ? t
                  ? e.remove(!0)
                  : e.lastChild
                : t
                ? e.valueOf(!0)
                : e.firstChild;
            case Ue:
              return Le(e.render(), t);
            default:
              return e;
          }
        }
        function Pe(e, t) {
          t(e.placeholder),
            "text" in e
              ? Promise.resolve(e.text).then(String).then(t)
              : "any" in e
              ? Promise.resolve(e.any).then(t)
              : "html" in e
              ? Promise.resolve(e.html).then(Te).then(t)
              : Promise.resolve(D.invoke(e, t)).then(t);
        }
        function Ie(e) {
          return null != e && "then" in e;
        }
        var De,
          Ne,
          je,
          Oe,
          ze,
          Me = "ownerSVGElement",
          Ue = v.prototype.nodeType,
          We = Ee.prototype.nodeType,
          qe =
            ((Ne = (De = { Event: b, WeakSet: u }).Event),
            (je = De.WeakSet),
            (Oe = !0),
            (ze = null),
            function (e) {
              return (
                Oe &&
                  ((Oe = !Oe),
                  (ze = new je()),
                  (function (e) {
                    var t = new je(),
                      n = new je();
                    try {
                      new MutationObserver(o).observe(e, {
                        subtree: !0,
                        childList: !0,
                      });
                    } catch (t) {
                      var r = 0,
                        s = [],
                        i = function (e) {
                          s.push(e),
                            clearTimeout(r),
                            (r = setTimeout(function () {
                              o(s.splice((r = 0), s.length));
                            }, 0));
                        };
                      e.addEventListener(
                        "DOMNodeRemoved",
                        function (e) {
                          i({ addedNodes: [], removedNodes: [e.target] });
                        },
                        !0
                      ),
                        e.addEventListener(
                          "DOMNodeInserted",
                          function (e) {
                            i({ addedNodes: [e.target], removedNodes: [] });
                          },
                          !0
                        );
                    }
                    function o(e) {
                      for (var r, s = e.length, i = 0; i < s; i++)
                        a((r = e[i]).removedNodes, "disconnected", n, t),
                          a(r.addedNodes, "connected", t, n);
                    }
                    function a(e, t, n, r) {
                      for (
                        var s, i = new Ne(t), o = e.length, a = 0;
                        a < o;
                        1 === (s = e[a++]).nodeType &&
                        (function e(t, n, r, s, i) {
                          ze.has(t) &&
                            !s.has(t) &&
                            (i.delete(t), s.add(t), t.dispatchEvent(n));
                          for (
                            var o = t.children || [], a = o.length, c = 0;
                            c < a;
                            e(o[c++], n, r, s, i)
                          );
                        })(s, i, t, n, r)
                      );
                    }
                  })(e.ownerDocument)),
                ze.add(e),
                e
              );
            }),
          Fe = /^(?:form|list)$/i,
          Be = [].slice;
        function He(t) {
          return (
            (this.type = t),
            (function (t) {
              var n = we,
                r = ve;
              return function (s) {
                var i, o, a;
                return (
                  n !== s &&
                    ((i = t),
                    (o = n = s),
                    (a = be.get(o) || be.set(o, ye(i, o))),
                    (r = a.updates(K.call(e, a.content, !0)))),
                  r.apply(null, arguments)
                );
              };
            })(this)
          );
        }
        var Ge = !(He.prototype = {
            attribute: function (e, t, n) {
              var r,
                s = Me in e;
              if ("style" === t) return xe(e, n, s);
              if ("." === t.slice(0, 1))
                return (
                  (l = e),
                  (u = t.slice(1)),
                  s
                    ? function (e) {
                        try {
                          l[u] = e;
                        } catch (t) {
                          l.setAttribute(u, e);
                        }
                      }
                    : function (e) {
                        l[u] = e;
                      }
                );
              if ("?" === t.slice(0, 1))
                return (
                  (o = e),
                  (a = t.slice(1)),
                  function (e) {
                    c !== !!e &&
                      ((c = !!e)
                        ? o.setAttribute(a, "")
                        : o.removeAttribute(a));
                  }
                );
              if (/^on/.test(t)) {
                var i = t.slice(2);
                return (
                  "connected" === i || "disconnected" === i
                    ? qe(e)
                    : t.toLowerCase() in e && (i = i.toLowerCase()),
                  function (t) {
                    r !== t &&
                      (r && e.removeEventListener(i, r, !1),
                      (r = t) && e.addEventListener(i, t, !1));
                  }
                );
              }
              if ("data" === t || (!s && t in e && !Fe.test(t)))
                return function (n) {
                  r !== n &&
                    ((r = n),
                    e[t] !== n && null == n
                      ? ((e[t] = ""), e.removeAttribute(t))
                      : (e[t] = n));
                };
              if (t in D.attributes)
                return function (n) {
                  var s = D.attributes[t](e, n);
                  r !== s &&
                    (null == (r = s)
                      ? e.removeAttribute(t)
                      : e.setAttribute(t, s));
                };
              var o,
                a,
                c,
                l,
                u,
                d = !1,
                p = n.cloneNode(!0);
              return function (t) {
                r !== t &&
                  ((r = t),
                  p.value !== t &&
                    (null == t
                      ? (d && ((d = !1), e.removeAttributeNode(p)),
                        (p.value = t))
                      : ((p.value = t),
                        d || ((d = !0), e.setAttributeNode(p)))));
              };
            },
            any: function (e, t) {
              var n,
                r = { node: Le, before: e },
                s = Me in e ? "svg" : "html",
                i = !1;
              return function o(a) {
                switch (typeof a) {
                  case "string":
                  case "number":
                  case "boolean":
                    i
                      ? n !== a && ((n = a), (t[0].textContent = a))
                      : ((i = !0),
                        (n = a),
                        (t = f(
                          e.parentNode,
                          t,
                          [((c = a), e.ownerDocument.createTextNode(c))],
                          r
                        )));
                    break;
                  case "function":
                    o(a(e));
                    break;
                  case "object":
                  case "undefined":
                    if (null == a) {
                      (i = !1), (t = f(e.parentNode, t, [], r));
                      break;
                    }
                  default:
                    if (((i = !1), N((n = a))))
                      if (0 === a.length)
                        t.length && (t = f(e.parentNode, t, [], r));
                      else
                        switch (typeof a[0]) {
                          case "string":
                          case "number":
                          case "boolean":
                            o({ html: a });
                            break;
                          case "object":
                            if (
                              (N(a[0]) && (a = a.concat.apply([], a)), Ie(a[0]))
                            ) {
                              Promise.all(a).then(o);
                              break;
                            }
                          default:
                            t = f(e.parentNode, t, a, r);
                        }
                    else
                      "ELEMENT_NODE" in a
                        ? (t = f(
                            e.parentNode,
                            t,
                            11 === a.nodeType ? Be.call(a.childNodes) : [a],
                            r
                          ))
                        : Ie(a)
                        ? a.then(o)
                        : "placeholder" in a
                        ? Pe(a, o)
                        : "text" in a
                        ? o(String(a.text))
                        : "any" in a
                        ? o(a.any)
                        : "html" in a
                        ? (t = f(
                            e.parentNode,
                            t,
                            Be.call(
                              j([].concat(a.html).join(""), s).childNodes
                            ),
                            r
                          ))
                        : o("length" in a ? Be.call(a) : D.invoke(a, o));
                }
                var c;
              };
            },
            text: function (e) {
              var t;
              return function n(r) {
                var s;
                t !== r &&
                  ("object" == (s = typeof (t = r)) && r
                    ? Ie(r)
                      ? r.then(n)
                      : "placeholder" in r
                      ? Pe(r, n)
                      : n(
                          "text" in r
                            ? String(r.text)
                            : "any" in r
                            ? r.any
                            : "html" in r
                            ? [].concat(r.html).join("")
                            : "length" in r
                            ? Be.call(r).join("")
                            : D.invoke(r, n)
                        )
                    : "function" == s
                    ? n(r(e))
                    : (e.textContent = null == r ? "" : r));
              };
            },
          }),
          Ve = function (t) {
            var r,
              s,
              i,
              o,
              a =
                ((r = (e.defaultView.navigator || {}).userAgent),
                /(Firefox|Safari)\/(\d+)/.test(r) &&
                  !/(Chrom[eium]+|Android)\/(\d+)/.test(r)),
              c =
                !("raw" in t) ||
                t.propertyIsEnumerable("raw") ||
                !Object.isFrozen(t.raw);
            return (
              a || c
                ? ((s = {}),
                  (i = function (e) {
                    for (var t = ".", n = 0; n < e.length; n++)
                      t += e[n].length + "." + e[n];
                    return s[t] || (s[t] = e);
                  }),
                  (Ve = c
                    ? i
                    : ((o = new n()),
                      function (e) {
                        return o.get(e) || ((n = i((t = e))), o.set(t, n), n);
                        var t, n;
                      })))
                : (Ge = !0),
              Ke(t)
            );
          };
        function Ke(e) {
          return Ge ? e : Ve(e);
        }
        function Ye(e) {
          for (var t = arguments.length, n = [Ke(e)], r = 1; r < t; )
            n.push(arguments[r++]);
          return n;
        }
        var Ze = new n(),
          Je = function (e) {
            var t, n, r;
            return function () {
              var s = Ye.apply(null, arguments);
              return (
                r !== s[0]
                  ? ((r = s[0]), (n = new He(e)), (t = Xe(n.apply(n, s))))
                  : n.apply(n, s),
                t
              );
            };
          },
          Qe = function (e, t) {
            var n = t.indexOf(":"),
              r = Ze.get(e),
              s = t;
            return (
              -1 < n && ((s = t.slice(n + 1)), (t = t.slice(0, n) || "html")),
              r || Ze.set(e, (r = {})),
              r[s] || (r[s] = Je(t))
            );
          },
          Xe = function (e) {
            var t = e.childNodes,
              n = t.length;
            return 1 === n ? t[0] : n ? new Ee(t) : e;
          },
          et = new n();
        function tt() {
          var e = et.get(this),
            t = Ye.apply(null, arguments);
          return (
            e && e.template === t[0]
              ? e.tagger.apply(null, t)
              : function (e) {
                  var t = new He(Me in this ? "svg" : "html");
                  et.set(this, { tagger: t, template: e }),
                    (this.textContent = ""),
                    this.appendChild(t.apply(null, arguments));
                }.apply(this, t),
            this
          );
        }
        var nt,
          rt,
          st,
          it,
          ot = D.define,
          at = He.prototype;
        function ct(e) {
          return arguments.length < 2
            ? null == e
              ? Je("html")
              : "string" == typeof e
              ? ct.wire(null, e)
              : "raw" in e
              ? Je("html")(e)
              : "nodeType" in e
              ? ct.bind(e)
              : Qe(e, "html")
            : ("raw" in e ? Je("html") : ct.wire).apply(null, arguments);
        }
        return (
          (ct.Component = v),
          (ct.bind = function (e) {
            return tt.bind(e);
          }),
          (ct.define = ot),
          (ct.diff = f),
          ((ct.hyper = ct).observe = qe),
          (ct.tagger = at),
          (ct.wire = function (e, t) {
            return null == e ? Je(t || "html") : Qe(e, t || "html");
          }),
          (ct._ = { WeakMap: n, WeakSet: u }),
          (nt = Je),
          (rt = new n()),
          (st = Object.create),
          (it = function (e, t) {
            var n = { w: null, p: null };
            return t.set(e, n), n;
          }),
          Object.defineProperties(v, {
            for: {
              configurable: !0,
              value: function (e, t) {
                return (function (e, t, r, s) {
                  var i,
                    o,
                    a,
                    c = t.get(e) || it(e, t);
                  switch (typeof s) {
                    case "object":
                    case "function":
                      var l = c.w || (c.w = new n());
                      return (
                        l.get(s) ||
                        ((i = l), (o = s), (a = new e(r)), i.set(o, a), a)
                      );
                    default:
                      var u = c.p || (c.p = st(null));
                      return u[s] || (u[s] = new e(r));
                  }
                })(
                  this,
                  rt.get(e) || ((r = e), (s = new w()), rt.set(r, s), s),
                  e,
                  null == t ? "default" : t
                );
                var r, s;
              },
            },
          }),
          Object.defineProperties(v.prototype, {
            handleEvent: {
              value: function (e) {
                var t = e.currentTarget;
                this[
                  ("getAttribute" in t && t.getAttribute("data-call")) ||
                    "on" + e.type
                ](e);
              },
            },
            html: k("html", nt),
            svg: k("svg", nt),
            state: k("state", function () {
              return this.defaultState;
            }),
            defaultState: {
              get: function () {
                return {};
              },
            },
            dispatch: {
              value: function (e, t) {
                var n = this._wire$;
                if (n) {
                  var r = new b(e, { bubbles: !0, cancelable: !0, detail: t });
                  return (
                    (r.component = this),
                    (n.dispatchEvent ? n : n.firstChild).dispatchEvent(r)
                  );
                }
                return !1;
              },
            },
            setState: {
              value: function (e, t) {
                var n = this.state,
                  r = "function" == typeof e ? e.call(this, n) : e;
                for (var s in r) n[s] = r[s];
                return !1 !== t && this.render(), this;
              },
            },
          }),
          ct
        );
      })(document);
    /*! (c) Andrea Giammarchi (ISC) */ const Lt = $,
      Pt = ze,
      It = Tt,
      Dt = St,
      Nt = At,
      jt = class {
        constructor(e) {
          const {
            type: t,
            subtype: n,
            params: r,
          } = (function (e) {
            if (!(e = e.trim())) throw new TypeError("Invalid input.");
            let t = "",
              n = "",
              r = "",
              s = null,
              i = new Map(),
              o = "type",
              a = Array.from(e);
            for (let e = 0; e < a.length; e++) {
              const c = a[e];
              switch (o) {
                case "type":
                  if ("/" === c) {
                    o = "subtype";
                    continue;
                  }
                  t += c;
                  break;
                case "subtype":
                  if (";" === c) {
                    o = "param-start";
                    continue;
                  }
                  n += c;
                  break;
                case "param-start":
                  if (Ue.test(c) || ";" === c) continue;
                  (r += c), (o = "param-name");
                  break;
                case "param-name":
                  if ("=" === c || ";" === c) {
                    if ("=" === c) {
                      (o = "param-value"), (s = null);
                      continue;
                    }
                    i.set(r.toLowerCase(), null), (r = "");
                    continue;
                  }
                  r += c;
                  break;
                case "param-value":
                  if ('"' == c) {
                    o = "collect-quoted-string";
                    continue;
                  }
                  if (";" === c) {
                    (s = s.trimEnd()),
                      (o = "param-start"),
                      qe(i, r, s),
                      (r = "");
                    continue;
                  }
                  s = "string" == typeof s ? s + c : c;
                  break;
                case "collect-quoted-string":
                  if ('"' === c) {
                    qe(i, r, s),
                      (o = "ignore-input-until-next-param"),
                      (r = ""),
                      (s = null);
                    continue;
                  }
                  if ("\\" === c) continue;
                  s = "string" == typeof s ? s + c : c;
                  break;
                case "ignore-input-until-next-param":
                  if (";" !== c) continue;
                  o = "param-start";
                  break;
                default:
                  throw new Error(
                    `State machine error - unknown parser mode: ${o} `
                  );
              }
            }
            r && qe(i, r, s);
            if ("" === t.trim() || !Me.test(t))
              throw new TypeError("Invalid type");
            if ("" === n.trim() || !Me.test(n))
              throw new TypeError("Invalid subtype");
            return {
              type: t,
              subtype: n,
              params: Object.fromEntries(i.entries()),
            };
          })(e);
          (this.type = t.trim().toLowerCase()),
            (this.subtype = n.trimEnd().toLowerCase()),
            (this.parameters = new Map(Object.entries(r)));
        }
        get essence() {
          return `${this.type}/${this.subtype}`;
        }
        toString() {
          return (function (e) {
            const { parameters: t, essence: n } = e;
            if (!t.size) return n;
            let r = ";";
            for (const [e, n] of t.entries())
              (r += e),
                null !== n
                  ? Me.test(n)
                    ? (r += "=" + n)
                    : (r += `="${n}"`)
                  : (r += '=""'),
                (r += ";");
            return e.essence + r.slice(0, -1);
          })(this);
        }
      },
      Ot = /-/g;
    const zt = new Intl.DateTimeFormat(["en-ca-iso8601"], {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      Mt =
        ".informative, .note, .issue, .example, .ednote, .practice, .introductory";
    function Ut(e) {
      const t = new URL(e.href, document.baseURI),
        n = document.createElement("link");
      let { href: r } = t;
      switch (((n.rel = e.hint), n.rel)) {
        case "dns-prefetch":
        case "preconnect":
          (r = t.origin),
            (e.corsMode || t.origin !== document.location.origin) &&
              (n.crossOrigin = e.corsMode || "anonymous");
          break;
        case "preload":
          "as" in e && n.setAttribute("as", e.as);
      }
      return (n.href = r), e.dontRemove || n.classList.add("removeOnSave"), n;
    }
    function Wt(e) {
      e.querySelectorAll(".remove, script[data-requiremodule]").forEach((e) => {
        e.remove();
      });
    }
    function qt(e, t = "long") {
      const n = new Intl.ListFormat(s, { style: t, type: e });
      return (e, t) => {
        let r = 0;
        return n
          .formatToParts(e)
          .map(({ type: n, value: s }) =>
            "element" === n && t ? t(s, r++, e) : s
          );
      };
    }
    const Ft = qt("conjunction"),
      Bt = qt("disjunction");
    function Ht(e, t) {
      return Ft(e, t).join("");
    }
    function Gt(e, t) {
      return Bt(e, t).join("");
    }
    function Vt(e) {
      return e
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
    }
    function Kt(e) {
      return e.trim().replace(/\s+/g, " ");
    }
    function Yt(e, t = s) {
      return (
        (t = (function (e) {
          return { "zh-hans": "zh", "zh-cn": "zh" }[e] || e;
        })(t.toLowerCase())),
        new Proxy(e, {
          get(e, n) {
            const r = (e[t] && e[t][n]) || e.en[n];
            if (!r) throw new Error(`No l10n data for key: "${n}"`);
            return r;
          },
        })
      );
    }
    function Zt(e, t = "") {
      return zt.format(e).replace(Ot, t);
    }
    function Jt(e = new Date(), t = document.documentElement.lang || "en") {
      e instanceof Date || (e = new Date(e));
      const n = [t, "en"];
      return `${e.toLocaleString(n, {
        day: "2-digit",
        timeZone: "UTC",
      })} ${e.toLocaleString(n, {
        month: "long",
        timeZone: "UTC",
      })} ${e.toLocaleString(n, { year: "numeric", timeZone: "UTC" })}`;
    }
    function Qt(e, t, ...n) {
      const r = [this, e, ...n];
      if (t) {
        const n = t.split(/\s+/);
        for (const t of n) {
          const n = window[t];
          if (n)
            try {
              e = n.apply(this, r);
            } catch (e) {
              yn(
                `call to \`${t}()\` failed with: ${e}.`,
                "utils/runTransforms",
                { hint: "See developer console for stack trace." }
              ),
                console.error(e);
            }
        }
      }
      return e;
    }
    async function Xt(e, t = 864e5) {
      const n = new Request(e),
        r = new URL(n.url);
      let s, i;
      if ("caches" in window)
        try {
          if (
            ((s = await caches.open(r.origin)),
            (i = await s.match(n)),
            i && new Date(i.headers.get("Expires")) > new Date())
          )
            return i;
        } catch (e) {
          console.error("Failed to use Cache API.", e);
        }
      const o = await fetch(n);
      if (!o.ok && i)
        return console.warn("Returning a stale cached response for " + r), i;
      if (s && o.ok) {
        const e = o.clone(),
          r = new Headers(o.headers),
          i = new Date(Date.now() + t);
        r.set("Expires", i.toISOString());
        const a = new Response(await e.blob(), { headers: r });
        await s.put(n, a).catch(console.error);
      }
      return o;
    }
    function en(e, t = (e) => e) {
      const n = e.map(t),
        r = n.slice(0, -1).map((e) => It`${e}, `);
      return It`${r}${n[n.length - 1]}`;
    }
    function tn(e, t) {
      return []
        .concat(Ft(e, t))
        .map((e) => ("string" == typeof e ? It`${e}` : e));
    }
    function nn(e, t = "") {
      return rn(
        e,
        t,
        (function (e) {
          let t = 0;
          for (const n of e) t = (Math.imul(31, t) + n.charCodeAt(0)) | 0;
          return String(t);
        })(Kt(e.textContent))
      );
    }
    function rn(e, t = "", n = "", r = !1) {
      if (e.id) return e.id;
      n || (n = (e.title ? e.title : e.textContent).trim());
      let s = r ? n : n.toLowerCase();
      if (
        ((s = s
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\W+/gim, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "")),
        s
          ? (!/\.$/.test(s) && /^[a-z]/i.test(t || s)) || (s = "x" + s)
          : (s = "generatedID"),
        t && (s = `${t}-${s}`),
        e.ownerDocument.getElementById(s))
      ) {
        let t = 0,
          n = `${s}-${t}`;
        for (; e.ownerDocument.getElementById(n); ) (t += 1), (n = `${s}-${t}`);
        s = n;
      }
      return (e.id = s), s;
    }
    function sn(e) {
      const t = new Set(),
        n = "ltNodefault" in e.dataset ? "" : Kt(e.textContent),
        r = e.children[0];
      if (
        (e.dataset.lt
          ? e.dataset.lt
              .split("|")
              .map((e) => Kt(e))
              .forEach((e) => t.add(e))
          : 1 === e.childNodes.length &&
            1 === e.getElementsByTagName("abbr").length &&
            r.title
          ? t.add(r.title)
          : '""' === e.textContent && t.add("the-empty-string"),
        t.add(n),
        t.delete(""),
        e.dataset.localLt)
      ) {
        e.dataset.localLt.split("|").forEach((e) => t.add(Kt(e)));
      }
      return [...t];
    }
    function on(e, t, n = { copyAttributes: !0 }) {
      if (e.localName === t) return e;
      const r = e.ownerDocument.createElement(t);
      if (n.copyAttributes)
        for (const { name: t, value: n } of e.attributes) r.setAttribute(t, n);
      return r.append(...e.childNodes), e.replaceWith(r), r;
    }
    function an(e, t) {
      const n = t.closest(Mt);
      let r = !1;
      if (
        (n && (r = !t.closest(".normative") || !n.querySelector(".normative")),
        e.startsWith("!"))
      ) {
        if (r) return { type: "informative", illegal: !0 };
        r = !1;
      } else e.startsWith("?") && (r = !0);
      return { type: r ? "informative" : "normative", illegal: !1 };
    }
    function cn(e, t) {
      return t.append(...e.childNodes), e.appendChild(t), e;
    }
    function ln(e, t) {
      const n = [];
      let r = e.parentElement;
      for (; r; ) {
        const e = r.closest(t);
        if (!e) break;
        n.push(e), (r = e.parentElement);
      }
      return n;
    }
    function un(e) {
      const { previousSibling: t } = e;
      if (!t || t.nodeType !== Node.TEXT_NODE) return "";
      const n = t.textContent.lastIndexOf("\n");
      if (-1 === n) return "";
      const r = t.textContent.slice(n + 1);
      return /\S/.test(r) ? "" : r;
    }
    class dn extends Set {
      constructor(e = []) {
        super();
        for (const t of e) this.add(t);
      }
      add(e) {
        return this.has(e) || this.getCanonicalKey(e) ? this : super.add(e);
      }
      has(e) {
        return (
          super.has(e) ||
          [...this.keys()].some((t) => t.toLowerCase() === e.toLowerCase())
        );
      }
      delete(e) {
        return super.has(e)
          ? super.delete(e)
          : super.delete(this.getCanonicalKey(e));
      }
      getCanonicalKey(e) {
        return super.has(e)
          ? e
          : [...this.keys()].find((t) => t.toLowerCase() === e.toLowerCase());
      }
    }
    function pn(e) {
      const t = e.cloneNode(!0);
      return (
        t.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id")),
        t.querySelectorAll("dfn").forEach((e) => {
          on(e, "span", { copyAttributes: !1 });
        }),
        t.hasAttribute("id") && t.removeAttribute("id"),
        hn(t),
        t
      );
    }
    function hn(e) {
      const t = document.createTreeWalker(e, NodeFilter.SHOW_COMMENT);
      for (const e of [...fn(t)]) e.remove();
    }
    function* fn(e) {
      for (; e.nextNode(); ) yield e.currentNode;
    }
    class mn extends Map {
      constructor(e = []) {
        return (
          super(),
          e.forEach(([e, t]) => {
            this.set(e, t);
          }),
          this
        );
      }
      set(e, t) {
        return super.set(e.toLowerCase(), t), this;
      }
      get(e) {
        return super.get(e.toLowerCase());
      }
      has(e) {
        return super.has(e.toLowerCase());
      }
      delete(e) {
        return super.delete(e.toLowerCase());
      }
    }
    class gn extends Error {
      constructor(e, t, n) {
        super(e);
        const r = n.isWarning ? "ReSpecWarning" : "ReSpecError";
        Object.assign(this, { message: e, plugin: t, name: r, ...n }),
          n.elements &&
            n.elements.forEach((t) =>
              (function (e, t, n) {
                e.classList.add("respec-offending-element"),
                  e.hasAttribute("title") || e.setAttribute("title", n || t),
                  e.id || rn(e, "respec-offender");
              })(t, e, n.title)
            );
      }
      toJSON() {
        const { message: e, name: t, stack: n } = this,
          { plugin: r, hint: s, elements: i, title: o, details: a } = this;
        return {
          message: e,
          name: t,
          plugin: r,
          hint: s,
          elements: i,
          title: o,
          details: a,
          stack: n,
        };
      }
    }
    function bn(e, t, n = {}) {
      const r = { ...n, isWarning: !1 };
      Sn("error", new gn(e, t, r));
    }
    function yn(e, t, n = {}) {
      const r = { ...n, isWarning: !0 };
      Sn("warn", new gn(e, t, r));
    }
    function wn(e) {
      return e ? `\`${e}\`` : "";
    }
    function vn(e, { quotes: t } = { quotes: !1 }) {
      return Gt(e, t ? (e) => wn($n(e)) : wn);
    }
    function kn(e, { quotes: t } = { quotes: !1 }) {
      return Ht(e, t ? (e) => wn($n(e)) : wn);
    }
    function $n(e) {
      return String(e) ? `"${e}"` : "";
    }
    function xn(e, ...t) {
      return e
        .map((e, n) => {
          const r = t[n];
          if (!r) return e;
          if (!r.startsWith("[") && !r.endsWith("]")) return e + r;
          const [s, i] = r.slice(1, -1).split("|");
          if (i) {
            return `${e}[${s}](${new URL(i, "https://respec.org/docs/")})`;
          }
          return `${e}[\`${s}\`](https://respec.org/docs/#${s})`;
        })
        .join("");
    }
    const _n = "core/pubsubhub",
      Cn = new Map();
    function Sn(e, ...t) {
      if (!Cn.has(e)) return;
      if (
        (Array.from(Cn.get(e)).forEach((e) => {
          try {
            e(...t);
          } catch (t) {
            bn(`Error when calling function ${e.name}.`, _n, {
              hint: "See developer console.",
            }),
              console.error(t);
          }
        }),
        window.parent === window.self)
      )
        return;
      const n = t.map((e) => String(JSON.stringify(e.stack || e)));
      window.parent.postMessage(
        { topic: e, args: n },
        window.parent.location.origin
      );
    }
    function Rn(e, t, n = { once: !1 }) {
      return n.once
        ? Rn(e, function n(...r) {
            !(function ({ topic: e, cb: t }) {
              const n = Cn.get(e);
              if (!n || !n.has(t))
                return console.warn("Already unsubscribed:", e, t), !1;
              n.delete(t);
            })({ topic: e, cb: n }),
              t(...r);
          })
        : (Cn.has(e) ? Cn.get(e).add(t) : Cn.set(e, new Set([t])),
          { topic: e, cb: t });
    }
    t(_n, { sub: Rn });
    const En = ["githubToken", "githubUser"];
    const An = new Map([
      ["text/html", "html"],
      ["application/xml", "xml"],
    ]);
    function Tn(e, t = document) {
      const n = An.get(e);
      if (!n) {
        const t = [...An.values()].join(", ");
        throw new TypeError(`Invalid format: ${e}. Expected one of: ${t}.`);
      }
      const r = Ln(n, t);
      return `data:${e};charset=utf-8,${encodeURIComponent(r)}`;
    }
    function Ln(e, t) {
      const n = t.cloneNode(!0);
      !(function (e) {
        const { head: t, body: n, documentElement: r } = e;
        hn(e),
          e
            .querySelectorAll(".removeOnSave, #toc-nav")
            .forEach((e) => e.remove()),
          n.classList.remove("toc-sidebar"),
          Wt(r);
        const s = e.createDocumentFragment(),
          i = e.querySelector("meta[name='viewport']");
        i && t.firstChild !== i && s.appendChild(i);
        let o = e.querySelector("meta[charset], meta[content*='charset=']");
        o || (o = It`<meta charset="utf-8" />`);
        s.appendChild(o);
        const a = "ReSpec " + (window.respecVersion || "Developer Channel"),
          c = It`
    <meta name="generator" content="${a}" />
  `;
        s.appendChild(c), t.prepend(s), Sn("beforesave", r);
      })(n);
      let r = "";
      switch (e) {
        case "xml":
          r = new XMLSerializer().serializeToString(n);
          break;
        default:
          !(function (e) {
            e.querySelectorAll("style").forEach((e) => {
              e.innerHTML = `\n${e.innerHTML}\n`;
            }),
              e.querySelectorAll("head > *").forEach((e) => {
                e.outerHTML = "\n" + e.outerHTML;
              });
          })(n),
            n.doctype &&
              (r += new XMLSerializer().serializeToString(n.doctype)),
            (r += n.documentElement.outerHTML);
      }
      return r;
    }
    t("core/exporter", { rsDocToDataURL: Tn });
    class Pn {
      constructor() {
        (this._respecDonePromise = new Promise((e) => {
          Rn("end-all", e, { once: !0 });
        })),
          (this.errors = []),
          (this.warnings = []),
          Rn("error", (e) => {
            console.error(e, e.toJSON()), this.errors.push(e);
          }),
          Rn("warn", (e) => {
            console.warn(e, e.toJSON()), this.warnings.push(e);
          });
      }
      get version() {
        return window.respecVersion;
      }
      get ready() {
        return this._respecDonePromise;
      }
      async toHTML() {
        return Ln("html", document);
      }
    }
    const In = "core/post-process";
    const Dn = "core/pre-process";
    const Nn = "core/base-runner";
    async function jn(e) {
      !(function () {
        const e = new Pn();
        Object.defineProperty(document, "respec", { value: e });
      })(),
        Sn("start-all", respecConfig),
        (function (e) {
          const t = {},
            n = (e) => Object.assign(t, e);
          n(e),
            Rn("amend-user-config", n),
            Rn("end-all", () => {
              const e = document.createElement("script");
              (e.id = "initialUserConfig"), (e.type = "application/json");
              for (const e of En) e in t && delete t[e];
              (e.innerHTML = JSON.stringify(t, null, 2)),
                document.head.appendChild(e);
            });
        })(respecConfig),
        (function (e) {
          const t = new URLSearchParams(document.location.search),
            n = Array.from(t)
              .filter(([e, t]) => !!e && !!t)
              .map(([e, t]) => {
                const n = decodeURIComponent(e),
                  r = decodeURIComponent(t.replace(/%3D/g, "="));
                let s;
                try {
                  s = JSON.parse(r);
                } catch {
                  s = r;
                }
                return [n, s];
              }),
            r = Object.fromEntries(n);
          Object.assign(e, r), Sn("amend-user-config", r);
        })(respecConfig),
        performance.mark(Nn + "-start"),
        await (async function (e) {
          if (Array.isArray(e.preProcess)) {
            const t = e.preProcess
              .filter((e) => {
                const t = "function" == typeof e;
                return (
                  t ||
                    bn("Every item in `preProcess` must be a JS function.", Dn),
                  t
                );
              })
              .map(async (t) => {
                try {
                  return await t(e, document);
                } catch (e) {
                  bn(
                    `Function ${t.name} threw an error during \`preProcess\`.`,
                    Dn,
                    { hint: "See developer console." }
                  ),
                    console.error(e);
                }
              });
            await Promise.all(t);
          }
        })(respecConfig);
      const t = e.filter((e) => {
        return (t = e) && (t.run || t.Plugin);
        var t;
      });
      t.forEach((e) => !e.name && console.warn("Plugin lacks name:", e)),
        (respecConfig.state = {}),
        await (async function (e, t) {
          for (const n of e.filter((e) => e.prepare))
            try {
              await n.prepare(t);
            } catch (e) {
              console.error(e);
            }
        })(t, respecConfig),
        await (async function (e, t) {
          for (const n of e) {
            const e = n.name || "";
            try {
              await new Promise(async (r, s) => {
                const i = setTimeout(() => {
                  const t = `Plugin ${e} took too long.`;
                  console.error(t, n), s(new Error(t));
                }, 15e3);
                performance.mark(e + "-start");
                try {
                  n.Plugin
                    ? (await new n.Plugin(t).run(), r())
                    : n.run && (await n.run(t), r());
                } catch (e) {
                  s(e);
                } finally {
                  clearTimeout(i),
                    performance.mark(e + "-end"),
                    performance.measure(e, e + "-start", e + "-end");
                }
              });
            } catch (e) {
              console.error(e);
            }
          }
        })(t, respecConfig),
        (respecConfig.state = {}),
        Sn("plugins-done", respecConfig),
        await (async function (e) {
          if (Array.isArray(e.postProcess)) {
            const t = e.postProcess
              .filter((e) => {
                const t = "function" == typeof e;
                return (
                  t ||
                    bn(
                      "Every item in `postProcess` must be a JS function.",
                      In
                    ),
                  t
                );
              })
              .map(async (t) => {
                try {
                  return await t(e, document);
                } catch (e) {
                  bn(
                    `Function ${t.name} threw an error during \`postProcess\`.`,
                    In,
                    { hint: "See developer console." }
                  ),
                    console.error(e);
                }
              });
            await Promise.all(t);
          }
          "function" == typeof e.afterEnd && (await e.afterEnd(e, document));
        })(respecConfig),
        Sn("end-all"),
        Wt(document),
        performance.mark(Nn + "-end"),
        performance.measure(Nn, Nn + "-start", Nn + "-end");
    }
    var On = String.raw`.respec-modal .close-button{position:absolute;z-index:inherit;padding:.2em;font-weight:700;cursor:pointer;margin-left:5px;border:none;background:0 0}
#respec-ui{position:fixed;display:flex;flex-direction:row-reverse;top:20px;right:20px;width:202px;text-align:right;z-index:9000}
#respec-pill,.respec-info-button{background:#fff;height:2.5em;color:#787878;border:1px solid #ccc;box-shadow:1px 1px 8px 0 rgba(100,100,100,.5)}
.respec-info-button{border:none;opacity:.75;border-radius:2em;margin-right:1em;min-width:3.5em}
.respec-info-button:focus,.respec-info-button:hover{opacity:1;transition:opacity .2s}
#respec-pill:disabled{font-size:2.8px;text-indent:-9999em;border-top:1.1em solid rgba(40,40,40,.2);border-right:1.1em solid rgba(40,40,40,.2);border-bottom:1.1em solid rgba(40,40,40,.2);border-left:1.1em solid #fff;transform:translateZ(0);animation:respec-spin .5s infinite linear;box-shadow:none}
#respec-pill:disabled,#respec-pill:disabled:after{border-radius:50%;width:10em;height:10em}
@keyframes respec-spin{
0%{transform:rotate(0)}
100%{transform:rotate(360deg)}
}
.respec-hidden{visibility:hidden;opacity:0;transition:visibility 0s .2s,opacity .2s linear}
.respec-visible{visibility:visible;opacity:1;transition:opacity .2s linear}
#respec-pill:focus,#respec-pill:hover{color:#000;background-color:#f5f5f5;transition:color .2s}
#respec-menu{position:absolute;margin:0;padding:0;font-family:sans-serif;background:#fff;box-shadow:1px 1px 8px 0 rgba(100,100,100,.5);width:200px;display:none;text-align:left;margin-top:32px;font-size:.8em}
#respec-menu:not([hidden]){display:block}
#respec-menu li{list-style-type:none;margin:0;padding:0}
.respec-save-buttons{display:grid;grid-template-columns:repeat(auto-fill,minmax(47%,2fr));grid-gap:.5cm;padding:.5cm}
.respec-save-button:link{padding-top:16px;color:#f0f0f0;background:#2a5aa8;justify-self:stretch;height:1cm;text-decoration:none;text-align:center;font-size:inherit;border:none;border-radius:.2cm}
.respec-save-button:link:hover{color:#fff;background:#2a5aa8;padding:0;margin:0;border:0;padding-top:16px}
.respec-save-button:link:focus{background:#193766}
#respec-pill:focus,#respec-ui button:focus,.respec-option:focus{outline:0;outline-style:none}
#respec-pill-error{background-color:red;color:#fff}
#respec-pill-warning{background-color:orange;color:#fff}
.respec-error-list,.respec-warning-list{margin:0;padding:0;list-style:none;font-family:sans-serif;background-color:#fffbe6;font-size:.85em}
.respec-error-list>li,.respec-warning-list>li{padding:.4em .7em}
.respec-warning-list>li::before{content:"⚠️";padding-right:.5em}
.respec-error-list p,.respec-warning-list p{padding:0;margin:0}
.respec-warning-list li{color:#5c3b00;border-bottom:thin solid #fff5c2}
.respec-error-list,.respec-error-list li{background-color:#fff0f0}
.respec-error-list li::before{content:"💥";padding-right:.5em}
.respec-error-list li{padding:.4em .7em;color:#5c3b00;border-bottom:thin solid #ffd7d7}
.respec-error-list li>p{margin:0;padding:0;display:inline-block}
.respec-error-list li>p:first-child,.respec-warning-list li>p:first-child{display:inline}
.respec-error-list>li li,.respec-warning-list>li li{margin:0;list-style:disc}
#respec-overlay{display:block;position:fixed;z-index:10000;top:0;left:0;height:100%;width:100%;background:#000}
.respec-show-overlay{transition:opacity .2s linear;opacity:.5}
.respec-hide-overlay{transition:opacity .2s linear;opacity:0}
.respec-modal{display:block;position:fixed;z-index:11000;margin:auto;top:10%;background:#fff;border:5px solid #666;min-width:20%;width:79%;padding:0;max-height:80%;overflow-y:auto;margin:0 -.5cm}
@media screen and (min-width:78em){
.respec-modal{width:62%}
}
.respec-modal h3{margin:0;padding:.2em;text-align:center;color:#000;background:linear-gradient(to bottom,#eee 0,#eee 50%,#ccc 100%);font-size:1em}
.respec-modal .inside div p{padding-left:1cm}
#respec-menu button.respec-option{background:#fff;padding:0 .2cm;border:none;width:100%;text-align:left;font-size:inherit;padding:1.2em 1.2em}
#respec-menu button.respec-option:hover,#respec-menu button:focus{background-color:#eee}
.respec-cmd-icon{padding-right:.5em}
#respec-ui button.respec-option:last-child{border:none;border-radius:inherit}
.respec-button-copy-paste{position:absolute;height:28px;width:40px;cursor:pointer;background-image:linear-gradient(#fcfcfc,#eee);border:1px solid #90b8de;border-left:0;border-radius:0 0 3px 0;-webkit-user-select:none;user-select:none;-webkit-appearance:none;top:0;left:127px}
@media print{
#respec-ui{display:none}
}
.respec-iframe{width:100%;min-height:550px;height:100%;overflow:hidden;padding:0;margin:0;border:0}
.respec-iframe:not(.ready){background:url(https://respec.org/xref/loader.gif) no-repeat center}
.respec-iframe+a[href]{font-size:.9rem;float:right;margin:0 .5em .5em;border-bottom-width:1px}`;
    function zn(e) {
      if (!e) return e;
      const t = e.trimEnd().split("\n");
      for (; t.length && !t[0].trim(); ) t.shift();
      const n = t.filter((e) => e.trim()).map((e) => e.search(/[^\s]/)),
        r = Math.min(...n);
      return t.map((e) => e.slice(r)).join("\n");
    }
    var Mn = Object.freeze({
      __proto__: null,
      name: "core/reindent",
      reindent: zn,
      run: function () {
        for (const e of document.getElementsByTagName("pre"))
          e.innerHTML = zn(e.innerHTML);
      },
    });
    const Un = /&gt;/gm,
      Wn = /&amp;/gm;
    class qn extends Dt.Renderer {
      code(e, t, n) {
        const { language: r, ...s } = qn.parseInfoString(t);
        if (/(^webidl$)/i.test(r)) return `<pre class="idl">${e}</pre>`;
        const i = super.code(e, r, n),
          { example: o, illegalExample: a } = s;
        if (!o && !a) return i;
        const c = o || a,
          l = `${r} ${o ? "example" : "illegal-example"}`;
        return i.replace("<pre>", `<pre title="${c}" class="${l}">`);
      }
      static parseInfoString(e) {
        const t = e.search(/\s/);
        if (-1 === t) return { language: e };
        const n = e.slice(0, t),
          r = e.slice(t + 1);
        let s;
        if (r)
          try {
            s = JSON.parse(`{ ${r} }`);
          } catch (e) {
            console.error(e);
          }
        return { language: n, ...s };
      }
      heading(e, t, n, r) {
        const s = /(.+)\s+{#([\w-]+)}$/;
        if (s.test(e)) {
          const [, n, r] = e.match(s);
          return `<h${t} id="${r}">${n}</h${t}>`;
        }
        return super.heading(e, t, n, r);
      }
    }
    function Fn(e) {
      const t = zn(e).replace(Un, ">").replace(Wn, "&");
      return Dt(t, {
        sanitize: !1,
        gfm: !0,
        headerIds: !1,
        langPrefix: "",
        renderer: new qn(),
      });
    }
    function Bn(e) {
      for (const t of e.getElementsByTagName("pre")) t.prepend("\n");
      e.innerHTML = Fn(e.innerHTML);
    }
    class Hn {
      constructor(e) {
        (this.doc = e),
          (this.root = e.createDocumentFragment()),
          (this.stack = [this.root]),
          (this.current = this.root);
      }
      findPosition(e) {
        return parseInt(e.tagName.charAt(1), 10);
      }
      findParent(e) {
        let t;
        for (; e > 0; ) if ((e--, (t = this.stack[e]), t)) return t;
      }
      findHeader({ firstChild: e }) {
        for (; e; ) {
          if (/H[1-6]/.test(e.tagName)) return e;
          e = e.nextSibling;
        }
        return null;
      }
      addHeader(e) {
        const t = this.doc.createElement("section"),
          n = this.findPosition(e);
        t.appendChild(e),
          this.findParent(n).appendChild(t),
          (this.stack[n] = t),
          (this.stack.length = n + 1),
          (this.current = t);
      }
      addSection(e, t) {
        const n = this.findHeader(e),
          r = n ? this.findPosition(n) : 1,
          s = this.findParent(r);
        n && e.removeChild(n),
          e.appendChild(t(e)),
          n && e.prepend(n),
          s.appendChild(e),
          (this.current = s);
      }
      addElement(e) {
        this.current.appendChild(e);
      }
    }
    function Gn(e, t) {
      return (function e(n) {
        const r = new Hn(t);
        for (; n.firstChild; ) {
          const t = n.firstChild;
          if (t.nodeType === Node.ELEMENT_NODE)
            switch (t.localName) {
              case "h1":
              case "h2":
              case "h3":
              case "h4":
              case "h5":
              case "h6":
                r.addHeader(t);
                break;
              case "section":
                r.addSection(t, e);
                break;
              default:
                r.addElement(t);
            }
          else n.removeChild(t);
        }
        return r.root;
      })(e);
    }
    function Vn(e) {
      const t = Gn(e, e.ownerDocument);
      if (
        "section" === t.firstElementChild.localName &&
        "section" === e.localName
      ) {
        const n = t.firstElementChild;
        n.remove(), e.append(...n.childNodes);
      } else e.textContent = "";
      e.appendChild(t);
    }
    const Kn =
      ((Yn = "[data-format='markdown']:not(body)"),
      (e) => {
        const t = e.querySelectorAll(Yn);
        return t.forEach(Bn), Array.from(t);
      });
    var Yn;
    var Zn = Object.freeze({
      __proto__: null,
      name: "core/markdown",
      markdownToHtml: Fn,
      restructure: Vn,
      run: function (e) {
        const t = !!document.querySelector("[data-format=markdown]:not(body)"),
          n = "markdown" === e.format;
        if (!n && !t) return;
        if (!n) {
          for (const e of Kn(document.body)) Vn(e);
          return;
        }
        const r = document.getElementById("respec-ui");
        r.remove();
        const s = document.body.cloneNode(!0);
        !(function (e, t) {
          const n = e.querySelectorAll(t);
          for (const e of n) {
            const { innerHTML: t } = e;
            if (/^<\w/.test(t.trimStart())) continue;
            const n = t.split("\n"),
              r = n.slice(0, 2).join("\n"),
              s = n.slice(-2).join("\n");
            if ((r.trim() && e.prepend("\n\n"), s.trim())) {
              const t = un(e);
              e.append("\n\n" + t);
            }
          }
        })(
          s,
          "[data-format=markdown], section, div, address, article, aside, figure, header, main"
        ),
          Bn(s),
          (function (e) {
            Array.from(e).forEach((e) => {
              e.replaceWith(e.textContent);
            });
          })(s.querySelectorAll(".nolinks a[href]"));
        const i = Gn(s, document);
        s.append(r, i), document.body.replaceWith(s);
      },
    });
    function Jn(e, t) {
      e &&
        Array.from(t).forEach(([t, n]) => {
          e.setAttribute("aria-" + t, n);
        });
    }
    !(function () {
      const e = document.createElement("style");
      (e.id = "respec-ui-styles"),
        (e.textContent = On),
        e.classList.add("removeOnSave"),
        document.head.appendChild(e);
    })();
    const Qn = It`<div id="respec-ui" class="removeOnSave" hidden></div>`,
      Xn = It`<ul
  id="respec-menu"
  role="menu"
  aria-labelledby="respec-pill"
  hidden
></ul>`,
      er = It`<button
  class="close-button"
  onclick=${() => dr.closeModal()}
  title="Close"
>
  ❌
</button>`;
    let tr, nr;
    window.addEventListener("load", () => cr(Xn));
    const rr = [],
      sr = [],
      ir = {};
    Rn("start-all", () => document.body.prepend(Qn), { once: !0 }),
      Rn("end-all", () => document.body.prepend(Qn), { once: !0 });
    const or = It`<button id="respec-pill" disabled>ReSpec</button>`;
    function ar() {
      Xn.classList.toggle("respec-hidden"),
        Xn.classList.toggle("respec-visible"),
        (Xn.hidden = !Xn.hidden);
    }
    function cr(e) {
      const t = e.querySelectorAll(
          "a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])"
        ),
        n = t[0],
        r = t[t.length - 1];
      n && n.focus(),
        e.addEventListener("keydown", (e) => {
          "Tab" === e.key &&
            (e.shiftKey
              ? document.activeElement === n && (r.focus(), e.preventDefault())
              : document.activeElement === r &&
                (n.focus(), e.preventDefault()));
        });
    }
    Qn.appendChild(or),
      or.addEventListener("click", (e) => {
        e.stopPropagation(),
          or.setAttribute("aria-expanded", String(Xn.hidden)),
          ar(),
          Xn.querySelector("li:first-child button").focus();
      }),
      document.documentElement.addEventListener("click", () => {
        Xn.hidden || ar();
      }),
      Qn.appendChild(Xn),
      Xn.addEventListener("keydown", (e) => {
        "Escape" !== e.key ||
          Xn.hidden ||
          (or.setAttribute("aria-expanded", String(Xn.hidden)),
          ar(),
          or.focus());
      });
    const lr = new Map([
      ["controls", "respec-menu"],
      ["expanded", "false"],
      ["haspopup", "true"],
      ["label", "ReSpec Menu"],
    ]);
    function ur(e, t, n, r) {
      t.push(e),
        ir.hasOwnProperty(n) ||
          ((ir[n] = (function (e, t, n) {
            const r = It`<button
    id="${"respec-pill-" + e}"
    class="respec-info-button"
  ></button>`;
            r.addEventListener("click", () => {
              r.setAttribute("aria-expanded", "true");
              const s = It`<ol class="${`respec-${e}-list`}"></ol>`;
              for (const e of t) {
                const t = document
                    .createRange()
                    .createContextualFragment(pr(e)),
                  n = document.createElement("li");
                t.firstElementChild === t.lastElementChild
                  ? n.append(...t.firstElementChild.childNodes)
                  : n.appendChild(t),
                  s.appendChild(n);
              }
              dr.freshModal(n, s, r);
            });
            const s = new Map([
              ["expanded", "false"],
              ["haspopup", "true"],
              ["controls", `respec-pill-${e}-modal`],
            ]);
            return Jn(r, s), r;
          })(n, t, r)),
          Qn.appendChild(ir[n]));
      const s = ir[n];
      s.textContent = t.length;
      const i = 1 === t.length ? Nt.singular(r) : r;
      Jn(s, new Map([["label", `${t.length} ${i}`]]));
    }
    Jn(or, lr);
    const dr = {
      show() {
        try {
          Qn.hidden = !1;
        } catch (e) {
          console.error(e);
        }
      },
      hide() {
        Qn.hidden = !0;
      },
      enable() {
        or.removeAttribute("disabled");
      },
      addCommand(e, t, n, r) {
        r = r || "";
        const s = "respec-button-" + e.toLowerCase().replace(/\s+/, "-"),
          i = It`<button id="${s}" class="respec-option">
      <span class="respec-cmd-icon" aria-hidden="true">${r}</span> ${e}…
    </button>`,
          o = It`<li role="menuitem">${i}</li>`;
        return o.addEventListener("click", t), Xn.appendChild(o), i;
      },
      error(e) {
        ur(e, rr, "error", "ReSpec Errors");
      },
      warning(e) {
        ur(e, sr, "warning", "ReSpec Warnings");
      },
      closeModal(e) {
        nr &&
          (nr.classList.remove("respec-show-overlay"),
          nr.classList.add("respec-hide-overlay"),
          nr.addEventListener("transitionend", () => {
            nr.remove(), (nr = null);
          })),
          e && e.setAttribute("aria-expanded", "false"),
          tr && (tr.remove(), (tr = null), or.focus());
      },
      freshModal(e, t, n) {
        tr && tr.remove(),
          nr && nr.remove(),
          (nr = It`<div id="respec-overlay" class="removeOnSave"></div>`);
        const r = n.id + "-modal",
          s = r + "-heading";
        tr = It`<div
      id="${r}"
      class="respec-modal removeOnSave"
      role="dialog"
      aria-labelledby="${s}"
    >
      ${er}
      <h3 id="${s}">${e}</h3>
      <div class="inside">${t}</div>
    </div>`;
        const i = new Map([["labelledby", s]]);
        Jn(tr, i),
          document.body.append(nr, tr),
          nr.addEventListener("click", () => this.closeModal(n)),
          nr.classList.toggle("respec-show-overlay"),
          (tr.hidden = !1),
          cr(tr);
      },
    };
    function pr(e) {
      if ("string" == typeof e) return e;
      const t = e.plugin ? ` <small>(Plugin: "${e.plugin}")</small>.` : "",
        n = e.hint ? " " + e.hint : "",
        r = Array.isArray(e.elements)
          ? ` Occurred at: ${Ht(e.elements.map(hr))}.`
          : "",
        s = e.details ? `\n\n<details>\n${e.details}\n</details>\n` : "";
      return Fn(`${e.message}${n}${r}${t}${s}`);
    }
    function hr(e, t) {
      return `[${t + 1}](#${e.id})`;
    }
    async function fr(e) {
      try {
        dr.show(),
          await (async function () {
            "loading" === document.readyState &&
              (await new Promise((e) =>
                document.addEventListener("DOMContentLoaded", e)
              ));
          })(),
          await jn(e);
      } finally {
        dr.enable();
      }
    }
    document.addEventListener("keydown", (e) => {
      "Escape" === e.key && dr.closeModal();
    }),
      (window.respecUI = dr),
      Rn("error", (e) => dr.error(e)),
      Rn("warn", (e) => dr.warning(e)),
      window.addEventListener("error", (e) => {
        console.error(e.error, e.message, e);
      });
    const mr = [
      Promise.resolve().then(function () {
        return gr;
      }),
      Promise.resolve().then(function () {
        return i;
      }),
      Promise.resolve().then(function () {
        return vr;
      }),
      Promise.resolve().then(function () {
        return us;
      }),
      Promise.resolve().then(function () {
        return hs;
      }),
      Promise.resolve().then(function () {
        return bs;
      }),
      Promise.resolve().then(function () {
        return ws;
      }),
      Promise.resolve().then(function () {
        return Cs;
      }),
      Promise.resolve().then(function () {
        return Es;
      }),
      Promise.resolve().then(function () {
        return Zn;
      }),
      Promise.resolve().then(function () {
        return Mn;
      }),
      Promise.resolve().then(function () {
        return Ls;
      }),
      Promise.resolve().then(function () {
        return Ds;
      }),
      Promise.resolve().then(function () {
        return is;
      }),
      Promise.resolve().then(function () {
        return Os;
      }),
      Promise.resolve().then(function () {
        return zs;
      }),
      Promise.resolve().then(function () {
        return Ws;
      }),
      Promise.resolve().then(function () {
        return Zi;
      }),
      Promise.resolve().then(function () {
        return Xi;
      }),
      Promise.resolve().then(function () {
        return uo;
      }),
      Promise.resolve().then(function () {
        return po;
      }),
      Promise.resolve().then(function () {
        return go;
      }),
      Promise.resolve().then(function () {
        return ko;
      }),
      Promise.resolve().then(function () {
        return So;
      }),
      Promise.resolve().then(function () {
        return Ao;
      }),
      Promise.resolve().then(function () {
        return Jo;
      }),
      Promise.resolve().then(function () {
        return bi;
      }),
      Promise.resolve().then(function () {
        return ga;
      }),
      Promise.resolve().then(function () {
        return Ta;
      }),
      Promise.resolve().then(function () {
        return aa;
      }),
      Promise.resolve().then(function () {
        return La;
      }),
      Promise.resolve().then(function () {
        return Ei;
      }),
      Promise.resolve().then(function () {
        return Ba;
      }),
      Promise.resolve().then(function () {
        return Ga;
      }),
      Promise.resolve().then(function () {
        return Va;
      }),
      Promise.resolve().then(function () {
        return tc;
      }),
      Promise.resolve().then(function () {
        return rc;
      }),
      Promise.resolve().then(function () {
        return sc;
      }),
      Promise.resolve().then(function () {
        return lc;
      }),
      Promise.resolve().then(function () {
        return bc;
      }),
      Promise.resolve().then(function () {
        return kc;
      }),
      Promise.resolve().then(function () {
        return Cc;
      }),
      Promise.resolve().then(function () {
        return Tc;
      }),
      Promise.resolve().then(function () {
        return jc;
      }),
      Promise.resolve().then(function () {
        return Oc;
      }),
      Promise.resolve().then(function () {
        return qc;
      }),
      Promise.resolve().then(function () {
        return Yc;
      }),
      Promise.resolve().then(function () {
        return zo;
      }),
      Promise.resolve().then(function () {
        return nl;
      }),
      Promise.resolve().then(function () {
        return al;
      }),
      Promise.resolve().then(function () {
        return hl;
      }),
      Promise.resolve().then(function () {
        return gl;
      }),
      Promise.resolve().then(function () {
        return yl;
      }),
      Promise.resolve().then(function () {
        return vl;
      }),
      Promise.resolve().then(function () {
        return Rl;
      }),
      Promise.resolve().then(function () {
        return Pl;
      }),
      Promise.resolve().then(function () {
        return Il;
      }),
      Promise.resolve().then(function () {
        return Ol;
      }),
      Promise.resolve().then(function () {
        return ql;
      }),
      Promise.resolve().then(function () {
        return Gl;
      }),
      Promise.resolve().then(function () {
        return Jl;
      }),
      Promise.resolve().then(function () {
        return nu;
      }),
      Promise.resolve().then(function () {
        return ou;
      }),
      Promise.resolve().then(function () {
        return uu;
      }),
      Promise.resolve().then(function () {
        return fu;
      }),
      Promise.resolve().then(function () {
        return yu;
      }),
      Promise.resolve().then(function () {
        return $u;
      }),
    ];
    Promise.all(mr)
      .then((e) => fr(e))
      .catch((e) => console.error(e));
    var gr = Object.freeze({
      __proto__: null,
      name: "core/location-hash",
      run: function () {
        location.hash &&
          document.respec.ready.then(() => {
            let e = decodeURIComponent(location.hash).substr(1);
            const t = document.getElementById(e),
              n = /\W/.test(e);
            if (!t && n) {
              const t = e
                .replace(/[\W]+/gim, "-")
                .replace(/^-+/, "")
                .replace(/-+$/, "");
              document.getElementById(t) && (e = t);
            }
            location.hash = "#" + e;
          });
      },
    });
    const br = "w3c/group",
      yr = ["wg", "wgURI", "wgId", "wgPatentURI", "wgPatentPolicy"];
    async function wr(e) {
      let t = "",
        n = e;
      e.includes("/") && ([t, n] = e.split("/", 2));
      const r = new URL(`${n}/${t}`, "https://respec.org/w3c/groups/"),
        s = await Xt(r.href);
      if (s.ok) {
        const e = await s.json(),
          {
            id: t,
            name: n,
            patentURI: r,
            patentPolicy: i,
            type: o,
            wgURI: a,
          } = e;
        return {
          wg: n,
          wgId: t,
          wgURI: a,
          wgPatentURI: r,
          wgPatentPolicy: i,
          groupType: o,
        };
      }
      const i = await s.text(),
        o = `Failed to fetch group details (HTTP: ${s.status}). ${i}`,
        a =
          404 === s.status
            ? xn`See the list of [supported group names](https://respec.org/w3c/groups/) to use with the ${"[group]"} configuration option.`
            : void 0;
      bn(o, br, { hint: a });
    }
    var vr = Object.freeze({
      __proto__: null,
      name: br,
      run: async function (e) {
        const t = yr.filter((t) => e[t]);
        if (!e.group) {
          if (t.length) {
            const e = xn`Please use the ${"[group]"} configuration option instead.`;
            yn(`Configuration options ${kn(yr)} are deprecated.`, br, {
              hint: e,
            });
          }
          return;
        }
        if (t.length) {
          const e = xn`Remove them from the document's ${"[respecConfig]"} to silence this warning.`;
          yn(
            xn`Configuration options ${kn(
              t
            )} are superseded by ${"[group]"} and will be overridden by ReSpec.`,
            br,
            { hint: e }
          );
        }
        const { group: n } = e,
          r = Array.isArray(n)
            ? await (async function (e) {
                const t = await Promise.all(e.map(wr)),
                  n = {
                    wg: [],
                    wgId: [],
                    wgURI: [],
                    wgPatentURI: [],
                    wgPatentPolicy: [],
                    groupType: [],
                  };
                for (const e of t.filter((e) => e))
                  for (const t of Object.keys(n)) n[t].push(e[t]);
                return n;
              })(n)
            : await wr(n);
        Object.assign(e, r);
      },
    });
    function kr(e) {
      if (!e.key) {
        const t =
          "Found a link without `key` attribute in the configuration. See dev console.";
        return yn(t, "core/templates/show-link"), void console.warn(t, e);
      }
      return It`
    <dt class="${e.class ? e.class : null}">${e.key}</dt>
    ${e.data ? e.data.map($r) : $r(e)}
  `;
    }
    function $r(e) {
      return It`<dd class="${e.class ? e.class : null}">
    ${e.href ? It`<a href="${e.href}">${e.value || e.href}</a>` : e.value}
  </dd>`;
    }
    const xr = "core/templates/show-logo";
    function _r(e, t) {
      const n = It`<a href="${e.url || null}" class="logo"
    ><img
      alt="${e.alt || null}"
      crossorigin
      height="${e.height || null}"
      id="${e.id || null}"
      src="${e.src || null}"
      width="${e.width || null}"
    />
  </a>`;
      if (!e.alt) {
        const r = xn`Add the missing "\`alt\`" property describing the logo. See ${"[logos]"} for more information.`;
        bn(
          `Logo at index ${t}${
            e.src ? `, with \`src\` ${e.src}, ` : ""
          } is missing required "\`alt\`" property.`,
          xr,
          { hint: r, elements: [n] }
        );
      }
      if (!e.src) {
        const e = xn`The \`src\` property is required on every logo. See ${"[logos]"} for more information.`;
        bn(`Logo at index ${t} is missing "\`src\`" property.`, xr, {
          hint: e,
          elements: [n],
        });
      }
      return n;
    }
    const Cr = "core/templates/show-people",
      Sr = {
        en: { until: (e) => It` Until ${e} ` },
        es: { until: (e) => It` Hasta ${e} ` },
        ko: { until: (e) => It` ${e} 이전 ` },
        ja: { until: (e) => It` ${e} 以前 ` },
        de: { until: (e) => It` bis ${e} ` },
        zh: { until: (e) => It` 直到 ${e} ` },
      },
      Rr = s in Sr ? s : "en";
    function Er(e, t) {
      const n = e[t];
      if (!Array.isArray(n) || !n.length) return;
      const r =
        ((s = t),
        function (e, t) {
          const n = "https://respec.org/docs/",
            r = `See [person](${n}#person) configuration for available options.`,
            i = `Error processing the [person object](${n}#person) at index ${t} of the "[\`${s}\`](${n}#${s})" configuration option.`;
          if (!e.name)
            return (
              bn(i + ' Missing required property `"name"`.', Cr, { hint: r }),
              !1
            );
          if (e.orcid) {
            const { orcid: n } = e,
              r = new URL(n, "https://orcid.org/");
            if ("https://orcid.org" !== r.origin) {
              const n = `${i} ORCID "${e.orcid}" at index ${t} is invalid.`,
                s = `The origin should be "https://orcid.org", not "${r.origin}".`;
              return bn(n, Cr, { hint: s }), !1;
            }
            const s = r.pathname.slice(1).replace(/\/$/, "");
            if (!/^\d{4}-\d{4}-\d{4}-\d{3}(\d|X)$/.test(s))
              return (
                bn(`${i} ORCID "${s}" has wrong format.`, Cr, {
                  hint: 'ORCIDs have the format "1234-1234-1234-1234."',
                }),
                !1
              );
            if (
              !(function (e) {
                const t = e[e.length - 1],
                  n =
                    (12 -
                      (e
                        .split("")
                        .slice(0, -1)
                        .filter((e) => /\d/.test(e))
                        .map(Number)
                        .reduce((e, t) => 2 * (e + t), 0) %
                        11)) %
                    11,
                  r = 10 === n ? "X" : String(n);
                return t === r;
              })(n)
            )
              return (
                bn(`${i} ORCID "${n}" failed checksum check.`, Cr, {
                  hint: "Please check that the ORCID is valid.",
                }),
                !1
              );
            e.orcid = r.href;
          }
          return e.retiredDate &&
            ((o = e.retiredDate),
            "Invalid Date" ===
              (/\d{4}-\d{2}-\d{2}/.test(o)
                ? new Date(o)
                : "Invalid Date"
              ).toString())
            ? (bn(
                i + ' The property "`retiredDate`" is not a valid date.',
                Cr,
                { hint: "The expected format is YYYY-MM-DD. " + r }
              ),
              !1)
            : !(
                e.hasOwnProperty("extras") &&
                !(function (e, t, n) {
                  return Array.isArray(e)
                    ? e.every((e, r) => {
                        switch (!0) {
                          case "object" != typeof e:
                            return (
                              bn(
                                `${n}. Member "extra" at index ${r} is not an object.`,
                                Cr,
                                { hint: t }
                              ),
                              !1
                            );
                          case !e.hasOwnProperty("name"):
                            return (
                              bn(
                                `${n} \`PersonExtra\` object at index ${r} is missing required "name" member.`,
                                Cr,
                                { hint: t }
                              ),
                              !1
                            );
                          case "string" == typeof e.name &&
                            "" === e.name.trim():
                            return (
                              bn(
                                `${n} \`PersonExtra\` object at index ${r} "name" can't be empty.`,
                                Cr,
                                { hint: t }
                              ),
                              !1
                            );
                        }
                        return !0;
                      })
                    : (bn(
                        n + '. A person\'s "extras" member must be an array.',
                        Cr,
                        { hint: t }
                      ),
                      !1);
                })(e.extras, r, i)
              ) &&
                (e.url &&
                  e.mailto &&
                  yn(i + ' Has both "url" and "mailto" property.', Cr, {
                    hint:
                      'Please choose either "url" or "mailto" ("url" is preferred). ' +
                      r,
                  }),
                e.companyURL &&
                  !e.company &&
                  yn(
                    i +
                      ' Has a "`companyURL`" property but no "`company`" property.',
                    Cr,
                    { hint: `Please add a "\`company\`" property. ${r}.` }
                  ),
                !0);
          var o;
        });
      var s;
      return n.filter(r).map(Ar);
    }
    function Ar(e) {
      const t = Sr[Rr],
        n = [e.name],
        r = [e.company],
        s = e.w3cid || null,
        i = [];
      if ((e.mailto && (e.url = "mailto:" + e.mailto), e.url)) {
        const t =
          "mailto:" === new URL(e.url, document.location.href).protocol
            ? "ed_mailto u-email email p-name"
            : "u-url url p-name fn";
        i.push(It`<a class="${t}" href="${e.url}">${n}</a>`);
      } else i.push(It`<span class="p-name fn">${n}</span>`);
      if (
        (e.orcid &&
          i.push(
            It`<a class="p-name orcid" href="${e.orcid}">${It`<svg
  width="16"
  height="16"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
>
  <style>
    .st1 {
      fill: #fff;
    }
  </style>
  <path
    d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z"
    fill="#a6ce39"
  />
  <path
    class="st1"
    d="M86.3 186.2H70.9V79.1h15.4v107.1zM108.9 79.1h41.6c39.6 0 57 28.3 57 53.6 0 27.5-21.5 53.6-56.8 53.6h-41.8V79.1zm15.4 93.3h24.5c34.9 0 42.9-26.5 42.9-39.7C191.7 111.2 178 93 148 93h-23.7v79.4zM88.7 56.8c0 5.5-4.5 10.1-10.1 10.1s-10.1-4.6-10.1-10.1c0-5.6 4.5-10.1 10.1-10.1s10.1 4.6 10.1 10.1z"
  />
</svg>`}</a>`
          ),
        e.company)
      ) {
        const t = "p-org org h-org",
          n = e.companyURL
            ? It`<a class="${t}" href="${e.companyURL}">${r}</a>`
            : It`<span class="${t}">${r}</span>`;
        i.push(It` (${n})`);
      }
      if (
        (e.note && i.push(document.createTextNode(` (${e.note})`)),
        e.extras &&
          i.push(
            ...e.extras.map(
              (e) =>
                It`, ${(function (e) {
                  const t = e.class || null,
                    { name: n, href: r } = e;
                  return r
                    ? It`<a href="${r}" class="${t}">${n}</a>`
                    : It`<span class="${t}">${n}</span>`;
                })(e)}`
            )
          ),
        e.retiredDate)
      ) {
        const { retiredDate: n } = e,
          r = It`<time datetime="${n}"
      >${Jt(n)}</time
    >`;
        i.push(It` - ${t.until(r)} `);
      }
      return It`<dd
    class="editor p-author h-card vcard"
    data-editor-id="${s}"
  >
    ${i}
  </dd>`;
    }
    const Tr = Yt({
      en: {
        archives: "archives",
        author: "Author:",
        authors: "Authors:",
        commit_history: "Commit history",
        edited_in_place: "edited in place",
        editor: "Editor:",
        editors: "Editors:",
        feedback: "Feedback:",
        former_editor: "Former editor:",
        former_editors: "Former editors:",
        history: "History:",
        implementation_report: "Implementation report:",
        latest_editors_draft: "Latest editor's draft:",
        latest_published_version: "Latest published version:",
        latest_recommendation: "Latest Recommendation:",
        message_topic: "… message topic …",
        more_details_about_this_doc: "More details about this document",
        prev_editor_draft: "Previous editor's draft:",
        prev_recommendation: "Previous Recommendation:",
        prev_version: "Previous version:",
        publication_history: "Publication history",
        test_suite: "Test suite:",
        this_version: "This version:",
        with_subject_line: "with subject line",
        your_topic_here: "YOUR TOPIC HERE",
      },
      ko: {
        author: "저자:",
        authors: "저자:",
        editor: "편집자:",
        editors: "편집자:",
        former_editor: "이전 편집자:",
        former_editors: "이전 편집자:",
        latest_editors_draft: "최신 편집 초안:",
        latest_published_version: "최신 버전:",
        this_version: "현재 버전:",
      },
      zh: {
        author: "作者：",
        authors: "作者：",
        editor: "编辑：",
        editors: "编辑：",
        former_editor: "原编辑：",
        former_editors: "原编辑：",
        latest_editors_draft: "最新编辑草稿：",
        latest_published_version: "最新发布版本：",
        this_version: "本版本：",
        test_suite: "测试套件：",
        implementation_report: "实现报告：",
        prev_editor_draft: "上一版编辑草稿：",
        prev_version: "上一版：",
        prev_recommendation: "上一版正式推荐标准：",
        latest_recommendation: "最新发布的正式推荐标准：",
      },
      ja: {
        author: "著者：",
        authors: "著者：",
        editor: "編者：",
        editors: "編者：",
        former_editor: "以前の版の編者：",
        former_editors: "以前の版の編者：",
        latest_editors_draft: "最新の編集用草案：",
        latest_published_version: "最新バージョン：",
        this_version: "このバージョン：",
        test_suite: "テストスイート：",
        implementation_report: "実装レポート：",
      },
      nl: {
        author: "Auteur:",
        authors: "Auteurs:",
        editor: "Redacteur:",
        editors: "Redacteurs:",
        latest_editors_draft: "Laatste werkversie:",
        latest_published_version: "Laatst gepubliceerde versie:",
        this_version: "Deze versie:",
      },
      es: {
        archives: "archivos",
        author: "Autor:",
        authors: "Autores:",
        commit_history: "Historial de cambios",
        edited_in_place: "editado en lugar",
        editor: "Editor:",
        editors: "Editores:",
        feedback: "Comentarios:",
        former_editor: "Antiguo editor:",
        former_editors: "Antiguos editores:",
        history: "Historia:",
        implementation_report: "Informe de implementación:",
        latest_editors_draft: "Última versión del editor:",
        latest_published_version: "Última versión publicada:",
        latest_recommendation: "Recomendación más reciente:",
        message_topic: "… detalles de mensaje …",
        more_details_about_this_doc: "Más detalles sobre este documento:",
        publication_history: "Historial de publicación",
        prev_editor_draft: "Última versión del editor:",
        prev_recommendation: "Última Recomendación:",
        prev_version: "Última versión:",
        test_suite: "Suite de pruebas:",
        this_version: "Esta versión:",
        with_subject_line: "con línea de asunto",
        your_topic_here: "TU SUJETO AQUÍ",
      },
      de: {
        author: "Autor/in:",
        authors: "Autor/innen:",
        editor: "Redaktion:",
        editors: "Redaktion:",
        former_editor: "Frühere Mitwirkende:",
        former_editors: "Frühere Mitwirkende:",
        latest_editors_draft: "Letzter Entwurf:",
        latest_published_version: "Letzte publizierte Fassung:",
        this_version: "Diese Fassung:",
      },
    });
    var Lr = (e, t) => (
      Rn("beforesave", (e) => {
        e.querySelector(".head details").open = !0;
      }),
      It`<div class="head">
    ${e.logos.map(_r)} ${document.querySelector("h1#title")}
    ${(function (e) {
      let t = document.querySelector("h2#subtitle");
      return (
        t && t.parentElement
          ? (t.remove(), (e.subtitle = t.textContent.trim()))
          : e.subtitle &&
            ((t = document.createElement("h2")),
            (t.textContent = e.subtitle),
            (t.id = "subtitle")),
        t && t.classList.add("subtitle"),
        t
      );
    })(e)}
    <p id="w3c-state">${(function (e) {
      const t = e.isCR || e.isCRY ? e.longStatus : e.textStatus,
        n = e.prependW3C
          ? It`<a href="https://www.w3.org/standards/types#${e.specStatus}"
        >W3C ${t}</a
      >`
          : It`${t}`;
      return It`${n}${" "}
    <time class="dt-published" datetime="${e.dashDate}"
      >${e.publishHumanDate}</time
    >${
      e.modificationDate
        ? It`, ${Tr.edited_in_place}${" "}
        ${(function (e) {
          const t = Jt(new Date(e));
          return It`<time class="dt-modified" datetime="${e}"
    >${t}</time
  >`;
        })(e.modificationDate)}`
        : ""
    }`;
    })(e)}</p>
    <details open="${localStorage.getItem("tr-metadata") || "true"}">
      <summary>${Tr.more_details_about_this_doc}</summary>
      <dl>
        ${
          (e.isTagFinding && !e.isTagEditorFinding) || !e.isNoTrack
            ? It`
              <dt>${Tr.this_version}</dt>
              <dd>
                <a class="u-url" href="${e.thisVersion}"
                  >${e.thisVersion}</a
                >
              </dd>
              <dt>${Tr.latest_published_version}</dt>
              <dd>
                ${
                  e.latestVersion
                    ? It`<a href="${e.latestVersion}"
                      >${e.latestVersion}</a
                    >`
                    : "none"
                }
              </dd>
            `
            : ""
        }
        ${
          e.edDraftURI
            ? It`
              <dt>${Tr.latest_editors_draft}</dt>
              <dd><a href="${e.edDraftURI}">${e.edDraftURI}</a></dd>
            `
            : ""
        }
        ${(function (e) {
          if (!e.historyURI && !e.github) return;
          const t = [];
          if (e.historyURI) {
            const n = It`<dd>
      <a href="${e.historyURI}">${e.historyURI}</a>
    </dd>`;
            t.push(n);
          }
          if (e.github) {
            const n = It`
      <dd>
        <a href="${e.github.commitHistoryURL}">${Tr.commit_history}</a>
      </dd>
    `;
            t.push(n);
          }
          return It`<dt>${Tr.history}</dt>
    ${t}`;
        })(e)}
        ${
          e.testSuiteURI
            ? It`
              <dt>${Tr.test_suite}</dt>
              <dd><a href="${e.testSuiteURI}">${e.testSuiteURI}</a></dd>
            `
            : ""
        }
        ${
          e.implementationReportURI
            ? It`
              <dt>${Tr.implementation_report}</dt>
              <dd>
                <a href="${e.implementationReportURI}"
                  >${e.implementationReportURI}</a
                >
              </dd>
            `
            : ""
        }
        ${
          e.isED && e.prevED
            ? It`
              <dt>${Tr.prev_editor_draft}</dt>
              <dd><a href="${e.prevED}">${e.prevED}</a></dd>
            `
            : ""
        }
        ${
          e.showPreviousVersion
            ? It`
              <dt>${Tr.prev_version}</dt>
              <dd><a href="${e.prevVersion}">${e.prevVersion}</a></dd>
            `
            : ""
        }
        ${
          e.prevRecURI
            ? e.isRec
              ? It`
              <dt>${Tr.prev_recommendation}</dt>
              <dd><a href="${e.prevRecURI}">${e.prevRecURI}</a></dd>
            `
              : It`
              <dt>${Tr.latest_recommendation}</dt>
              <dd><a href="${e.prevRecURI}">${e.prevRecURI}</a></dd>
            `
            : ""
        }
        <dt>${e.multipleEditors ? Tr.editors : Tr.editor}</dt>
        ${Er(e, "editors")}
        ${
          Array.isArray(e.formerEditors) && e.formerEditors.length > 0
            ? It`
              <dt>
                ${
                  e.multipleFormerEditors ? Tr.former_editors : Tr.former_editor
                }
              </dt>
              ${Er(e, "formerEditors")}
            `
            : ""
        }
        ${
          e.authors
            ? It`
              <dt>${e.multipleAuthors ? Tr.authors : Tr.author}</dt>
              ${Er(e, "authors")}
            `
            : ""
        }
        ${(function (e) {
          if (!e.github && !e.wgPublicList) return;
          const t = [];
          if (e.github) {
            const {
              repoURL: n,
              issuesURL: r,
              newIssuesURL: s,
              pullsURL: i,
              fullName: o,
            } = e.github;
            t.push(It`<dd>
        <a href="${n}">GitHub ${o}</a>
        (<a href="${i}">pull requests</a>,
        <a href="${s}">new issue</a>,
        <a href="${r}">open issues</a>)
      </dd>`);
          }
          if (e.wgPublicList) {
            const n = new URL(`mailto:${e.wgPublicList}@w3.org`),
              r = e.subjectPrefix ?? `[${e.shortName}] ${Tr.your_topic_here}`,
              s = It`<a
      href="${n.href}?subject=${encodeURIComponent(r)}"
      >${n.pathname}</a
    >`,
              i =
                e.subjectPrefix ||
                It`[${e.shortName}] <em>${Tr.message_topic}</em>`,
              o = It`${Tr.with_subject_line}${" "}
      <kbd>${i}</kbd>`,
              a = new URL(
                e.wgPublicList,
                "https://lists.w3.org/Archives/Public/"
              ),
              c = It`(<a href="${a}" rel="discussion"
        >${Tr.archives}</a
      >)`;
            t.push(It`<dd>${s} ${o} ${c}</dd>`);
          }
          return It`<dt>${Tr.feedback}</dt>
    ${t}`;
        })(e)}
        ${
          e.errata
            ? It`<dt>Errata:</dt>
              <dd><a href="${e.errata}">Errata exists</a>.</dd>`
            : ""
        }
        ${e.otherLinks ? e.otherLinks.map(kr) : ""}
      </dl>
    </details>
    ${
      e.isRec
        ? It`<p>
          See also
          <a
            href="${
              "https://www.w3.org/Translations/?technology=" + e.shortName
            }"
          >
            <strong>translations</strong></a
          >.
        </p>`
        : ""
    }
    ${
      e.alternateFormats
        ? It`<p>
          ${
            t.multipleAlternates
              ? "This document is also available in these non-normative formats:"
              : "This document is also available in this non-normative format:"
          }
          ${t.alternatesHTML}
        </p>`
        : ""
    }
    ${(function (e) {
      const t = document.querySelector(".copyright");
      if (t) return t.remove(), t;
      if (e.isUnofficial && e.licenseInfo)
        return It`<p class="copyright">
      Copyright &copy;
      ${e.copyrightStart ? e.copyrightStart + "-" : ""}${e.publishYear}
      the document editors/authors.
      ${
        "unlicensed" !== e.licenseInfo.name
          ? It`Text is available under the
            <a rel="license" href="${e.licenseInfo.url}"
              >${e.licenseInfo.name}</a
            >; additional terms may apply.`
          : ""
      }
    </p>`;
      return (function (e) {
        return It`<p class="copyright">
    <a href="https://www.w3.org/Consortium/Legal/ipr-notice#Copyright"
      >Copyright</a
    >
    &copy;
    ${e.copyrightStart ? e.copyrightStart + "-" : ""}${e.publishYear}
    ${
      e.additionalCopyrightHolders
        ? It` ${[e.additionalCopyrightHolders]} &amp; `
        : ""
    }
    <a href="https://www.w3.org/"
      ><abbr title="World Wide Web Consortium">W3C</abbr></a
    ><sup>&reg;</sup> (<a href="https://www.csail.mit.edu/"
      ><abbr title="Massachusetts Institute of Technology">MIT</abbr></a
    >,
    <a href="https://www.ercim.eu/"
      ><abbr
        title="European Research Consortium for Informatics and Mathematics"
        >ERCIM</abbr
      ></a
    >, <a href="https://www.keio.ac.jp/">Keio</a>,
    <a href="https://ev.buaa.edu.cn/">Beihang</a>). W3C
    <a href="https://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer"
      >liability</a
    >,
    <a href="https://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks"
      >trademark</a
    >${(function (e) {
      const { url: t, short: n, name: r } = e;
      if ("unlicensed" === r)
        return It`. <span class="issue">THIS DOCUMENT IS UNLICENSED</span>.`;
      return It` and
    <a rel="license" href="${t}" title="${r}">${n}</a> rules apply.`;
    })(e.licenseInfo)}
  </p>`;
      })(e);
    })(e)}
    <hr title="Separator for header" />
  </div>`
    );
    var Pr = (e, t) => {
      const n = document.querySelector(".copyright");
      n && n.remove();
      const r = document.querySelector("h1#title"),
        s = r.cloneNode(!0);
      return It`<div class="head">
    ${e.logos.map(_r)} ${r}
    ${e.subtitle ? It`<h2 id="subtitle">${e.subtitle}</h2>` : ""}
    <h2>
      ${e.longStatus}
      <time class="dt-published" datetime="${e.dashDate}"
        >${e.publishHumanDate}</time
      >
    </h2>
    <dl>
      ${
        e.thisVersion
          ? It`
            <dt>${Tr.this_version}</dt>
            <dd>
              <a class="u-url" href="${e.thisVersion}"
                >${e.thisVersion}</a
              >
            </dd>
          `
          : ""
      }
      ${
        e.latestVersion
          ? It`
            <dt>${Tr.latest_published_version}</dt>
            <dd>
              <a href="${e.latestVersion}">${e.latestVersion}</a>
            </dd>
          `
          : ""
      }
      ${
        e.edDraftURI
          ? It`
            <dt>${Tr.latest_editors_draft}</dt>
            <dd><a href="${e.edDraftURI}">${e.edDraftURI}</a></dd>
          `
          : ""
      }
      ${
        e.testSuiteURI
          ? It`
            <dt>Test suite:</dt>
            <dd><a href="${e.testSuiteURI}">${e.testSuiteURI}</a></dd>
          `
          : ""
      }
      ${
        e.implementationReportURI
          ? It`
            <dt>Implementation report:</dt>
            <dd>
              <a href="${e.implementationReportURI}"
                >${e.implementationReportURI}</a
              >
            </dd>
          `
          : ""
      }
      ${
        e.prevVersion
          ? It`
            <dt>Previous version:</dt>
            <dd><a href="${e.prevVersion}">${e.prevVersion}</a></dd>
          `
          : ""
      }
      ${
        e.isCGFinal
          ? ""
          : It`
            ${
              e.prevED
                ? It`
                  <dt>Previous editor's draft:</dt>
                  <dd><a href="${e.prevED}">${e.prevED}</a></dd>
                `
                : ""
            }
          `
      }
      <dt>${e.multipleEditors ? Tr.editors : Tr.editor}</dt>
      ${Er(e, "editors")}
      ${
        Array.isArray(e.formerEditors) && e.formerEditors.length > 0
          ? It`
            <dt>
              ${e.multipleFormerEditors ? Tr.former_editors : Tr.former_editor}
            </dt>
            ${Er(e, "formerEditors")}
          `
          : ""
      }
      ${
        e.authors
          ? It`
            <dt>${e.multipleAuthors ? Tr.authors : Tr.author}</dt>
            ${Er(e, "authors")}
          `
          : ""
      }
      ${e.otherLinks ? e.otherLinks.map(kr) : ""}
    </dl>
    ${
      e.alternateFormats
        ? It`<p>
          ${
            t.multipleAlternates
              ? "This document is also available in these non-normative formats:"
              : "This document is also available in this non-normative format:"
          }
          ${t.alternatesHTML}
        </p>`
        : ""
    }
    ${
      n ||
      It`<p class="copyright">
          <a href="https://www.w3.org/Consortium/Legal/ipr-notice#Copyright"
            >Copyright</a
          >
          &copy;
          ${e.copyrightStart ? e.copyrightStart + "-" : ""}${e.publishYear}
          ${
            e.additionalCopyrightHolders
              ? It` ${[e.additionalCopyrightHolders]} &amp; `
              : ""
          }
          the Contributors to the ${s.childNodes}
          Specification, published by the
          <a href="${e.wgURI}">${e.wg}</a> under the
          ${
            e.isCGFinal
              ? It`
                <a href="https://www.w3.org/community/about/agreements/fsa/"
                  >W3C Community Final Specification Agreement (FSA)</a
                >. A human-readable
                <a
                  href="https://www.w3.org/community/about/agreements/fsa-deed/"
                  >summary</a
                >
                is available.
              `
              : It`
                <a href="https://www.w3.org/community/about/agreements/cla/"
                  >W3C Community Contributor License Agreement (CLA)</a
                >. A human-readable
                <a
                  href="https://www.w3.org/community/about/agreements/cla-deed/"
                  >summary</a
                >
                is available.
              `
          }
        </p>`
    }
    <hr title="Separator for header" />
  </div>`;
    };
    const Ir = Yt({
        en: { sotd: "Status of This Document" },
        ko: { sotd: "현재 문서의 상태" },
        zh: { sotd: "关于本文档" },
        ja: { sotd: "この文書の位置付け" },
        nl: { sotd: "Status van dit document" },
        es: { sotd: "Estado de este Document" },
        de: { sotd: "Status dieses Dokuments" },
      }),
      Dr = "https://www.w3.org/2021/Process-20211102/";
    function Nr(e) {
      return /^[aeiou]/i.test(e) ? "an " + e : "a " + e;
    }
    var jr = (e, t) => It`
    <h2>${Ir.sotd}</h2>
    ${e.isPreview ? Or(e) : ""}
    ${
      e.isUnofficial
        ? (function (e) {
            const { additionalContent: t } = e;
            return It`
    <p>
      This document is a draft of a potential specification. It has no official
      standing of any kind and does not represent the support or consensus of
      any standards organization.
    </p>
    ${t}
  `;
          })(t)
        : e.isTagFinding
        ? t.additionalContent
        : e.isNoTrack
        ? (function (e, t) {
            const { isMO: n } = e,
              { additionalContent: r } = t;
            return It`
    <p class="remove" comment="JDG changed this to not show this message">
      This document is merely a W3C-internal
      ${n ? "member-confidential" : ""} document. It has no official standing
      of any kind and does not represent consensus of the W3C Membership.
    </p>
    ${r}
  `;
          })(e, t)
        : It`
          <p><em>${e.l10n.status_at_publication}</em></p>
          ${
            e.isMemberSubmission
              ? (function (e, t) {
                  return It`
    ${t.additionalContent}
    ${
      e.isMemberSubmission
        ? (function (e) {
            const t = `https://www.w3.org/Submission/${e.publishDate.getUTCFullYear()}/${
                e.submissionCommentNumber
              }/Comment/`,
              n =
                "PP2017" === e.wgPatentPolicy
                  ? "https://www.w3.org/Consortium/Patent-Policy-20170801/"
                  : "https://www.w3.org/Consortium/Patent-Policy/";
            return It`<p>
    By publishing this document, W3C acknowledges that the
    <a href="${e.thisVersion}">Submitting Members</a> have made a formal
    Submission request to W3C for discussion. Publication of this document by
    W3C indicates no endorsement of its content by W3C, nor that W3C has, is, or
    will be allocating any resources to the issues addressed by it. This
    document is not the product of a chartered W3C group, but is published as
    potential input to the
    <a href="https://www.w3.org/Consortium/Process">W3C Process</a>. A
    <a href="${t}">W3C Team Comment</a> has been published in
    conjunction with this Member Submission. Publication of acknowledged Member
    Submissions at the W3C site is one of the benefits of
    <a href="https://www.w3.org/Consortium/Prospectus/Joining">
      W3C Membership</a
    >. Please consult the requirements associated with Member Submissions of
    <a href="${n}#sec-submissions"
      >section 3.3 of the W3C Patent Policy</a
    >. Please consult the complete
    <a href="https://www.w3.org/Submission"
      >list of acknowledged W3C Member Submissions</a
    >.
  </p>`;
          })(e)
        : ""
    }
  `;
                })(e, t)
              : It`
                ${e.sotdAfterWGinfo ? "" : t.additionalContent}
                ${
                  e.overrideStatus
                    ? ""
                    : It` ${(function (e) {
                        if (!e.wg) return;
                        let t = null;
                        e.isRec &&
                          e.revisionTypes &&
                          e.revisionTypes.length &&
                          (e.revisionTypes.includes("addition")
                            ? (t = e.revisionTypes.includes("correction")
                                ? It`It includes
          <a href="${Dr}#proposed-amendments">proposed amendments</a>,
          introducing substantive changes and new features since the previous
          Recommendation.`
                                : It`It includes
          <a href="${Dr}#proposed-addition">proposed additions</a>,
          introducing new features since the previous Recommendation.`)
                            : e.revisionTypes.includes("correction") &&
                              (t = It`It includes
        <a href="${Dr}#proposed-correction">proposed corrections</a>.`));
                        const n = Gr[e.specStatus]
                          ? It` using the
        <a href="${Dr}#recs-and-notes"
          >${Gr[e.specStatus]} track</a
        >`
                          : "";
                        return It`<p>
    This document was published by ${e.wgHTML} as
    ${Nr(e.longStatus)}${n}. ${t}
  </p>`;
                      })(e)} `
                }
                ${e.sotdAfterWGinfo ? t.additionalContent : ""}
                ${
                  e.isRec
                    ? (function ({
                        updateableRec: e,
                        revisionTypes: t = [],
                        humanRevisedRecEnd: n,
                      }) {
                        let r = "";
                        t.includes("addition") && (r = "additions");
                        t.includes("correction") && !r && (r = "corrections");
                        return It`
    <p>
      W3C recommends the wide deployment of this specification as a standard for
      the Web.
    </p>

    <p>
      A W3C Recommendation is a specification that, after extensive
      consensus-building, is endorsed by
      <abbr title="World Wide Web Consortium">W3C</abbr> and its Members, and
      has commitments from Working Group members to
      <a href="https://www.w3.org/Consortium/Patent-Policy/#sec-Requirements"
        >royalty-free licensing</a
      >
      for implementations.
      ${
        e
          ? It`Future updates to this Recommendation may incorporate
            <a href="${Dr}#allow-new-features">new features</a>.`
          : ""
      }
    </p>
    ${
      t.includes("addition")
        ? It`<p class="addition">
          Proposed additions are marked in the document.
        </p>`
        : ""
    }
    ${
      t.includes("correction")
        ? It`<p class="correction">
          Proposed corrections are marked in the document.
        </p>`
        : ""
    }
    ${
      r
        ? It`<p>
          The W3C Membership and other interested parties are invited to review
          the proposed ${r} and send comments through
          ${n}. Advisory Committee Representatives should
          consult their
          <a href="https://www.w3.org/2002/09/wbs/myQuestionnaires"
            >WBS questionnaires</a
          >.
        </p>`
        : ""
    }
  `;
                      })(e)
                    : (function (e) {
                        let t = null,
                          n = null,
                          r = It`Publication as ${Nr(e.textStatus)} does not
  imply endorsement by W3C and its Members.`,
                          s = It`<p>
    This is a draft document and may be updated, replaced or obsoleted by other
    documents at any time. It is inappropriate to cite this document as other
    than work in progress.
    ${
      e.updateableRec
        ? It`Future updates to this specification may incorporate
          <a href="${Dr}#allow-new-features">new features</a>.`
        : ""
    }
  </p>`;
                        const i = It`<p>
    This document is maintained and updated at any time. Some parts of this
    document are work in progress.
  </p>`;
                        switch (e.specStatus) {
                          case "STMT":
                            r = It`<p>
        A W3C Statement is a specification that, after extensive
        consensus-building, has received the endorsement of the
        <abbr title="World Wide Web Consortium">W3C</abbr> and its Members.
      </p>`;
                            break;
                          case "RY":
                            r = It`<p>W3C recommends the wide usage of this registry.</p>
        <p>
          A W3C Registry is a specification that, after extensive
          consensus-building, has received the endorsement of the
          <abbr title="World Wide Web Consortium">W3C</abbr> and its Members.
        </p>`;
                            break;
                          case "CRD":
                            (t = It`A Candidate Recommendation Draft integrates
      changes from the previous Candidate Recommendation that the Working Group
      intends to include in a subsequent Candidate Recommendation Snapshot.`),
                              "LS" === e.pubMode && (s = i);
                            break;
                          case "CRYD":
                            (t = It`A Candidate Registry Draft integrates changes
      from the previous Candidate Registry Snapshot that the Working Group
      intends to include in a subsequent Candidate Registry Snapshot.`),
                              "LS" === e.pubMode && (s = i);
                            break;
                          case "CRY":
                            (t = It`A Candidate Registry Snapshot has received
        <a href="${Dr}#dfn-wide-review">wide review</a>.`),
                              (n = It`<p>
        The W3C Membership and other interested parties are invited to review
        the document and send comments through ${e.humanPREnd}. Advisory
        Committee Representatives should consult their
        <a href="https://www.w3.org/2002/09/wbs/myQuestionnaires"
          >WBS questionnaires</a
        >. Note that substantive technical comments were expected during the
        Candidate Recommendation review period that ended ${e.humanCREnd}.
      </p>`);
                            break;
                          case "CR":
                            (t = It`A Candidate Recommendation Snapshot has received
        <a href="${Dr}#dfn-wide-review">wide review</a>, is intended to
        gather
        <a href="${e.implementationReportURI}">implementation experience</a>,
        and has commitments from Working Group members to
        <a href="https://www.w3.org/Consortium/Patent-Policy/#sec-Requirements"
          >royalty-free licensing</a
        >
        for implementations.`),
                              (s = It`${
                                e.updateableRec
                                  ? It`Future updates to this specification may incorporate
            <a href="${Dr}#allow-new-features">new features</a>.`
                                  : ""
                              }`),
                              (n =
                                "LS" === e.pubMode
                                  ? It`<p>
          Comments are welcome at any time but most especially before
          ${e.humanCREnd}.
        </p>`
                                  : It`<p>
          This Candidate Recommendation is not expected to advance to Proposed
          Recommendation any earlier than ${e.humanCREnd}.
        </p>`);
                            break;
                          case "PR":
                            n = It`<p>
        The W3C Membership and other interested parties are invited to review
        the document and send comments through ${e.humanPREnd}. Advisory
        Committee Representatives should consult their
        <a href="https://www.w3.org/2002/09/wbs/myQuestionnaires"
          >WBS questionnaires</a
        >. Note that substantive technical comments were expected during the
        Candidate Recommendation review period that ended ${e.humanCREnd}.
      </p>`;
                            break;
                          case "DNOTE":
                          case "NOTE":
                            r = It`${e.textStatus}s are not endorsed by
        <abbr title="World Wide Web Consortium">W3C</abbr> nor its Members.`;
                        }
                        return It`<p>${r} ${t}</p>
    ${s} ${n}`;
                      })(e)
                }
                ${(function (e) {
                  const {
                      isNote: t,
                      isRegistry: n,
                      wgId: r,
                      multipleWGs: s,
                      wgPatentHTML: i,
                      wgPatentURI: o,
                      wgPatentPolicy: a,
                    } = e,
                    c =
                      "PP2017" === a
                        ? "https://www.w3.org/Consortium/Patent-Policy-20170801/"
                        : "https://www.w3.org/Consortium/Patent-Policy/",
                    l =
                      t || n
                        ? It`
        The
        <a href="${c}"
          >${"PP2017" === a ? "1 August 2017 " : ""}W3C Patent
          Policy</a
        >
        does not carry any licensing requirements or commitments on this
        document.
      `
                        : It`
        This document was produced by ${s ? "groups" : "a group"}
        operating under the
        <a href="${c}"
          >${"PP2017" === a ? "1 August 2017 " : ""}W3C Patent
          Policy</a
        >.
      `;
                  return It`<p data-deliverer="${t || n ? r : null}">
    ${l}
    ${
      t || n
        ? ""
        : It`
          ${
            s
              ? It` W3C maintains ${i} `
              : It`
                W3C maintains a
                <a href="${[o]}" rel="disclosure"
                  >public list of any patent disclosures</a
                >
              `
          }
          made in connection with the deliverables of
          ${
            s
              ? "each group; these pages also include"
              : "the group; that page also includes"
          }
          instructions for disclosing a patent. An individual who has actual
          knowledge of a patent which the individual believes contains
          <a href="${c}#def-essential">Essential Claim(s)</a>
          must disclose the information in accordance with
          <a href="${c}#sec-Disclosure"
            >section 6 of the W3C Patent Policy</a
          >.
        `
    }
  </p>`;
                })(e)}
                <p>
                  This document is governed by the
                  <a id="w3c_process_revision" href="${Dr}"
                    >2 November 2021 W3C Process Document</a
                  >.
                </p>
                ${e.addPatentNote ? It`<p>${[e.addPatentNote]}</p>` : ""}
              `
          }
        `
    }
    ${t.additionalSections}
  `;
    function Or(e) {
      const { prUrl: t, prNumber: n, edDraftURI: r } = e;
      return It`<details class="annoying-warning" open="">
    <summary>
      This is a
      preview${
        t && n
          ? It`
            of pull request
            <a href="${t}">#${n}</a>
          `
          : ""
      }
    </summary>
    <p>
      Do not attempt to implement this version of the specification. Do not
      reference this version as authoritative in any way.
      ${
        r
          ? It`
            Instead, see
            <a href="${r}">${r}</a> for the Editor's draft.
          `
          : ""
      }
    </p>
  </details>`;
    }
    var zr = (e, t) => It`
    <h2>${Ir.sotd}</h2>
    ${e.isPreview ? Or(e) : ""}
    <p>
      This specification was published by the
      <a href="${e.wgURI}">${e.wg}</a>. It is not a W3C Standard nor is it
      on the W3C Standards Track.
      ${
        e.isCGFinal
          ? It`
            Please note that under the
            <a href="https://www.w3.org/community/about/agreements/final/"
              >W3C Community Final Specification Agreement (FSA)</a
            >
            other conditions apply.
          `
          : It`
            Please note that under the
            <a href="https://www.w3.org/community/about/agreements/cla/"
              >W3C Community Contributor License Agreement (CLA)</a
            >
            there is a limited opt-out and other conditions apply.
          `
      }
      Learn more about
      <a href="https://www.w3.org/community/"
        >W3C Community and Business Groups</a
      >.
    </p>
    ${e.sotdAfterWGinfo ? "" : t.additionalContent}
    ${
      !e.github && e.wgPublicList
        ? (function (e, t) {
            const {
                mailToWGPublicListWithSubject: n,
                mailToWGPublicListSubscription: r,
              } = t,
              { wgPublicList: s, subjectPrefix: i } = e;
            return It`<p>
    If you wish to make comments regarding this document, please send them to
    <a href="${n}">${s}@w3.org</a>
    (<a href="${r}">subscribe</a>,
    <a href="${`https://lists.w3.org/Archives/Public/${s}/`}">archives</a>)${
              i
                ? It` with <code>${i}</code> at the start of your email's
          subject`
                : ""
            }.
  </p>`;
          })(e, t)
        : ""
    }
    ${
      e.github
        ? (function (e, t) {
            if (e.github || e.wgPublicList)
              return It`<p>
    ${
      e.github
        ? It`
          <a href="${e.issueBase}">GitHub Issues</a> are preferred for
          discussion of this specification.
        `
        : ""
    }
    ${
      e.wgPublicList
        ? It`
          ${
            e.github && e.wgPublicList
              ? "Alternatively, you can send comments to our mailing list."
              : "Comments regarding this document are welcome."
          }
          Please send them to
          <a href="${t.mailToWGPublicListWithSubject}"
            >${e.wgPublicList}@w3.org</a
          >
          (<a href="${t.mailToWGPublicListSubscription}">subscribe</a>,
          <a
            href="${`https://lists.w3.org/Archives/Public/${e.wgPublicList}/`}"
            >archives</a
          >)${
            e.subjectPrefix
              ? It` with <code>${e.subjectPrefix}</code> at the start of your
                email's subject`
              : ""
          }.
        `
        : ""
    }
  </p>`;
          })(e, t)
        : ""
    }
    ${e.sotdAfterWGinfo ? t.additionalContent : ""}
    ${t.additionalSections}
  `;
    const Mr = "w3c/headers",
      Ur = new Intl.DateTimeFormat(["en-AU"], {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "2-digit",
      });
    function Wr(e) {
      return new URL(e, "https://www.w3.org/").href;
    }
    const qr = { LS: "WD", LD: "WD", FPWD: "WD" },
      Fr = {
        "Member-SUBM": "/Submission",
        finding: "/2001/tag/doc",
        "draft-finding": "/2001/tag/doc",
      },
      Br = {
        DNOTE: "Group Draft Note",
        NOTE: "Group Note",
        STMT: "Statement",
        "Member-SUBM": "Member Submission",
        MO: "Member-Only Document",
        ED: "Editor's Draft",
        LS: "Living Standard",
        LD: "Living Document",
        FPWD: "First Public Working Draft",
        WD: "Working Draft",
        CR: "Candidate Recommendation",
        CRD: "Candidate Recommendation",
        PR: "Proposed Recommendation",
        PER: "Proposed Edited Recommendation",
        REC: "Recommendation",
        DISC: "Discontinued Draft",
        RSCND: "Rescinded Recommendation",
        DRY: "Draft Registry",
        CRYD: "Candidate Registry",
        CRY: "Candidate Registry",
        RY: "Registry",
        unofficial: "Unofficial Draft",
        base: "",
        finding: "TAG Finding",
        "draft-finding": "Draft TAG Finding",
        "editor-draft-finding": "Draft TAG Finding",
        "CG-DRAFT": "Draft Community Group Report",
        "CG-FINAL": "Final Community Group Report",
        "BG-DRAFT": "Draft Business Group Report",
        "BG-FINAL": "Final Business Group Report",
      },
      Hr = {
        ...Br,
        CR: "Candidate Recommendation Snapshot",
        CRD: "Candidate Recommendation Draft",
        CRY: "Candidate Registry Snapshot",
        CRYD: "Candidate Registry Draft",
      },
      Gr = {
        DNOTE: "Note",
        NOTE: "Note",
        STMT: "Note",
        "WG-NOTE": "Note",
        "IG-NOTE": "Note",
        FPWD: "Recommendation",
        WD: "Recommendation",
        CR: "Recommendation",
        CRD: "Recommendation",
        PR: "Recommendation",
        REC: "Recommendation",
        DISC: "Recommendation",
        RSCND: "Recommendation",
        DRY: "Registry",
        CRYD: "Registry",
        CRY: "Registry",
        RY: "Registry",
      },
      Vr = ["DNOTE", "NOTE", "STMT"],
      Kr = ["FPWD", "WD", "CR", "CRD", "PR", "PER", "REC", "DISC"],
      Yr = ["DRY", "CRY", "CRYD", "RY"],
      Zr = ["CG-DRAFT", "CG-FINAL"],
      Jr = ["BG-DRAFT", "BG-FINAL"],
      Qr = [...Zr, ...Jr],
      Xr = [
        "base",
        ...Zr,
        ...Jr,
        "editor-draft-finding",
        "draft-finding",
        "finding",
        "MO",
        "unofficial",
      ],
      es = new Map([
        [
          "cc0",
          {
            name: "Creative Commons 0 Public Domain Dedication",
            short: "CC0",
            url: "https://creativecommons.org/publicdomain/zero/1.0/",
          },
        ],
        [
          "w3c-software",
          {
            name: "W3C Software Notice and License",
            short: "W3C Software",
            url: "https://www.w3.org/Consortium/Legal/2002/copyright-software-20021231",
          },
        ],
        [
          "w3c-software-doc",
          {
            name: "W3C Software and Document Notice and License",
            short: "permissive document license",
            url: "https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document",
          },
        ],
        [
          "cc-by",
          {
            name: "Creative Commons Attribution 4.0 International Public License",
            short: "CC-BY",
            url: "https://creativecommons.org/licenses/by/4.0/legalcode",
          },
        ],
        [
          "document",
          {
            name: "W3C Document License",
            short: "document use",
            url: "https://www.w3.org/Consortium/Legal/2015/doc-license",
          },
        ],
        [
          "dual",
          {
            name: "W3C Dual License",
            short: "dual license",
            url: "https://www.w3.org/Consortium/Legal/2013/copyright-documents-dual.html",
          },
        ],
        [void 0, { name: "unlicensed", url: null, short: "UNLICENSED" }],
      ]),
      ts = ["PP2017", "PP2020"],
      ns = Object.freeze({
        id: "",
        alt: "",
        href: "",
        src: "",
        height: "48",
        width: "72",
      });
    function rs(e, t, n = new Date()) {
      const r = e[t] ? new Date(e[t]) : new Date(n);
      if (Number.isFinite(r.valueOf())) {
        const e = zt.format(r);
        return new Date(e);
      }
      return (
        bn(
          xn`${t} is not a valid date: "${e[t]}". Expected format 'YYYY-MM-DD'.`,
          Mr
        ),
        new Date(zt.format(new Date()))
      );
    }
    function ss(e, { isTagFinding: t = !1 }) {
      const n = e.cloneNode(!0),
        r = document.createDocumentFragment();
      for (
        ;
        n.hasChildNodes() &&
        (n.firstChild.nodeType !== Node.ELEMENT_NODE ||
          "section" !== n.firstChild.localName);

      )
        r.appendChild(n.firstChild);
      if (t && !r.hasChildNodes()) {
        yn(
          xn`ReSpec does not support automated SotD generation for TAG findings.`,
          Mr,
          { hint: "Please add the prerequisite content in the 'sotd' section." }
        );
      }
      return { additionalContent: r, additionalSections: n.childNodes };
    }
    var is = Object.freeze({
      __proto__: null,
      name: Mr,
      status2track: Gr,
      W3CNotes: Vr,
      recTrackStatus: Kr,
      registryTrackStatus: Yr,
      cgStatus: Zr,
      bgStatus: Jr,
      cgbgStatus: Qr,
      licenses: es,
      run: async function (e) {
        if (!e.specStatus) {
          const e = xn`Please select an appropriate status from ${"[specStatus]"} based on your W3C group. If in doubt, use \`"unofficial"\`.`;
          bn(xn`Missing required configuration: ${"[specStatus]"}.`, Mr, {
            hint: e,
          });
        }
        if (
          ((e.isUnofficial = "unofficial" === e.specStatus),
          e.isUnofficial && !Array.isArray(e.logos) && (e.logos = []),
          "IG-NOTE" === e.specStatus || "WG-NOTE" === e.specStatus)
        ) {
          const t = xn`Please update your ${"[specStatus]"} to use "NOTE".`;
          yn(e.specStatus + " are no longer supported. ", Mr, { hint: t }),
            (e.specStatus = "NOTE");
        }
        if (
          ((e.licenseInfo = (function (e) {
            let t = void 0;
            if ("string" == typeof e.license) {
              const n = e.license.toLowerCase();
              if (es.has(n)) t = n;
              else {
                const t = `The license "\`${e.license}\`" is not supported.`,
                  n = xn`Please set
        ${"[license]"} to one of: ${vn(
                    [...es.keys()].filter((e) => e),
                    { quotes: !0 }
                  )}. If in doubt, remove \`license\` and let ReSpec pick one for you.`;
                bn(t, Mr, { hint: n });
              }
            }
            if (
              (e.isUnofficial && !t && (t = "cc-by"),
              !e.isUnofficial && ["cc-by", "cc0"].includes(t))
            ) {
              const t = xn`Please set ${"[license]"} to \`"w3c-software-doc"\` instead.`;
              bn(
                xn`License "\`${e.license}\`" is not allowed for W3C Specifications.`,
                Mr,
                { hint: t }
              );
            }
            return es.get(t);
          })(e)),
          (e.isCGBG = Qr.includes(e.specStatus)),
          (e.isCGFinal = e.isCGBG && e.specStatus.endsWith("G-FINAL")),
          (e.isBasic = "base" === e.specStatus),
          (e.isRegular = !e.isCGBG && !e.isBasic),
          e.isRegular && !e.shortName)
        ) {
          bn("Missing required configuration: `shortName`", Mr);
        }
        if (e.testSuiteURI) {
          const t = new URL(e.testSuiteURI, location.href),
            { host: n, pathname: r } = t;
          if ("github.com" === n && r.startsWith("/w3c/web-platform-tests/")) {
            const t =
                "Web Platform Tests have moved to a new Github Organization at https://github.com/web-platform-tests. ",
              n = xn`Please update your ${"[testSuiteURI]"} to point to the new tests repository (e.g., ${
                "https://wpt.live/" + e.shortName
              }).`;
            yn(t, Mr, { hint: n });
          }
        }
        if (
          (e.subtitle || (e.subtitle = ""),
          (e.publishDate = rs(e, "publishDate", document.lastModified)),
          (e.publishYear = e.publishDate.getUTCFullYear()),
          (e.publishHumanDate = Ur.format(e.publishDate)),
          (e.isNoTrack = Xr.includes(e.specStatus)),
          (e.isRecTrack = !e.noRecTrack && Kr.includes(e.specStatus)),
          (e.isMemberSubmission = "Member-SUBM" === e.specStatus),
          e.isMemberSubmission)
        ) {
          const t = {
            alt: "W3C Member Submission",
            href: "https://www.w3.org/Submission/",
            src: "https://www.w3.org/Icons/member_subm-v.svg",
            width: "211",
          };
          e.logos.push({ ...ns, ...t });
        }
        if (
          ((e.isTagFinding =
            "finding" === e.specStatus ||
            "draft-finding" === e.specStatus ||
            "editor-draft-finding" === e.specStatus),
          (e.isTagEditorFinding = "editor-draft-finding" === e.specStatus),
          e.isRecTrack && !e.github && !e.wgPublicList)
        ) {
          const e = xn`Use the ${"[github]"} configuration option to add a link to a repository. Alternatively use ${"[wgPublicList]"} to link to a mailing list.`;
          bn(
            "W3C Process requires a either a link to a public repository or mailing list.",
            Mr,
            { hint: e }
          );
        }
        if (!e.edDraftURI && ((e.edDraftURI = ""), "ED" === e.specStatus)) {
          yn("Editor's Drafts should set edDraftURI.", Mr);
        }
        const t = qr[e.specStatus] || e.specStatus,
          n = Fr[e.specStatus] || "/TR";
        if (e.isRegular) {
          const { shortName: r, publishDate: s } = e,
            i = e.publishDate.getUTCFullYear(),
            o = `${t}-${r}-${Zt(s)}`;
          e.thisVersion = Wr(`${n}/${i}/${o}/`);
        }
        "ED" === e.specStatus && (e.thisVersion = e.edDraftURI);
        const r = `${n}/${e.shortName}`;
        if (
          (null !== e.latestVersion &&
            (e.latestVersion = e.latestVersion
              ? Wr("" + e.latestVersion)
              : Wr(`${n}/${e.shortName}/`)),
          e.previousPublishDate)
        ) {
          if (!e.previousMaturity && !e.isTagFinding) {
            bn("`previousPublishDate` is set, but not `previousMaturity`.", Mr);
          }
          e.previousPublishDate = rs(e, "previousPublishDate");
          const t = qr[e.previousMaturity] ?? e.previousMaturity;
          if (e.isTagFinding && e.latestVersion) {
            const t = zt.format(e.publishDate);
            e.thisVersion = Wr(`${r}-${t}`);
            const n = zt.format(e.previousPublishDate);
            e.prevVersion = Wr(`${r}-${n}}`);
          } else if (e.isCGBG || e.isBasic) e.prevVersion = e.prevVersion || "";
          else {
            const r = e.previousPublishDate.getUTCFullYear(),
              { shortName: s } = e,
              i = Zt(e.previousPublishDate);
            e.prevVersion = Wr(`${n}/${r}/${t}-${s}-${i}/`);
          }
        } else e.prevVersion || (e.prevVersion = "");
        if (
          (e.prevRecShortname &&
            !e.prevRecURI &&
            (e.prevRecURI = Wr(`${n}/${e.prevRecShortname}`)),
          e.formerEditors || (e.formerEditors = []),
          e.editors)
        )
          for (let t = 0; t < e.editors.length; t++) {
            const n = e.editors[t];
            "retiredDate" in n &&
              (e.formerEditors.push(n), e.editors.splice(t--, 1));
          }
        if (!e.editors || 0 === e.editors.length) {
          bn("At least one editor is required.", Mr);
        }
        if (
          ((e.multipleEditors = e.editors && e.editors.length > 1),
          (e.multipleFormerEditors = e.formerEditors.length > 1),
          (e.multipleAuthors = e.authors && e.authors.length > 1),
          e.alternateFormats?.forEach((e) => {
            if (!e.uri || !e.label) {
              bn("All alternate formats must have a uri and a label.", Mr);
            }
          }),
          e.copyrightStart &&
            e.copyrightStart == e.publishYear &&
            (e.copyrightStart = ""),
          (e.longStatus = Hr[e.specStatus]),
          (e.textStatus = Br[e.specStatus]),
          (e.showPreviousVersion = !1),
          e.isTagFinding && (e.showPreviousVersion = !!e.previousPublishDate),
          (e.isRec = e.isRecTrack && "REC" === e.specStatus),
          e.isRec && !e.errata)
        ) {
          const e = xn`Add an ${"[errata]"} URL to your ${"[respecConfig]"}.`;
          bn("Recommendations must have an errata link.", Mr, { hint: e });
        }
        (e.prependW3C = !e.isBasic && !e.isUnofficial),
          (e.isED = "ED" === e.specStatus),
          (e.isCR = "CR" === e.specStatus || "CRD" === e.specStatus),
          (e.isCRY = "CRY" === e.specStatus || "CRYD" === e.specStatus),
          (e.isCRDraft = "CRD" === e.specStatus),
          (e.isPR = "PR" === e.specStatus),
          (e.isPER = "PER" === e.specStatus),
          (e.isMO = "MO" === e.specStatus),
          (e.isNote = Vr.includes(e.specStatus)),
          (e.isRegistry = Yr.includes(e.specStatus)),
          (e.dashDate = zt.format(e.publishDate)),
          (e.publishISODate = e.publishDate.toISOString()),
          (e.shortISODate = zt.format(e.publishDate)),
          (function (e) {
            if (!e.wgPatentPolicy) return;
            const t = new Set([].concat(e.wgPatentPolicy));
            if (t.size && ![...t].every((e) => ts.includes(e))) {
              const e = xn`Invalid ${"[wgPatentPolicy]"} value(s): ${kn(
                  [...t].filter((e) => !ts.includes(e))
                )}.`,
                n = `Please use one of: ${vn(ts)}.`;
              bn(e, Mr, { hint: n });
            }
            if (1 !== t.size) {
              const e =
                  "When collaborating across multiple groups, they must use the same patent policy.",
                n = xn`For ${"[wgPatentPolicy]"}, please check the patent policies of each group. The patent policies were: ${[
                  ...t,
                ].join(", ")}.`;
              bn(e, Mr, { hint: n });
            }
            e.wgPatentPolicy = [...t][0];
          })(e),
          await (async function (e) {
            if (!e.shortName || null === e.historyURI) return;
            const t = new URL(
              e.historyURI ?? e.shortName,
              "https://www.w3.org/standards/history/"
            );
            if ([...Kr, ...Vr, ...Yr].includes(e.specStatus))
              return void (e.historyURI = t.href);
            try {
              const n = await fetch(t, { method: "HEAD" });
              n.ok && (e.historyURI = n.url);
            } catch {}
          })(e);
        const s = {
            get multipleAlternates() {
              return e.alternateFormats && e.alternateFormats.length > 1;
            },
            get alternatesHTML() {
              return (
                e.alternateFormats &&
                tn(
                  e.alternateFormats.map(({ label: e }) => e),
                  (t, n) => {
                    const r = e.alternateFormats[n];
                    return It`<a
              rel="alternate"
              href="${r.uri}"
              hreflang="${r?.lang ?? null}"
              type="${r?.type ?? null}"
              >${r.label}</a
            >`;
                  }
                )
              );
            },
          },
          i = (e.isCGBG ? Pr : Lr)(e, s);
        document.body.prepend(i), document.body.classList.add("h-entry");
        const o =
          document.getElementById("sotd") || document.createElement("section");
        if ((e.isCGBG || !e.isNoTrack || e.isTagFinding) && !o.id) {
          bn(
            "A Status of This Document must include at least on custom paragraph.",
            Mr,
            {
              elements: [o],
              hint: "Add a `<p>` in the 'sotd' section that reflects the status of this specification.",
            }
          );
        }
        (o.id = o.id || "sotd"), o.classList.add("introductory");
        const a = [e.wg, e.wgURI, e.wgPatentURI];
        if (
          a.some((e) => Array.isArray(e)) &&
          !a.every((e) => Array.isArray(e))
        ) {
          const e = xn`Use the ${"[group]"} option with an array instead.`;
          bn(
            xn`If one of ${"[wg]"}, ${"[wgURI]"}, or ${"[wgPatentURI]"} is an array, they all have to be.`,
            Mr,
            { hint: e }
          );
        }
        if (e.isCGBG && !e.wg) {
          bn(
            xn`${"[wg]"} configuration option is required for this kind of document.`,
            Mr
          );
        }
        if (
          (Array.isArray(e.wg)
            ? ((e.multipleWGs = e.wg.length > 1),
              (e.wgHTML = tn(
                e.wg,
                (t, n) => It`the <a href="${e.wgURI[n]}">${t}</a>`
              )),
              (e.wgPatentHTML = tn(
                e.wg,
                (t, n) => It`a
        <a href="${e.wgPatentURI[n]}" rel="disclosure"
          >public list of any patent disclosures (${t})</a
        >`
              )))
            : ((e.multipleWGs = !1),
              e.wg && (e.wgHTML = It`the <a href="${e.wgURI}">${e.wg}</a>`)),
          "PR" === e.specStatus && !e.crEnd)
        ) {
          bn(
            xn`${"[specStatus]"} is "PR" but no ${"[crEnd]"} is specified in the ${"[respecConfig]"} (needed to indicate end of previous CR).`,
            Mr
          );
        }
        if ("CR" === e.specStatus && !e.crEnd) {
          bn(
            xn`${"[specStatus]"} is "CR", but no ${"[crEnd]"} is specified in the ${"[respecConfig]"}.`,
            Mr
          );
        }
        if (
          ((e.crEnd = rs(e, "crEnd")),
          (e.humanCREnd = Ur.format(e.crEnd)),
          "PR" === e.specStatus && !e.prEnd)
        ) {
          bn(
            xn`${"[specStatus]"} is "PR" but no ${"[prEnd]"} is specified in the ${"[respecConfig]"}.`,
            Mr
          );
        }
        if (
          ((e.prEnd = rs(e, "prEnd")),
          (e.humanPREnd = Ur.format(e.prEnd)),
          "PER" === e.specStatus && !e.perEnd)
        ) {
          bn(
            xn`${"[specStatus]"} is "PR", but no ${"[prEnd]"} is specified`,
            Mr
          );
        }
        if (
          ((e.perEnd = rs(e, "perEnd")),
          (e.humanPEREnd = Ur.format(e.perEnd)),
          e.hasOwnProperty("updateableRec"))
        ) {
          const t = xn`Add an ${"[`updateable-rec`|#updateable-rec-class]"} CSS class to the Status of This Document section instead.`;
          yn("Configuration option `updateableRec` is deprecated.", Mr, {
            hint: t,
          }),
            e.updateableRec && o.classList.add("updateable-rec");
        }
        e.updateableRec = o.classList.contains("updateable-rec");
        const c = ["addition", "correction"];
        if ("REC" === e.specStatus && e.revisionTypes?.length > 0) {
          if (e.revisionTypes.some((e) => !c.includes(e))) {
            const t = xn`${"[specStatus]"} is "REC" with unknown ${"[revisionTypes]"}: '${vn(
                e.revisionTypes.filter((e) => !c.includes(e))
              )}'.`,
              n = xn`The valid values for ${"[revisionTypes]"} are: ${vn(c)}.`;
            bn(t, Mr, { hint: n });
          }
          if (e.revisionTypes.includes("addition") && !e.updateableRec) {
            bn(
              xn`${"[specStatus]"} is "REC" with proposed additions but the Recommendation is not marked as a allowing new features.`,
              Mr
            );
          }
        }
        if (
          "REC" === e.specStatus &&
          e.updateableRec &&
          e.revisionTypes &&
          e.revisionTypes.length > 0 &&
          !e.revisedRecEnd
        ) {
          bn(
            xn`${"[specStatus]"} is "REC" with proposed corrections or additions but no ${"[revisedRecEnd]"} is specified in the ${"[respecConfig]"}.`,
            Mr
          );
        }
        if (
          ((e.revisedRecEnd = rs(e, "revisedRecEnd")),
          (e.humanRevisedRecEnd = Ur.format(e.revisedRecEnd)),
          e.noRecTrack && Kr.includes(e.specStatus))
        ) {
          const t = xn`Document configured as ${"[noRecTrack]"}, but its status ("${
              e.specStatus
            }") puts it on the W3C Rec Track.`,
            n = vn(Kr, { quotes: !0 });
          bn(t, Mr, { hint: `Status **can't** be any of: ${n}.` });
        }
        if (
          (o.classList.contains("override") ||
            It.bind(o)`${(function (e, t) {
              const n = {
                ...ss(t, e),
                get mailToWGPublicList() {
                  return `mailto:${e.wgPublicList}@w3.org`;
                },
                get mailToWGPublicListWithSubject() {
                  const t = e.subjectPrefix
                    ? "?subject=" + encodeURIComponent(e.subjectPrefix)
                    : "";
                  return this.mailToWGPublicList + t;
                },
                get mailToWGPublicListSubscription() {
                  return `mailto:${e.wgPublicList}-request@w3.org?subject=subscribe`;
                },
              };
              return (e.isCGBG ? zr : jr)(e, n);
            })(e, o)}`,
          !e.implementationReportURI && e.isCR)
        ) {
          const e = xn`CR documents must have an ${"[implementationReportURI]"} that describes the [implementation experience](https://www.w3.org/2019/Process-20190301/#implementation-experience).`;
          bn(
            xn`Missing ${"[implementationReportURI]"} configuration option in ${"[respecConfig]"}.`,
            Mr,
            { hint: e }
          );
        }
        if (!e.implementationReportURI && e.isPR) {
          yn(
            xn`PR documents should include an ${"[implementationReportURI]"}, which needs to link to a document that describes the [implementation experience](https://www.w3.org/2019/Process-20190301/#implementation-experience).`,
            Mr
          );
        }
        Sn("amend-user-config", {
          publishISODate: e.publishISODate,
          generatedSubtitle: `${e.longStatus} ${e.publishHumanDate}`,
        });
      },
    });
    const os = {
        lint: {
          "no-headingless-sections": !0,
          "no-http-props": !0,
          "no-unused-vars": !1,
          "check-punctuation": !1,
          "local-refs-exist": !0,
          "check-internal-slots": !1,
          "check-charset": !1,
          "privsec-section": !1,
        },
        pluralize: !0,
        specStatus: "base",
        highlightVars: !0,
        addSectionLinks: !0,
      },
      as = "w3c/defaults",
      cs = {
        src: "https://www.w3.org/StyleSheets/TR/2021/logos/W3C",
        alt: "W3C",
        height: 48,
        width: 72,
        url: "https://www.w3.org/",
      },
      ls = {
        lint: { "privsec-section": !0, "wpt-tests-exist": !1, a11y: !1 },
        doJsonLd: !1,
        logos: [],
        xref: !0,
        wgId: "",
        otherLinks: [],
        excludeGithubLinks: !0,
      };
    var us = Object.freeze({
      __proto__: null,
      name: as,
      run: function (e) {
        const t = !1 !== e.lint && { ...os.lint, ...ls.lint, ...e.lint };
        Object.assign(e, { ...os, ...ls, ...e, lint: t }),
          "unofficial" === e.specStatus ||
            e.hasOwnProperty("license") ||
            (e.license = "w3c-software-doc"),
          (function (e) {
            const t = e.specStatus ?? "";
            [...Kr, ...Yr, ...Vr].includes(t) && e.logos?.unshift(cs);
            "ED" === t && 0 === e.logos?.length && e.logos.push(cs);
          })(e),
          e.groupType &&
            e.specStatus &&
            (function (e) {
              const { specStatus: t, groupType: n } = e;
              switch (n) {
                case "cg":
                  if (![...Qr, "unofficial"].includes(t)) {
                    const n = xn`W3C Community Group documents can't use \`"${t}"\` for the ${"[specStatus]"} configuration option.`,
                      r = vn(Zr, { quotes: !0 });
                    bn(n, as, {
                      hint: `Please use one of: ${r}. Automatically falling back to \`"CG-DRAFT"\`.`,
                    }),
                      (e.specStatus = "CG-DRAFT");
                  }
                  break;
                case "bg":
                  if (![...Jr, "unofficial"].includes(t)) {
                    const n = xn`W3C Business Group documents can't use \`"${t}"\` for the ${"[specStatus]"} configuration option.`,
                      r = vn(Jr, { quotes: !0 });
                    bn(n, as, {
                      hint: `Please use one of: ${r}. Automatically falling back to \`"BG-DRAFT"\`.`,
                    }),
                      (e.specStatus = "BG-DRAFT");
                  }
                  break;
                case "wg":
                  if (Qr.includes(t)) {
                    const e = xn`Please see ${"[specStatus]"} for appropriate values for this type of group.`;
                    bn(
                      xn`W3C Working Group documents can't use \`"${t}"\` for the ${"[specStatus]"} configuration option.`,
                      as,
                      { hint: e }
                    );
                  }
              }
            })(e);
      },
    });
    var ds = String.raw`@keyframes pop{
0%{transform:scale(1,1)}
25%{transform:scale(1.25,1.25);opacity:.75}
100%{transform:scale(1,1)}
}
.hljs{background:0 0!important}
:is(h1,h2,h3,h4,h5,h6,a) abbr{border:none}
dfn{font-weight:700}
a.internalDFN{color:inherit;border-bottom:1px solid #99c;text-decoration:none}
a.externalDFN{color:inherit;border-bottom:1px dotted #ccc;text-decoration:none}
a.bibref{text-decoration:none}
.respec-offending-element:target{animation:pop .25s ease-in-out 0s 1}
.respec-offending-element,a[href].respec-offending-element{text-decoration:red wavy underline}
@supports not (text-decoration:red wavy underline){
.respec-offending-element:not(pre){display:inline-block}
.respec-offending-element{background:url(data:image/gif;base64,R0lGODdhBAADAPEAANv///8AAP///wAAACwAAAAABAADAEACBZQjmIAFADs=) bottom repeat-x}
}
#references :target{background:#eaf3ff;animation:pop .4s ease-in-out 0s 1}
cite .bibref{font-style:normal}
code{color:#c63501}
th code{color:inherit}
a[href].orcid{padding-left:4px;padding-right:4px}
a[href].orcid>svg{margin-bottom:-2px}
.toc a,.tof a{text-decoration:none}
a .figno,a .secno{color:#000}
ol.tof,ul.tof{list-style:none outside none}
.caption{margin-top:.5em;font-style:italic}
table.simple{border-spacing:0;border-collapse:collapse;border-bottom:3px solid #005a9c}
.simple th{background:#005a9c;color:#fff;padding:3px 5px;text-align:left}
.simple th a{color:#fff;padding:3px 5px;text-align:left}
.simple th[scope=row]{background:inherit;color:inherit;border-top:1px solid #ddd}
.simple td{padding:3px 10px;border-top:1px solid #ddd}
.simple tr:nth-child(even){background:#f0f6ff}
.section dd>p:first-child{margin-top:0}
.section dd>p:last-child{margin-bottom:0}
.section dd{margin-bottom:1em}
.section dl.attrs dd,.section dl.eldef dd{margin-bottom:0}
#issue-summary>ul{column-count:2}
#issue-summary li{list-style:none;display:inline-block}
details.respec-tests-details{margin-left:1em;display:inline-block;vertical-align:top}
details.respec-tests-details>*{padding-right:2em}
details.respec-tests-details[open]{z-index:999999;position:absolute;border:thin solid #cad3e2;border-radius:.3em;background-color:#fff;padding-bottom:.5em}
details.respec-tests-details[open]>summary{border-bottom:thin solid #cad3e2;padding-left:1em;margin-bottom:1em;line-height:2em}
details.respec-tests-details>ul{width:100%;margin-top:-.3em}
details.respec-tests-details>li{padding-left:1em}
a[href].self-link:hover{opacity:1;text-decoration:none;background-color:transparent}
h2,h3,h4,h5,h6{position:relative}
aside.example .marker>a.self-link{color:inherit}
:is(h2,h3,h4,h5,h6)>a.self-link{border:none;color:inherit;font-size:83%;height:2em;left:-1.6em;opacity:.5;position:absolute;text-align:center;text-decoration:none;top:0;transition:opacity .2s;width:2em}
:is(h2,h3,h4,h5,h6)>a.self-link::before{content:"§";display:block}
@media (max-width:767px){
dd{margin-left:0}
:is(h2,h3,h4,h5,h6)>a.self-link{left:auto;top:auto}
}
@media print{
.removeOnSave{display:none}
}`;
    const ps = (function () {
      const e = document.createElement("style");
      return (
        (e.id = "respec-mainstyle"),
        (e.textContent = ds),
        document.head.appendChild(e),
        e
      );
    })();
    var hs = Object.freeze({
      __proto__: null,
      name: "core/style",
      run: function (e) {
        e.noReSpecCSS && ps.remove();
      },
    });
    const fs = "w3c/style";
    function ms() {
      const e = It`<script src="https://www.w3.org/scripts/TR/2021/fixup.js">`;
      location.hash &&
        e.addEventListener(
          "load",
          () => {
            window.location.href = location.hash;
          },
          { once: !0 }
        ),
        document.body.appendChild(e);
    }
    const gs = (function () {
      const e = [
          { hint: "preconnect", href: "https://www.w3.org" },
          {
            hint: "preload",
            href: "https://www.w3.org/scripts/TR/2021/fixup.js",
            as: "script",
          },
          {
            hint: "preload",
            href: "https://www.w3.org/StyleSheets/TR/2021/base.css",
            as: "style",
          },
          {
            hint: "preload",
            href: "https://www.w3.org/StyleSheets/TR/2021/logos/W3C",
            as: "image",
          },
        ],
        t = document.createDocumentFragment();
      for (const n of e.map(Ut)) t.appendChild(n);
      return t;
    })();
    gs.appendChild(It`<link
  rel="stylesheet"
  href="https://www.w3.org/StyleSheets/TR/2021/base.css"
  class="removeOnSave"
/>`),
      document.head.querySelector("meta[name=viewport]") ||
        gs.prepend(It`<meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />`),
      document.head.prepend(gs);
    var bs = Object.freeze({
      __proto__: null,
      name: fs,
      run: function (e) {
        if (!e.specStatus) {
          const t = "`respecConfig.specStatus` missing. Defaulting to 'base'.";
          (e.specStatus = "base"), yn(t, fs);
        }
        let t = "W3C-";
        switch (e.specStatus.toUpperCase()) {
          case "WD":
          case "FPWD":
            t = "W3C-WD";
            break;
          case "CG-DRAFT":
          case "CG-FINAL":
          case "BG-DRAFT":
          case "BG-FINAL":
            t = e.specStatus.toLowerCase();
            break;
          case "UNOFFICIAL":
            t += "UD";
            break;
          case "FINDING":
          case "DRAFT-FINDING":
          case "EDITOR-DRAFT-FINDING":
          case "BASE":
            t = "base.css";
            break;
          default:
            t += e.specStatus;
        }
        e.noToc || Rn("end-all", ms, { once: !0 });
        const n = new URL("/StyleSheets/TR/2021/" + t, "https://www.w3.org/");
        var r;
        !(function (e, t) {
          const n = []
            .concat(t)
            .map((t) => {
              const n = e.createElement("link");
              return (n.rel = "stylesheet"), (n.href = t), n;
            })
            .reduce(
              (e, t) => (e.appendChild(t), e),
              e.createDocumentFragment()
            );
          e.head.appendChild(n);
        })(document, n.href),
          Rn(
            "beforesave",
            ((r = n),
            (e) => {
              const t = e.querySelector(`head link[href="${r}"]`);
              e.querySelector("head").append(t);
            })
          );
      },
    });
    const ys = {
      en: {
        status_at_publication: It`This section describes the status of this
      document at the time of its publication. A list of current W3C
      publications and the latest revision of this technical report can be found
      in the <a href="https://www.w3.org/TR/">W3C technical reports index</a> at
      https://www.w3.org/TR/.`,
      },
      ko: {
        status_at_publication: It`이 부분은 현재 문서의 발행 당시 상태에 대해
      기술합니다. W3C 발행 문서의 최신 목록 및 테크니컬 리포트 최신판을
      https://www.w3.org/TR/ 의
      <a href="https://www.w3.org/TR/">W3C technical reports index</a> 에서
      열람할 수 있습니다.`,
      },
      zh: {
        status_at_publication: It`本章节描述了本文档的发布状态。W3C的文档列
      表和最新版本可通过<a href="https://www.w3.org/TR/">W3C技术报告</a
      >索引访问。`,
      },
      ja: {
        status_at_publication: It`この節には、公開時点でのこの文書の位置づけが記されている。現時点でのW3Cの発行文書とこのテクニカルレポートの最新版は、下記から参照できる。
      <a href="https://www.w3.org/TR/">W3C technical reports index</a>
      (https://www.w3.org/TR/)`,
      },
      es: {
        status_at_publication: It`Esta sección describe el estado del presente
      documento al momento de su publicación. Una lista de las publicaciones
      actuales del W3C y la última revisión del presente informe técnico puede
      hallarse en http://www.w3.org/TR/
      <a href="https://www.w3.org/TR/">el índice de informes técnicos</a> del
      W3C.`,
      },
      de: {
        status_at_publication: It`Dieser Abschnitt beschreibt den Status des
      Dokuments zum Zeitpunkt der Publikation. Eine Liste der aktuellen
      Publikatinen des W3C und die aktuellste Fassung dieser Spezifikation kann
      im <a href="https://www.w3.org/TR/">W3C technical reports index</a> unter
      https://www.w3.org/TR/ abgerufen werden.`,
      },
    };
    Object.keys(ys).forEach((e) => {
      r[e] || (r[e] = {}), Object.assign(r[e], ys[e]);
    });
    var ws = Object.freeze({ __proto__: null, name: "w3c/l10n" });
    const vs = "core/github";
    let ks, $s;
    const xs = new Promise((e, t) => {
        (ks = e),
          ($s = (e) => {
            bn(e, vs), t(new Error(e));
          });
      }),
      _s = Yt({
        en: {
          file_a_bug: "File an issue",
          participate: "Participate:",
          commit_history: "Commit history",
        },
        ko: { participate: "참여" },
        zh: { file_a_bug: "反馈错误", participate: "参与：" },
        ja: {
          commit_history: "変更履歴",
          file_a_bug: "問題報告",
          participate: "参加方法：",
        },
        nl: {
          commit_history: "Revisiehistorie",
          file_a_bug: "Dien een melding in",
          participate: "Doe mee:",
        },
        es: {
          commit_history: "Historia de cambios",
          file_a_bug: "Nota un bug",
          participate: "Participe:",
        },
        de: {
          commit_history: "Revisionen",
          file_a_bug: "Fehler melden",
          participate: "Mitmachen:",
        },
      });
    var Cs = Object.freeze({
      __proto__: null,
      name: vs,
      github: xs,
      run: async function (e) {
        if (!e.hasOwnProperty("github") || !e.github) return void ks(null);
        if (
          "object" == typeof e.github &&
          !e.github.hasOwnProperty("repoURL")
        ) {
          const e = xn`Config option ${"[github]"} is missing property \`repoURL\`.`;
          return void $s(e);
        }
        let t,
          n = e.github.repoURL || e.github;
        n.endsWith("/") || (n += "/");
        try {
          t = new URL(n, "https://github.com");
        } catch {
          const e = xn`${"[github]"} configuration option is not a valid URL? (${n}).`;
          return void $s(e);
        }
        if ("https://github.com" !== t.origin) {
          const e = xn`${"[github]"} configuration option must be HTTPS and pointing to GitHub. (${
            t.href
          }).`;
          return void $s(e);
        }
        const [r, s] = t.pathname.split("/").filter((e) => e);
        if (!r || !s) {
          const e = xn`${"[github]"} URL needs a path. For example, "w3c/my-spec".`;
          return void $s(e);
        }
        const i = e.github.branch || "gh-pages",
          o = new URL("./issues/", t).href,
          a = new URL("./commits/" + (e.github.branch ?? ""), t.href),
          c = {
            edDraftURI: `https://${r.toLowerCase()}.github.io/${s}/`,
            githubToken: void 0,
            githubUser: void 0,
            issueBase: o,
            atRiskBase: o,
            otherLinks: [],
            pullBase: new URL("./pulls/", t).href,
            shortName: s,
          };
        let l = "https://respec.org/github";
        if (e.githubAPI)
          if (new URL(e.githubAPI).hostname === window.parent.location.hostname)
            l = e.githubAPI;
          else {
            yn(
              "The `githubAPI` configuration option is private and should not be added manually.",
              vs
            );
          }
        if (!e.excludeGithubLinks) {
          const n = {
            key: _s.participate,
            data: [
              { value: `GitHub ${r}/${s}`, href: t },
              { value: _s.file_a_bug, href: c.issueBase },
              { value: _s.commit_history, href: a.href },
              { value: "Pull requests", href: c.pullBase },
            ],
          };
          e.otherLinks || (e.otherLinks = []), e.otherLinks.unshift(n);
        }
        const u = {
          branch: i,
          repoURL: t.href,
          apiBase: l,
          fullName: `${r}/${s}`,
          issuesURL: o,
          pullsURL: c.pullBase,
          newIssuesURL: new URL("./new/choose", o).href,
          commitHistoryURL: a.href,
        };
        ks(u);
        const d = { ...c, ...e, github: u, githubAPI: l };
        Object.assign(e, d);
      },
    });
    const Ss = "core/data-include";
    function Rs(e, t, n) {
      const r = document.querySelector(`[data-include-id=${t}]`),
        s = Qt(e, r.dataset.oninclude, n),
        i = "string" == typeof r.dataset.includeReplace;
      !(function (e, t, { replace: n }) {
        const { includeFormat: r } = e.dataset;
        let s = t;
        "markdown" === r && (s = Fn(s)),
          "text" === r ? (e.textContent = s) : (e.innerHTML = s),
          "markdown" === r && Vn(e),
          n && e.replaceWith(...e.childNodes);
      })(r, s, { replace: i }),
        i ||
          (function (e) {
            [
              "data-include",
              "data-include-format",
              "data-include-replace",
              "data-include-id",
              "oninclude",
            ].forEach((t) => e.removeAttribute(t));
          })(r);
    }
    var Es = Object.freeze({
      __proto__: null,
      name: Ss,
      run: async function () {
        const e = document.querySelectorAll("[data-include]"),
          t = Array.from(e).map(async (e) => {
            const t = e.dataset.include;
            if (!t) return;
            const n = "include-" + String(Math.random()).substr(2);
            e.dataset.includeId = n;
            try {
              const e = await fetch(t);
              Rs(await e.text(), n, t);
            } catch (n) {
              const r = `\`data-include\` failed: \`${t}\` (${n.message}).`;
              console.error(r, e, n), bn(r, Ss, { elements: [e] });
            }
          });
        await Promise.all(t);
      },
    });
    const As = "core/title",
      Ts = Yt({
        en: { default_title: "No Title" },
        de: { default_title: "Kein Titel" },
        zh: { default_title: "无标题" },
      });
    var Ls = Object.freeze({
      __proto__: null,
      name: As,
      run: function (e) {
        const t =
          document.querySelector("h1#title") || It`<h1 id="title"></h1>`;
        if (t.isConnected && "" === t.textContent.trim()) {
          bn(
            'The document is missing a title, so using a default title. To fix this, please give your document a `<title>`. If you need special markup in the document\'s title, please use a `<h1 id="title">`.',
            As,
            { title: "Document is missing a title", elements: [t] }
          );
        }
        t.id || (t.id = "title"),
          t.classList.add("title"),
          (function (e, t) {
            t.isConnected ||
              (t.textContent = document.title || "" + Ts.default_title);
            const n = document.createElement("h1");
            n.innerHTML = t.innerHTML
              .replace(/:<br>/g, ": ")
              .replace(/<br>/g, " - ");
            let r = Kt(n.textContent);
            if (e.isPreview && e.prNumber) {
              const n = e.prUrl || `${e.github.repoURL}pull/${e.prNumber}`,
                { childNodes: s } = It`
      Preview of PR <a href="${n}">#${e.prNumber}</a>:
    `;
              t.prepend(...s), (r = `Preview of PR #${e.prNumber}: ${r}`);
            }
            (document.title = r), (e.title = r);
          })(e, t),
          document.body.prepend(t);
      },
    });
    const Ps = "w3c/level",
      Is = Yt({ en: { level: "Level" } });
    var Ds = Object.freeze({
      __proto__: null,
      name: Ps,
      run: function (e) {
        if (!e.hasOwnProperty("level")) return;
        const t = document.querySelector("h1#title"),
          n = parseInt(e.level);
        if (!Number.isInteger(n) || n < 0) {
          bn(
            `The \`level\` configuration option must be a number greater or equal to 0. It is currently set to \`${n}\``,
            Ps,
            { title: "Invalid level config.", elements: [t] }
          );
        } else
          t.append(` ${Is.level} ${n}`),
            (document.title = `${document.title} ${Is.level} ${n}`),
            (e.shortName = `${e.shortName}-${n}`),
            (e.level = n);
      },
    });
    const Ns = "w3c/abstract",
      js = Yt({
        en: { abstract: "Abstract" },
        ko: { abstract: "요약" },
        zh: { abstract: "摘要" },
        ja: { abstract: "要約" },
        nl: { abstract: "Samenvatting" },
        es: { abstract: "Resumen" },
        de: { abstract: "Zusammenfassung" },
      });
    var Os = Object.freeze({
      __proto__: null,
      name: Ns,
      run: async function () {
        const e = document.getElementById("abstract");
        if (!e) {
          return void bn(
            'Document must have one element with `id="abstract"`.',
            Ns
          );
        }
        e.classList.add("introductory");
        let t = document.querySelector("#abstract>h2");
        t ||
          ((t = document.createElement("h2")),
          (t.textContent = js.abstract),
          e.prepend(t));
      },
    });
    var zs = Object.freeze({
      __proto__: null,
      name: "core/data-transform",
      run: function () {
        document.querySelectorAll("[data-transform]").forEach((e) => {
          (e.innerHTML = Qt(e.innerHTML, e.dataset.transform)),
            e.removeAttribute("data-transform");
        });
      },
    });
    const Ms = "core/dfn-abbr";
    function Us(e) {
      const t = (n = e).dataset.abbr
        ? n.dataset.abbr
        : n.textContent
            .match(/\b([a-z])/gi)
            .join("")
            .toUpperCase();
      var n;
      const r = e.textContent.replace(/\s\s+/g, " ").trim();
      e.insertAdjacentHTML("afterend", ` (<abbr title="${r}">${t}</abbr>)`);
      const s = e.dataset.lt || "";
      e.dataset.lt = s
        .split("|")
        .filter((e) => e.trim())
        .concat(t)
        .join("|");
    }
    var Ws = Object.freeze({
      __proto__: null,
      name: Ms,
      run: function () {
        const e = document.querySelectorAll("[data-abbr]");
        for (const t of e) {
          const { localName: e } = t;
          switch (e) {
            case "dfn":
              Us(t);
              break;
            default:
              bn(
                `\`data-abbr\` attribute not supported on \`${e}\` elements.`,
                Ms,
                { elements: [t], title: "Error: unsupported." }
              );
          }
        }
      },
    });
    const qs = /^[a-z]+(\s+[a-z]+)+\??$/,
      Fs = /\B"([^"]*)"\B/,
      Bs = /(\w+)\((.*)\)$/,
      Hs = /\[\[(\w+(?: +\w+)*)\]\](\([^)]*\))?$/,
      Gs = /^((?:\[\[)?(?:\w+(?: +\w+)*)(?:\]\])?)$/,
      Vs = /^(?:\w+)\??$/,
      Ks = /^(\w+)\["([\w- ]*)"\]$/,
      Ys = /\.?(\w+\(.*\)$)/,
      Zs = /\/(.+)/,
      Js = /\[\[.+\]\]/;
    function Qs(e) {
      const { identifier: t, renderParent: n, nullable: r } = e;
      if (n)
        return It`<a
      data-xref-type="_IDL_"
      data-link-type="idl"
      data-lt="${t}"
      ><code>${t + (r ? "?" : "")}</code></a
    >`;
    }
    function Xs(e) {
      const {
          identifier: t,
          parent: n,
          slotType: r,
          renderParent: s,
          args: i,
        } = e,
        { identifier: o } = n || {},
        a = "method" === r,
        c = a ? It`(${en(i, ei)})` : null,
        l = a ? `(${i.join(", ")})` : "";
      return It`${n && s ? "." : ""}<a
      data-xref-type="${r}"
      data-link-for="${o}"
      data-xref-for="${o}"
      data-lt="${`[[${t}]]${l}`}"
      ><code>[[${t}]]${c}</code></a
    >`;
    }
    function ei(e, t, n) {
      if (t < n.length - 1) return It`<var>${e}</var>`;
      const r = e.split(/(^\.{3})(.+)/),
        s = r.length > 1,
        i = s ? r[2] : r[0];
      return It`${s ? "..." : null}<var>${i}</var>`;
    }
    function ti(e) {
      const { parent: t, identifier: n, renderParent: r } = e,
        { identifier: s } = t || {};
      return It`${r ? "." : ""}<a
      data-link-type="idl"
      data-xref-type="attribute|dict-member|const"
      data-link-for="${s}"
      data-xref-for="${s}"
      ><code>${n}</code></a
    >`;
    }
    function ni(e) {
      const { args: t, identifier: n, type: r, parent: s, renderParent: i } = e,
        { identifier: o } = s || {},
        a = en(t, ei),
        c = `${n}(${t.join(", ")})`;
      return It`${s && i ? "." : ""}<a
      data-link-type="idl"
      data-xref-type="${r}"
      data-link-for="${o}"
      data-xref-for="${o}"
      data-lt="${c}"
      ><code>${n}</code></a
    ><code>(${a})</code>`;
    }
    function ri(e) {
      const { identifier: t, enumValue: n, parent: r } = e,
        s = r ? r.identifier : t;
      return It`"<a
      data-link-type="idl"
      data-xref-type="enum-value"
      data-link-for="${s}"
      data-xref-for="${s}"
      data-lt="${n ? null : "the-empty-string"}"
      ><code>${n}</code></a
    >"`;
    }
    function si(e) {
      const { identifier: t } = e;
      return It`"<a
      data-link-type="idl"
      data-cite="WebIDL"
      data-xref-type="exception"
      ><code>${t}</code></a
    >"`;
    }
    function ii(e) {
      const { identifier: t, nullable: n } = e;
      return It`<a
    data-link-type="idl"
    data-cite="WebIDL"
    data-xref-type="interface"
    data-lt="${t}"
    ><code>${t + (n ? "?" : "")}</code></a
  >`;
    }
    function oi(e) {
      let t;
      try {
        t = (function (e) {
          const t = Js.test(e),
            n = t ? Zs : Ys,
            [r, s] = e.split(n);
          if (t && r && !s)
            throw new SyntaxError(
              `Internal slot missing "for" part. Expected \`{{ InterfaceName/${r}}}\` }.`
            );
          const i = r
              .split(/[./]/)
              .concat(s)
              .filter((e) => e && e.trim())
              .map((e) => e.trim()),
            o = !e.includes("/"),
            a = [];
          for (; i.length; ) {
            const t = i.pop();
            if (Bs.test(t)) {
              const [, e, n] = t.match(Bs),
                r = n.split(/,\s*/).filter((e) => e);
              a.push({
                type: "method",
                identifier: e,
                args: r,
                renderParent: o,
              });
            } else if (Ks.test(t)) {
              const [, e, n] = t.match(Ks);
              a.push({
                type: "enum",
                identifier: e,
                enumValue: n,
                renderParent: o,
              });
            } else if (Fs.test(t)) {
              const [, e] = t.match(Fs);
              o
                ? a.push({ type: "exception", identifier: e })
                : a.push({ type: "enum", enumValue: e, renderParent: o });
            } else if (Hs.test(t)) {
              const [, e, n] = t.match(Hs),
                r = n ? "method" : "attribute",
                s = n
                  ?.slice(1, -1)
                  .split(/,\s*/)
                  .filter((e) => e);
              a.push({
                type: "internal-slot",
                slotType: r,
                identifier: e,
                args: s,
                renderParent: o,
              });
            } else if (Gs.test(t) && i.length) {
              const [, e] = t.match(Gs);
              a.push({ type: "attribute", identifier: e, renderParent: o });
            } else if (qs.test(t)) {
              const e = t.endsWith("?"),
                n = e ? t.slice(0, -1) : t;
              a.push({
                type: "idl-primitive",
                identifier: n,
                renderParent: o,
                nullable: e,
              });
            } else {
              if (!Vs.test(t) || 0 !== i.length)
                throw new SyntaxError(
                  `IDL micro-syntax parsing error in \`{{ ${e} }}\``
                );
              {
                const e = t.endsWith("?"),
                  n = e ? t.slice(0, -1) : t;
                a.push({
                  type: "base",
                  identifier: n,
                  renderParent: o,
                  nullable: e,
                });
              }
            }
          }
          return (
            a.forEach((e, t, n) => {
              e.parent = n[t + 1] || null;
            }),
            a.reverse()
          );
        })(e);
      } catch (t) {
        const n = It`<span>{{ ${e} }}</span>`,
          r = "Error: Invalid inline IDL string.";
        return bn(t.message, "core/inlines", { title: r, elements: [n] }), n;
      }
      const n = It(document.createDocumentFragment()),
        r = [];
      for (const e of t)
        switch (e.type) {
          case "base": {
            const t = Qs(e);
            t && r.push(t);
            break;
          }
          case "attribute":
            r.push(ti(e));
            break;
          case "internal-slot":
            r.push(Xs(e));
            break;
          case "method":
            r.push(ni(e));
            break;
          case "enum":
            r.push(ri(e));
            break;
          case "exception":
            r.push(si(e));
            break;
          case "idl-primitive":
            r.push(ii(e));
            break;
          default:
            throw new Error("Unknown type.");
        }
      return n`${r}`;
    }
    const ai = new Set(["alias", "reference"]),
      ci = (async function () {
        const e = await Lt.openDB("respec-biblio2", 12, {
            upgrade(e) {
              Array.from(e.objectStoreNames).map((t) => e.deleteObjectStore(t));
              e
                .createObjectStore("alias", { keyPath: "id" })
                .createIndex("aliasOf", "aliasOf", { unique: !1 }),
                e.createObjectStore("reference", { keyPath: "id" });
            },
          }),
          t = Date.now();
        for (const n of [...ai]) {
          const r = e.transaction(n, "readwrite").store,
            s = IDBKeyRange.lowerBound(t);
          let i = await r.openCursor(s);
          for (; i?.value; ) {
            const e = i.value;
            (void 0 === e.expires || e.expires < t) && (await r.delete(e.id)),
              (i = await i.continue());
          }
        }
        return e;
      })();
    const li = {
        get ready() {
          return ci;
        },
        async find(e) {
          return (
            (await this.isAlias(e)) && (e = await this.resolveAlias(e)),
            await this.get("reference", e)
          );
        },
        async has(e, t) {
          if (!ai.has(e)) throw new TypeError("Invalid type: " + e);
          if (!t) throw new TypeError("id is required");
          const n = (await this.ready).transaction(e, "readonly").store,
            r = IDBKeyRange.only(t);
          return !!(await n.openCursor(r));
        },
        async isAlias(e) {
          return await this.has("alias", e);
        },
        async resolveAlias(e) {
          if (!e) throw new TypeError("id is required");
          const t = (await this.ready).transaction("alias", "readonly").store,
            n = IDBKeyRange.only(e),
            r = await t.openCursor(n);
          return r ? r.value.aliasOf : r;
        },
        async get(e, t) {
          if (!ai.has(e)) throw new TypeError("Invalid type: " + e);
          if (!t) throw new TypeError("id is required");
          const n = (await this.ready).transaction(e, "readonly").store,
            r = IDBKeyRange.only(t),
            s = await n.openCursor(r);
          return s ? s.value : s;
        },
        async addAll(e, t) {
          if (!e) return;
          const n = { alias: [], reference: [] };
          for (const r of Object.keys(e)) {
            const s = { id: r, ...e[r], expires: t };
            s.aliasOf ? n.alias.push(s) : n.reference.push(s);
          }
          const r = [...ai].flatMap((e) => n[e].map((t) => this.add(e, t)));
          await Promise.all(r);
        },
        async add(e, t) {
          if (!ai.has(e)) throw new TypeError("Invalid type: " + e);
          if ("object" != typeof t)
            throw new TypeError("details should be an object");
          if ("alias" === e && !t.hasOwnProperty("aliasOf"))
            throw new TypeError("Invalid alias object.");
          const n = await this.ready;
          let r = await this.has(e, t.id);
          if (r) {
            const s = await this.get(e, t.id);
            if (s?.expires < Date.now()) {
              const { store: s } = n.transaction(e, "readwrite");
              await s.delete(t.id), (r = !1);
            }
          }
          const { store: s } = n.transaction(e, "readwrite");
          return r ? await s.put(t) : await s.add(t);
        },
        async close() {
          (await this.ready).close();
        },
        async clear() {
          const e = await this.ready,
            t = [...ai],
            n = e.transaction(t, "readwrite"),
            r = t.map((e) => n.objectStore(e).clear());
          await Promise.all(r);
        },
      },
      ui = {},
      di = new URL("https://api.specref.org/bibrefs?refs="),
      pi = Ut({ hint: "dns-prefetch", href: di.origin });
    let hi;
    document.head.appendChild(pi);
    const fi = new Promise((e) => {
      hi = e;
    });
    async function mi(e, t = { forceUpdate: !1 }) {
      const n = [...new Set(e)].filter((e) => e.trim());
      if (!n.length || !1 === navigator.onLine) return null;
      let r;
      try {
        r = await fetch(di.href + n.join(","));
      } catch (e) {
        return console.error(e), null;
      }
      if ((!t.forceUpdate && !r.ok) || 200 !== r.status) return null;
      const s = await r.json(),
        i = Date.now() + 36e5;
      try {
        const e = r.headers.has("Expires")
          ? Math.min(Date.parse(r.headers.get("Expires")), i)
          : i;
        await li.addAll(s, e);
      } catch (e) {
        console.error(e);
      }
      return s;
    }
    async function gi(e) {
      const t = await fi;
      if (!t.hasOwnProperty(e)) return null;
      const n = t[e];
      return n.aliasOf ? await gi(n.aliasOf) : n;
    }
    var bi = Object.freeze({
      __proto__: null,
      biblio: ui,
      name: "core/biblio",
      updateFromNetwork: mi,
      resolveRef: gi,
      Plugin: class {
        constructor(e) {
          this.conf = e;
        }
        normalizeReferences() {
          const e = new Set(
            [...this.conf.normativeReferences].map((e) => e.toLowerCase())
          );
          Array.from(this.conf.informativeReferences)
            .filter((t) => e.has(t.toLowerCase()))
            .forEach((e) => this.conf.informativeReferences.delete(e));
        }
        getRefKeys() {
          return {
            informativeReferences: Array.from(this.conf.informativeReferences),
            normativeReferences: Array.from(this.conf.normativeReferences),
          };
        }
        async run() {
          this.conf.localBiblio || (this.conf.localBiblio = {}),
            (this.conf.biblio = ui);
          const e = Object.keys(this.conf.localBiblio)
            .filter((e) => this.conf.localBiblio[e].hasOwnProperty("aliasOf"))
            .map((e) => this.conf.localBiblio[e].aliasOf)
            .filter((e) => !this.conf.localBiblio.hasOwnProperty(e));
          this.normalizeReferences();
          const t = this.getRefKeys(),
            n = Array.from(
              new Set(
                t.normativeReferences
                  .concat(t.informativeReferences)
                  .filter((e) => !this.conf.localBiblio.hasOwnProperty(e))
                  .concat(e)
                  .sort()
              )
            ),
            r = n.length
              ? await (async function (e) {
                  const t = [];
                  try {
                    await li.ready;
                    const n = e.map(async (e) => ({
                      id: e,
                      data: await li.find(e),
                    }));
                    t.push(...(await Promise.all(n)));
                  } catch (n) {
                    t.push(...e.map((e) => ({ id: e, data: null }))),
                      console.warn(n);
                  }
                  return t;
                })(n)
              : [],
            s = { hasData: [], noData: [] };
          r.forEach((e) => {
            (e.data ? s.hasData : s.noData).push(e);
          }),
            s.hasData.forEach((e) => {
              ui[e.id] = e.data;
            });
          const i = s.noData.map((e) => e.id);
          if (i.length) {
            const e = await mi(i, { forceUpdate: !0 });
            Object.assign(ui, e);
          }
          Object.assign(ui, this.conf.localBiblio),
            (() => {
              hi(this.conf.biblio);
            })();
        }
      },
    });
    const yi = "core/render-biblio",
      wi = Yt({
        en: {
          info_references: "Informative references",
          norm_references: "Normative references",
          references: "References",
        },
        ko: { references: "참조" },
        nl: {
          info_references: "Informatieve referenties",
          norm_references: "Normatieve referenties",
          references: "Referenties",
        },
        es: {
          info_references: "Referencias informativas",
          norm_references: "Referencias normativas",
          references: "Referencias",
        },
        ja: {
          info_references: "参照用参考文献",
          norm_references: "規範的参考文献",
          references: "参考文献",
        },
        de: {
          info_references: "Weiterführende Informationen",
          norm_references: "Normen und Spezifikationen",
          references: "Referenzen",
        },
        zh: {
          info_references: "非规范性引用",
          norm_references: "规范性引用",
          references: "参考文献",
        },
      }),
      vi = new Map([
        ["CR", "W3C Candidate Recommendation"],
        ["ED", "W3C Editor's Draft"],
        ["LCWD", "W3C Last Call Working Draft"],
        ["NOTE", "W3C Working Group Note"],
        ["PER", "W3C Proposed Edited Recommendation"],
        ["PR", "W3C Proposed Recommendation"],
        ["REC", "W3C Recommendation"],
        ["WD", "W3C Working Draft"],
      ]),
      ki =
        (($i = "."),
        (e) => {
          const t = e.trim();
          return !t || t.endsWith($i) ? t : t + $i;
        });
    var $i;
    function xi(e, t) {
      const { goodRefs: n, badRefs: r } = (function (e) {
          const t = [],
            n = [];
          for (const r of e) r.refcontent ? t.push(r) : n.push(r);
          return { goodRefs: t, badRefs: n };
        })(e.map(_i)),
        s = (function (e) {
          const t = new Map();
          for (const n of e)
            t.has(n.refcontent.id) || t.set(n.refcontent.id, n);
          return [...t.values()];
        })(n),
        i = s
          .concat(r)
          .sort((e, t) =>
            e.ref.toLocaleLowerCase().localeCompare(t.ref.toLocaleLowerCase())
          ),
        o = It`<section>
    <h3>${t}</h3>
    <dl class="bibliography">${i.map(Si)}</dl>
  </section>`;
      rn(o, "", t);
      return (
        (function (e, t) {
          e.map(({ ref: e, refcontent: n }) => {
            const r = "#bib-" + e.toLowerCase(),
              s = t
                .get(n.id)
                .map((e) => `a.bibref[href="#bib-${e.toLowerCase()}"]`)
                .join(",");
            return {
              refUrl: r,
              elems: document.querySelectorAll(s),
              refcontent: n,
            };
          }).forEach(({ refUrl: e, elems: t, refcontent: n }) => {
            t.forEach((t) => {
              t.setAttribute("href", e),
                t.setAttribute("title", n.title),
                (t.dataset.linkType = "biblio");
            });
          });
        })(
          s,
          (function (e) {
            return e.reduce((e, t) => {
              const n = t.refcontent.id;
              return (e.has(n) ? e.get(n) : e.set(n, []).get(n)).push(t.ref), e;
            }, new Map());
          })(n)
        ),
        (function (e) {
          e.forEach(({ ref: e }) => {
            const t = [
              ...document.querySelectorAll(
                `a.bibref[href="#bib-${e.toLowerCase()}"]`
              ),
            ].filter(
              ({ textContent: t }) => t.toLowerCase() === e.toLowerCase()
            );
            bn(`Bad reference: [\`${e}\`] (appears ${t.length} times)`, yi),
              console.warn("Bad references: ", t);
          });
        })(r),
        o
      );
    }
    function _i(e) {
      let t = ui[e],
        n = e;
      const r = new Set([n]);
      for (; t && t.aliasOf; )
        if (r.has(t.aliasOf)) {
          t = null;
          bn(
            `Circular reference in biblio DB between [\`${e}\`] and [\`${n}\`].`,
            yi
          );
        } else (n = t.aliasOf), (t = ui[n]), r.add(n);
      return t && !t.id && (t.id = e.toLowerCase()), { ref: e, refcontent: t };
    }
    function Ci(e, t) {
      const n = e.replace(/^(!|\?)/, ""),
        r = "#bib-" + n.toLowerCase(),
        s = It`<cite
    ><a class="bibref" href="${r}" data-link-type="biblio">${t || n}</a></cite
  >`;
      return t ? s : It`[${s}]`;
    }
    function Si({ ref: e, refcontent: t }) {
      const n = "bib-" + e.toLowerCase();
      return t
        ? It`
      <dt id="${n}">[${e}]</dt>
      <dd>${{ html: Ri(t) }}</dd>
    `
        : It`
      <dt id="${n}">[${e}]</dt>
      <dd><em class="respec-offending-element">Reference not found.</em></dd>
    `;
    }
    function Ri(e) {
      if ("string" == typeof e) return e;
      let t = `<cite>${e.title}</cite>`;
      return (
        (t = e.href ? `<a href="${e.href}">${t}</a>. ` : t + ". "),
        e.authors &&
          e.authors.length &&
          ((t += e.authors.join("; ")), e.etAl && (t += " et al"), (t += ". ")),
        e.publisher && (t = `${t} ${ki(e.publisher)} `),
        e.date && (t += e.date + ". "),
        e.status && (t += (vi.get(e.status) || e.status) + ". "),
        e.href && (t += `URL: <a href="${e.href}">${e.href}</a>`),
        t
      );
    }
    var Ei = Object.freeze({
      __proto__: null,
      name: yi,
      run: function (e) {
        const t = Array.from(e.informativeReferences),
          n = Array.from(e.normativeReferences);
        if (!t.length && !n.length) return;
        const r =
          document.querySelector("section#references") ||
          It`<section id="references"></section>`;
        if (
          (document.querySelector("section#references > h2") ||
            r.prepend(It`<h2>${wi.references}</h2>`),
          r.classList.add("appendix"),
          n.length)
        ) {
          const e = xi(n, wi.norm_references);
          r.appendChild(e);
        }
        if (t.length) {
          const e = xi(t, wi.info_references);
          r.appendChild(e);
        }
        document.body.appendChild(r);
      },
      renderInlineCitation: Ci,
    });
    const Ai = "core/inlines",
      Ti = {},
      Li = (e) => new RegExp(e.map((e) => e.source).join("|")),
      Pi = Yt({
        en: {
          rfc2119Keywords: () =>
            Li([
              /\bMUST(?:\s+NOT)?\b/,
              /\bSHOULD(?:\s+NOT)?\b/,
              /\bSHALL(?:\s+NOT)?\b/,
              /\bMAY?\b/,
              /\b(?:NOT\s+)?REQUIRED\b/,
              /\b(?:NOT\s+)?RECOMMENDED\b/,
              /\bOPTIONAL\b/,
            ]),
        },
        de: {
          rfc2119Keywords: () =>
            Li([
              /\bMUSS\b/,
              /\bERFORDERLICH\b/,
              /\b(?:NICHT\s+)?NÖTIG\b/,
              /\bDARF(?:\s+NICHT)?\b/,
              /\bVERBOTEN\b/,
              /\bSOLL(?:\s+NICHT)?\b/,
              /\b(?:NICHT\s+)?EMPFOHLEN\b/,
              /\bKANN\b/,
              /\bOPTIONAL\b/,
            ]),
        },
      }),
      Ii = /(?:`[^`]+`)(?!`)/,
      Di = /(?:{{[^}]+\?*}})/,
      Ni = /\B\|\w[\w\s]*(?:\s*:[\w\s&;<>]+\??)?\|\B/,
      ji = /(?:\[\[(?:!|\\|\?)?[\w.-]+(?:|[^\]]+)?\]\])/,
      Oi = /(?:\[\[\[(?:!|\\|\?)?#?[\w-.]+\]\]\])/,
      zi = /(?:\[=[^=]+=\])/,
      Mi = /(?:\[\^[^^]+\^\])/;
    function Ui(e) {
      const t = e.slice(2, -2).trim(),
        [n, r, s] = t
          .split("/", 3)
          .map((e) => e && e.trim())
          .filter((e) => !!e),
        [i, o, a] = t.startsWith("/")
          ? ["element-attr", null, n]
          : s
          ? ["attr-value", `${n}/${r}`, s]
          : r
          ? ["element-attr", n, r]
          : ["element", null, n];
      return It`<code
    ><a data-xref-type="${i}" data-xref-for="${o}"
      >${a}</a
    ></code
  >`;
    }
    function Wi(e) {
      const t = Kt(e),
        n = It`<em class="rfc2119">${t}</em>`;
      return (Ti[t] = !0), n;
    }
    function qi(e) {
      const t = e.slice(3, -3).trim();
      return t.startsWith("#")
        ? It`<a href="${t}"></a>`
        : It`<a data-cite="${t}"></a>`;
    }
    function Fi(e, t) {
      const n = Kt(e.slice(2, -2));
      if (n.startsWith("\\")) return e.replace("\\", "");
      const r = oi(n);
      return !!t.parentElement.closest("dfn") ? Ki(`\`${r.textContent}\``) : r;
    }
    function Bi(e, t, n) {
      const r = e.slice(2, -2);
      if (r.startsWith("\\")) return [`[[${r.slice(1)}]]`];
      const [s, i] = r.split("|").map(Kt),
        { type: o, illegal: a } = an(s, t.parentElement),
        c = Ci(s, i),
        l = s.replace(/^(!|\?)/, "");
      if (a && !n.normativeReferences.has(l)) {
        const e = c.childNodes[1] || c;
        yn(
          "Normative references in informative sections are not allowed. ",
          Ai,
          {
            elements: [e],
            hint: `Remove '!' from the start of the reference \`[[${r}]]\``,
          }
        );
      }
      return (
        "informative" !== o || a
          ? n.normativeReferences.add(l)
          : n.informativeReferences.add(l),
        c.childNodes[1] ? c.childNodes : [c]
      );
    }
    function Hi(e, t, n) {
      return "ABBR" === t.parentElement.tagName
        ? e
        : It`<abbr title="${n.get(e)}">${e}</abbr>`;
    }
    function Gi(e) {
      const t = e.slice(1, -1).split(":", 2),
        [n, r] = t.map((e) => e.trim());
      return It`<var data-type="${r}">${n}</var>`;
    }
    function Vi(e) {
      const t = (function (e) {
          const t = (e) => e.replace("%%", "/").split("/").map(Kt).join("/"),
            n = e.replace("\\/", "%%"),
            r = n.lastIndexOf("/");
          if (-1 === r) return [t(n)];
          const s = n.substring(0, r),
            i = n.substring(r + 1, n.length);
          return [t(s), t(i)];
        })((e = e.slice(2, -2))),
        [n, r] = 2 === t.length ? t : [null, t[0]],
        [s, i] = r.includes("|")
          ? r.split("|", 2).map((e) => e.trim())
          : [null, r],
        o = Yi(i),
        a = n ? Kt(n) : null;
      return It`<a
    data-link-type="dfn"
    data-link-for="${a}"
    data-xref-for="${a}"
    data-lt="${s}"
    >${o}</a
  >`;
    }
    function Ki(e) {
      const t = e.slice(1, -1);
      return It`<code>${t}</code>`;
    }
    function Yi(e) {
      return Ii.test(e)
        ? e
            .split(/(`[^`]+`)(?!`)/)
            .map((e) => (e.startsWith("`") ? Ki(e) : Yi(e)))
        : document.createTextNode(e);
    }
    var Zi = Object.freeze({
      __proto__: null,
      name: Ai,
      rfc2119Usage: Ti,
      run: function (e) {
        const t = new Map();
        document.normalize(),
          document.querySelector("section#conformance") ||
            document.body.classList.add("informative"),
          (e.normativeReferences = new dn()),
          (e.informativeReferences = new dn()),
          e.respecRFC2119 || (e.respecRFC2119 = Ti);
        const n = document.querySelectorAll("abbr[title]:not(.exclude)");
        for (const { textContent: e, title: r } of n) {
          const n = Kt(e),
            s = Kt(r);
          t.set(n, s);
        }
        const r = t.size
            ? new RegExp(`(?:\\b${[...t.keys()].join("\\b)|(?:\\b")}\\b)`)
            : null,
          s = (function (e, t = [], n = { wsNodes: !0 }) {
            const r = t.join(", "),
              s = document.createNodeIterator(e, NodeFilter.SHOW_TEXT, (e) =>
                n.wsNodes || e.data.trim()
                  ? r && e.parentElement.closest(r)
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT
                  : NodeFilter.FILTER_REJECT
              ),
              i = [];
            let o;
            for (; (o = s.nextNode()); ) i.push(o);
            return i;
          })(document.body, ["#respec-ui", ".head", "pre"], { wsNodes: !1 }),
          i = Pi.rfc2119Keywords(),
          o = new RegExp(
            `(${Li([i, Di, Ni, ji, Oi, zi, Ii, Mi, ...(r ? [r] : [])]).source})`
          );
        for (const n of s) {
          const r = n.data.split(o);
          if (1 === r.length) continue;
          const s = document.createDocumentFragment();
          let a = !0;
          for (const o of r)
            if (((a = !a), a))
              switch (!0) {
                case o.startsWith("{{"):
                  s.append(Fi(o, n));
                  break;
                case o.startsWith("[[["):
                  s.append(qi(o));
                  break;
                case o.startsWith("[["):
                  s.append(...Bi(o, n, e));
                  break;
                case o.startsWith("|"):
                  s.append(Gi(o));
                  break;
                case o.startsWith("[="):
                  s.append(Vi(o));
                  break;
                case o.startsWith("`"):
                  s.append(Ki(o));
                  break;
                case o.startsWith("[^"):
                  s.append(Ui(o));
                  break;
                case t.has(o):
                  s.append(Hi(o, n, t));
                  break;
                case i.test(o):
                  s.append(Wi(o));
              }
            else s.append(o);
          n.replaceWith(s);
        }
      },
    });
    const Ji = "w3c/conformance",
      Qi = Yt({
        en: {
          conformance: "Conformance",
          normativity:
            "As well as sections marked as non-normative, all authoring guidelines, diagrams, examples, and notes in this specification are non-normative. Everything else in this specification is normative.",
          keywordInterpretation: (e, t) => It`<p>
        The key word${t ? "s" : ""} ${e} in this document
        ${t ? "are" : "is"} to be interpreted as described in
        <a href="https://datatracker.ietf.org/doc/html/bcp14">BCP 14</a>
        ${Ci("RFC2119")} ${Ci("RFC8174")}
        when, and only when, they appear in all capitals, as shown here.
      </p>`,
        },
        de: {
          conformance: "Anforderungen",
          normativity:
            "Neben den explizit als nicht-normativ gekennzeichneten Abschnitten sind auch alle Diagramme, Beispiele und Hinweise in diesem Dokument nicht normativ. Alle anderen Angaben sind normativ.",
          keywordInterpretation: (e, t) => It`<p>
        ${t ? "Die Schlüsselwörter" : "Das Schlüsselwort"} ${e} in
        diesem Dokument ${t ? "sind" : "ist"} gemäß
        <a href="https://datatracker.ietf.org/doc/html/bcp14">BCP 14</a>
        ${Ci("RFC2119")} ${Ci("RFC8174")}
        und unter Berücksichtigung von
        <a href="https://github.com/adfinis-sygroup/2119/blob/master/2119de.rst"
          >2119de</a
        >
        zu interpretieren, wenn und nur wenn ${t ? "sie" : "es"} wie hier
        gezeigt durchgehend groß geschrieben wurde${t ? "n" : ""}.
      </p>`,
        },
      });
    var Xi = Object.freeze({
      __proto__: null,
      name: Ji,
      run: function (e) {
        const t = document.querySelector("section#conformance");
        if (
          (t &&
            !t.classList.contains("override") &&
            (function (e, t) {
              const n = [...Object.keys(Ti)];
              n.length &&
                (t.normativeReferences.add("RFC2119"),
                t.normativeReferences.add("RFC8174"));
              const r = tn(n.sort(), (e) => It`<em class="rfc2119">${e}</em>`),
                s = n.length > 1,
                i = It`
    <h2>${Qi.conformance}</h2>
    <p>${Qi.normativity}</p>
    ${n.length ? Qi.keywordInterpretation(r, s) : null}
  `;
              e.prepend(...i.childNodes);
            })(t, e),
          !t && Object.keys(Ti).length)
        ) {
          yn(
            "Document uses RFC2119 keywords but lacks a conformance section.",
            Ji,
            { hint: 'Please add a `<section id="conformance">`.' }
          );
        }
      },
    });
    function eo(e, t, n, r) {
      try {
        switch (t) {
          case "attribute":
            return document.createAttribute(e), !0;
          case "element":
            return document.createElement(e), !0;
        }
      } catch (s) {
        bn(`Invalid ${t} name "${e}": ${s.message}`, r, {
          hint: `Check that the ${t} name is allowed per the XML's Name production for ${t}.`,
          elements: [n],
        });
      }
      return !1;
    }
    function to(e, t, n, r) {
      if (/^[a-z]+(-[a-z]+)*$/i.test(e)) return !0;
      return (
        bn(`Invalid ${t} name "${e}".`, r, {
          hint: `Check that the ${t} name is allowed per the naming rules for this type.`,
          elements: [n],
        }),
        !1
      );
    }
    const no = new mn();
    function ro(e, t) {
      for (const n of t) no.has(n) || no.set(n, new Set()), no.get(n).add(e);
    }
    const so = "core/dfn",
      io = new Map([
        ["abstract-op", { requiresFor: !1 }],
        ["attribute", { requiresFor: !1, validator: eo }],
        [
          "attr-value",
          {
            requiresFor: !0,
            associateWith: "an HTML attribute",
            validator: to,
          },
        ],
        ["element", { requiresFor: !1, validator: eo }],
        [
          "element-state",
          {
            requiresFor: !0,
            associateWith: "an HTML attribute",
            validator: to,
          },
        ],
        ["event", { requiresFor: !1, validator: to }],
        ["http-header", { requiresFor: !1 }],
        [
          "media-type",
          {
            requiresFor: !1,
            validator: function (e, t, n, r) {
              try {
                const t = new jt(e);
                if (t.toString() !== e)
                  throw new Error(
                    `Input doesn't match its canonical form: "${t}".`
                  );
              } catch (s) {
                return (
                  bn(`Invalid ${t} "${e}": ${s.message}.`, r, {
                    hint: "Check that the MIME type has both a type and a sub-type, and that it's in a canonical form (e.g., `text/plain`).",
                    elements: [n],
                  }),
                  !1
                );
              }
              return !0;
            },
          },
        ],
        ["scheme", { requiresFor: !1, validator: to }],
        [
          "permission",
          {
            requiresFor: !1,
            validator: function (e, t, n, r) {
              return e.startsWith('"') && e.endsWith('"')
                ? to(e.slice(1, -1), t, n, r)
                : (bn(`Invalid ${t} "${e}".`, r, {
                    hint: `Check that the ${t} is quoted with double quotes.`,
                    elements: [n],
                  }),
                  !1);
            },
          },
        ],
      ]),
      oo = [...io.keys()];
    function ao(e, t) {
      let n = "";
      switch (!0) {
        case oo.some((t) => e.classList.contains(t)):
          (n = [...e.classList].find((e) => io.has(e))),
            (function (e, t, n) {
              const r = io.get(t);
              if (r.requiresFor && !n.dataset.dfnFor) {
                const e = xn`Definition of type "\`${t}\`" requires a ${"[data-dfn-for]"} attribute.`,
                  { associateWith: s } = r,
                  i = xn`Use a ${"[data-dfn-for]"} attribute to associate this with ${s}.`;
                bn(e, so, { hint: i, elements: [n] });
              }
              r.validator && r.validator(e, t, n, so);
            })(t, n, e);
          break;
        case Hs.test(t):
          n = (function (e, t) {
            t.dataset.hasOwnProperty("idl") || (t.dataset.idl = "");
            const n = t.closest("[data-dfn-for]");
            t !== n &&
              n?.dataset.dfnFor &&
              (t.dataset.dfnFor = n.dataset.dfnFor);
            if (!t.dataset.dfnFor) {
              const n = xn`Use a ${"[data-dfn-for]"} attribute to associate this dfn with a WebIDL interface.`;
              bn(
                `Internal slot "${e}" must be associated with a WebIDL interface.`,
                so,
                { hint: n, elements: [t] }
              );
            }
            t.matches(".export, [data-export]") || (t.dataset.noexport = "");
            const r = e.endsWith(")") ? "method" : "attribute";
            if (!t.dataset.dfnType) return r;
            const s = ["attribute", "method"],
              { dfnType: i } = t.dataset;
            if (!s.includes(i) || r !== i) {
              const n = xn`Invalid ${"[data-dfn-type]"} attribute on internal slot.`,
                i = `The only allowed types are: ${vn(s, {
                  quotes: !0,
                })}. The slot "${e}" seems to be a "${wn(r)}"?`;
              return bn(n, so, { hint: i, elements: [t] }), "dfn";
            }
            return i;
          })(t, e);
      }
      if (!n && !e.matches("[data-dfn-type]")) {
        const t = e.closest("[data-dfn-type]");
        n = t?.dataset.dfnType;
      }
      n && !e.dataset.dfnType && (e.dataset.dfnType = n);
    }
    function co(e) {
      switch (!0) {
        case e.matches(".export.no-export"):
          bn(
            xn`Declares both "${"[no-export]"}" and "${"[export]"}" CSS class.`,
            so,
            { elements: [e], hint: "Please use only one." }
          );
          break;
        case e.matches(".no-export, [data-noexport]"):
          if (e.matches("[data-export]")) {
            bn(
              xn`Declares ${"[no-export]"} CSS class, but also has a "${"[data-export]"}" attribute.`,
              so,
              { elements: [e], hint: "Please chose only one." }
            ),
              delete e.dataset.export;
          }
          e.dataset.noexport = "";
          break;
        case e.matches(":is(.export):not([data-noexport], .no-export)"):
          e.dataset.export = "";
      }
    }
    function lo() {
      const e = document.querySelectorAll(
        "dfn:is([data-dfn-type=''],:not([data-dfn-type]))"
      );
      for (const t of e) t.dataset.dfnType = "dfn";
      const t = document.querySelectorAll(
        "dfn:not([data-noexport], [data-export], [data-dfn-type='dfn'], [data-cite])"
      );
      for (const e of t) e.dataset.export = "";
    }
    var uo = Object.freeze({
      __proto__: null,
      name: so,
      run: function () {
        for (const e of document.querySelectorAll("dfn")) {
          const t = sn(e);
          if ((ro(e, t), e.dataset.cite && /\b#\b/.test(e.dataset.cite)))
            continue;
          const [n] = t;
          ao(e, n),
            co(e),
            (1 === t.length && n === Kt(e.textContent)) ||
              (e.dataset.lt = t.join("|"));
        }
        Rn("plugins-done", lo);
      },
    });
    var po = Object.freeze({
      __proto__: null,
      name: "core/pluralize",
      run: function (e) {
        if (!e.pluralize) return;
        const t = (function () {
          const e = new Set();
          document.querySelectorAll("a:not([href])").forEach((t) => {
            const n = Kt(t.textContent).toLowerCase();
            e.add(n), t.dataset.lt && e.add(t.dataset.lt);
          });
          const t = new Set();
          return (
            document
              .querySelectorAll("dfn:not([data-lt-noDefault])")
              .forEach((e) => {
                const n = Kt(e.textContent).toLowerCase();
                t.add(n),
                  e.dataset.lt &&
                    e.dataset.lt.split("|").forEach((e) => t.add(e)),
                  e.dataset.localLt &&
                    e.dataset.localLt.split("|").forEach((e) => t.add(e));
              }),
            function (n) {
              const r = Kt(n).toLowerCase(),
                s = Nt.isSingular(r) ? Nt.plural(r) : Nt.singular(r);
              return e.has(s) && !t.has(s) ? s : "";
            }
          );
        })();
        document
          .querySelectorAll(
            "dfn:not([data-lt-no-plural]):not([data-lt-noDefault])"
          )
          .forEach((e) => {
            const n = [e.textContent];
            e.dataset.lt && n.push(...e.dataset.lt.split("|")),
              e.dataset.localLt && n.push(...e.dataset.localLt.split("|"));
            const r = new Set(n.map(t).filter((e) => e));
            if (r.size) {
              const t = e.dataset.plurals ? e.dataset.plurals.split("|") : [],
                n = [...new Set([...t, ...r])];
              (e.dataset.plurals = n.join("|")), ro(e, n);
            }
          });
      },
    });
    var ho = String.raw`span.example-title{text-transform:none}
:is(aside,div).example,div.illegal-example{padding:.5em;margin:1em 0;position:relative;clear:both}
div.illegal-example{color:red}
div.illegal-example p{color:#000}
:is(aside,div).example{border-left-width:.5em;border-left-style:solid;border-color:#e0cb52;background:#fcfaee}
aside.example div.example{border-left-width:.1em;border-color:#999;background:#fff}
.example pre{background-color:rgba(0,0,0,.03)}`;
    const fo = Yt({
      en: { example: "Example" },
      nl: { example: "Voorbeeld" },
      es: { example: "Ejemplo" },
      ko: { example: "예시" },
      ja: { example: "例" },
      de: { example: "Beispiel" },
      zh: { example: "例" },
    });
    function mo(e, t, n) {
      (n.title = e.title), n.title && e.removeAttribute("title");
      const r = t > 0 ? " " + t : "",
        s = n.title ? It`<span class="example-title">: ${n.title}</span>` : "";
      return It`<div class="marker">
    <a class="self-link">${fo.example}<bdi>${r}</bdi></a
    >${s}
  </div>`;
    }
    var go = Object.freeze({
      __proto__: null,
      name: "core/examples",
      run: function () {
        const e = document.querySelectorAll(
          "pre.example, pre.illegal-example, aside.example"
        );
        if (!e.length) return;
        document.head.insertBefore(
          It`<style>
      ${ho}
    </style>`,
          document.querySelector("link")
        );
        let t = 0;
        e.forEach((e) => {
          const n = e.classList.contains("illegal-example"),
            r = { number: t, illegal: n },
            { title: s } = e;
          if ("aside" === e.localName) {
            ++t;
            const n = mo(e, t, r);
            e.prepend(n);
            const i = rn(e, "example", s || String(t));
            (n.querySelector("a.self-link").href = "#" + i), Sn("example", r);
          } else {
            const n = !!e.closest("aside");
            n || ++t,
              (r.content = e.innerHTML),
              e.classList.remove("example", "illegal-example");
            const i = e.id ? e.id : null;
            i && e.removeAttribute("id");
            const o = mo(e, n ? 0 : t, r),
              a = It`<div class="example" id="${i}">
        ${o} ${e.cloneNode(!0)}
      </div>`;
            rn(a, "example", s || String(t));
            (a.querySelector("a.self-link").href = "#" + a.id),
              e.replaceWith(a),
              n || Sn("example", r);
          }
        });
      },
    });
    var bo = String.raw`.issue-label{text-transform:initial}
.warning>p:first-child{margin-top:0}
.warning{padding:.5em;border-left-width:.5em;border-left-style:solid}
span.warning{padding:.1em .5em .15em}
.issue.closed span.issue-number{text-decoration:line-through}
.warning{border-color:#f11;border-width:.2em;border-style:solid;background:#fbe9e9}
.warning-title:before{content:"⚠";font-size:1.3em;float:left;padding-right:.3em;margin-top:-.3em}
li.task-list-item{list-style:none}
input.task-list-item-checkbox{margin:0 .35em .25em -1.6em;vertical-align:middle}
.issue a.respec-gh-label{padding:5px;margin:0 2px 0 2px;font-size:10px;text-transform:none;text-decoration:none;font-weight:700;border-radius:4px;position:relative;bottom:2px;border:none;display:inline-block}`;
    const yo = "core/issues-notes",
      wo = Yt({
        en: {
          editors_note: "Editor's note",
          feature_at_risk: "(Feature at Risk) Issue",
          issue: "Issue",
          issue_summary: "Issue Summary",
          no_issues_in_spec:
            "There are no issues listed in this specification.",
          note: "Note",
          warning: "Warning",
        },
        ja: {
          note: "注",
          editors_note: "編者注",
          feature_at_risk: "(変更の可能性のある機能) Issue",
          issue: "Issue",
          issue_summary: "Issue の要約",
          no_issues_in_spec: "この仕様には未解決の issues は含まれていません．",
          warning: "警告",
        },
        nl: {
          editors_note: "Redactionele noot",
          issue_summary: "Lijst met issues",
          no_issues_in_spec:
            "Er zijn geen problemen vermeld in deze specificatie.",
          note: "Noot",
          warning: "Waarschuwing",
        },
        es: {
          editors_note: "Nota de editor",
          issue: "Cuestión",
          issue_summary: "Resumen de la cuestión",
          note: "Nota",
          no_issues_in_spec:
            "No hay problemas enumerados en esta especificación.",
          warning: "Aviso",
        },
        de: {
          editors_note: "Redaktioneller Hinweis",
          issue: "Frage",
          issue_summary: "Offene Fragen",
          no_issues_in_spec:
            "Diese Spezifikation enthält keine offenen Fragen.",
          note: "Hinweis",
          warning: "Warnung",
        },
        zh: {
          editors_note: "编者注",
          feature_at_risk: "（有可能变动的特性）Issue",
          issue: "Issue",
          issue_summary: "Issue 总结",
          no_issues_in_spec: "本规范中未列出任何 issue。",
          note: "注",
          warning: "警告",
        },
      });
    function vo(e, t, n) {
      const r = (function () {
          if (document.querySelector(".issue[data-number]"))
            return (e) => {
              if (e.dataset.number) return Number(e.dataset.number);
            };
          let e = 0;
          return (t) => {
            if (t.classList.contains("issue") && "span" !== t.localName)
              return ++e;
          };
        })(),
        s = document.createElement("ul");
      e.forEach((e) => {
        const {
            type: i,
            displayType: o,
            isFeatureAtRisk: a,
          } = (function (e) {
            const t = e.classList.contains("issue"),
              n = e.classList.contains("warning"),
              r = e.classList.contains("ednote"),
              s = e.classList.contains("atrisk"),
              i = t ? "issue" : n ? "warning" : r ? "ednote" : "note",
              o = t
                ? s
                  ? wo.feature_at_risk
                  : wo.issue
                : n
                ? wo.warning
                : r
                ? wo.editors_note
                : wo.note;
            return { type: i, displayType: o, isFeatureAtRisk: s };
          })(e),
          c = "issue" === i,
          l = "span" === e.localName,
          { number: u } = e.dataset,
          d = { type: i, inline: l, title: e.title, number: r(e) };
        if (!l) {
          const r = It`<div class="${a ? i + " atrisk" : i}" role="${
              "note" === i ? "note" : null
            }"></div>`,
            l = document.createElement("span"),
            p = It`<div role="heading" class="${
              i + "-title marker"
            }">${l}</div>`;
          rn(p, "h", i);
          let h,
            f = o;
          if (
            (e.id
              ? ((r.id = e.id), e.removeAttribute("id"))
              : rn(r, "issue-container", d.number ? "number-" + d.number : ""),
            c)
          ) {
            if (
              (void 0 !== d.number && (f += " " + d.number),
              e.dataset.hasOwnProperty("number"))
            ) {
              const e = (function (e, t, { isFeatureAtRisk: n = !1 } = {}) {
                if (!n && t.issueBase)
                  return It`<a href="${t.issueBase + e}" />`;
                if (n && t.atRiskBase)
                  return It`<a href="${t.atRiskBase + e}" />`;
              })(u, n, { isFeatureAtRisk: a });
              if (
                (e && (l.before(e), e.append(l)),
                l.classList.add("issue-number"),
                (h = t.get(u)),
                !h)
              ) {
                yn(`Failed to fetch issue number ${u}.`, yo);
              }
              h && !d.title && (d.title = h.title);
            }
            void 0 !== d.number &&
              s.append(
                (function (e, t, n) {
                  const r = `${e} ${t.number}`,
                    s = t.title
                      ? It`<span style="text-transform: none">: ${t.title}</span>`
                      : "";
                  return It`<li><a href="${"#" + n}">${r}</a>${s}</li>`;
                })(wo.issue, d, r.id)
              );
          }
          if (((l.textContent = f), d.title)) {
            e.removeAttribute("title");
            const { repoURL: t = "" } = n.github || {},
              s = h ? h.labels : [];
            h && "CLOSED" === h.state && r.classList.add("closed"),
              p.append(
                (function (e, t, n) {
                  const r = e.map((e) =>
                    (function (e, t) {
                      const { color: n, name: r } = e,
                        s = new URL("./issues/", t);
                      s.searchParams.set(
                        "q",
                        `is:issue is:open label:"${e.name}"`
                      );
                      const i =
                          ((a = n),
                          parseInt(a, 16) > 8388607.5 ? "#000" : "#fff"),
                        o = "GitHub label: " + r;
                      var a;
                      return It` <a
    class="respec-gh-label"
    style="${`background-color: #${n}; color: ${i}`}"
    href="${s.href}"
    aria-label="${o}"
    >${r}</a
  >`;
                    })(e, n)
                  );
                  r.length && r.unshift(document.createTextNode(" "));
                  return It`<span class="issue-label">: ${t}${r}</span>`;
                })(s, d.title, t)
              );
          }
          let m = e;
          e.replaceWith(r),
            m.classList.remove(i),
            m.removeAttribute("data-number"),
            h &&
              !m.innerHTML.trim() &&
              (m = document.createRange().createContextualFragment(h.bodyHTML)),
            r.append(p, m);
          const g = ln(p, "section").length + 2;
          p.setAttribute("aria-level", g);
        }
        Sn(d.type, d);
      }),
        (function (e) {
          const t = document.getElementById("issue-summary");
          if (!t) return;
          const n = t.querySelector("h2, h3, h4, h5, h6");
          e.hasChildNodes()
            ? t.append(e)
            : t.append(It`<p>${wo.no_issues_in_spec}</p>`),
            (!n || (n && n !== t.firstElementChild)) &&
              t.insertAdjacentHTML(
                "afterbegin",
                `<h2>${wo.issue_summary}</h2>`
              );
        })(s);
    }
    var ko = Object.freeze({
      __proto__: null,
      name: yo,
      run: async function (e) {
        const t = document.querySelectorAll(".issue, .note, .warning, .ednote");
        if (!t.length) return;
        const n = await (async function (e) {
            if (!e || !e.apiBase) return new Map();
            const t = [...document.querySelectorAll(".issue[data-number]")]
              .map((e) => Number.parseInt(e.dataset.number, 10))
              .filter((e) => e);
            if (!t.length) return new Map();
            const n = new URL("issues", `${e.apiBase}/${e.fullName}/`);
            n.searchParams.set("issues", t.join(","));
            const r = await fetch(n.href);
            if (!r.ok)
              return (
                bn(
                  `Error fetching issues from GitHub. (HTTP Status ${r.status}).`,
                  yo
                ),
                new Map()
              );
            const s = await r.json();
            return new Map(Object.entries(s));
          })(e.github),
          { head: r } = document;
        r.insertBefore(
          It`<style>
      ${bo}
    </style>`,
          r.querySelector("link")
        ),
          vo(t, n, e),
          document.querySelectorAll(".ednote").forEach((e) => {
            e.classList.remove("ednote"), e.classList.add("note");
          });
      },
    });
    const $o = "core/best-practices",
      xo = {
        en: { best_practice: "Best Practice " },
        ja: { best_practice: "最良実施例 " },
        de: { best_practice: "Musterbeispiel " },
        zh: { best_practice: "最佳实践 " },
      },
      _o = Yt(xo),
      Co = s in xo ? s : "en";
    var So = Object.freeze({
      __proto__: null,
      name: $o,
      run: function () {
        const e = document.querySelectorAll(".practicelab"),
          t = document.getElementById("bp-summary"),
          n = t ? document.createElement("ul") : null;
        if (
          ([...e].forEach((e, t) => {
            const r = rn(e, "bp"),
              s = It`<a class="marker self-link" href="${"#" + r}"
      ><bdi lang="${Co}">${_o.best_practice}${t + 1}</bdi></a
    >`;
            if (n) {
              const t = It`<li>${s}: ${pn(e)}</li>`;
              n.appendChild(t);
            }
            const i = e.closest("div");
            if (!i) return void e.classList.add("advisement");
            i.classList.add("advisement");
            const o = It`${s.cloneNode(!0)}: ${e}`;
            i.prepend(...o.childNodes);
          }),
          e.length)
        )
          t &&
            (t.appendChild(It`<h2>Best Practices Summary</h2>`),
            t.appendChild(n));
        else if (t) {
          yn(
            "Using best practices summary (#bp-summary) but no best practices found.",
            $o
          ),
            t.remove();
        }
      },
    });
    const Ro = "core/figures",
      Eo = Yt({
        en: { list_of_figures: "List of Figures", fig: "Figure " },
        ja: { fig: "図 ", list_of_figures: "図のリスト" },
        ko: { fig: "그림 ", list_of_figures: "그림 목록" },
        nl: { fig: "Figuur ", list_of_figures: "Lijst met figuren" },
        es: { fig: "Figura ", list_of_figures: "Lista de Figuras" },
        zh: { fig: "图 ", list_of_figures: "规范中包含的图" },
        de: { fig: "Abbildung", list_of_figures: "Abbildungsverzeichnis" },
      });
    var Ao = Object.freeze({
      __proto__: null,
      name: Ro,
      run: function () {
        document
          .querySelectorAll(
            ":not(picture)>img:not([width]):not([height]):not([srcset])"
          )
          .forEach((e) => {
            0 !== e.naturalHeight &&
              0 !== e.naturalWidth &&
              ((e.height = e.naturalHeight), (e.width = e.naturalWidth));
          });
        const e = (function () {
            const e = [];
            return (
              document.querySelectorAll("figure").forEach((t, n) => {
                const r = t.querySelector("figcaption");
                if (r)
                  !(function (e, t, n) {
                    const r = t.textContent;
                    rn(e, "fig", r),
                      cn(t, It`<span class="fig-title"></span>`),
                      t.prepend(
                        Eo.fig,
                        It`<bdi class="figno">${n + 1}</bdi>`,
                        " "
                      );
                  })(t, r, n),
                    e.push(
                      (function (e, t) {
                        const n = t.cloneNode(!0);
                        return (
                          n.querySelectorAll("a").forEach((e) => {
                            on(e, "span").removeAttribute("href");
                          }),
                          It`<li class="tofline">
    <a class="tocxref" href="${"#" + e}">${n.childNodes}</a>
  </li>`
                        );
                      })(t.id, r)
                    );
                else {
                  yn("Found a `<figure>` without a `<figcaption>`.", Ro, {
                    elements: [t],
                  });
                }
              }),
              e
            );
          })(),
          t = document.getElementById("tof");
        e.length &&
          t &&
          (!(function (e) {
            if (
              e.classList.contains("appendix") ||
              e.classList.contains("introductory") ||
              e.closest("section")
            )
              return;
            const t = (function (e) {
              const t = [];
              for (const n of (function* (e) {
                let t = e;
                for (; t.previousElementSibling; )
                  (t = t.previousElementSibling), yield t;
              })(e))
                "section" === n.localName && t.push(n);
              return t;
            })(e);
            t.every((e) => e.classList.contains("introductory"))
              ? e.classList.add("introductory")
              : t.some((e) => e.classList.contains("appendix")) &&
                e.classList.add("appendix");
          })(t),
          t.append(
            It`<h2>${Eo.list_of_figures}</h2>`,
            It`<ul class="tof">
        ${e}
      </ul>`
          ));
      },
    });
    const To = new Set([
      "callback interface",
      "callback",
      "dictionary",
      "enum",
      "interface mixin",
      "interface",
      "typedef",
    ]);
    function Lo(e, t, { parent: n = "" } = {}) {
      switch (e.type) {
        case "constructor":
        case "operation":
          return (function (e, t, n) {
            if (n.includes("!overload")) return Po(e, t, n);
            return Po(e, t, n + "()", n);
          })(e, n, t);
        default:
          return Po(e, n, t);
      }
    }
    function Po(e, t, ...n) {
      const { type: r } = e;
      for (const e of n) {
        let n = "enum-value" === r && "" === e ? "the-empty-string" : e,
          s = Do(n, t, e, r);
        if (0 === s.length && "" !== t) {
          n = `${t}.${n}`;
          const e = no.get(n);
          e && 1 === e.size && ((s = [...e]), ro(s[0], [n]));
        } else n = e;
        if (s.length > 1) {
          bn(
            `WebIDL identifier \`${e}\` ${
              t ? `for \`${t}\`` : ""
            } is defined multiple times`,
            e,
            { title: "Duplicate definition.", elements: s }
          );
        }
        if (s.length) return s[0];
      }
    }
    function Io(e, t, n, r) {
      if (!e.id) {
        const t = n.toLowerCase(),
          s = t ? t + "-" : "";
        let i = r.toLowerCase().replace(/[()]/g, "").replace(/\s/g, "-");
        "" === i &&
          ((i = "the-empty-string"),
          e.setAttribute("aria-label", "the empty string")),
          (e.id = `dom-${s}${i}`);
      }
      switch (
        ((e.dataset.idl = t.type),
        (e.dataset.title = e.textContent),
        (e.dataset.dfnFor = n),
        t.type)
      ) {
        case "operation":
        case "attribute":
        case "field":
          e.dataset.type = No(t);
      }
      switch (
        (e.querySelector("code") ||
          e.closest("code") ||
          !e.children ||
          cn(e, e.ownerDocument.createElement("code")),
        t.type)
      ) {
        case "attribute":
        case "constructor":
        case "operation":
          !(function (e, t) {
            const { local: n, exportable: r } = t,
              s = e.dataset.lt ? new Set(e.dataset.lt.split("|")) : new Set();
            for (const e of r) s.add(e);
            n.filter((e) => s.has(e)).forEach((e) => s.delete(e)),
              (e.dataset.lt = [...s].join("|")),
              (e.dataset.localLt = n.join("|")),
              ro(e, [...n, ...r]);
          })(
            e,
            (function (e, t, n) {
              const { type: r } = e,
                s = `${t}.${n}`;
              switch (r) {
                case "constructor":
                case "operation":
                  return {
                    local: [s, s + "()", n],
                    exportable: [
                      n + "()",
                      ...(function (e, t) {
                        const n = [];
                        if (0 === t.length) return n;
                        const r = [],
                          s = [];
                        for (const { name: e, optional: n, variadic: i } of t)
                          n || i ? s.push(e) : r.push(e);
                        const i = r.join(", "),
                          o = `${e}(${i})`;
                        n.push(o);
                        const a = s.map((t, n) => {
                          const i = [...r, ...s.slice(0, n + 1)].join(", ");
                          return `${e}(${i})`;
                        });
                        return n.push(...a), n;
                      })(n, e.arguments),
                    ],
                  };
                case "attribute":
                  return { local: [s], exportable: [n] };
              }
            })(t, n, r)
          );
      }
      return e;
    }
    function Do(e, t, n, r) {
      const s = no.get(e);
      if (!s || 0 === s.size) return [];
      const i = [...s],
        o = i.filter((e) => {
          if ("dfn" === e.dataset.dfnType) return !1;
          const n = e.closest("[data-dfn-for]");
          return n && n.dataset.dfnFor === t;
        });
      if (0 === o.length && "" === t && 1 === i.length)
        return i[0].textContent === n ? i : [];
      if (To.has(r) && i.length) {
        const e = i.find((e) => e.textContent.trim() === n);
        if (e) return [e];
      }
      return o;
    }
    function No(e = {}) {
      const { idlType: t, generic: n, union: r } = e;
      return void 0 === t
        ? ""
        : "string" == typeof t
        ? t
        : n || (r ? t.map(No).join("|") : No(t));
    }
    const jo = (function () {
      const e = document.createElement("button");
      return (
        (e.innerHTML =
          '<svg height="16" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"/></svg>'),
        (e.title = "Copy IDL to clipboard"),
        e.classList.add("respec-button-copy-paste", "removeOnSave"),
        e
      );
    })();
    function Oo(e) {
      const t = e.closest("pre.idl").cloneNode(!0);
      t.querySelector(".idlHeader").remove();
      const { textContent: n } = t,
        r = jo.cloneNode(!0);
      r.addEventListener("click", () => {
        navigator.clipboard.writeText(n);
      }),
        e.append(r);
    }
    var zo = Object.freeze({
      __proto__: null,
      name: "core/webidl-clipboard",
      addCopyIDLButton: Oo,
    });
    var Mo = String.raw`pre.idl{padding:1em;position:relative}
pre.idl>code{color:#000}
@media print{
pre.idl{white-space:pre-wrap}
}
.idlHeader{display:block;width:150px;background:#8ccbf2;color:#fff;font-family:sans-serif;font-weight:700;margin:-1em 0 1em -1em;height:28px;line-height:28px}
.idlHeader a.self-link{margin-left:.3cm;text-decoration:none;border-bottom:none}
.idlID{font-weight:700;color:#005a9c}
.idlType{color:#005a9c}
.idlName{color:#ff4500}
.idlName a{color:#ff4500;border-bottom:1px dotted #ff4500;text-decoration:none}
a.idlEnumItem{color:#000;border-bottom:1px dotted #ccc;text-decoration:none}
.idlSuperclass{font-style:italic;color:#005a9c}
.idlDefaultValue,.idlParamName{font-style:italic}
.extAttr{color:#666}
.idlSectionComment{color:gray}
.idlIncludes a{font-weight:700}
.respec-button-copy-paste:focus{text-decoration:none;border-color:#51a7e8;outline:0;box-shadow:0 0 5px rgba(81,167,232,.5)}
.respec-button-copy-paste:is(:focus:hover,.selected:focus){border-color:#51a7e8}
.respec-button-copy-paste:is(:hover,:active,.zeroclipboard-is-hover,.zeroclipboard-is-active){text-decoration:none;background-color:#ddd;background-image:linear-gradient(#eee,#ddd);border-color:#ccc}
.respec-button-copy-paste:is(:active,.selected,.zeroclipboard-is-active){background-color:#dcdcdc;background-image:none;border-color:#b5b5b5;box-shadow:inset 0 2px 4px rgba(0,0,0,.15)}
.respec-button-copy-paste.selected:hover{background-color:#cfcfcf}
.respec-button-copy-paste:is(:disabled,:disabled:hover,.disabled,.disabled:hover){color:rgba(102,102,102,.5);cursor:default;background-color:rgba(229,229,229,.5);background-image:none;border-color:rgba(197,197,197,.5);box-shadow:none}
@media print{
.respec-button-copy-paste{visibility:hidden}
}`;
    const Uo = "core/webidl",
      Wo = Uo,
      qo = {},
      Fo = {},
      Bo = {
        wrap: (e) =>
          e
            .flat()
            .filter((e) => "" !== e)
            .map((e) => ("string" == typeof e ? new Text(e) : e)),
        trivia: (e) =>
          e.trim() ? It`<span class="idlSectionComment">${e}</span>` : e,
        generic: (e) =>
          /^[A-Z]/.test(e)
            ? It`<a data-xref-type="interface" data-cite="WEBIDL">${e}</a>`
            : It`<a data-xref-type="dfn" data-cite="WEBIDL">${e}</a>`,
        reference(e, t, n) {
          if ("extended-attribute" === n.type && "Exposed" !== n.name) return e;
          let r,
            s = "_IDL_",
            i = null;
          switch (t) {
            case "Window":
              (s = "interface"), (i = "HTML");
              break;
            case "object":
              (s = "interface"), (i = "WebIDL");
              break;
            default:
              t.includes("Worker") &&
                "extended-attribute" === n.type &&
                ((r = t + "GlobalScope"),
                (s = "interface"),
                (i = ["Worker", "DedicatedWorker", "SharedWorker"].includes(t)
                  ? "HTML"
                  : null));
          }
          return It`<a data-xref-type="${s}" data-cite="${i}" data-lt="${r}"
      >${e}</a
    >`;
        },
        name(e, { data: t, parent: n }) {
          if (t.idlType && "argument-type" === t.idlType.type)
            return It`<span class="idlParamName">${e}</span>`;
          const r = Ho(e, t, n);
          if ("enum-value" !== t.type) {
            const e = n ? "idlName" : "idlID";
            r.classList.add(e);
          }
          return r;
        },
        nameless(e, { data: t, parent: n }) {
          switch (t.type) {
            case "operation":
            case "constructor":
              return Ho(e, t, n);
            default:
              return e;
          }
        },
        type: (e) => It`<span class="idlType">${e}</span>`,
        inheritance: (e) => It`<span class="idlSuperclass">${e}</span>`,
        definition(e, { data: t, parent: n }) {
          const r = (function (e) {
            switch (e.type) {
              case "callback interface":
                return "idlInterface";
              case "operation":
                return "idlMethod";
              case "field":
                return "idlMember";
              case "enum-value":
                return "idlEnumItem";
              case "callback function":
                return "idlCallback";
            }
            return `idl${e.type[0].toUpperCase()}${e.type.slice(1)}`;
          })(t);
          switch (t.type) {
            case "includes":
            case "enum-value":
              return It`<span class="${r}">${e}</span>`;
          }
          const s = n ? n.name : "",
            { name: i, idlId: o } = Vo(t, s);
          return It`<span
      class="${r}"
      id="${o}"
      data-idl
      data-title="${i}"
      >${e}</span
    >`;
        },
        extendedAttribute: (e) => It`<span class="extAttr">${e}</span>`,
        extendedAttributeReference: (e) =>
          It`<a data-xref-type="extended-attribute">${e}</a>`,
      };
    function Ho(e, t, n) {
      const r = n ? n.name : "",
        { name: s } = Vo(t, r),
        i = Lo(t, s, { parent: r }),
        o = (function (e) {
          switch (e) {
            case "operation":
              return "method";
            case "field":
              return "dict-member";
            case "callback interface":
            case "interface mixin":
              return "interface";
            default:
              return e;
          }
        })(t.type);
      if (i) {
        t.partial ||
          (i.matches("[data-noexport]") || (i.dataset.export = ""),
          (i.dataset.dfnType = o)),
          Io(i, t, r, s);
        const n = "#" + i.id;
        return It`<a
      data-link-for="${r}"
      data-link-type="${o}"
      href="${n}"
      class="internalDFN"
      ><code>${e}</code></a
    >`;
      }
      if (
        "operation" === t.type &&
        "toJSON" === t.name &&
        t.extAttrs.some(({ name: e }) => "Default" === e)
      )
        return It`<a data-link-type="dfn" data-lt="default toJSON steps"
      >${e}</a
    >`;
      if (!t.partial) {
        const n = It`<dfn data-export data-dfn-type="${o}"
      >${e}</dfn
    >`;
        return ro(n, [s]), Io(n, t, r, s), n;
      }
      const a = It`<a
    data-idl="${t.partial ? "partial" : null}"
    data-link-type="${o}"
    data-title="${t.name}"
    data-xref-type="${o}"
    >${e}</a
  >`;
      if (s && "typedef" !== t.type && !(t.partial && !i)) {
        const e = xn`See ${"using `data-dfn-for`|#data-dfn-for"} in ReSpec's documentation.`;
        yn(
          `Missing \`<dfn>\` for${r ? ` \`${r}\`'s` : ""} \`${
            "operation" === t.type ? s + "()" : s
          }\` ${t.type}.`,
          Wo,
          { elements: [a], hint: e }
        );
      }
      return a;
    }
    const Go = new WeakMap();
    function Vo(e, t = "") {
      if (Go.has(e)) return Go.get(e);
      const n = (function (e, t) {
        let n = (function (e) {
          switch (e.type) {
            case "enum-value":
              return e.value;
            case "operation":
              return e.name || e.special;
            default:
              return e.name || e.type;
          }
        })(e);
        let r = (function (e, t) {
          if (!t) return "idl-def-" + e.toLowerCase();
          return `idl-def-${t.toLowerCase()}-${e.toLowerCase()}`;
        })((e.special && "" === e.name ? "anonymous-" : "") + n, t);
        switch (e.type) {
          case "callback interface":
          case "dictionary":
          case "interface":
          case "interface mixin":
            r += (function (e) {
              if (!e.partial) return "";
              Fo[e.name] || (Fo[e.name] = 0);
              return (Fo[e.name] += 1), "-partial-" + Fo[e.name];
            })(e);
            break;
          case "constructor":
          case "operation": {
            const s = (function (e, t) {
              const n = `${t}.${e}`,
                r = n + "()";
              let s;
              qo[r] || (qo[r] = 0);
              qo[n] ? (s = "!overload-" + qo[n]) : (qo[n] = 0);
              return (qo[r] += 1), (qo[n] += 1), s || "";
            })(n, t);
            s
              ? ((n += s), (r += s))
              : e.arguments.length &&
                (r += e.arguments
                  .map((e) => "-" + e.name.toLowerCase())
                  .join(""));
            break;
          }
        }
        return { name: n, idlId: r };
      })(e, t);
      return Go.set(e, n), n;
    }
    const Ko = [
      "interface",
      "interface mixin",
      "dictionary",
      "namespace",
      "enum",
      "typedef",
      "callback",
    ];
    function Yo(e, t) {
      let n;
      try {
        n = Pt.parse(e.textContent, { sourceName: String(t) });
      } catch (t) {
        return (
          bn(`Failed to parse WebIDL: ${t.bareMessage}.`, Wo, {
            title: t.bareMessage,
            details: `<pre>${t.context}</pre>`,
            elements: [e],
          }),
          []
        );
      }
      e.classList.add("def", "idl");
      const r = Pt.write(n, { templates: Bo });
      It.bind(e)`${r}`,
        cn(e, document.createElement("code")),
        e.querySelectorAll("[data-idl]").forEach((e) => {
          if (e.dataset.dfnFor) return;
          const t = e.dataset.title,
            n = e.dataset.dfnType,
            r = e.parentElement.closest("[data-idl][data-title]");
          r && !Ko.includes(n) && (e.dataset.dfnFor = r.dataset.title),
            "dfn" === e.localName && ro(e, [t]);
        });
      const s = e.closest("[data-cite], body"),
        { dataset: i } = s;
      if ((i.cite || (i.cite = "WEBIDL"), !/\bwebidl\b/i.test(i.cite))) {
        const e = i.cite.trim().split(/\s+/);
        i.cite = ["WEBIDL", ...e].join(" ");
      }
      return Zo(e), n;
    }
    function Zo(e) {
      nn(e, "webidl");
      const t = It`<span class="idlHeader"
    ><a class="self-link" href="${"#" + e.id}">WebIDL</a></span
  >`;
      e.prepend(t), Oo(t);
    }
    var Jo = Object.freeze({
      __proto__: null,
      name: Uo,
      addIDLHeader: Zo,
      run: async function () {
        const e = document.querySelectorAll("pre.idl, pre.webidl");
        if (!e.length) return;
        const t = document.createElement("style");
        (t.textContent = Mo),
          document.querySelector("head link, head > *:last-child").before(t);
        const n = [...e].map(Yo),
          r = Pt.validate(n);
        for (const t of r) {
          let r = `<pre>${Vt(t.context)}</pre>`;
          if (t.autofix) {
            t.autofix();
            r += `Try fixing as:\n      <pre>${Vt(
              Pt.write(n[t.sourceName])
            )}</pre>`;
          }
          bn("WebIDL validation error: " + t.bareMessage, Wo, {
            details: r,
            elements: [e[t.sourceName]],
            title: t.bareMessage,
          });
        }
        document.normalize();
      },
    });
    const Qo = "core/data-cite",
      Xo = "__SPEC__";
    async function ea(e) {
      const { key: t, frag: n, path: r, href: s } = e;
      let i = "",
        o = "";
      if (t === Xo) i = document.location.href;
      else {
        const e = await gi(t);
        if (!e) return null;
        (i = e.href), (o = e.title);
      }
      if (s) i = s;
      else {
        if (r) {
          const e = r.startsWith("/") ? "." + r : r;
          i = new URL(e, i).href;
        }
        n && (i = new URL(n, i).href);
      }
      return { href: i, title: o };
    }
    function ta(e, t, n) {
      const { href: r, title: s } = t,
        i = !n.path && !n.frag;
      switch (e.localName) {
        case "a": {
          const t = e;
          if (
            ("" === t.textContent &&
              "the-empty-string" !== t.dataset.lt &&
              (t.textContent = s),
            (t.href = r),
            i)
          ) {
            const e = document.createElement("cite");
            t.replaceWith(e), e.append(t);
          }
          break;
        }
        case "dfn": {
          const t = document.createElement("a");
          if (
            ((t.href = r),
            e.textContent ? cn(e, t) : ((t.textContent = s), e.append(t)),
            i)
          ) {
            const n = document.createElement("cite");
            n.append(t), e.append(n);
          }
          if ("export" in e.dataset) {
            bn("Exporting an linked external definition is not allowed.", Qo, {
              hint: "Please remove the `data-export` attribute.",
              elements: [e],
            }),
              delete e.dataset.export;
          }
          e.classList.add("externalDFN"), (e.dataset.noExport = "");
          break;
        }
      }
    }
    function na(e) {
      return (t) => {
        const n = t.search(e);
        return -1 !== n ? t.substring(n) : "";
      };
    }
    const ra = na("#"),
      sa = na("/");
    function ia(e) {
      const { dataset: t } = e,
        { cite: n, citeFrag: r, citePath: s, citeHref: i } = t;
      if (n.startsWith("#") && !r) {
        const r = e.parentElement.closest('[data-cite]:not([data-cite^="#"])'),
          { key: s, isNormative: i } = r ? ia(r) : { key: Xo, isNormative: !1 };
        return (
          (t.cite = i ? s : "?" + s), (t.citeFrag = n.replace("#", "")), ia(e)
        );
      }
      const o = r ? "#" + r : ra(n),
        a = s || sa(n).split("#")[0],
        { type: c } = an(n, e),
        l = "normative" === c,
        u = /^[?|!]/.test(n);
      return {
        key: n.split(/[/|#]/)[0].substring(Number(u)),
        isNormative: l,
        frag: o,
        path: a,
        href: i,
      };
    }
    function oa(e) {
      const t = ["data-cite", "data-cite-frag", "data-cite-path"];
      e.querySelectorAll("a[data-cite], dfn[data-cite]").forEach((e) =>
        t.forEach((t) => e.removeAttribute(t))
      );
    }
    var aa = Object.freeze({
      __proto__: null,
      name: Qo,
      THIS_SPEC: Xo,
      toCiteDetails: ia,
      run: async function () {
        const e = document.querySelectorAll(
          "dfn[data-cite]:not([data-cite='']), a[data-cite]:not([data-cite=''])"
        );
        await (async function (e) {
          const t = e
              .map(ia)
              .map(async (e) => ({ entry: e, result: await gi(e.key) })),
            n = (await Promise.all(t))
              .filter(({ result: e }) => null === e)
              .map(({ entry: { key: e } }) => e),
            r = await mi(n);
          r && Object.assign(ui, r);
        })([...e]);
        for (const t of e) {
          const e = t.dataset.cite,
            n = ia(t),
            r = await ea(n);
          if (r) ta(t, r, n);
          else {
            yn(`Couldn't find a match for "${e}"`, Qo, { elements: [t] });
          }
        }
        Rn("beforesave", oa);
      },
    });
    const ca = "core/link-to-dfn",
      la = [],
      ua = Yt({
        en: {
          duplicateMsg: (e) => `Duplicate definition(s) of '${e}'`,
          duplicateTitle: "This is defined more than once in the document.",
        },
        ja: {
          duplicateMsg: (e) => `'${e}' の重複定義`,
          duplicateTitle: "この文書内で複数回定義されています．",
        },
        de: {
          duplicateMsg: (e) => `Mehrfache Definition von '${e}'`,
          duplicateTitle:
            "Das Dokument enthält mehrere Definitionen dieses Eintrags.",
        },
        zh: {
          duplicateMsg: (e) => `'${e}' 的重复定义`,
          duplicateTitle: "在文档中有重复的定义。",
        },
      });
    function da(e) {
      const t = new Map(),
        n = [];
      for (const r of no.get(e)) {
        const { dfnFor: s = "", dfnType: i = "dfn" } = r.dataset;
        if (t.has(s) && t.get(s).has(i)) {
          const e = t.get(s).get(i),
            o = "dfn" === e.localName,
            a = "dfn" === r.localName,
            c = i === (e.dataset.dfnType || "dfn"),
            l = s === (e.dataset.dfnFor || "");
          if (o && a && c && l) {
            n.push(r);
            continue;
          }
        }
        const o = "idl" in r.dataset || "dfn" !== i ? "idl" : "dfn";
        t.has(s) || t.set(s, new Map()), t.get(s).set(o, r), rn(r, "dfn", e);
      }
      return { result: t, duplicates: n };
    }
    function pa(e, t) {
      const n = (function (e) {
        const t = e.closest("[data-link-for]"),
          n = t ? t.dataset.linkFor : "";
        return sn(e).reduce((e, r) => {
          const s = r.split(".");
          return (
            2 === s.length && e.push({ for: s[0], title: s[1] }),
            e.push({ for: n, title: r }),
            t || e.push({ for: r, title: r }),
            "" !== n && e.push({ for: "", title: r }),
            e
          );
        }, []);
      })(e).find((e) => t.has(e.title) && t.get(e.title).has(e.for));
      if (!n) return;
      const r = t.get(n.title).get(n.for),
        { linkType: s } = e.dataset;
      if (s) {
        const e = "dfn" === s ? "dfn" : "idl";
        return r.get(e) || r.get("dfn");
      }
      {
        const e = n.for ? "idl" : "dfn";
        return r.get(e) || r.get("idl");
      }
    }
    function ha(e, t, n) {
      let r = !1;
      const { linkFor: s } = e.dataset,
        { dfnFor: i } = t.dataset;
      if (t.dataset.cite) e.dataset.cite = t.dataset.cite;
      else if (s && !n.get(s) && s !== i) r = !0;
      else if (t.classList.contains("externalDFN")) {
        const n = t.dataset.lt ? t.dataset.lt.split("|") : [];
        (e.dataset.lt = n[0] || t.textContent), (r = !0);
      } else
        "partial" !== e.dataset.idl
          ? ((e.href = "#" + t.id), e.classList.add("internalDFN"))
          : (r = !0);
      return (
        e.hasAttribute("data-link-type") ||
          (e.dataset.linkType = "idl" in t.dataset ? "idl" : "dfn"),
        (function (e) {
          if (e.closest("code,pre")) return !0;
          if (1 !== e.childNodes.length) return !1;
          const [t] = e.childNodes;
          return "code" === t.localName;
        })(t) &&
          (function (e, t) {
            const n = e.textContent.trim(),
              r = t.dataset.hasOwnProperty("idl"),
              s = fa(e) && fa(t, n);
            (r && !s) || cn(e, document.createElement("code"));
          })(e, t),
        !r
      );
    }
    function fa(e, t = "") {
      switch (e.localName) {
        case "a":
          if (!e.querySelector("code")) return !0;
          break;
        default: {
          const { dataset: n } = e;
          if (e.textContent.trim() === t) return !0;
          if (n.title === t) return !0;
          if (n.lt || n.localLt) {
            const e = [];
            return (
              n.lt && e.push(...n.lt.split("|")),
              n.localLt && e.push(...n.localLt.split("|")),
              e.includes(t)
            );
          }
        }
      }
      return !1;
    }
    function ma(e) {
      e.forEach((e) => {
        yn(
          `Found linkless \`<a>\` element with text "${e.textContent}" but no matching \`<dfn>\``,
          ca,
          { title: "Linking error: not matching `<dfn>`", elements: [e] }
        );
      });
    }
    var ga = Object.freeze({
      __proto__: null,
      name: ca,
      possibleExternalLinks: la,
      run: async function (e) {
        const t = (function () {
            const e = new mn();
            for (const t of no.keys()) {
              const { result: n, duplicates: r } = da(t);
              e.set(t, n),
                r.length > 0 &&
                  bn(ua.duplicateMsg(t), ca, {
                    title: ua.duplicateTitle,
                    elements: r,
                  });
            }
            return e;
          })(),
          n = [],
          r = document.querySelectorAll(
            "a[data-cite=''], a:not([href]):not([data-cite]):not(.logo):not(.externalDFN)"
          );
        for (const e of r) {
          const r = pa(e, t);
          if (r) {
            ha(e, r, t) || la.push(e);
          } else "" === e.dataset.cite ? n.push(e) : la.push(e);
        }
        ma(n),
          (function (e) {
            const { shortName: t = "" } = e,
              n = new RegExp(String.raw`^([?!])?${t}\b([^-])`, "i"),
              r = document.querySelectorAll(
                "dfn[data-cite]:not([data-cite='']), a[data-cite]:not([data-cite=''])"
              );
            for (const t of r) {
              t.dataset.cite = t.dataset.cite.replace(n, "$1__SPEC__$2");
              const { key: r, isNormative: s } = ia(t);
              r !== Xo &&
                (s || e.normativeReferences.has(r)
                  ? (e.normativeReferences.add(r),
                    e.informativeReferences.delete(r))
                  : e.informativeReferences.add(r));
            }
          })(e),
          e.xref || ma(la);
      },
    });
    const ba = "xrefs",
      ya = 3e5;
    async function wa() {
      return await Lt.openDB("xref", 2, {
        upgrade(e) {
          [...e.objectStoreNames].forEach((t) => e.deleteObjectStore(t));
          e.createObjectStore(ba, { keyPath: "query.id" }).createIndex(
            "byTerm",
            "query.term",
            { unique: !1 }
          );
        },
      });
    }
    async function va(e) {
      const t = new Map();
      if (
        await (async function () {
          const e = "XREF:LAST_VERSION_CHECK",
            t = parseInt(localStorage.getItem(e), 10),
            n = Date.now();
          if (!t) return localStorage.setItem(e, n.toString()), !1;
          if (n - t < ya) return !1;
          const r = new URL("meta/version", xa).href,
            s = await fetch(r);
          if (!s.ok) return !1;
          const i = await s.text();
          return localStorage.setItem(e, n.toString()), parseInt(i, 10) > t;
        })()
      )
        return (
          await (async function () {
            try {
              await wa().then((e) => e.clear(ba));
            } catch (e) {
              console.error(e);
            }
          })(),
          t
        );
      const n = new Set(e.map((e) => e.id));
      try {
        const e = await wa();
        let r = await e.transaction(ba).store.openCursor();
        for (; r; )
          n.has(r.key) && t.set(r.key, r.value.result),
            (r = await r.continue());
      } catch (e) {
        console.error(e);
      }
      return t;
    }
    const ka = "core/xref",
      $a = {
        "web-platform": ["HTML", "INFRA", "URL", "WEBIDL", "DOM", "FETCH"],
      },
      xa = "https://respec.org/xref/";
    if (
      !document.querySelector(
        "link[rel='preconnect'][href='https://respec.org']"
      )
    ) {
      const e = Ut({ hint: "preconnect", href: "https://respec.org" });
      document.head.appendChild(e);
    }
    function _a(e) {
      const t = "xrefType" in e.dataset;
      let n = Ca(e);
      t || (n = n.toLowerCase());
      const r = (function (e) {
          const t = [];
          let n = e.closest("[data-cite]");
          for (; n; ) {
            const r = n.dataset.cite
              .toLowerCase()
              .replace(/[!?]/g, "")
              .split(/\s+/)
              .filter((e) => e);
            if ((r.length && t.push(r), n === e)) break;
            n = n.parentElement.closest("[data-cite]");
          }
          if (n !== e) {
            const n = e.closest("section"),
              r = [...(n ? n.querySelectorAll("a.bibref") : [])].map((e) =>
                e.textContent.toLowerCase()
              );
            r.length && t.push(r);
          }
          return (function (e) {
            const t = [];
            for (const n of e) {
              const e = t[t.length - 1] || [],
                r = [...new Set(n)].filter((t) => !e.includes(t));
              t.push(r.sort());
            }
            return t;
          })(t);
        })(e),
        s = (function (e, t) {
          if (t)
            return e.dataset.xrefType
              ? e.dataset.xrefType.split("|")
              : ["_IDL_"];
          return ["_CONCEPT_"];
        })(e, t),
        i = (function (e, t) {
          if (e.dataset.xrefFor) return Kt(e.dataset.xrefFor);
          if (t) {
            const t = e.closest("[data-xref-for]");
            if (t) return Kt(t.dataset.xrefFor);
          }
          return null;
        })(e, t);
      return {
        id: "",
        term: n,
        types: s,
        ...(r.length && { specs: r }),
        ...("string" == typeof i && { for: i }),
      };
    }
    function Ca(e) {
      const { lt: t } = e.dataset;
      let n = t ? t.split("|", 1)[0] : e.textContent;
      return (n = Kt(n)), "the-empty-string" === n ? "" : n;
    }
    function Sa(e, t, n, r) {
      const { term: s, specs: i = [] } = t,
        { uri: o, shortname: a, spec: c, normative: l, type: u, for: d } = n,
        p = i.flat().includes(c) ? c : a,
        h = new URL(o, "https://partial"),
        { pathname: f } = h,
        m = { cite: p, citePath: f, citeFrag: h.hash.slice(1), type: u };
      d && (m.linkFor = d[0]),
        h.origin && "https://partial" !== h.origin && (m.citeHref = h.href),
        Object.assign(e.dataset, m),
        (function (e, t, n, r, s) {
          if (
            !(function (e) {
              const t = e.closest(".normative"),
                n = e.closest(Mt);
              return !n || e === t || (t && n && n.contains(t));
            })(e)
          )
            return void (
              s.normativeReferences.has(t) || s.informativeReferences.add(t)
            );
          if (n) {
            const e = s.informativeReferences.has(t)
              ? s.informativeReferences.getCanonicalKey(t)
              : t;
            return (
              s.normativeReferences.add(e),
              void s.informativeReferences.delete(e)
            );
          }
          yn(
            `Normative reference to "${r}" found but term is defined "informatively" in "${t}".`,
            ka,
            {
              title: "Normative reference to non-normative term.",
              elements: [e],
            }
          );
        })(e, p, l, s, r);
    }
    function Ra(e) {
      const t = JSON.stringify(e, Object.keys(e).sort()),
        n = new TextEncoder().encode(t);
      return crypto.subtle.digest("SHA-1", n).then(Ea);
    }
    function Ea(e) {
      return [...new Uint8Array(e)]
        .map((e) => e.toString(16).padStart(2, "0"))
        .join("");
    }
    function Aa(e) {
      const t = e.querySelectorAll(
          "a[data-xref-for], a[data-xref-type], a[data-link-for]"
        ),
        n = ["data-xref-for", "data-xref-type", "data-link-for"];
      t.forEach((e) => {
        n.forEach((t) => e.removeAttribute(t));
      });
    }
    var Ta = Object.freeze({
      __proto__: null,
      name: ka,
      API_URL: xa,
      run: async function (e) {
        if (!e.xref) return;
        const t = (function (e) {
          const t = { url: xa, specs: null },
            n = Object.assign({}, t);
          switch (Array.isArray(e) ? "array" : typeof e) {
            case "boolean":
              break;
            case "string":
              e.toLowerCase() in $a
                ? Object.assign(n, { specs: $a[e.toLowerCase()] })
                : r(e);
              break;
            case "array":
              Object.assign(n, { specs: e });
              break;
            case "object":
              if ((Object.assign(n, e), e.profile)) {
                const t = e.profile.toLowerCase();
                if (t in $a) {
                  const r = (e.specs ?? []).concat($a[t]);
                  Object.assign(n, { specs: r });
                } else r(e.profile);
              }
              break;
            default:
              bn(
                `Invalid value for \`xref\` configuration option. Received: "${e}".`,
                ka
              );
          }
          return n;
          function r(e) {
            bn(
              `Invalid profile "${e}" in \`respecConfig.xref\`. Please use one of the supported profiles: ${Gt(
                Object.keys($a),
                (e) => `"${e}"`
              )}.`,
              ka
            );
          }
        })(e.xref);
        if (t.specs) {
          const e = document.body.dataset.cite
            ? document.body.dataset.cite.split(/\s+/)
            : [];
          document.body.dataset.cite = e.concat(t.specs).join(" ");
        }
        const n = la.concat(
          (function () {
            const e = document.querySelectorAll(
                ":is(a,dfn)[data-cite]:not([data-cite=''],[data-cite*='#'])"
              ),
              t = document.querySelectorAll("dfn.externalDFN");
            return [...e]
              .filter((e) => {
                if ("" === e.textContent.trim()) return !1;
                const t = e.closest("[data-cite]");
                return !t || "" !== t.dataset.cite;
              })
              .concat(...t);
          })()
        );
        if (!n.length) return;
        const r = [];
        for (const e of n) {
          const t = _a(e);
          (t.id = await Ra(t)), r.push(t);
        }
        const s = await (async function (e, t) {
          const n = new Set(),
            r = e.filter((e) => !n.has(e.id) && n.add(e.id) && !0),
            s = await va(r),
            i = r.filter((e) => !s.get(e.id)),
            o = await (async function (e, t) {
              if (!e.length) return new Map();
              const n = { keys: e },
                r = {
                  method: "POST",
                  body: JSON.stringify(n),
                  headers: { "Content-Type": "application/json" },
                },
                s = await fetch(t, r),
                i = await s.json();
              return new Map(i.result);
            })(i, t);
          o.size &&
            (await (async function (e, t) {
              try {
                const n = (await wa()).transaction(ba, "readwrite");
                for (const r of e) {
                  const e = t.get(r.id);
                  n.objectStore(ba).add({ query: r, result: e });
                }
                await n.done;
              } catch (e) {
                console.error(e);
              }
            })(r, o));
          return new Map([...s, ...o]);
        })(r, t.url);
        !(function (e, t, n, r) {
          const s = { ambiguous: new Map(), notFound: new Map() };
          for (let i = 0, o = e.length; i < o; i++) {
            if (e[i].closest("[data-no-xref]")) continue;
            const o = e[i],
              a = t[i],
              { id: c } = a,
              l = n.get(c);
            if (1 === l.length) Sa(o, a, l[0], r);
            else {
              const e = s[0 === l.length ? "notFound" : "ambiguous"];
              e.has(c) || e.set(c, { elems: [], results: l, query: a }),
                e.get(c).elems.push(o);
            }
          }
          !(function ({ ambiguous: e, notFound: t }) {
            const n = (e, t, n = []) => {
                const r = new URL(xa);
                return (
                  r.searchParams.set("term", e),
                  t.for && r.searchParams.set("for", t.for),
                  r.searchParams.set("types", t.types.join(",")),
                  n.length && r.searchParams.set("specs", n.join(",")),
                  r.href
                );
              },
              r = (e, t) => xn`
    [See search matches for "${t}"](${e}) or
    ${"[Learn about this error|#error-term-not-found]"}.`;
            for (const { query: e, elems: s } of t.values()) {
              const t = e.specs ? [...new Set(e.specs.flat())].sort() : [],
                i = Ca(s[0]),
                o = n(i, e),
                a = Ht(t, (e) => `**[${e}]**`),
                c = r(o, i);
              bn(
                `Couldn't find "**${i}**"${
                  e.for ? `, for **"${e.for}"**, ` : ""
                } in this document or other cited documents: ${a}.`,
                ka,
                { title: "No matching definition found.", elements: s, hint: c }
              );
            }
            for (const { query: t, elems: s, results: i } of e.values()) {
              const e = [...new Set(i.map((e) => e.shortname))].sort(),
                o = Ht(e, (e) => `**[${e}]**`),
                a = Ca(s[0]),
                c = n(a, t, e),
                l = t.for ? `, for **"${t.for}"**, ` : "",
                u = xn`To fix, use the ${"[data-cite]"} attribute to pick the one you mean from the appropriate specification. ${r(
                  c,
                  a
                )}.`;
              bn(
                `The term "**${a}**"${l} is ambiguous because it's defined in ${o}.`,
                ka,
                { title: "Definition is ambiguous.", elements: s, hint: u }
              );
            }
          })(s);
        })(n, r, s, e),
          Rn("beforesave", Aa);
      },
      getTermFromElement: Ca,
    });
    var La = Object.freeze({
      __proto__: null,
      name: "core/webidl-index",
      run: function () {
        const e = document.querySelector("section#idl-index");
        if (!e) return;
        const t = [2, 3, 4, 5, 6].map((e) => `h${e}:first-child`).join(",");
        if (!e.querySelector(t)) {
          const t = document.createElement("h2");
          e.title
            ? ((t.textContent = e.title), e.removeAttribute("title"))
            : (t.textContent = "IDL Index"),
            e.prepend(t);
        }
        const n = Array.from(
          document.querySelectorAll("pre.idl:not(.exclude) > code")
        ).filter((e) => !e.closest(Mt));
        if (0 === n.length) {
          const t =
            "This specification doesn't normatively declare any Web IDL.";
          return void e.append(t);
        }
        const r = document.createElement("pre");
        r.classList.add("idl", "def"),
          (r.id = "actual-idl-index"),
          n
            .map((e) => {
              const t = document.createDocumentFragment();
              for (const n of e.children) t.appendChild(n.cloneNode(!0));
              return t;
            })
            .forEach((e) => {
              r.lastChild && r.append("\n\n"), r.appendChild(e);
            }),
          r.querySelectorAll("*[id]").forEach((e) => e.removeAttribute("id")),
          e.appendChild(r),
          cn(r, document.createElement("code")),
          Zo(r);
      },
    });
    var Pa = String.raw`ul.index{columns:30ch;column-gap:1.5em}
ul.index li{list-style:inherit}
ul.index li span{color:inherit;cursor:pointer;white-space:normal}
#index-defined-here ul.index li{font-size:.9rem}
ul.index code{color:inherit}
#index-defined-here .print-only{display:none}
@media print{
#index-defined-here .print-only{display:initial}
}`;
    const Ia = Yt({
        en: {
          heading: "Index",
          headingExternal: "Terms defined by reference",
          headlingLocal: "Terms defined by this specification",
          dfnOf: "definition of",
        },
      }),
      Da = new Set([
        "attribute",
        "callback",
        "dict-member",
        "dictionary",
        "element-attr",
        "element",
        "enum-value",
        "enum",
        "exception",
        "extended-attribute",
        "interface",
        "method",
        "typedef",
      ]);
    function Na(e) {
      const t = e.dataset,
        n = t.dfnType || t.idl || t.linkType || "";
      switch (n) {
        case "":
        case "dfn":
          return "";
        default:
          return n;
      }
    }
    function ja(e) {
      const t = e.closest("[data-dfn-for]:not([data-dfn-for=''])");
      return t ? t.dataset.dfnFor : "";
    }
    function Oa(e, t, n = "") {
      if (n.startsWith("[[")) {
        return `internal slot for <code>${ja(e)}</code>`;
      }
      switch (t) {
        case "dict-member":
        case "method":
        case "attribute":
        case "enum-value":
          return `${
            "dict-member" === t ? "member" : t.replace("-", " ")
          } for <code>${ja(e)}</code>`;
        case "interface":
        case "dictionary":
        case "enum":
          return t;
        case "constructor":
          return `for <code>${ja(e)}</code>`;
        default:
          return "";
      }
    }
    function za() {
      document
        .querySelectorAll("#index-defined-here li[data-id]")
        .forEach((e) =>
          e.append(
            ((e) => {
              const t =
                "§" +
                document
                  .getElementById(e)
                  .closest("section")
                  .querySelector(".secno")
                  .textContent.trim();
              return It`<span class="print-only">${t}</span>`;
            })(e.dataset.id)
          )
        );
    }
    function Ma() {
      const e = new Set(),
        t = new Map(),
        n = document.querySelectorAll("a[data-cite]");
      for (const r of n) {
        if (!r.dataset.cite) continue;
        const n = r.href;
        if (e.has(n)) continue;
        const { type: s, linkFor: i } = r.dataset,
          o = Ca(r);
        if (!o) continue;
        const a = ia(r).key.toUpperCase();
        (t.get(a) || t.set(a, []).get(a)).push({
          term: o,
          type: s,
          linkFor: i,
          elem: r,
        }),
          e.add(n);
      }
      return t;
    }
    function Ua(e) {
      const { elem: t } = e,
        n = (function (e) {
          const { term: t, type: n, linkFor: r } = e;
          let s = t;
          Da.has(n) &&
            ("extended-attribute" === n && (s = `[${s}]`),
            (s = `<code>${s}</code>`));
          const i = qa.has(t) ? "type" : Wa.get(n);
          i && (s += " " + i);
          if (r) {
            let e = r;
            /\s/.test(r) || (e = `<code>${e}</code>`),
              "element-attr" === n && (e += " element"),
              (s += ` (for ${e})`);
          }
          return s;
        })(e);
      return It`<li>
    <span class="index-term" data-href="${t.href}">${{ html: n }}</span>
  </li>`;
    }
    const Wa = new Map([
        ["attribute", "attribute"],
        ["element-attr", "attribute"],
        ["element", "element"],
        ["enum", "enum"],
        ["exception", "exception"],
        ["extended-attribute", "extended attribute"],
        ["interface", "interface"],
      ]),
      qa = new Set([
        "boolean",
        "byte",
        "octet",
        "short",
        "unsigned short",
        "long",
        "unsigned long",
        "long long",
        "unsigned long long",
        "float",
        "unrestricted float",
        "double",
        "unrestricted double",
        "undefined",
        "any",
        "object",
        "symbol",
      ]);
    function Fa(e) {
      e
        .querySelectorAll("#index-defined-elsewhere li[data-spec]")
        .forEach((e) => e.removeAttribute("data-spec")),
        e
          .querySelectorAll("#index-defined-here li[data-id]")
          .forEach((e) => e.removeAttribute("data-id"));
    }
    var Ba = Object.freeze({
      __proto__: null,
      name: "core/dfn-index",
      run: function () {
        const e = document.querySelector("section#index");
        if (!e) return;
        const t = document.createElement("style");
        (t.textContent = Pa),
          document.head.appendChild(t),
          e.classList.add("appendix"),
          e.querySelector("h2") || e.prepend(It`<h2>${Ia.heading}</h2>`);
        const n = It`<section id="index-defined-here">
    <h3>${Ia.headlingLocal}</h3>
    ${(function () {
      const e = (function () {
        const e = new Map(),
          t = document.querySelectorAll("dfn:not([data-cite])");
        for (const n of t) {
          if (!n.id) continue;
          const t = Kt(n.textContent);
          (e.get(t) || e.set(t, []).get(t)).push(n);
        }
        return [...e].sort(([e], [t]) =>
          e.slice(e.search(/\w/)).localeCompare(t.slice(t.search(/\w/)))
        );
      })();
      return It`<ul class="index">
    ${e.map(([e, t]) =>
      (function (e, t) {
        const n = (e, t, n) => {
          const r = "#" + e.id;
          return It`<li data-id=${e.id}>
      <a class="index-term" href="${r}">${{ html: t }}</a> ${
            n ? { html: n } : ""
          }
    </li>`;
        };
        if (1 === t.length) {
          const r = t[0],
            s = Na(r),
            i = (function (e, t, n) {
              let r = n;
              "enum-value" === t && (r = `"${r}"`);
              (Da.has(t) || e.dataset.idl || e.closest("code")) &&
                (r = `<code>${r}</code>`);
              return r;
            })(r, s, e),
            o = Oa(r, s, e);
          return n(r, i, o);
        }
        return It`<li>
    ${e}
    <ul>
      ${t.map((t) => {
        const r = Oa(t, Na(t), e) || Ia.dfnOf;
        return n(t, r);
      })}
    </ul>
  </li>`;
      })(e, t)
    )}
  </ul>`;
    })()}
  </section>`;
        e.append(n);
        const r = It`<section id="index-defined-elsewhere">
    <h3>${Ia.headingExternal}</h3>
    ${(function () {
      const e = [...Ma().entries()].sort(([e], [t]) => e.localeCompare(t));
      return It`<ul class="index">
    ${e.map(
      ([e, t]) => It`<li data-spec="${e}">
        ${Ci(e)} defines the following:
        <ul>
          ${t.sort((e, t) => e.term.localeCompare(t.term)).map(Ua)}
        </ul>
      </li>`
    )}
  </ul>`;
    })()}
  </section>`;
        e.append(r);
        for (const e of r.querySelectorAll(".index-term")) rn(e, "index-term");
        Rn("toc", za, { once: !0 }), Rn("beforesave", Fa);
      },
    });
    const Ha = "core/contrib";
    var Ga = Object.freeze({
      __proto__: null,
      name: Ha,
      run: async function (e) {
        if (!document.getElementById("gh-contributors")) return;
        if (!e.github) {
          return void bn(
            xn`Requested list of contributors from GitHub, but ${"[github]"} configuration option is not set.`,
            Ha
          );
        }
        const t = e.editors.map((e) => e.name),
          n = `${e.github.apiBase}/${e.github.fullName}/`;
        await (async function (e, t) {
          const n = document.getElementById("gh-contributors");
          if (!n) return;
          n.textContent = "Fetching list of contributors...";
          const r = await s();
          null !== r
            ? (function (e, t) {
                const n = e.sort((e, t) => {
                  const n = e.name || e.login,
                    r = t.name || t.login;
                  return n.toLowerCase().localeCompare(r.toLowerCase());
                });
                if ("UL" === t.tagName)
                  return void It(t)`${n.map(
                    ({ name: e, login: t }) =>
                      `<li><a href="https://github.com/${t}">${e || t}</a></li>`
                  )}`;
                const r = n.map((e) => e.name || e.login);
                t.textContent = Ht(r);
              })(r, n)
            : (n.textContent = "Failed to fetch contributors.");
          async function s() {
            const { href: n } = new URL("contributors", t);
            try {
              const t = await Xt(n);
              if (!t.ok)
                throw new Error(
                  `Request to ${n} failed with status code ${t.status}`
                );
              return (await t.json()).filter(
                (t) => !e.includes(t.name || t.login)
              );
            } catch (e) {
              return (
                bn("Error loading contributors from GitHub.", Ha),
                console.error(e),
                null
              );
            }
          }
        })(t, n);
      },
    });
    var Va = Object.freeze({
      __proto__: null,
      name: "core/fix-headers",
      run: function () {
        [...document.querySelectorAll("section:not(.introductory)")]
          .map((e) => e.querySelector("h1, h2, h3, h4, h5, h6"))
          .filter((e) => e)
          .forEach((e) => {
            on(
              e,
              "h" +
                Math.min(
                  (function (e, t) {
                    const n = [];
                    for (; e != e.ownerDocument.body; )
                      e.matches(t) && n.push(e), (e = e.parentElement);
                    return n;
                  })(e, "section").length + 1,
                  6
                )
            );
          });
      },
    });
    const Ka = ["h2", "h3", "h4", "h5", "h6"],
      Ya = "core/structure",
      Za = Yt({
        en: { toc: "Table of Contents" },
        zh: { toc: "内容大纲" },
        ko: { toc: "목차" },
        ja: { toc: "目次" },
        nl: { toc: "Inhoudsopgave" },
        es: { toc: "Tabla de Contenidos" },
        de: { toc: "Inhaltsverzeichnis" },
      });
    function Ja(e, t, { prefix: n = "" } = {}) {
      let r = !1,
        s = 0,
        i = 1;
      if ((n.length && !n.endsWith(".") && (n += "."), 0 === e.length))
        return null;
      const o = It`<ol class="toc"></ol>`;
      for (const a of e) {
        !a.isAppendix || n || r || ((s = i), (r = !0));
        let e = a.isIntro ? "" : r ? Qa(i - s + 1) : n + i;
        const c = e.split(".").length;
        if (
          (1 === c &&
            ((e += "."), a.header.before(document.createComment("OddPage"))),
          a.isIntro ||
            ((i += 1), a.header.prepend(It`<bdi class="secno">${e} </bdi>`)),
          c <= t)
        ) {
          const n = a.header.id || a.element.id,
            r = ec(a.header, n),
            s = Ja(a.subsections, t, { prefix: e });
          s && r.append(s), o.append(r);
        }
      }
      return o;
    }
    function Qa(e) {
      let t = "";
      for (; e > 0; )
        (e -= 1),
          (t = String.fromCharCode(65 + (e % 26)) + t),
          (e = Math.floor(e / 26));
      return t;
    }
    function Xa(e) {
      const t = e.querySelectorAll(":scope > section"),
        n = [];
      for (const e of t) {
        const t = e.classList.contains("notoc");
        if (!e.children.length || t) continue;
        const r = e.children[0];
        if (!Ka.includes(r.localName)) continue;
        const s = r.textContent;
        rn(e, null, s),
          n.push({
            element: e,
            header: r,
            title: s,
            isIntro: Boolean(e.closest(".introductory")),
            isAppendix: e.classList.contains("appendix"),
            subsections: Xa(e),
          });
      }
      return n;
    }
    function ec(e, t) {
      const n = It`<a href="${"#" + t}" class="tocxref" />`;
      var r;
      return (
        n.append(...e.cloneNode(!0).childNodes),
        (r = n).querySelectorAll("a").forEach((e) => {
          const t = on(e, "span");
          (t.className = "formerLink"), t.removeAttribute("href");
        }),
        r.querySelectorAll("dfn").forEach((e) => {
          on(e, "span").removeAttribute("id");
        }),
        It`<li class="tocline">${n}</li>`
      );
    }
    var tc = Object.freeze({
      __proto__: null,
      name: Ya,
      run: function (e) {
        if (
          ("maxTocLevel" in e == !1 && (e.maxTocLevel = 1 / 0),
          (function () {
            const e = [
              ...document.querySelectorAll(
                "section:not(.introductory) :is(h1,h2,h3,h4,h5,h6):first-child"
              ),
            ].filter((e) => !e.closest("section.introductory"));
            if (!e.length) return;
            e.forEach((e) => {
              const t = "h" + Math.min(ln(e, "section").length + 1, 6);
              e.localName !== t && on(e, t);
            });
          })(),
          !e.noTOC)
        ) {
          !(function () {
            const e = document.querySelectorAll("section[data-max-toc]");
            for (const t of e) {
              const e = parseInt(t.dataset.maxToc, 10);
              if (e < 0 || e > 6 || Number.isNaN(e)) {
                bn(
                  "`data-max-toc` must have a value between 0-6 (inclusive).",
                  Ya,
                  { elements: [t] }
                );
                continue;
              }
              if (0 === e) {
                t.classList.add("notoc");
                continue;
              }
              const n = t.querySelectorAll(
                ":scope > " +
                  Array.from({ length: e }, () => "section").join(" > ")
              );
              for (const e of n) e.classList.add("notoc");
            }
          })();
          const t = Ja(Xa(document.body), e.maxTocLevel);
          t &&
            (function (e) {
              if (!e) return;
              const t = It`<nav id="toc"></nav>`,
                n = It`<h2 class="introductory">${Za.toc}</h2>`;
              rn(n), t.append(n, e);
              const r =
                document.getElementById("toc") ||
                document.getElementById("sotd") ||
                document.getElementById("abstract");
              r && ("toc" === r.id ? r.replaceWith(t) : r.after(t));
              const s = It`<p role="navigation" id="back-to-top">
    <a href="#title"><abbr title="Back to Top">&uarr;</abbr></a>
  </p>`;
              document.body.append(s);
            })(t);
        }
        Sn("toc");
      },
    });
    const nc = Yt({
      en: { informative: "This section is non-normative." },
      nl: { informative: "Dit onderdeel is niet normatief." },
      ko: { informative: "이 부분은 비규범적입니다." },
      ja: { informative: "この節は仕様には含まれません．" },
      de: { informative: "Dieser Abschnitt ist nicht normativ." },
      zh: { informative: "本章节不包含规范性内容。" },
    });
    var rc = Object.freeze({
      __proto__: null,
      name: "core/informative",
      run: function () {
        Array.from(document.querySelectorAll("section.informative"))
          .map((e) => e.querySelector("h2, h3, h4, h5, h6"))
          .filter((e) => e)
          .forEach((e) => {
            e.after(It`<p><em>${nc.informative}</em></p>`);
          });
      },
    });
    var sc = Object.freeze({
      __proto__: null,
      name: "core/id-headers",
      run: function (e) {
        const t = document.querySelectorAll(
          "section:not(.head):not(.introductory) h2, h3, h4, h5, h6"
        );
        for (const n of t) {
          let t = n.id;
          t || (rn(n), (t = n.parentElement.id || n.id)),
            e.addSectionLinks &&
              n.appendChild(It`
      <a href="${"#" + t}" class="self-link" aria-label="§"></a>
    `);
        }
      },
    });
    var ic = String.raw`.caniuse-stats{display:flex;flex-wrap:wrap;justify-content:flex-start;align-items:baseline}
button.caniuse-cell{margin:1px 1px 0 0;border:none}
.caniuse-browser{position:relative}
@media print{
.caniuse-cell.y::before{content:"✔️";padding:.5em}
.caniuse-cell.n::before{content:"❌";padding:.5em}
.caniuse-cell:is(.a,.d,.p,.x)::before{content:"⚠️";padding:.5em}
}
.caniuse-browser ul{display:none;margin:0;padding:0;list-style:none;position:absolute;left:0;z-index:2;background:#fff;margin-top:1px}
.caniuse-stats a[href]{white-space:nowrap;align-self:center;margin-left:.5em}
.caniuse-cell{display:flex;font-size:90%;height:.8cm;margin-right:1px;margin-top:0;min-width:3cm;overflow:visible;justify-content:center;align-items:center;--supported:#2a8436;--no-support:#c44230;--no-support-alt:#b43b2b;--partial:#807301;--partial-alt:#746c00;color:#fff;background:repeating-linear-gradient(var(--caniuse-angle,45deg),var(--caniuse-bg) 0,var(--caniuse-bg-alt) 1px,var(--caniuse-bg-alt) .4em,var(--caniuse-bg) calc(.25em + 1px),var(--caniuse-bg) .75em)}
li.caniuse-cell{margin-bottom:1px}
.caniuse-cell:focus{outline:0}
.caniuse-cell.y{background:var(--supported)}
.caniuse-cell:is(.n,.d){--caniuse-angle:45deg;--caniuse-bg:var(--no-support);--caniuse-bg-alt:var(--no-support-alt)}
.caniuse-cell.d{--caniuse-angle:180deg}
.caniuse-cell:is(.a,.x,.p){--caniuse-angle:90deg;--caniuse-bg:var(--partial);--caniuse-bg-alt:var(--partial-alt)}
.caniuse-stats .caniuse-browser:hover>ul,.caniuse-stats button:focus+ul{display:block}`;
    const oc = "core/caniuse",
      ac = new Set([
        "and_chr",
        "and_ff",
        "and_uc",
        "android",
        "bb",
        "chrome",
        "edge",
        "firefox",
        "ie",
        "ios_saf",
        "op_mini",
        "op_mob",
        "opera",
        "safari",
        "samsung",
      ]);
    async function cc(e, t) {
      const { feature: n, versions: r, browsers: s } = t,
        i = new URLSearchParams();
      i.set("feature", n),
        i.set("versions", r),
        Array.isArray(s) && i.set("browsers", s.join(",")),
        i.set("format", "html");
      const o = `${e}?${i.toString()}`,
        a = await fetch(o);
      if (!a.ok) {
        const { status: e, statusText: t } = a;
        throw new Error(`Failed to get caniuse data: (${e}) ${t}`);
      }
      return await a.text();
    }
    var lc = Object.freeze({
      __proto__: null,
      name: oc,
      prepare: function (e) {
        if (!e.caniuse) return;
        const t = (function (e) {
          const t = { versions: 4, removeOnSave: !1 };
          if ("string" == typeof e.caniuse) return { feature: e.caniuse, ...t };
          const n = { ...t, ...e.caniuse },
            { browsers: r } = n;
          if (Array.isArray(r)) {
            const e = r.filter((e) => !ac.has(e));
            if (e.length) {
              yn(
                xn`Invalid browser(s): (${kn(e, {
                  quotes: !0,
                })}) in the \`browser\` property of ${"[caniuse]"}.`,
                oc
              );
            }
          }
          return n;
        })(e);
        if (((e.caniuse = t), !t.feature)) return;
        document.head.appendChild(It`<style
    id="caniuse-stylesheet"
    class="${t.removeOnSave ? "removeOnSave" : ""}"
  >
    ${ic}
  </style>`);
        const n = t.apiURL || "https://respec.org/caniuse/";
        e.state[oc] = { fetchPromise: cc(n, t) };
      },
      run: async function (e) {
        const t = e.caniuse;
        if (!t?.feature) return;
        const n = new URL(t.feature, "https://caniuse.com/").href,
          r = document.querySelector(".head dl"),
          s = (async () => {
            try {
              const t = await e.state[oc].fetchPromise;
              return It`${{ html: t }}`;
            } catch (e) {
              const r = xn`Please check the feature key on [caniuse.com](https://caniuse.com) and update ${"[caniuse]"}`;
              return (
                bn(`Couldn't find feature "${t.feature}" on caniuse.com.`, oc, {
                  hint: r,
                }),
                console.error(e),
                It`<a href="${n}">caniuse.com</a>`
              );
            }
          })(),
          i = It`<dt class="caniuse-title">
      Browser support (caniuse.com):
    </dt>
    <dd class="caniuse-stats">
      ${{ any: s, placeholder: "Fetching data from caniuse.com..." }}
    </dd>`;
        r.append(...i.childNodes),
          await s,
          Sn("amend-user-config", { caniuse: t.feature }),
          t.removeOnSave &&
            (r
              .querySelectorAll(".caniuse-browser")
              .forEach((e) => e.classList.add("removeOnSave")),
            Rn("beforesave", (e) => {
              It.bind(e.querySelector(".caniuse-stats"))`
        <a href="${n}">caniuse.com</a>`;
            }));
      },
    });
    var uc = String.raw`.mdn{font-size:.75em;position:absolute;right:.3em;min-width:0;margin-top:3em}
.mdn details{width:100%;margin:1px 0;position:relative;z-index:10;box-sizing:border-box;padding:.4em;padding-top:0}
.mdn details[open]{min-width:25ch;max-width:32ch;background:#fff;box-shadow:0 1em 3em -.4em rgba(0,0,0,.3),0 0 1px 1px rgba(0,0,0,.05);border-radius:2px;z-index:11;margin-bottom:.4em}
.mdn summary{text-align:right;cursor:default;margin-right:-.4em}
.mdn summary span{font-family:zillaslab,Palatino,"Palatino Linotype",serif;color:#fff;background-color:#000;display:inline-block;padding:3px}
.mdn a{display:inline-block;word-break:break-all}
.mdn p{margin:0}
.mdn .engines-all{color:#058b00}
.mdn .engines-some{color:#b00}
.mdn table{width:100%;font-size:.9em}
.mdn td{border:none}
.mdn td:nth-child(2){text-align:right}
.mdn .nosupportdata{font-style:italic;margin:0}
.mdn tr::before{content:"";display:table-cell;width:1.5em;height:1.5em;background:no-repeat center center/contain;font-size:.75em}
.mdn .no,.mdn .unknown{color:#ccc;filter:grayscale(100%)}
.mdn .no::before,.mdn .unknown::before{opacity:.5}
.mdn .chrome::before,.mdn .chrome_android::before{background-image:url(https://resources.whatwg.org/browser-logos/chrome.svg)}
.mdn .edge::before,.mdn .edge_mobile::before{background-image:url(https://resources.whatwg.org/browser-logos/edge.svg)}
.mdn .firefox::before,.mdn .firefox_android::before{background-image:url(https://resources.whatwg.org/browser-logos/firefox.png)}
.mdn .ie::before{background-image:url(https://resources.whatwg.org/browser-logos/ie.png)}
.mdn .opera::before,.mdn .opera_android::before{background-image:url(https://resources.whatwg.org/browser-logos/opera.svg)}
.mdn .safari::before{background-image:url(https://resources.whatwg.org/browser-logos/safari.png)}
.mdn .safari_ios::before{background-image:url(https://resources.whatwg.org/browser-logos/safari-ios.svg)}
.mdn .samsunginternet_android::before{background-image:url(https://resources.whatwg.org/browser-logos/samsung.svg)}
.mdn .webview_android::before{background-image:url(https://resources.whatwg.org/browser-logos/android-webview.png)}`;
    const dc = "core/mdn-annotation",
      pc = "https://w3c.github.io/mdn-spec-links/",
      hc = {
        chrome: "Chrome",
        chrome_android: "Chrome Android",
        edge: "Edge",
        edge_mobile: "Edge Mobile",
        firefox: "Firefox",
        firefox_android: "Firefox Android",
        ie: "Internet Explorer",
        opera: "Opera",
        opera_android: "Opera Android",
        safari: "Safari",
        safari_ios: "Safari iOS",
        samsunginternet_android: "Samsung Internet",
        webview_android: "WebView Android",
      },
      fc = Yt({
        en: {
          inAllEngines: "This feature is in all major engines.",
          inSomeEngines: "This feature has limited support.",
        },
        zh: {
          inAllEngines: "所有主要引擎均支持此特性。",
          inSomeEngines: "此功能支持有限。",
        },
      });
    function mc(e) {
      const t = e.closest("section");
      if (!t) return;
      const { previousElementSibling: n } = t;
      if (n && n.classList.contains("mdn")) return n;
      const r = It`<aside class="mdn"></aside>`;
      return t.before(r), r;
    }
    function gc(e) {
      const { name: t, slug: n, summary: r, support: s, engines: i } = e,
        o = n.slice(n.indexOf("/") + 1),
        a = "https://developer.mozilla.org/en-US/docs/Web/" + n,
        c = "Expand MDN details for " + t,
        l = (function (e) {
          if (3 === e.length)
            return It`<span title="${fc.inAllEngines}">✅</span>`;
          if (e.length < 2)
            return It`<span title="${fc.inSomeEngines}">🚫</span>`;
          return It`<span>&emsp;</span>`;
        })(i);
      return It`<details>
    <summary aria-label="${c}"><span>MDN</span>${l}</summary>
    <a title="${r}" href="${a}">${o}</a>
    ${(function (e) {
      if (3 === e.length)
        return It`<p class="engines-all">${fc.inAllEngines}</p>`;
      if (e.length < 2)
        return It`<p class="engines-some">${fc.inSomeEngines}</p>`;
    })(i)}
    ${
      s
        ? (function (e) {
            function t(e, t, n) {
              const r = "Unknown" === t ? "?" : t,
                s = `${e} ${t.toLowerCase()}`;
              return It`<tr class="${s}">
      <td>${hc[e]}</td>
      <td>${n || r}</td>
    </tr>`;
            }
            function n(e, n) {
              if (n.version_removed) return t(e, "No", "");
              const r = n.version_added;
              return "boolean" == typeof r
                ? t(e, r ? "Yes" : "No", "")
                : r
                ? t(e, "Yes", r + "+")
                : t(e, "Unknown", "");
            }
            return It`<table>
    ${Object.keys(hc).map((r) => (e[r] ? n(r, e[r]) : t(r, "Unknown", "")))}
  </table>`;
          })(s)
        : It`<p class="nosupportdata">No support data.</p>`
    }
  </details>`;
    }
    var bc = Object.freeze({
      __proto__: null,
      name: dc,
      run: async function (e) {
        const t = (function (e) {
          const { shortName: t, mdn: n } = e;
          if (!n) return;
          return "string" == typeof n ? n : n.key || t;
        })(e);
        if (!t) return;
        const n = await (async function (e, t) {
          const { baseJsonPath: n = pc, maxAge: r = 864e5 } = t,
            s = new URL(e + ".json", n).href,
            i = await Xt(s, r);
          if (404 === i.status) {
            return void bn(
              `Could not find MDN data associated with key "${e}".`,
              dc,
              { hint: "Please add a valid key to `respecConfig.mdn`" }
            );
          }
          return await i.json();
        })(t, e.mdn);
        if (!n) return;
        const r = document.createElement("style");
        (r.textContent = uc), document.head.append(r);
        for (const e of (function (e) {
          return [...document.body.querySelectorAll("[id]:not(script)")].filter(
            ({ id: t }) => Array.isArray(e[t])
          );
        })(n)) {
          const t = n[e.id],
            r = mc(e);
          if (r) for (const e of t) r.append(gc(e));
        }
      },
    });
    const yc = "ui/save-html",
      wc = Yt({
        en: { save_snapshot: "Export" },
        nl: { save_snapshot: "Bewaar Snapshot" },
        ja: { save_snapshot: "保存する" },
        de: { save_snapshot: "Exportieren" },
        zh: { save_snapshot: "导出" },
      }),
      vc = [
        {
          id: "respec-save-as-html",
          ext: "html",
          title: "HTML",
          type: "text/html",
          get href() {
            return Tn(this.type);
          },
        },
        {
          id: "respec-save-as-xml",
          ext: "xhtml",
          title: "XML",
          type: "application/xml",
          get href() {
            return Tn(this.type);
          },
        },
        {
          id: "respec-save-as-epub",
          ext: "epub",
          title: "EPUB 3",
          type: "application/epub+zip",
          get href() {
            const e = new URL("https://labs.w3.org/r2epub/");
            return (
              e.searchParams.append("respec", "true"),
              e.searchParams.append("url", document.location.href),
              e.href
            );
          },
        },
      ];
    var kc = Object.freeze({
      __proto__: null,
      name: yc,
      run: function (e) {
        const t = {
            async show(t) {
              await document.respec.ready;
              const n = It`<div class="respec-save-buttons">
        ${vc.map((t) =>
          (function (e, t) {
            const { id: n, href: r, ext: s, title: i, type: o } = e,
              a = Zt(t.publishDate || new Date()),
              c = [t.specStatus, t.shortName || "spec", a].join("-");
            return It`<a
    href="${r}"
    id="${n}"
    download="${c}.${s}"
    type="${o}"
    class="respec-save-button"
    onclick=${() => dr.closeModal()}
    >${i}</a
  >`;
          })(t, e)
        )}
      </div>`;
              dr.freshModal(wc.save_snapshot, n, t);
            },
          },
          n = "download" in HTMLAnchorElement.prototype;
        let r;
        n &&
          (r = dr.addCommand(
            wc.save_snapshot,
            function () {
              if (!n) return;
              t.show(r);
            },
            "Ctrl+Shift+Alt+S",
            "💾"
          ));
      },
      exportDocument: function (e, t) {
        return (
          yn(
            "Exporting via ui/save-html module's `exportDocument()` is deprecated and will be removed.",
            yc,
            { hint: "Use core/exporter `rsDocToDataURL()` instead." }
          ),
          Tn(t)
        );
      },
    });
    const $c = "https://respec.org/specref/",
      xc = Yt({
        en: { search_specref: "Search Specref" },
        nl: { search_specref: "Doorzoek Specref" },
        ja: { search_specref: "仕様検索" },
        de: { search_specref: "Spezifikationen durchsuchen" },
        zh: { search_specref: "搜索 Specref" },
      }),
      _c = dr.addCommand(
        xc.search_specref,
        function () {
          const e = It`
    <iframe class="respec-iframe" src="${$c}" onload=${(e) =>
            e.target.classList.add("ready")}></iframe>
    <a href="${$c}" target="_blank">Open Search UI in a new tab</a>
  `;
          dr.freshModal(xc.search_specref, e, _c);
        },
        "Ctrl+Shift+Alt+space",
        "🔎"
      );
    var Cc = Object.freeze({ __proto__: null });
    const Sc = "https://respec.org/xref/",
      Rc = {
        en: { title: "Search definitions" },
        ja: { title: "定義検索" },
        de: { title: "Definitionen durchsuchen" },
        zh: { title: "搜索定义" },
      },
      Ec = Rc[s in Rc ? s : "en"],
      Ac = dr.addCommand(
        Ec.title,
        function () {
          const e = It`
    <iframe class="respec-iframe" src="${Sc}" onload="${(e) =>
            e.target.classList.add("ready")}"></iframe>
    <a href="${Sc}" target="_blank">Open Search UI in a new tab</a>
  `;
          dr.freshModal(Ec.title, e, Ac);
        },
        "Ctrl+Shift+Alt+x",
        "📚"
      );
    var Tc = Object.freeze({ __proto__: null });
    const Lc = Yt({
      en: { about_respec: "About" },
      zh: { about_respec: "关于" },
      nl: { about_respec: "Over" },
      ja: { about_respec: "これについて" },
      de: { about_respec: "Über" },
    });
    window.respecVersion = window.respecVersion || "Developer Edition";
    const Pc = document.createElement("div"),
      Ic = It.bind(Pc),
      Dc = dr.addCommand(
        `${Lc.about_respec} ${window.respecVersion}`,
        function () {
          const e = [];
          "getEntriesByType" in performance &&
            performance
              .getEntriesByType("measure")
              .sort((e, t) => t.duration - e.duration)
              .map(({ name: e, duration: t }) => ({
                name: e,
                duration:
                  t > 1e3
                    ? Math.round(t / 1e3) + " second(s)"
                    : t.toFixed(2) + " milliseconds",
              }))
              .map(Nc)
              .forEach((t) => {
                e.push(t);
              });
          Ic`
  <p>
    ReSpec is a document production toolchain, with a notable focus on W3C specifications.
  </p>
  <p>
    <a href='https://respec.org/docs'>Documentation</a>,
    <a href='https://github.com/w3c/respec/issues'>Bugs</a>.
  </p>
  <table border="1" width="100%" hidden="${!e.length}">
    <caption>
      Loaded plugins
    </caption>
    <thead>
      <tr>
        <th>
          Plugin Name
        </th>
        <th>
          Processing time
        </th>
      </tr>
    </thead>
    <tbody>${e}</tbody>
  </table>
`,
            dr.freshModal(
              `${Lc.about_respec} - ${window.respecVersion}`,
              Pc,
              Dc
            );
        },
        "Ctrl+Shift+Alt+A",
        "ℹ️"
      );
    function Nc({ name: e, duration: t }) {
      return It`
    <tr>
      <td><a href="${`https://github.com/w3c/respec/blob/develop/src/${e}.js`}">${e}</a></td>
      <td>${t}</td>
    </tr>
  `;
    }
    var jc = Object.freeze({ __proto__: null });
    var Oc = Object.freeze({
      __proto__: null,
      name: "core/seo",
      run: function () {
        const e = document.querySelector("#abstract p:first-of-type");
        if (!e) return;
        const t = e.textContent.replace(/\s+/, " ").trim(),
          n = document.createElement("meta");
        (n.name = "description"), (n.content = t), document.head.appendChild(n);
      },
    });
    const zc = "w3c/seo",
      Mc = {
        NOTE: "w3p:NOTE",
        WD: "w3p:WD",
        LC: "w3p:LastCall",
        CR: "w3p:CR",
        CRD: "w3p:CRD",
        PR: "w3p:PR",
        REC: "w3p:REC",
        PER: "w3p:PER",
        RSCND: "w3p:RSCND",
      };
    function Uc({ name: e, url: t, mailto: n, company: r, companyURL: s }) {
      const i = { type: "Person", name: e, url: t, "foaf:mbox": n };
      return (r || s) && (i.worksFor = { name: r, url: s }), i;
    }
    function Wc(e) {
      const { href: t, title: n, href: r } = e,
        s = { id: t, type: "TechArticle", name: n, url: r };
      return (
        e.authors && (s.creator = e.authors.map((e) => ({ name: e }))),
        e.rawDate && (s.publishedDate = e.rawDate),
        e.isbn && (s.identifier = e.isbn),
        e.publisher && (s.publisher = { name: e.publisher }),
        s
      );
    }
    var qc = Object.freeze({
      __proto__: null,
      name: zc,
      run: async function (e) {
        if (!e.canonicalURI)
          switch (e.specStatus) {
            case "CG-DRAFT":
            case "BG-DRAFT":
            case "unofficial":
              return;
          }
        const t = e.shortName ? `https://www.w3.org/TR/${e.shortName}/` : null;
        switch (e.canonicalURI) {
          case "edDraft":
            if (e.edDraftURI)
              e.canonicalURI = new URL(
                e.edDraftURI,
                document.location.href
              ).href;
            else {
              yn(
                "Canonical URI set to edDraft, but no edDraftURI is set in configuration",
                zc
              ),
                (e.canonicalURI = null);
            }
            break;
          case "TR":
            if (t) e.canonicalURI = t;
            else {
              yn(
                "Canonical URI set to TR, but no shortName is set in configuration",
                zc
              ),
                (e.canonicalURI = null);
            }
            break;
          default:
            if (e.canonicalURI)
              try {
                e.canonicalURI = new URL(
                  e.canonicalURI,
                  document.location.href
                ).href;
              } catch (t) {
                yn("CanonicalURI is an invalid URL: " + t.message, zc),
                  (e.canonicalURI = null);
              }
            else t && (e.canonicalURI = t);
        }
        if (e.canonicalURI) {
          const t = document.createElement("link");
          t.setAttribute("rel", "canonical"),
            t.setAttribute("href", e.canonicalURI),
            document.head.appendChild(t);
        }
        e.doJsonLd &&
          (await (async function (e, t) {
            const n = Mc[e.specStatus],
              r = ["TechArticle"];
            n && r.push(n);
            const s = {
              "@context": [
                "http://schema.org",
                {
                  "@vocab": "http://schema.org/",
                  "@language": t.documentElement.lang || "en",
                  w3p: "http://www.w3.org/2001/02pd/rec54#",
                  foaf: "http://xmlns.com/foaf/0.1/",
                  datePublished: {
                    "@type": "http://www.w3.org/2001/XMLSchema#date",
                  },
                  inLanguage: { "@language": null },
                  isBasedOn: { "@type": "@id" },
                  license: { "@type": "@id" },
                },
              ],
              id: e.canonicalURI || e.thisVersion,
              type: r,
              name: document.title,
              inLanguage: t.documentElement.lang || "en",
              license: e.licenseInfo?.url,
              datePublished: e.dashDate,
              copyrightHolder: {
                name: "World Wide Web Consortium",
                url: "https://www.w3.org/",
              },
              discussionUrl: e.issueBase,
              alternativeHeadline: e.subtitle,
              isBasedOn: e.prevVersion,
            };
            if (e.additionalCopyrightHolders) {
              const t = Array.isArray(e.additionalCopyrightHolders)
                ? e.additionalCopyrightHolders
                : [e.additionalCopyrightHolders];
              s.copyrightHolder = [
                s.copyrightHolder,
                ...t.map((e) => ({ name: e })),
              ];
            }
            const i = t.head.querySelector("meta[name=description]");
            i && (s.description = i.content);
            e.editors && (s.editor = e.editors.map(Uc));
            e.authors && (s.contributor = e.authors.map(Uc));
            const o = [...e.normativeReferences, ...e.informativeReferences],
              a = await Promise.all(o.map((e) => gi(e)));
            s.citation = a.filter((e) => "object" == typeof e).map(Wc);
            const c = t.createElement("script");
            (c.type = "application/ld+json"),
              (c.textContent = JSON.stringify(s, null, 2)),
              t.head.appendChild(c);
          })(e, document));
      },
    });
    var Fc = String.raw`.hljs{display:block;overflow-x:auto;padding:.5em;color:#383a42;background:#fafafa}
.hljs-comment,.hljs-quote{color:#717277;font-style:italic}
.hljs-doctag,.hljs-formula,.hljs-keyword{color:#a626a4}
.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst{color:#ca4706;font-weight:700}
.hljs-literal{color:#0b76c5}
.hljs-addition,.hljs-attribute,.hljs-meta-string,.hljs-regexp,.hljs-string{color:#42803c}
.hljs-built_in,.hljs-class .hljs-title{color:#9a6a01}
.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable{color:#986801}
.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title{color:#336ae3}
.hljs-emphasis{font-style:italic}
.hljs-strong{font-weight:700}
.hljs-link{text-decoration:underline}`;
    async function Bc(e) {
      const t = await fetch(
        new URL(
          "../../" + e,
          (document.currentScript && document.currentScript.src) ||
            new URL("respec-w3c.js", document.baseURI).href
        )
      );
      return await t.text();
    }
    const Hc = Ut({
      hint: "preload",
      href: "https://www.w3.org/Tools/respec/respec-highlight",
      as: "script",
    });
    document.head.appendChild(Hc);
    const Gc = (async function () {
      const e = await (async function () {
          try {
            return (
              await Promise.resolve().then(function () {
                return xu;
              })
            ).default;
          } catch {
            return Bc("worker/respec-worker.js");
          }
        })(),
        t = URL.createObjectURL(
          new Blob([e], { type: "application/javascript" })
        );
      return new Worker(t);
    })();
    t(
      "core/worker",
      Gc.then((e) => ({ worker: e }))
    );
    const Vc = (function (e, t = 0) {
      const n = (function* (e, t) {
        for (;;) yield `${e}:${t}`, t++;
      })(e, t);
      return () => n.next().value;
    })("highlight");
    async function Kc(e) {
      e.setAttribute("aria-busy", "true");
      const t =
        ((n = e.classList),
        Array.from(n)
          .filter((e) => "highlight" !== e && "nolinks" !== e)
          .map((e) => e.toLowerCase()));
      var n;
      let r;
      try {
        r = await (async function (e, t) {
          const n = { action: "highlight", code: e, id: Vc(), languages: t },
            r = await Gc;
          return (
            r.postMessage(n),
            new Promise((e, t) => {
              const s = setTimeout(() => {
                t(new Error("Timed out waiting for highlight."));
              }, 4e3);
              r.addEventListener("message", function t(i) {
                const {
                  data: { id: o, language: a, value: c },
                } = i;
                o === n.id &&
                  (r.removeEventListener("message", t),
                  clearTimeout(s),
                  e({ language: a, value: c }));
              });
            })
          );
        })(e.innerText, t);
      } catch (e) {
        return void console.error(e);
      }
      const { language: s, value: i } = r;
      switch (e.localName) {
        case "pre":
          e.classList.remove(s),
            (e.innerHTML = `<code class="hljs${s ? " " + s : ""}">${i}</code>`),
            e.classList.length || e.removeAttribute("class");
          break;
        case "code":
          (e.innerHTML = i), e.classList.add("hljs"), s && e.classList.add(s);
      }
      e.setAttribute("aria-busy", "false");
    }
    var Yc = Object.freeze({
      __proto__: null,
      name: "core/highlight",
      run: async function (e) {
        if (e.noHighlightCSS) return;
        const t = [
          ...document.querySelectorAll(
            "\n    pre:not(.idl):not(.nohighlight) > code:not(.nohighlight),\n    pre:not(.idl):not(.nohighlight),\n    code.highlight\n  "
          ),
        ].filter((e) => "pre" !== e.localName || !e.querySelector("code"));
        if (!t.length) return;
        const n = t.filter((e) => e.textContent.trim()).map(Kc);
        document.head.appendChild(It`<style>
      ${Fc}
    </style>`),
          await Promise.all(n);
      },
    });
    const Zc = Yt({
        en: {
          missing_test_suite_uri: xn`Found tests in your spec, but missing ${"[testSuiteURI]"} in your ReSpec config.`,
          tests: "tests",
          test: "test",
        },
        ja: {
          missing_test_suite_uri: xn`この仕様内にテストの項目を検出しましたが，ReSpec の設定に ${"[testSuiteURI]"} が見つかりません．`,
          tests: "テスト",
          test: "テスト",
        },
        de: {
          missing_test_suite_uri: xn`Die Spezifikation enthält Tests, aber in der ReSpec-Konfiguration ist keine ${"[testSuiteURI]"} angegeben.`,
          tests: "Tests",
          test: "Test",
        },
        zh: {
          missing_test_suite_uri: xn`本规范中包含测试，但在 ReSpec 配置中缺少 ${"[testSuiteURI]"}。`,
          tests: "测试",
          test: "测试",
        },
      }),
      Jc = "core/data-tests";
    function Qc(e) {
      const t = [],
        [n] = new URL(e).pathname.split("/").reverse(),
        r = n.split(".");
      let [s] = r;
      if (r.find((e) => "https" === e)) {
        const e = document.createElement("span");
        (e.textContent = "🔒"),
          e.setAttribute("aria-label", "requires a secure connection"),
          e.setAttribute("title", "Test requires HTTPS"),
          (s = s.replace(".https", "")),
          t.push(e);
      }
      if (
        s
          .split(".")
          .join("-")
          .split("-")
          .find((e) => "manual" === e)
      ) {
        const e = document.createElement("span");
        (e.textContent = "💪"),
          e.setAttribute("aria-label", "the test must be run manually"),
          e.setAttribute("title", "Manual test"),
          (s = s.replace("-manual", "")),
          t.push(e);
      }
      return It`
    <li>
      <a href="${e}">${s}</a>
      ${t}
    </li>
  `;
    }
    function Xc(e, t, n) {
      return e
        .map((e) => {
          try {
            return new URL(e, t).href;
          } catch {
            yn(xn`Invalid URL in ${"[data-tests]"} attribute: ${e}.`, Jc, {
              elements: [n],
            });
          }
        })
        .filter((e) => e);
    }
    function el(e, t) {
      const n = e.filter((e, t, n) => n.indexOf(e) !== t);
      if (n.length) {
        const e = xn`Duplicate tests found in the ${"[data-tests]"} attribute.`,
          r = xn`To fix, remove duplicates from ${"[data-tests]"}: ${kn(n, {
            quotes: !0,
          })}.`;
        yn(e, Jc, { hint: r, elements: [t] });
      }
    }
    function tl(e) {
      const t = [...new Set(e)];
      return It`
    <details class="respec-tests-details removeOnSave">
      <summary>tests: ${t.length}</summary>
      <ul>
        ${t.map(Qc)}
      </ul>
    </details>
  `;
    }
    var nl = Object.freeze({
      __proto__: null,
      name: Jc,
      run: function (e) {
        const t = [...document.querySelectorAll("[data-tests]")].filter(
          (e) => e.dataset.tests
        );
        if (t.length)
          if (e.testSuiteURI)
            for (const n of t) {
              const t = Xc(
                n.dataset.tests.split(/,/gm).map((e) => e.trim()),
                e.testSuiteURI,
                n
              );
              el(t, n);
              const r = tl(t);
              n.append(r);
            }
          else bn(Zc.missing_test_suite_uri, Jc);
      },
    });
    const rl = "core/list-sorter";
    function sl(e) {
      const t = "ascending" === e ? 1 : -1;
      return ({ textContent: e }, { textContent: n }) =>
        t * e.trim().localeCompare(n.trim());
    }
    function il(e, t) {
      return [...e.querySelectorAll(":scope > li")]
        .sort(sl(t))
        .reduce(
          (e, t) => (e.appendChild(t), e),
          document.createDocumentFragment()
        );
    }
    function ol(e, t) {
      return [...e.querySelectorAll(":scope > dt")]
        .sort(sl(t))
        .reduce((e, t) => {
          const { nodeType: n, nodeName: r } = t,
            s = document.createDocumentFragment();
          let { nextSibling: i } = t;
          for (; i && i.nextSibling; ) {
            s.appendChild(i.cloneNode(!0));
            const { nodeType: e, nodeName: t } = i.nextSibling;
            if (e === n && t === r) break;
            i = i.nextSibling;
          }
          return s.prepend(t.cloneNode(!0)), e.appendChild(s), e;
        }, document.createDocumentFragment());
    }
    var al = Object.freeze({
      __proto__: null,
      name: rl,
      sortListItems: il,
      sortDefinitionTerms: ol,
      run: function () {
        const e = document.querySelectorAll("[data-sort]");
        for (const t of e) {
          let e;
          const n = t.dataset.sort || "ascending";
          switch (t.localName) {
            case "dl":
              e = ol(t, n);
              break;
            case "ol":
            case "ul":
              e = il(t, n);
              break;
            default:
              yn(`ReSpec can't sort ${t.localName} elements.`, rl, {
                elements: [t],
              });
          }
          if (e) {
            const n = document.createRange();
            n.selectNodeContents(t), n.deleteContents(), t.appendChild(e);
          }
        }
      },
    });
    var cl = String.raw`var:hover{text-decoration:underline;cursor:pointer}
var.respec-hl{color:var(--color,#000);background-color:var(--bg-color);box-shadow:0 0 0 2px var(--bg-color)}
var.respec-hl-c1{--bg-color:#f4d200}
var.respec-hl-c2{--bg-color:#ff87a2}
var.respec-hl-c3{--bg-color:#96e885}
var.respec-hl-c4{--bg-color:#3eeed2}
var.respec-hl-c5{--bg-color:#eacfb6}
var.respec-hl-c6{--bg-color:#82ddff}
var.respec-hl-c7{--bg-color:#ffbcf2}
@media print{
var.respec-hl{background:0 0;color:#000;box-shadow:unset}
}`;
    function ll(e) {
      e.stopPropagation();
      const { target: t } = e,
        n = (function (e) {
          const t = Kt(e.textContent),
            n = e.closest("section"),
            r = dl(e),
            s = [...n.querySelectorAll("var")].filter(
              (e) => Kt(e.textContent) === t && e.closest("section") === n
            ),
            i = s[0].classList.contains("respec-hl");
          if ((ul.set(r, i), i)) return s.forEach((e) => pl(e, r)), [];
          s.forEach((e) =>
            (function (e, t) {
              e.classList.add("respec-hl", t);
            })(e, r)
          );
          return s;
        })(t),
        r = () => {
          const e = dl(t);
          n.forEach((t) => pl(t, e)),
            [...ul.keys()].forEach((e) => ul.set(e, !0));
        };
      n.length && document.body.addEventListener("click", r, { once: !0 });
    }
    const ul = new Map([
      ["respec-hl-c1", !0],
      ["respec-hl-c2", !0],
      ["respec-hl-c3", !0],
      ["respec-hl-c4", !0],
      ["respec-hl-c5", !0],
      ["respec-hl-c6", !0],
      ["respec-hl-c7", !0],
    ]);
    function dl(e) {
      const { value: t } = e.classList,
        n = /respec-hl-\w+/,
        r = n.test(t) && t.match(n);
      return r
        ? r[0]
        : !0 === ul.get("respec-hl-c1")
        ? "respec-hl-c1"
        : [...ul.keys()].find((e) => ul.get(e)) || "respec-hl-c1";
    }
    function pl(e, t) {
      e.classList.remove("respec-hl", t),
        e.classList.length || e.removeAttribute("class");
    }
    var hl = Object.freeze({
      __proto__: null,
      name: "core/highlight-vars",
      run: function (e) {
        if (!e.highlightVars) return;
        const t = document.createElement("style");
        (t.textContent = cl),
          t.classList.add("removeOnSave"),
          document.head.appendChild(t),
          document
            .querySelectorAll("var")
            .forEach((e) => e.addEventListener("click", ll)),
          Rn("beforesave", (e) => {
            e.querySelectorAll("var.respec-hl").forEach(pl);
          });
      },
    });
    var fl = String.raw`dfn{cursor:pointer}
.dfn-panel{position:absolute;z-index:35;min-width:300px;max-width:500px;padding:.5em .75em;margin-top:.6em;font:small Helvetica Neue,sans-serif,Droid Sans Fallback;background:#fff;color:#000;box-shadow:0 1em 3em -.4em rgba(0,0,0,.3),0 0 1px 1px rgba(0,0,0,.05);border-radius:2px}
.dfn-panel:not(.docked)>.caret{position:absolute;top:-9px}
.dfn-panel:not(.docked)>.caret::after,.dfn-panel:not(.docked)>.caret::before{content:"";position:absolute;border:10px solid transparent;border-top:0;border-bottom:10px solid #fff;top:0}
.dfn-panel:not(.docked)>.caret::before{border-bottom:9px solid #a2a9b1}
.dfn-panel *{margin:0}
.dfn-panel b{display:block;color:#000;margin-top:.25em}
.dfn-panel ul a[href]{color:#333}
.dfn-panel>div{display:flex}
.dfn-panel a.self-link{font-weight:700;margin-right:auto}
.dfn-panel .marker{padding:.1em;margin-left:.5em;border-radius:.2em;text-align:center;white-space:nowrap;font-size:90%;color:#040b1c}
.dfn-panel .marker.dfn-exported{background:#d1edfd;box-shadow:0 0 0 .125em #1ca5f940}
.dfn-panel .marker.idl-block{background:#8ccbf2;box-shadow:0 0 0 .125em #0670b161}
.dfn-panel a:not(:hover){text-decoration:none!important;border-bottom:none!important}
.dfn-panel a[href]:hover{border-bottom-width:1px}
.dfn-panel ul{padding:0}
.dfn-panel li{margin-left:1em}
.dfn-panel.docked{position:fixed;left:.5em;top:unset;bottom:2em;margin:0 auto;max-width:calc(100vw - .75em * 2 - .5em - .2em * 2);max-height:30vh;overflow:auto}`;
    function ml(e) {
      const { id: t } = e,
        n = e.dataset.href || "#" + t,
        r = document.querySelectorAll(`a[href="${n}"]:not(.index-term)`),
        s = "dfn-panel-for-" + e.id,
        i = e.getAttribute("aria-label") || Kt(e.textContent);
      return It`
    <div
      class="dfn-panel"
      id="${s}"
      hidden
      role="dialog"
      aria-modal="true"
      aria-label="Links in this document to definition: ${i}"
    >
      <span class="caret"></span>
      <div>
        <a
          class="self-link"
          href="${n}"
          aria-label="Permalink for definition: ${i}. Activate to close this dialog."
          >Permalink</a
        >
        ${(function (e) {
          return e.matches("dfn[data-export]")
            ? It`<span
    class="marker dfn-exported"
    title="Definition can be referenced by other specifications"
    >exported</span
  >`
            : null;
        })(e)} ${(function (e, t) {
        if (!e.hasAttribute("data-idl")) return null;
        for (const n of t) {
          if (n.dataset.linkType !== e.dataset.dfnType) continue;
          const t = n.closest("pre.idl");
          if (t && t.id) {
            const e = "#" + t.id;
            return It`<a
        href="${e}"
        class="marker idl-block"
        title="Jump to IDL declaration"
        >IDL</a
      >`;
          }
        }
        return null;
      })(e, r)}
      </div>
      <p><b>Referenced in:</b></p>
      ${(function (e, t) {
        if (!t.length)
          return It`<ul>
      <li>Not referenced in this document.</li>
    </ul>`;
        const n = new Map();
        t.forEach((t, r) => {
          const s = t.id || `ref-for-${e}-${r + 1}`;
          t.id || (t.id = s);
          const i = (function (e) {
            const t = e.closest("section");
            if (!t) return null;
            const n = t.querySelector("h1, h2, h3, h4, h5, h6");
            return n ? "§ " + Kt(n.textContent) : null;
          })(t);
          (n.get(i) || n.set(i, []).get(i)).push(s);
        });
        const r = ([e, t]) =>
            [{ title: e, id: t[0], text: e }].concat(
              t
                .slice(1)
                .map((e, t) => ({
                  title: "Reference " + (t + 2),
                  text: `(${t + 2})`,
                  id: e,
                }))
            ),
          s = (e) => It`<li>
    ${r(e).map(
      (e) => It`<a href="#${e.id}" title="${e.title}">${e.text}</a>${" "}`
    )}
  </li>`;
        return It`<ul>
    ${[...n].map(s)}
  </ul>`;
      })(t, r)}
    </div>
  `;
    }
    var gl = Object.freeze({
      __proto__: null,
      name: "core/dfn-panel",
      run: async function () {
        document.head.insertBefore(
          It`<style>
      ${fl}
    </style>`,
          document.querySelector("link")
        );
        const e = document.querySelectorAll(
            "dfn[id]:not([data-cite]), #index-defined-elsewhere .index-term"
          ),
          t = document.createDocumentFragment();
        for (const n of e)
          t.append(ml(n)),
            (n.tabIndex = 0),
            n.setAttribute("aria-haspopup", "dialog");
        document.body.append(t);
        const n = document.createElement("script");
        (n.id = "respec-dfn-panel"),
          (n.textContent = await (async function () {
            try {
              return (
                await Promise.resolve().then(function () {
                  return _u;
                })
              ).default;
            } catch {
              return Bc("./src/core/dfn-panel.runtime.js");
            }
          })()),
          document.body.append(n);
      },
    });
    var bl = String.raw`var{position:relative;cursor:pointer}
var[data-type]::after,var[data-type]::before{position:absolute;left:50%;top:-6px;opacity:0;transition:opacity .4s;pointer-events:none}
var[data-type]::before{content:"";transform:translateX(-50%);border-width:4px 6px 0 6px;border-style:solid;border-color:transparent;border-top-color:#000}
var[data-type]::after{content:attr(data-type);transform:translateX(-50%) translateY(-100%);background:#000;text-align:center;font-family:"Dank Mono","Fira Code",monospace;font-style:normal;padding:6px;border-radius:3px;color:#daca88;text-indent:0;font-weight:400}
var[data-type]:hover::after,var[data-type]:hover::before{opacity:1}`;
    var yl = Object.freeze({
      __proto__: null,
      name: "core/data-type",
      run: function (e) {
        if (!e.highlightVars) return;
        const t = document.createElement("style");
        (t.textContent = bl), document.head.appendChild(t);
        let n = null;
        const r = new Map(),
          s = document.querySelectorAll("section var");
        for (const e of s) {
          const t = e.closest("section");
          if ((n !== t && ((n = t), r.clear()), e.dataset.type)) {
            r.set(e.textContent.trim(), e.dataset.type);
            continue;
          }
          const s = r.get(e.textContent.trim());
          s && (e.dataset.type = s);
        }
      },
    });
    var wl = String.raw`.assert{background:#eee;border-left:.5em solid #aaa;padding:.3em}`;
    var vl = Object.freeze({
      __proto__: null,
      name: "core/algorithms",
      run: function () {
        if (
          (Array.from(document.querySelectorAll("ol.algorithm li"))
            .filter((e) => e.textContent.trim().startsWith("Assert: "))
            .forEach((e) => e.classList.add("assert")),
          document.querySelector(".assert"))
        ) {
          const e = document.createElement("style");
          (e.textContent = wl), document.head.appendChild(e);
        }
      },
    });
    const kl = "core/anchor-expander";
    function $l(e, t, n) {
      const r = e.querySelector(".marker .self-link");
      if (!r) {
        n.textContent = n.getAttribute("href");
        return void bn(
          `Found matching element "${t}", but it has no title or marker.`,
          kl,
          { title: "Missing title.", elements: [n] }
        );
      }
      const s = pn(r);
      n.append(...s.childNodes), n.classList.add("box-ref");
    }
    function xl(e, t, n) {
      const r = e.querySelector("figcaption");
      if (!r) {
        n.textContent = n.getAttribute("href");
        return void bn(
          `Found matching figure "${t}", but figure is lacking a \`<figcaption>\`.`,
          kl,
          { title: "Missing figcaption in referenced figure.", elements: [n] }
        );
      }
      const s = [...pn(r).childNodes].filter(
        (e) => !e.classList || !e.classList.contains("fig-title")
      );
      s.pop(), n.append(...s), n.classList.add("fig-ref");
      const i = r.querySelector(".fig-title");
      !n.hasAttribute("title") && i && (n.title = Kt(i.textContent));
    }
    function _l(e, t, n) {
      const r = e.querySelector("h6, h5, h4, h3, h2");
      if (r) Cl(r, n), Sl(r, n);
      else {
        n.textContent = n.getAttribute("href");
        bn(
          "Found matching section, but the section was lacking a heading element.",
          kl,
          { title: `No matching id in document: "${t}".`, elements: [n] }
        );
      }
    }
    function Cl(e, t) {
      const n = e.querySelector(".self-link"),
        r = [...pn(e).childNodes].filter(
          (e) => !e.classList || !e.classList.contains("self-link")
        );
      t.append(...r),
        n && t.prepend("§ "),
        t.classList.add("sec-ref"),
        t.lastChild.nodeType === Node.TEXT_NODE &&
          (t.lastChild.textContent = t.lastChild.textContent.trimEnd()),
        t.querySelectorAll("a").forEach((e) => {
          const t = on(e, "span");
          for (const e of [...t.attributes]) t.removeAttributeNode(e);
        });
    }
    function Sl(e, t) {
      for (const n of ["dir", "lang"]) {
        if (t.hasAttribute(n)) continue;
        const r = e.closest(`[${n}]`);
        if (!r) continue;
        const s = t.closest(`[${n}]`);
        (s && s.getAttribute(n) === r.getAttribute(n)) ||
          t.setAttribute(n, r.getAttribute(n));
      }
    }
    var Rl = Object.freeze({
      __proto__: null,
      name: kl,
      run: function () {
        const e = [
          ...document.querySelectorAll(
            "a[href^='#']:not(.self-link):not([href$='the-empty-string'])"
          ),
        ].filter((e) => "" === e.textContent.trim());
        for (const t of e) {
          const e = t.getAttribute("href").slice(1),
            n = document.getElementById(e);
          if (n) {
            switch (n.localName) {
              case "h6":
              case "h5":
              case "h4":
              case "h3":
              case "h2":
                Cl(n, t);
                break;
              case "section":
                _l(n, e, t);
                break;
              case "figure":
                xl(n, e, t);
                break;
              case "aside":
              case "div":
                $l(n, e, t);
                break;
              default:
                t.textContent = t.getAttribute("href");
                bn(
                  "ReSpec doesn't support expanding this kind of reference.",
                  kl,
                  { title: `Can't expand "#${e}".`, elements: [t] }
                );
            }
            Sl(n, t), t.normalize();
          } else {
            t.textContent = t.getAttribute("href");
            bn(
              `Couldn't expand inline reference. The id "${e}" is not in the document.`,
              kl,
              { title: `No matching id in document: ${e}.`, elements: [t] }
            );
          }
        }
      },
    });
    const El = "rs-changelog",
      Al = class extends HTMLElement {
        constructor() {
          super(),
            (this.props = {
              from: this.getAttribute("from"),
              to: this.getAttribute("to") || "HEAD",
              filter:
                "function" == typeof window[this.getAttribute("filter")]
                  ? window[this.getAttribute("filter")]
                  : () => !0,
            });
        }
        connectedCallback() {
          const { from: e, to: t, filter: n } = this.props;
          It.bind(this)`
      <ul>
      ${{
        any: Tl(e, t, n)
          .then((e) =>
            (async function (e) {
              const { repoURL: t } = await xs;
              return e.map((e) => {
                const [n, r = null] = e.message.split(/\(#(\d+)\)/, 2),
                  s = `${t}commit/${e.hash}`,
                  i =
                    r &&
                    It` (<a href="${r ? `${t}pull/${r}` : null}">#${r}</a>)`;
                return It`<li><a href="${s}">${n.trim()}</a>${i}</li>`;
              });
            })(e)
          )
          .catch((e) => bn(e.message, El, { elements: [this] }))
          .finally(() => {
            this.dispatchEvent(new CustomEvent("done"));
          }),
        placeholder: "Loading list of commits...",
      }}
      </ul>
    `;
        }
      };
    async function Tl(e, t, n) {
      let r;
      try {
        const s = await xs;
        if (!s) throw new Error("`respecConfig.github` is not set");
        const i = new URL("commits", `${s.apiBase}/${s.fullName}/`);
        i.searchParams.set("from", e), i.searchParams.set("to", t);
        const o = await fetch(i.href);
        if (!o.ok)
          throw new Error(
            `Request to ${i} failed with status code ${o.status}`
          );
        if (((r = await o.json()), !r.length))
          throw new Error(`No commits between ${e}..${t}.`);
        r = r.filter(n);
      } catch (e) {
        const t = "Error loading commits from GitHub. " + e.message;
        throw (console.error(e), new Error(t));
      }
      return r;
    }
    const Ll = [Object.freeze({ __proto__: null, name: El, element: Al })];
    var Pl = Object.freeze({
      __proto__: null,
      name: "core/custom-elements/index",
      run: async function () {
        Ll.forEach((e) => {
          customElements.define(e.name, e.element);
        });
        const e = Ll.map((e) => e.name).join(", "),
          t = [...document.querySelectorAll(e)].map(
            (e) =>
              new Promise((t) => e.addEventListener("done", t, { once: !0 }))
          );
        await Promise.all(t);
      },
    });
    var Il = Object.freeze({
      __proto__: null,
      name: "core/web-monetization",
      run: function (e) {
        if (!1 === e.monetization) return;
        const { monetization: t } = e,
          { removeOnSave: n, paymentPointer: r } = (function (e) {
            const t = { paymentPointer: "$respec.org", removeOnSave: !0 };
            switch (typeof e) {
              case "string":
                t.paymentPointer = e;
                break;
              case "object":
                e.paymentPointer &&
                  (t.paymentPointer = String(e.paymentPointer)),
                  !1 === e.removeOnSave && (t.removeOnSave = !1);
            }
            return t;
          })(t),
          s = n ? "removeOnSave" : null;
        document.head.append(It`<meta
    name="monetization"
    content="${r}"
    class="${s}"
  />`);
      },
    });
    const Dl = "check-charset",
      Nl = "core/linter-rules/check-charset",
      jl = Yt({
        en: {
          msg: "Document must only contain one `<meta>` tag with charset set to 'utf-8'",
          hint: 'Add this line in your document `<head>` section - `<meta charset="utf-8">` or set charset to "utf-8" if not set already.',
        },
        zh: {
          msg: "文档只能包含一个 charset 属性为 utf-8 的 `<meta>` 标签",
          hint: '将此行添加到文档的 `<head>` 部分—— `<meta charset="utf-8">` 或将 charset 设置为 utf-8（如果尚未设置）。',
        },
      });
    var Ol = Object.freeze({
      __proto__: null,
      name: Nl,
      run: function (e) {
        if (!e.lint?.[Dl]) return;
        const t = document.querySelectorAll("meta[charset]"),
          n = [];
        for (const e of t)
          n.push(e.getAttribute("charset").trim().toLowerCase());
        (n.includes("utf-8") && 1 === t.length) ||
          yn(jl.msg, Nl, { hint: jl.hint, elements: [...t] });
      },
    });
    const zl = "check-punctuation",
      Ml = "core/linter-rules/check-punctuation",
      Ul = [".", ":", "!", "?"],
      Wl = Yt({
        en: {
          msg: "`p` elements should end with a punctuation mark.",
          hint: `Please make sure \`p\` elements end with one of: ${Ul.map(
            (e) => `"${e}"`
          ).join(", ")}.`,
        },
      });
    var ql = Object.freeze({
      __proto__: null,
      name: Ml,
      run: function (e) {
        if (!e.lint?.[zl]) return;
        const t = new RegExp(`[${Ul.join("")}\\]]$|^ *$`, "m"),
          n = [
            ...document.querySelectorAll("p:not(#back-to-top,#w3c-state)"),
          ].filter((e) => !t.test(e.textContent.trim()));
        n.length && yn(Wl.msg, Ml, { hint: Wl.hint, elements: n });
      },
    });
    const Fl = "check-internal-slots",
      Bl = "core/linter-rules/check-internal-slots",
      Hl = Yt({
        en: {
          msg: "Internal slots should be preceded by a '.'",
          hint: "Add a '.' between the elements mentioned.",
        },
      });
    var Gl = Object.freeze({
      __proto__: null,
      name: Bl,
      run: function (e) {
        if (!e.lint?.[Fl]) return;
        const t = [...document.querySelectorAll("var+a")].filter(
          ({ previousSibling: { nodeName: e } }) => e && "VAR" === e
        );
        t.length && yn(Hl.msg, Bl, { hint: Hl.hint, elements: t });
      },
    });
    const Vl = "local-refs-exist",
      Kl = "core/linter-rules/local-refs-exist",
      Yl = Yt({
        en: {
          msg: "Broken local reference found in document.",
          hint: "Please fix the links mentioned.",
        },
      });
    function Zl(e) {
      const t = e.getAttribute("href").substring(1),
        n = e.ownerDocument;
      return !n.getElementById(t) && !n.getElementsByName(t).length;
    }
    var Jl = Object.freeze({
      __proto__: null,
      name: Kl,
      run: function (e) {
        if (!e.lint?.[Vl]) return;
        const t = [...document.querySelectorAll("a[href^='#']")].filter(Zl);
        t.length && yn(Yl.msg, Kl, { hint: Yl.hint, elements: t });
      },
    });
    const Ql = "no-headingless-sections",
      Xl = "core/linter-rules/no-headingless-sections",
      eu = Yt({
        en: {
          msg: "All sections must start with a `h2-6` element.",
          hint: "Add a `h2-6` to the offending section or use a `<div>`.",
        },
        nl: {
          msg: "Alle secties moeten beginnen met een `h2-6` element.",
          hint: "Voeg een `h2-6` toe aan de conflicterende sectie of gebruik een `<div>`.",
        },
        zh: {
          msg: "所有章节（section）都必须以 `h2-6` 元素开头。",
          hint: "将 `h2-6` 添加到有问题的章节或使用 `<div>`。",
        },
      }),
      tu = ({ firstElementChild: e }) =>
        null === e || !1 === /^h[1-6]$/.test(e.localName);
    var nu = Object.freeze({
      __proto__: null,
      name: Xl,
      run: function (e) {
        if (!e.lint?.[Ql]) return;
        const t = [...document.querySelectorAll("section")].filter(tu);
        t.length && yn(eu.msg, Xl, { hint: eu.hint, elements: t });
      },
    });
    const ru = "no-unused-vars",
      su = "core/linter-rules/no-unused-vars",
      iu = Yt({
        en: {
          msg: "Variable was defined, but never used.",
          hint: "Add a `data-ignore-unused` attribute to the `<var>`.",
        },
      });
    var ou = Object.freeze({
      __proto__: null,
      name: su,
      run: function (e) {
        if (!e.lint?.[ru]) return;
        const t = [],
          n = (e) =>
            !!e.querySelector(
              ":scope > :not(section) ~ .algorithm, :scope > :not(section) .algorithm"
            );
        for (const e of document.querySelectorAll("section")) {
          if (!n(e)) continue;
          const r = e.querySelectorAll(":scope > :not(section) var");
          if (!r.length) continue;
          const s = new Map();
          for (const e of r) {
            const t = Kt(e.textContent);
            (s.get(t) || s.set(t, []).get(t)).push(e);
          }
          for (const e of s.values())
            1 !== e.length ||
              e[0].hasAttribute("data-ignore-unused") ||
              t.push(e[0]);
        }
        t.length && yn(iu.msg, su, { hint: iu.hint, elements: t });
      },
    });
    const au = "privsec-section",
      cu = "core/linter-rules/privsec-section",
      lu = Yt({
        en: {
          msg: "Document must have a 'Privacy and/or Security' Considerations section.",
          hint: "Add a privacy and/or security considerations section. See the [Self-Review Questionnaire](https://w3ctag.github.io/security-questionnaire/).",
        },
      });
    var uu = Object.freeze({
      __proto__: null,
      name: cu,
      run: function (e) {
        var t;
        e.lint?.[au] &&
          e.isRecTrack &&
          ((t = document),
          !Array.from(t.querySelectorAll("h2, h3, h4, h5, h6")).some(
            ({ textContent: e }) => {
              const t = /(privacy|security)/im.test(e),
                n = /(considerations)/im.test(e);
              return (t && n) || t;
            }
          )) &&
          yn(lu.msg, cu, { hint: lu.hint });
      },
    });
    const du = "wpt-tests-exist",
      pu = "core/linter-rules/wpt-tests-exist",
      hu = Yt({
        en: {
          msg: "The following test could not be found in Web Platform Tests:",
          hint: "Check [wpt.live](https://wpt.live) to see if it was deleted or renamed.",
        },
      });
    var fu = Object.freeze({
      __proto__: null,
      name: pu,
      run: async function (e) {
        if (!e.lint?.[du]) return;
        const t = await (async function (e, t) {
          let n;
          try {
            const t = new URL(e);
            if (t.pathname.startsWith("/web-platform-tests/wpt/tree/master/")) {
              const e = /web-platform-tests\/wpt\/tree\/master\/(.+)/;
              n = t.pathname.match(e)[1].replace(/\//g, "");
            } else n = t.pathname.replace(/\//g, "");
          } catch (e) {
            return (
              yn(
                "Failed to parse WPT directory from testSuiteURI",
                "linter/" + pu
              ),
              console.error(e),
              null
            );
          }
          const r = new URL("web-platform-tests/wpt/files", t + "/");
          r.searchParams.set("path", n);
          const s = await fetch(r);
          if (!s.ok) {
            return (
              yn(
                `Failed to fetch files from WPT repository. Request failed with error: ${await s.text()} (${
                  s.status
                })`,
                "linter/" + pu
              ),
              null
            );
          }
          const { entries: i } = await s.json(),
            o = i.filter((e) => !e.endsWith("/"));
          return new Set(o);
        })(e.testSuiteURI, e.githubAPI);
        if (!t) return;
        const n = [...document.querySelectorAll("[data-tests]")].filter(
          (e) => e.dataset.tests
        );
        for (const e of n)
          e.dataset.tests
            .split(/,/gm)
            .map((e) => e.trim().split("#")[0])
            .filter((e) => e && !t.has(e))
            .map((t) => {
              yn(`${hu.msg} \`${t}\`.`, pu, { hint: hu.hint, elements: [e] });
            });
      },
    });
    const mu = "no-http-props",
      gu = "core/linter-rules/no-http-props",
      bu = Yt({
        en: {
          msg: xn`Insecure URLs are not allowed in ${"[respecConfig]"}.`,
          hint: "Please change the following properties to 'https://': ",
        },
        zh: {
          msg: xn`${"[respecConfig]"} 中不允许使用不安全的URL.`,
          hint: "请将以下属性更改为 https://：",
        },
      });
    var yu = Object.freeze({
      __proto__: null,
      name: gu,
      run: function (e) {
        if (!e.lint?.[mu]) return;
        if (!parent.location.href.startsWith("http")) return;
        const t = Object.getOwnPropertyNames(e)
          .filter((t) => (t.endsWith("URI") && e[t]) || "prevED" === t)
          .filter((t) =>
            new URL(e[t], parent.location.href).href.startsWith("http://")
          );
        if (t.length) {
          const e = Ht(t, (e) => xn`${`[${e}]`}`);
          yn(bu.msg, gu, { hint: bu.hint + e });
        }
      },
    });
    const wu = "core/linter-rules/a11y",
      vu = ["color-contrast", "landmark-one-main", "landmark-unique", "region"];
    function ku(e) {
      const t = [];
      for (const n of e.split("\n\n")) {
        const [e, ...r] = n.split(/^\s{2}/m),
          s = r.map((e) => "- " + e.trimEnd()).join("\n");
        t.push(`${e}${s}`);
      }
      return t.join("\n\n");
    }
    var $u = Object.freeze({
        __proto__: null,
        name: wu,
        run: async function (e) {
          if (!e.lint?.a11y && !e.a11y) return;
          const t = e.lint?.a11y || e.a11y,
            n = !0 === t ? {} : t,
            r = await (async function (e) {
              const { rules: t, ...n } = e,
                r = {
                  rules: {
                    ...Object.fromEntries(vu.map((e) => [e, { enabled: !1 }])),
                    ...t,
                  },
                  ...n,
                  elementRef: !0,
                  resultTypes: ["violations"],
                  reporter: "v1",
                };
              let s;
              try {
                s = await (function () {
                  const e = document.createElement("script");
                  return (
                    e.classList.add("remove"),
                    (e.src = "https://unpkg.com/axe-core@3/axe.min.js"),
                    document.head.appendChild(e),
                    new Promise((t, n) => {
                      (e.onload = () => t(window.axe)), (e.onerror = n);
                    })
                  );
                })();
              } catch (e) {
                return (
                  bn("Failed to load a11y linter.", wu), console.error(e), []
                );
              }
              try {
                return (await s.run(document, r)).violations;
              } catch (e) {
                return (
                  bn("Error while looking for a11y issues.", wu),
                  console.error(e),
                  []
                );
              }
            })(n);
          for (const e of r) {
            const t = new Map();
            for (const n of e.nodes) {
              const { failureSummary: e, element: r } = n;
              (t.get(e) || t.set(e, []).get(e)).push(r);
            }
            const { id: n, help: r, description: s, helpUrl: i } = e,
              o = `a11y/${n}: ${r}`;
            for (const [e, n] of t) {
              const t = ku(e);
              yn(o, wu, {
                details: `\n\n${s}.\n\n${t}. ([Learn more](${i}))`,
                elements: n,
              });
            }
          }
        },
      }),
      xu = Object.freeze({
        __proto__: null,
        default:
          '// ReSpec Worker v1.0.0\n"use strict";\ntry {\n  importScripts("https://www.w3.org/Tools/respec/respec-highlight");\n} catch (err) {\n  console.error("Network error loading highlighter", err);\n}\n\nself.addEventListener("message", ({ data: originalData }) => {\n  const data = Object.assign({}, originalData);\n  switch (data.action) {\n    case "highlight-load-lang": {\n      const { langURL, propName, lang } = data;\n      importScripts(langURL);\n      self.hljs.registerLanguage(lang, self[propName]);\n      break;\n    }\n    case "highlight": {\n      const { code } = data;\n      const langs = data.languages.length ? data.languages : undefined;\n      try {\n        const { value, language } = self.hljs.highlightAuto(code, langs);\n        Object.assign(data, { value, language });\n      } catch (err) {\n        console.error("Could not transform some code?", err);\n        // Post back the original code\n        Object.assign(data, { value: code, language: "" });\n      }\n      break;\n    }\n  }\n  self.postMessage(data);\n});\n',
      }),
      _u = Object.freeze({
        __proto__: null,
        default:
          '(() => {\n// @ts-check\nif (document.respec) {\n  document.respec.ready.then(setupPanel);\n} else {\n  setupPanel();\n}\n\nfunction setupPanel() {\n  const listener = panelListener();\n  document.body.addEventListener("keydown", listener);\n  document.body.addEventListener("click", listener);\n}\n\nfunction panelListener() {\n  /** @type {HTMLElement} */\n  let panel = null;\n  return event => {\n    const { target, type } = event;\n\n    if (!(target instanceof HTMLElement)) return;\n\n    // For keys, we only care about Enter key to activate the panel\n    // otherwise it\'s activated via a click.\n    if (type === "keydown" && event.key !== "Enter") return;\n\n    const action = deriveAction(event);\n\n    switch (action) {\n      case "show": {\n        hidePanel(panel);\n        /** @type {HTMLElement} */\n        const dfn = target.closest("dfn, .index-term");\n        panel = document.getElementById(`dfn-panel-for-${dfn.id}`);\n        const coords = deriveCoordinates(event);\n        displayPanel(dfn, panel, coords);\n        break;\n      }\n      case "dock": {\n        panel.style.left = null;\n        panel.style.top = null;\n        panel.classList.add("docked");\n        break;\n      }\n      case "hide": {\n        hidePanel(panel);\n        panel = null;\n        break;\n      }\n    }\n  };\n}\n\n/**\n * @param {MouseEvent|KeyboardEvent} event\n */\nfunction deriveCoordinates(event) {\n  const target = /** @type HTMLElement */ (event.target);\n\n  // We prevent synthetic AT clicks from putting\n  // the dialog in a weird place. The AT events sometimes\n  // lack coordinates, so they have clientX/Y = 0\n  const rect = target.getBoundingClientRect();\n  if (\n    event instanceof MouseEvent &&\n    event.clientX >= rect.left &&\n    event.clientY >= rect.top\n  ) {\n    // The event probably happened inside the bounding rect...\n    return { x: event.clientX, y: event.clientY };\n  }\n\n  // Offset to the middle of the element\n  const x = rect.x + rect.width / 2;\n  // Placed at the bottom of the element\n  const y = rect.y + rect.height;\n  return { x, y };\n}\n\n/**\n * @param {Event} event\n */\nfunction deriveAction(event) {\n  const target = /** @type {HTMLElement} */ (event.target);\n  const hitALink = !!target.closest("a");\n  if (target.closest("dfn:not([data-cite]), .index-term")) {\n    return hitALink ? "none" : "show";\n  }\n  if (target.closest(".dfn-panel")) {\n    if (hitALink) {\n      return target.classList.contains("self-link") ? "hide" : "dock";\n    }\n    const panel = target.closest(".dfn-panel");\n    return panel.classList.contains("docked") ? "hide" : "none";\n  }\n  if (document.querySelector(".dfn-panel:not([hidden])")) {\n    return "hide";\n  }\n  return "none";\n}\n\n/**\n * @param {HTMLElement} dfn\n * @param {HTMLElement} panel\n * @param {{ x: number, y: number }} clickPosition\n */\nfunction displayPanel(dfn, panel, { x, y }) {\n  panel.hidden = false;\n  // distance (px) between edge of panel and the pointing triangle (caret)\n  const MARGIN = 20;\n\n  const dfnRects = dfn.getClientRects();\n  // Find the `top` offset when the `dfn` can be spread across multiple lines\n  let closestTop = 0;\n  let minDiff = Infinity;\n  for (const rect of dfnRects) {\n    const { top, bottom } = rect;\n    const diffFromClickY = Math.abs((top + bottom) / 2 - y);\n    if (diffFromClickY < minDiff) {\n      minDiff = diffFromClickY;\n      closestTop = top;\n    }\n  }\n\n  const top = window.scrollY + closestTop + dfnRects[0].height;\n  const left = x - MARGIN;\n  panel.style.left = `${left}px`;\n  panel.style.top = `${top}px`;\n\n  // Find if the panel is flowing out of the window\n  const panelRect = panel.getBoundingClientRect();\n  const SCREEN_WIDTH = Math.min(window.innerWidth, window.screen.width);\n  if (panelRect.right > SCREEN_WIDTH) {\n    const newLeft = Math.max(MARGIN, x + MARGIN - panelRect.width);\n    const newCaretOffset = left - newLeft;\n    panel.style.left = `${newLeft}px`;\n    /** @type {HTMLElement} */\n    const caret = panel.querySelector(".caret");\n    caret.style.left = `${newCaretOffset}px`;\n  }\n\n  // As it\'s a dialog, we trap focus.\n  // TODO: when <dialog> becomes a implemented, we should really\n  // use that.\n  trapFocus(panel, dfn);\n}\n\n/**\n * @param {HTMLElement} panel\n * @param {HTMLElement} dfn\n * @returns\n */\nfunction trapFocus(panel, dfn) {\n  /** @type NodeListOf<HTMLAnchorElement> elements */\n  const anchors = panel.querySelectorAll("a[href]");\n  // No need to trap focus\n  if (!anchors.length) return;\n\n  // Move focus to first anchor element\n  const first = anchors.item(0);\n  first.focus();\n\n  const trapListener = createTrapListener(anchors, panel, dfn);\n  panel.addEventListener("keydown", trapListener);\n\n  // Hiding the panel releases the trap\n  const mo = new MutationObserver(records => {\n    const [record] = records;\n    const target = /** @type HTMLElement */ (record.target);\n    if (target.hidden) {\n      panel.removeEventListener("keydown", trapListener);\n      mo.disconnect();\n    }\n  });\n  mo.observe(panel, { attributes: true, attributeFilter: ["hidden"] });\n}\n\n/**\n *\n * @param {NodeListOf<HTMLAnchorElement>} anchors\n * @param {HTMLElement} panel\n * @param {HTMLElement} dfn\n * @returns\n */\nfunction createTrapListener(anchors, panel, dfn) {\n  const lastIndex = anchors.length - 1;\n  let currentIndex = 0;\n  return event => {\n    switch (event.key) {\n      // Hitting "Tab" traps us in a nice loop around elements.\n      case "Tab": {\n        event.preventDefault();\n        currentIndex += event.shiftKey ? -1 : +1;\n        if (currentIndex < 0) {\n          currentIndex = lastIndex;\n        } else if (currentIndex > lastIndex) {\n          currentIndex = 0;\n        }\n        anchors.item(currentIndex).focus();\n        break;\n      }\n\n      // Hitting "Enter" on an anchor releases the trap.\n      case "Enter":\n        hidePanel(panel);\n        break;\n\n      // Hitting "Escape" returns focus to dfn.\n      case "Escape":\n        hidePanel(panel);\n        dfn.focus();\n        return;\n    }\n  };\n}\n\n/** @param {HTMLElement} panel */\nfunction hidePanel(panel) {\n  if (!panel) return;\n  panel.hidden = true;\n  panel.classList.remove("docked");\n}\n})()',
      });
  })();
//# sourceMappingURL=respec-w3c.js.map
