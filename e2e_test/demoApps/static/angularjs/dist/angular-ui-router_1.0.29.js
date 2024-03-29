/**
 * State-based routing for AngularJS 1.x
 * NOTICE: This monolithic bundle also bundles the @uirouter/core code.
 *         This causes it to be incompatible with plugins that depend on @uirouter/core.
 *         We recommend switching to the ui-router-core.js and ui-router-angularjs.js bundles instead.
 *         For more information, see https://ui-router.github.io/blog/uirouter-for-angularjs-umd-bundles
 * @version v1.0.29
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
!(function (t, e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? e(exports, require('angular'))
    : 'function' == typeof define && define.amd
    ? define(['exports', 'angular'], e)
    : e(((t = t || self)['@uirouter/angularjs'] = {}), t.angular);
})(this, function (t, e) {
  'use strict';
  var r = angular,
    n = e && e.module ? e : r,
    i = function () {
      for (var t = 0, e = 0, r = arguments.length; e < r; e++)
        t += arguments[e].length;
      var n = Array(t),
        i = 0;
      for (e = 0; e < r; e++)
        for (var o = arguments[e], a = 0, u = o.length; a < u; a++, i++)
          n[i] = o[a];
      return n;
    };
  function o(t) {
    return function e() {
      if (arguments.length >= t.length) return t.apply(this, arguments);
      var r = Array.prototype.slice.call(arguments);
      return e.bind.apply(e, i([this], r));
    };
  }
  function a() {
    var t = arguments,
      e = t.length - 1;
    return function () {
      for (var r = e, n = t[e].apply(this, arguments); r--; )
        n = t[r].call(this, n);
      return n;
    };
  }
  function u() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    return a.apply(null, [].slice.call(arguments).reverse());
  }
  var s = function (t) {
      return function (e) {
        return e && e[t];
      };
    },
    c = o(function (t, e, r) {
      return r && r[t] === e;
    }),
    f = function (t) {
      return u.apply(null, t.split('.').map(s));
    },
    l = function (t) {
      return function () {
        for (var e = [], r = 0; r < arguments.length; r++) e[r] = arguments[r];
        return !t.apply(null, e);
      };
    };
  function h(t, e) {
    return function () {
      for (var r = [], n = 0; n < arguments.length; n++) r[n] = arguments[n];
      return t.apply(null, r) && e.apply(null, r);
    };
  }
  function p(t, e) {
    return function () {
      for (var r = [], n = 0; n < arguments.length; n++) r[n] = arguments[n];
      return t.apply(null, r) || e.apply(null, r);
    };
  }
  var v = function (t) {
      return function (e) {
        return e.reduce(function (e, r) {
          return e && !!t(r);
        }, !0);
      };
    },
    d = function (t) {
      return function (e) {
        return e.reduce(function (e, r) {
          return e || !!t(r);
        }, !1);
      };
    },
    m = function (t) {
      return function (e) {
        return (null != e && e.constructor === t) || e instanceof t;
      };
    },
    g = function (t) {
      return function (e) {
        return t === e;
      };
    },
    y = function (t) {
      return function () {
        return t;
      };
    };
  function w(t, e) {
    return function (r) {
      return r[t].apply(r, e);
    };
  }
  function _(t) {
    return function (e) {
      for (var r = 0; r < t.length; r++) if (t[r][0](e)) return t[r][1](e);
    };
  }
  var S = Object.prototype.toString,
    $ = function (t) {
      return function (e) {
        return typeof e === t;
      };
    },
    b = $('undefined'),
    R = l(b),
    E = function (t) {
      return null === t;
    },
    C = p(E, b),
    P = $('function'),
    T = $('number'),
    k = $('string'),
    O = function (t) {
      return null !== t && 'object' == typeof t;
    },
    x = Array.isArray,
    j = function (t) {
      return '[object Date]' === S.call(t);
    },
    V = function (t) {
      return '[object RegExp]' === S.call(t);
    };
  function I(t) {
    if (x(t) && t.length) {
      var e = t.slice(0, -1),
        r = t.slice(-1);
      return !(e.filter(l(k)).length || r.filter(l(P)).length);
    }
    return P(t);
  }
  var H = h(O, u(s('then'), P)),
    A = function (t, e) {
      return e.reduce(function (e, r) {
        return (
          (e[r] =
            ((n = t + '.' + r + '()'),
            function () {
              throw new Error(
                'No implementation for ' +
                  n +
                  '. The framework specific code did not implement this method.',
              );
            })),
          e
        );
        var n;
      }, {});
    },
    D = { $q: void 0, $injector: void 0 },
    q = function () {
      for (var t = 0, e = 0, r = arguments.length; e < r; e++)
        t += arguments[e].length;
      var n = Array(t),
        i = 0;
      for (e = 0; e < r; e++)
        for (var o = arguments[e], a = 0, u = o.length; a < u; a++, i++)
          n[i] = o[a];
      return n;
    },
    U =
      ('object' == typeof self && self.self === self && self) ||
      ('object' == typeof global && global.global === global && global) ||
      void 0,
    N = U.angular || {},
    F = N.fromJson || JSON.parse.bind(JSON),
    L = N.toJson || JSON.stringify.bind(JSON),
    M =
      N.forEach ||
      function (t, e, r) {
        if (x(t)) return t.forEach(e, r);
        Object.keys(t).forEach(function (r) {
          return e(t[r], r);
        });
      },
    B = Object.assign || Ot,
    G = N.equals || xt;
  function z(t) {
    return t;
  }
  function W() {}
  function J(t, e, r, n, i) {
    void 0 === i && (i = !1);
    var o = function (e) {
      return t()[e].bind(r());
    };
    return (n = n || Object.keys(t())).reduce(function (t, r) {
      var n;
      return (
        (t[r] = i
          ? ((n = r),
            function () {
              return (e[n] = o(n)), e[n].apply(null, arguments);
            })
          : o(r)),
        t
      );
    }, e);
  }
  var Q = function (t, e) {
      return B(Object.create(t), e);
    },
    K = o(Y);
  function Y(t, e) {
    return -1 !== t.indexOf(e);
  }
  var Z = o(X);
  function X(t, e) {
    var r = t.indexOf(e);
    return r >= 0 && t.splice(r, 1), t;
  }
  var tt = o(et);
  function et(t, e) {
    return t.push(e), e;
  }
  var rt = function (t) {
    return t.slice().forEach(function (e) {
      'function' == typeof e && e(), Z(t, e);
    });
  };
  function nt(t) {
    for (var e = [], r = 1; r < arguments.length; r++) e[r - 1] = arguments[r];
    var n = B.apply(void 0, q([{}], e.reverse()));
    return B(n, at(t || {}, Object.keys(n)));
  }
  var it = function (t, e) {
    return B(t, e);
  };
  function ot(t, e) {
    var r = [];
    for (var n in t.path) {
      if (t.path[n] !== e.path[n]) break;
      r.push(t.path[n]);
    }
    return r;
  }
  function at(t, e) {
    var r = {};
    for (var n in t) -1 !== e.indexOf(n) && (r[n] = t[n]);
    return r;
  }
  function ut(t, e) {
    return Object.keys(t)
      .filter(l(K(e)))
      .reduce(function (e, r) {
        return (e[r] = t[r]), e;
      }, {});
  }
  function st(t, e) {
    return ht(t, s(e));
  }
  function ct(t, e) {
    var r = x(t),
      n = r ? [] : {},
      i = r
        ? function (t) {
            return n.push(t);
          }
        : function (t, e) {
            return (n[e] = t);
          };
    return (
      M(t, function (t, r) {
        e(t, r) && i(t, r);
      }),
      n
    );
  }
  function ft(t, e) {
    var r;
    return (
      M(t, function (t, n) {
        r || (e(t, n) && (r = t));
      }),
      r
    );
  }
  var lt = ht;
  function ht(t, e, r) {
    return (
      (r = r || (x(t) ? [] : {})),
      M(t, function (t, n) {
        return (r[n] = e(t, n));
      }),
      r
    );
  }
  var pt = function (t) {
      return Object.keys(t).map(function (e) {
        return t[e];
      });
    },
    vt = function (t, e) {
      return t && e;
    },
    dt = function (t, e) {
      return t || e;
    },
    mt = function (t, e) {
      return t.concat(e);
    },
    gt = function (t, e) {
      return x(e) ? t.concat(e.reduce(gt, [])) : yt(t, e);
    };
  function yt(t, e) {
    return t.push(e), t;
  }
  var wt = function (t, e) {
      return K(t, e) ? t : yt(t, e);
    },
    _t = function (t) {
      return t.reduce(mt, []);
    },
    St = function (t) {
      return t.reduce(gt, []);
    },
    $t = Rt,
    bt = Rt;
  function Rt(t, e) {
    return (
      void 0 === e && (e = 'assert failure'),
      function (r) {
        var n = t(r);
        if (!n) throw new Error(P(e) ? e(r) : e);
        return n;
      }
    );
  }
  var Et = function (t) {
    return Object.keys(t).map(function (e) {
      return [e, t[e]];
    });
  };
  function Ct() {
    for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
    if (0 === t.length) return [];
    for (
      var r = t.reduce(function (t, e) {
          return Math.min(e.length, t);
        }, 9007199254740991),
        n = [],
        i = function (e) {
          switch (t.length) {
            case 1:
              n.push([t[0][e]]);
              break;
            case 2:
              n.push([t[0][e], t[1][e]]);
              break;
            case 3:
              n.push([t[0][e], t[1][e], t[2][e]]);
              break;
            case 4:
              n.push([t[0][e], t[1][e], t[2][e], t[3][e]]);
              break;
            default:
              n.push(
                t.map(function (t) {
                  return t[e];
                }),
              );
          }
        },
        o = 0;
      o < r;
      o++
    )
      i(o);
    return n;
  }
  function Pt(t, e) {
    var r, n;
    if ((x(e) && ((r = e[0]), (n = e[1])), !k(r)))
      throw new Error('invalid parameters to applyPairs');
    return (t[r] = n), t;
  }
  function Tt(t) {
    return (t.length && t[t.length - 1]) || void 0;
  }
  function kt(t, e) {
    return (
      e &&
        Object.keys(e).forEach(function (t) {
          return delete e[t];
        }),
      e || (e = {}),
      B(e, t)
    );
  }
  function Ot(t) {
    for (var e = 1; e < arguments.length; e++) {
      var r = arguments[e];
      if (r)
        for (var n = Object.keys(r), i = 0; i < n.length; i++)
          t[n[i]] = r[n[i]];
    }
    return t;
  }
  function xt(t, e) {
    if (t === e) return !0;
    if (null === t || null === e) return !1;
    if (t != t && e != e) return !0;
    var r = typeof t;
    if (r !== typeof e || 'object' !== r) return !1;
    var n,
      i,
      o = [t, e];
    if (v(x)(o))
      return (
        (i = e),
        (n = t).length === i.length &&
          Ct(n, i).reduce(function (t, e) {
            return t && xt(e[0], e[1]);
          }, !0)
      );
    if (v(j)(o)) return t.getTime() === e.getTime();
    if (v(V)(o)) return t.toString() === e.toString();
    if (v(P)(o)) return !0;
    if (
      [P, x, j, V].map(d).reduce(function (t, e) {
        return t || !!e(o);
      }, !1)
    )
      return !1;
    var a = {};
    for (var u in t) {
      if (!xt(t[u], e[u])) return !1;
      a[u] = !0;
    }
    for (var u in e) if (!a[u]) return !1;
    return !0;
  }
  var jt,
    Vt = function (t) {
      return (
        t.catch(function (t) {
          return 0;
        }) && t
      );
    },
    It = function (t) {
      return Vt(D.$q.reject(t));
    },
    Ht = (function () {
      function t(t) {
        (this.text = t), (this.glob = t.split('.'));
        var e = this.text
          .split('.')
          .map(function (t) {
            return '**' === t
              ? '(?:|(?:\\.[^.]*)*)'
              : '*' === t
              ? '\\.[^.]*'
              : '\\.' + t;
          })
          .join('');
        this.regexp = new RegExp('^' + e + '$');
      }
      return (
        (t.is = function (t) {
          return !!/[!,*]+/.exec(t);
        }),
        (t.fromString = function (e) {
          return t.is(e) ? new t(e) : null;
        }),
        (t.prototype.matches = function (t) {
          return this.regexp.test('.' + t);
        }),
        t
      );
    })(),
    At = (function () {
      function t(t, e) {
        void 0 === t && (t = []),
          void 0 === e && (e = null),
          (this._items = t),
          (this._limit = e),
          (this._evictListeners = []),
          (this.onEvict = tt(this._evictListeners));
      }
      return (
        (t.prototype.enqueue = function (t) {
          var e = this._items;
          return (
            e.push(t), this._limit && e.length > this._limit && this.evict(), t
          );
        }),
        (t.prototype.evict = function () {
          var t = this._items.shift();
          return (
            this._evictListeners.forEach(function (e) {
              return e(t);
            }),
            t
          );
        }),
        (t.prototype.dequeue = function () {
          if (this.size()) return this._items.splice(0, 1)[0];
        }),
        (t.prototype.clear = function () {
          var t = this._items;
          return (this._items = []), t;
        }),
        (t.prototype.size = function () {
          return this._items.length;
        }),
        (t.prototype.remove = function (t) {
          var e = this._items.indexOf(t);
          return e > -1 && this._items.splice(e, 1)[0];
        }),
        (t.prototype.peekTail = function () {
          return this._items[this._items.length - 1];
        }),
        (t.prototype.peekHead = function () {
          if (this.size()) return this._items[0];
        }),
        t
      );
    })();
  ((jt = t.RejectType || (t.RejectType = {}))[(jt.SUPERSEDED = 2)] =
    'SUPERSEDED'),
    (jt[(jt.ABORTED = 3)] = 'ABORTED'),
    (jt[(jt.INVALID = 4)] = 'INVALID'),
    (jt[(jt.IGNORED = 5)] = 'IGNORED'),
    (jt[(jt.ERROR = 6)] = 'ERROR');
  var Dt = 0,
    qt = (function () {
      function e(t, e, r) {
        (this.$id = Dt++),
          (this.type = t),
          (this.message = e),
          (this.detail = r);
      }
      return (
        (e.isRejectionPromise = function (t) {
          return (
            t && 'function' == typeof t.then && m(e)(t._transitionRejection)
          );
        }),
        (e.superseded = function (r, n) {
          var i = new e(
            t.RejectType.SUPERSEDED,
            'The transition has been superseded by a different transition',
            r,
          );
          return n && n.redirected && (i.redirected = !0), i;
        }),
        (e.redirected = function (t) {
          return e.superseded(t, { redirected: !0 });
        }),
        (e.invalid = function (r) {
          return new e(t.RejectType.INVALID, 'This transition is invalid', r);
        }),
        (e.ignored = function (r) {
          return new e(t.RejectType.IGNORED, 'The transition was ignored', r);
        }),
        (e.aborted = function (r) {
          return new e(
            t.RejectType.ABORTED,
            'The transition has been aborted',
            r,
          );
        }),
        (e.errored = function (r) {
          return new e(t.RejectType.ERROR, 'The transition errored', r);
        }),
        (e.normalize = function (t) {
          return m(e)(t) ? t : e.errored(t);
        }),
        (e.prototype.toString = function () {
          var t,
            e =
              (t = this.detail) && t.toString !== Object.prototype.toString
                ? t.toString()
                : zt(t);
          return (
            'Transition Rejection($id: ' +
            this.$id +
            ' type: ' +
            this.type +
            ', message: ' +
            this.message +
            ', detail: ' +
            e +
            ')'
          );
        }),
        (e.prototype.toPromise = function () {
          return B(It(this), { _transitionRejection: this });
        }),
        e
      );
    })();
  function Ut(t, e) {
    return e.length <= t ? e : e.substr(0, t - 3) + '...';
  }
  function Nt(t, e) {
    for (; e.length < t; ) e += ' ';
    return e;
  }
  function Ft(t) {
    return t
      .replace(/^([A-Z])/, function (t) {
        return t.toLowerCase();
      })
      .replace(/([A-Z])/g, function (t) {
        return '-' + t.toLowerCase();
      });
  }
  function Lt(t) {
    var e = Mt(t),
      r = e.match(/^(function [^ ]+\([^)]*\))/),
      n = r ? r[1] : e,
      i = t.name || '';
    return i && n.match(/function \(/) ? 'function ' + i + n.substr(9) : n;
  }
  function Mt(t) {
    var e = x(t) ? t.slice(-1)[0] : t;
    return (e && e.toString()) || 'undefined';
  }
  var Bt = qt.isRejectionPromise,
    Gt = _([
      [b, y('undefined')],
      [E, y('null')],
      [H, y('[Promise]')],
      [
        Bt,
        function (t) {
          return t._transitionRejection.toString();
        },
      ],
      [
        function (t) {
          return O(t) && !x(t) && t.constructor !== Object && P(t.toString);
        },
        function (t) {
          return t.toString();
        },
      ],
      [I, Lt],
      [y(!0), z],
    ]);
  function zt(t) {
    var e = [];
    function r(t) {
      if (O(t)) {
        if (-1 !== e.indexOf(t)) return '[circular ref]';
        e.push(t);
      }
      return Gt(t);
    }
    return b(t)
      ? r(t)
      : JSON.stringify(t, function (t, e) {
          return r(e);
        }).replace(/\\"/g, '"');
  }
  var Wt = function (t) {
      return function (e) {
        if (!e) return ['', ''];
        var r = e.indexOf(t);
        return -1 === r ? [e, ''] : [e.substr(0, r), e.substr(r + 1)];
      };
    },
    Jt = new RegExp('^(?:[a-z]+:)?//[^/]+/'),
    Qt = function (t) {
      return t.replace(/\/[^/]*$/, '');
    },
    Kt = Wt('#'),
    Yt = Wt('?'),
    Zt = Wt('='),
    Xt = function (t) {
      return t ? t.replace(/^#/, '') : '';
    };
  function te(t) {
    var e = new RegExp('(' + t + ')', 'g');
    return function (t) {
      return t.split(e).filter(z);
    };
  }
  function ee(t, e) {
    return k(Tt(t)) && k(e) ? t.slice(0, -1).concat(Tt(t) + e) : yt(t, e);
  }
  var re = { log: W, error: W, table: W };
  var ne =
    'undefined' != typeof document &&
    document.documentMode &&
    9 === document.documentMode
      ? window && window.console
        ? (function (t) {
            var e = function (e) {
              return Function.prototype.bind.call(e, t);
            };
            return { log: e(t.log), error: e(t.log), table: e(t.log) };
          })(window.console)
        : re
      : console.table && console.error
      ? console
      : (function (t) {
          var e = t.log.bind(t);
          return {
            log: e,
            error: t.error ? t.error.bind(t) : e,
            table: t.table ? t.table.bind(t) : e,
          };
        })(console);
  function ie(t) {
    if (!t) return 'ui-view (defunct)';
    var e = t.creationContext ? t.creationContext.name || '(root)' : '(none)';
    return (
      '[ui-view#' +
      t.id +
      ' ' +
      t.$type +
      ':' +
      t.fqn +
      ' (' +
      t.name +
      '@' +
      e +
      ')]'
    );
  }
  var oe;
  function ae(e) {
    return T(e) ? t.Category[e] : t.Category[t.Category[e]];
  }
  ((oe = t.Category || (t.Category = {}))[(oe.RESOLVE = 0)] = 'RESOLVE'),
    (oe[(oe.TRANSITION = 1)] = 'TRANSITION'),
    (oe[(oe.HOOK = 2)] = 'HOOK'),
    (oe[(oe.UIVIEW = 3)] = 'UIVIEW'),
    (oe[(oe.VIEWCONFIG = 4)] = 'VIEWCONFIG');
  var ue = f('$id'),
    se = f('router.$id'),
    ce = function (t) {
      return 'Transition #' + ue(t) + '-' + se(t);
    },
    fe = (function () {
      function e() {
        (this._enabled = {}), (this.approximateDigests = 0);
      }
      return (
        (e.prototype._set = function (e, r) {
          var n = this;
          r.length ||
            (r = Object.keys(t.Category)
              .map(function (t) {
                return parseInt(t, 10);
              })
              .filter(function (t) {
                return !isNaN(t);
              })
              .map(function (e) {
                return t.Category[e];
              })),
            r.map(ae).forEach(function (t) {
              return (n._enabled[t] = e);
            });
        }),
        (e.prototype.enable = function () {
          for (var t = [], e = 0; e < arguments.length; e++)
            t[e] = arguments[e];
          this._set(!0, t);
        }),
        (e.prototype.disable = function () {
          for (var t = [], e = 0; e < arguments.length; e++)
            t[e] = arguments[e];
          this._set(!1, t);
        }),
        (e.prototype.enabled = function (t) {
          return !!this._enabled[ae(t)];
        }),
        (e.prototype.traceTransitionStart = function (e) {
          this.enabled(t.Category.TRANSITION) &&
            ne.log(ce(e) + ': Started  -> ' + zt(e));
        }),
        (e.prototype.traceTransitionIgnored = function (e) {
          this.enabled(t.Category.TRANSITION) &&
            ne.log(ce(e) + ': Ignored  <> ' + zt(e));
        }),
        (e.prototype.traceHookInvocation = function (e, r, n) {
          if (this.enabled(t.Category.HOOK)) {
            var i = f('traceData.hookType')(n) || 'internal',
              o =
                f('traceData.context.state.name')(n) ||
                f('traceData.context')(n) ||
                'unknown',
              a = Lt(e.registeredHook.callback);
            ne.log(
              ce(r) + ':   Hook -> ' + i + ' context: ' + o + ', ' + Ut(200, a),
            );
          }
        }),
        (e.prototype.traceHookResult = function (e, r, n) {
          this.enabled(t.Category.HOOK) &&
            ne.log(ce(r) + ':   <- Hook returned: ' + Ut(200, zt(e)));
        }),
        (e.prototype.traceResolvePath = function (e, r, n) {
          this.enabled(t.Category.RESOLVE) &&
            ne.log(ce(n) + ':         Resolving ' + e + ' (' + r + ')');
        }),
        (e.prototype.traceResolvableResolved = function (e, r) {
          this.enabled(t.Category.RESOLVE) &&
            ne.log(
              ce(r) +
                ':               <- Resolved  ' +
                e +
                ' to: ' +
                Ut(200, zt(e.data)),
            );
        }),
        (e.prototype.traceError = function (e, r) {
          this.enabled(t.Category.TRANSITION) &&
            ne.log(ce(r) + ': <- Rejected ' + zt(r) + ', reason: ' + e);
        }),
        (e.prototype.traceSuccess = function (e, r) {
          this.enabled(t.Category.TRANSITION) &&
            ne.log(
              ce(r) + ': <- Success  ' + zt(r) + ', final state: ' + e.name,
            );
        }),
        (e.prototype.traceUIViewEvent = function (e, r, n) {
          void 0 === n && (n = ''),
            this.enabled(t.Category.UIVIEW) &&
              ne.log('ui-view: ' + Nt(30, e) + ' ' + ie(r) + n);
        }),
        (e.prototype.traceUIViewConfigUpdated = function (e, r) {
          this.enabled(t.Category.UIVIEW) &&
            this.traceUIViewEvent(
              'Updating',
              e,
              " with ViewConfig from context='" + r + "'",
            );
        }),
        (e.prototype.traceUIViewFill = function (e, r) {
          this.enabled(t.Category.UIVIEW) &&
            this.traceUIViewEvent('Fill', e, ' with: ' + Ut(200, r));
        }),
        (e.prototype.traceViewSync = function (e) {
          if (this.enabled(t.Category.VIEWCONFIG)) {
            var r = 'uiview component fqn',
              n = e
                .map(function (t) {
                  var e,
                    n = t.uiView,
                    i = t.viewConfig,
                    o = n && n.fqn,
                    a =
                      i &&
                      i.viewDecl.$context.name + ': (' + i.viewDecl.$name + ')';
                  return (
                    ((e = {})[r] = o),
                    (e['view config state (view name)'] = a),
                    e
                  );
                })
                .sort(function (t, e) {
                  return (t[r] || '').localeCompare(e[r] || '');
                });
            ne.table(n);
          }
        }),
        (e.prototype.traceViewServiceEvent = function (e, r) {
          this.enabled(t.Category.VIEWCONFIG) &&
            ne.log(
              'VIEWCONFIG: ' +
                e +
                ' ' +
                (function (t) {
                  var e = t.viewDecl,
                    r = e.$context.name || '(root)';
                  return (
                    '[View#' +
                    t.$id +
                    " from '" +
                    r +
                    "' state]: target ui-view: '" +
                    e.$uiViewName +
                    '@' +
                    e.$uiViewContextAnchor +
                    "'"
                  );
                })(r),
            );
        }),
        (e.prototype.traceViewServiceUIViewEvent = function (e, r) {
          this.enabled(t.Category.VIEWCONFIG) &&
            ne.log('VIEWCONFIG: ' + e + ' ' + ie(r));
        }),
        e
      );
    })(),
    le = new fe(),
    he = (function () {
      function t(t) {
        (this.pattern = /.*/), (this.inherit = !0), B(this, t);
      }
      return (
        (t.prototype.is = function (t, e) {
          return !0;
        }),
        (t.prototype.encode = function (t, e) {
          return t;
        }),
        (t.prototype.decode = function (t, e) {
          return t;
        }),
        (t.prototype.equals = function (t, e) {
          return t == e;
        }),
        (t.prototype.$subPattern = function () {
          var t = this.pattern.toString();
          return t.substr(1, t.length - 2);
        }),
        (t.prototype.toString = function () {
          return '{ParamType:' + this.name + '}';
        }),
        (t.prototype.$normalize = function (t) {
          return this.is(t) ? t : this.decode(t);
        }),
        (t.prototype.$asArray = function (t, e) {
          if (!t) return this;
          if ('auto' === t && !e)
            throw new Error("'auto' array mode is for query parameters only");
          return new pe(this, t);
        }),
        t
      );
    })();
  function pe(t, e) {
    var r = this;
    function n(t) {
      return x(t) ? t : R(t) ? [t] : [];
    }
    function i(t, r) {
      return function (i) {
        if (x(i) && 0 === i.length) return i;
        var o = ht(n(i), t);
        return !0 === r
          ? 0 ===
              ct(o, function (t) {
                return !t;
              }).length
          : (function (t) {
              switch (t.length) {
                case 0:
                  return;
                case 1:
                  return 'auto' === e ? t[0] : t;
                default:
                  return t;
              }
            })(o);
      };
    }
    function o(t) {
      return function (e, r) {
        var i = n(e),
          o = n(r);
        if (i.length !== o.length) return !1;
        for (var a = 0; a < i.length; a++) if (!t(i[a], o[a])) return !1;
        return !0;
      };
    }
    ['encode', 'decode', 'equals', '$normalize'].forEach(function (e) {
      var n = t[e].bind(t),
        a = 'equals' === e ? o : i;
      r[e] = a(n);
    }),
      B(this, {
        dynamic: t.dynamic,
        name: t.name,
        pattern: t.pattern,
        inherit: t.inherit,
        raw: t.raw,
        is: i(t.is.bind(t), !0),
        $arrayMode: e,
      });
  }
  var ve,
    de = Object.prototype.hasOwnProperty;
  function me(e, r, n) {
    var i = (!1 === n.reloadOnSearch && r === t.DefType.SEARCH) || void 0,
      o = ft([n.dynamic, i], R),
      a = R(o) ? { dynamic: o } : {},
      u = (function (t) {
        function e() {
          return t.value;
        }
        (t = (function (t) {
          return (
            0 ===
            ['value', 'type', 'squash', 'array', 'dynamic'].filter(
              de.bind(t || {}),
            ).length
          );
        })(t)
          ? { value: t }
          : t),
          (e.__cacheable = !0);
        var r = I(t.value) ? t.value : e;
        return B(t, { $$fn: r });
      })(n && n.params && n.params[e]);
    return B(a, u);
  }
  ((ve = t.DefType || (t.DefType = {}))[(ve.PATH = 0)] = 'PATH'),
    (ve[(ve.SEARCH = 1)] = 'SEARCH'),
    (ve[(ve.CONFIG = 2)] = 'CONFIG');
  var ge,
    ye = (function () {
      function e(e, r, n, i, o) {
        var a = me(e, n, o);
        r = (function (e, r, n, i, o) {
          if (e.type && r && 'string' !== r.name)
            throw new Error("Param '" + i + "' has two type configurations.");
          if (e.type && r && 'string' === r.name && o.type(e.type))
            return o.type(e.type);
          if (r) return r;
          if (!e.type) {
            var a =
              n === t.DefType.CONFIG
                ? 'any'
                : n === t.DefType.PATH
                ? 'path'
                : n === t.DefType.SEARCH
                ? 'query'
                : 'string';
            return o.type(a);
          }
          return e.type instanceof he ? e.type : o.type(e.type);
        })(a, r, n, e, i.paramTypes);
        var u,
          c,
          f =
            ((u = { array: n === t.DefType.SEARCH && 'auto' }),
            (c = e.match(/\[\]$/) ? { array: !0 } : {}),
            B(u, c, a).array);
        r = f ? r.$asArray(f, n === t.DefType.SEARCH) : r;
        var l = void 0 !== a.value || n === t.DefType.SEARCH,
          h = R(a.dynamic) ? !!a.dynamic : !!r.dynamic,
          p = R(a.raw) ? !!a.raw : !!r.raw,
          v = (function (t, e, r) {
            var n = t.squash;
            if (!e || !1 === n) return !1;
            if (!R(n) || null == n) return r;
            if (!0 === n || k(n)) return n;
            throw new Error(
              "Invalid squash policy: '" +
                n +
                "'. Valid policies: false, true, or arbitrary string",
            );
          })(a, l, i.defaultSquashPolicy()),
          d = (function (t, e, r, n) {
            var i = [
                { from: '', to: r || e ? void 0 : '' },
                { from: null, to: r || e ? void 0 : '' },
              ],
              o = x(t.replace) ? t.replace : [];
            k(n) && o.push({ from: n, to: void 0 });
            var a = ht(o, s('from'));
            return ct(i, function (t) {
              return -1 === a.indexOf(t.from);
            }).concat(o);
          })(a, f, l, v),
          m = R(a.inherit) ? !!a.inherit : !!r.inherit;
        B(this, {
          id: e,
          type: r,
          location: n,
          isOptional: l,
          dynamic: h,
          raw: p,
          squash: v,
          replace: d,
          inherit: m,
          array: f,
          config: a,
        });
      }
      return (
        (e.values = function (t, e) {
          void 0 === e && (e = {});
          for (var r = {}, n = 0, i = t; n < i.length; n++) {
            var o = i[n];
            r[o.id] = o.value(e[o.id]);
          }
          return r;
        }),
        (e.changed = function (t, e, r) {
          return (
            void 0 === e && (e = {}),
            void 0 === r && (r = {}),
            t.filter(function (t) {
              return !t.type.equals(e[t.id], r[t.id]);
            })
          );
        }),
        (e.equals = function (t, r, n) {
          return (
            void 0 === r && (r = {}),
            void 0 === n && (n = {}),
            0 === e.changed(t, r, n).length
          );
        }),
        (e.validates = function (t, e) {
          return (
            void 0 === e && (e = {}),
            t
              .map(function (t) {
                return t.validates(e[t.id]);
              })
              .reduce(vt, !0)
          );
        }),
        (e.prototype.isDefaultValue = function (t) {
          return this.isOptional && this.type.equals(this.value(), t);
        }),
        (e.prototype.value = function (t) {
          var e = this;
          return (
            (t = (function (t) {
              for (var r = 0, n = e.replace; r < n.length; r++) {
                var i = n[r];
                if (i.from === t) return i.to;
              }
              return t;
            })(t)),
            b(t)
              ? (function () {
                  if (e._defaultValueCache)
                    return e._defaultValueCache.defaultValue;
                  if (!D.$injector)
                    throw new Error(
                      'Injectable functions cannot be called at configuration time',
                    );
                  var t = D.$injector.invoke(e.config.$$fn);
                  if (null != t && !e.type.is(t))
                    throw new Error(
                      'Default value (' +
                        t +
                        ") for parameter '" +
                        e.id +
                        "' is not an instance of ParamType (" +
                        e.type.name +
                        ')',
                    );
                  return (
                    e.config.$$fn.__cacheable &&
                      (e._defaultValueCache = { defaultValue: t }),
                    t
                  );
                })()
              : this.type.$normalize(t)
          );
        }),
        (e.prototype.isSearch = function () {
          return this.location === t.DefType.SEARCH;
        }),
        (e.prototype.validates = function (t) {
          if ((b(t) || null === t) && this.isOptional) return !0;
          var e = this.type.$normalize(t);
          if (!this.type.is(e)) return !1;
          var r = this.type.encode(e);
          return !(k(r) && !this.type.pattern.exec(r));
        }),
        (e.prototype.toString = function () {
          return (
            '{Param:' +
            this.id +
            ' ' +
            this.type +
            " squash: '" +
            this.squash +
            "' optional: " +
            this.isOptional +
            '}'
          );
        }),
        e
      );
    })(),
    we = (function () {
      function t() {
        (this.enqueue = !0),
          (this.typeQueue = []),
          (this.defaultTypes = at(t.prototype, [
            'hash',
            'string',
            'query',
            'path',
            'int',
            'bool',
            'date',
            'json',
            'any',
          ]));
        this.types = Q(
          ht(this.defaultTypes, function (t, e) {
            return new he(B({ name: e }, t));
          }),
          {},
        );
      }
      return (
        (t.prototype.dispose = function () {
          this.types = {};
        }),
        (t.prototype.type = function (t, e, r) {
          if (!R(e)) return this.types[t];
          if (this.types.hasOwnProperty(t))
            throw new Error(
              "A type named '" + t + "' has already been defined.",
            );
          return (
            (this.types[t] = new he(B({ name: t }, e))),
            r &&
              (this.typeQueue.push({ name: t, def: r }),
              this.enqueue || this._flushTypeQueue()),
            this
          );
        }),
        (t.prototype._flushTypeQueue = function () {
          for (; this.typeQueue.length; ) {
            var t = this.typeQueue.shift();
            if (t.pattern)
              throw new Error(
                "You cannot override a type's .pattern at runtime.",
              );
            B(this.types[t.name], D.$injector.invoke(t.def));
          }
        }),
        t
      );
    })();
  (ge = function (t) {
    var e = function (t) {
        return null != t ? t.toString() : t;
      },
      r = {
        encode: e,
        decode: e,
        is: m(String),
        pattern: /.*/,
        equals: function (t, e) {
          return t == e;
        },
      };
    return B({}, r, t);
  }),
    B(we.prototype, {
      string: ge({}),
      path: ge({ pattern: /[^/]*/ }),
      query: ge({}),
      hash: ge({ inherit: !1 }),
      int: ge({
        decode: function (t) {
          return parseInt(t, 10);
        },
        is: function (t) {
          return !C(t) && this.decode(t.toString()) === t;
        },
        pattern: /-?\d+/,
      }),
      bool: ge({
        encode: function (t) {
          return t ? 1 : 0;
        },
        decode: function (t) {
          return 0 !== parseInt(t, 10);
        },
        is: m(Boolean),
        pattern: /0|1/,
      }),
      date: ge({
        encode: function (t) {
          return this.is(t)
            ? [
                t.getFullYear(),
                ('0' + (t.getMonth() + 1)).slice(-2),
                ('0' + t.getDate()).slice(-2),
              ].join('-')
            : void 0;
        },
        decode: function (t) {
          if (this.is(t)) return t;
          var e = this.capture.exec(t);
          return e ? new Date(e[1], e[2] - 1, e[3]) : void 0;
        },
        is: function (t) {
          return t instanceof Date && !isNaN(t.valueOf());
        },
        equals: function (t, e) {
          return ['getFullYear', 'getMonth', 'getDate'].reduce(function (r, n) {
            return r && t[n]() === e[n]();
          }, !0);
        },
        pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
        capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/,
      }),
      json: ge({
        encode: L,
        decode: F,
        is: m(Object),
        equals: G,
        pattern: /[^/]*/,
      }),
      any: ge({
        encode: z,
        decode: z,
        is: function () {
          return !0;
        },
        equals: G,
      }),
    });
  var _e = (function () {
      function t(t) {
        void 0 === t && (t = {}), B(this, t);
      }
      return (
        (t.prototype.$inherit = function (t, e, r) {
          var n,
            i = ot(e, r),
            o = {},
            a = [];
          for (var u in i)
            if (i[u] && i[u].params && (n = Object.keys(i[u].params)).length)
              for (var s in n)
                a.indexOf(n[s]) >= 0 || (a.push(n[s]), (o[n[s]] = this[n[s]]));
          return B({}, o, t);
        }),
        t
      );
    })(),
    Se = (function () {
      function t(e) {
        if (e instanceof t) {
          var r = e;
          (this.state = r.state),
            (this.paramSchema = r.paramSchema.slice()),
            (this.paramValues = B({}, r.paramValues)),
            (this.resolvables = r.resolvables.slice()),
            (this.views = r.views && r.views.slice());
        } else {
          var n = e;
          (this.state = n),
            (this.paramSchema = n.parameters({ inherit: !1 })),
            (this.paramValues = {}),
            (this.resolvables = n.resolvables.map(function (t) {
              return t.clone();
            }));
        }
      }
      return (
        (t.prototype.clone = function () {
          return new t(this);
        }),
        (t.prototype.applyRawParams = function (t) {
          return (
            (this.paramValues = this.paramSchema.reduce(function (e, r) {
              return Pt(e, [(n = r).id, n.value(t[n.id])]);
              var n;
            }, {})),
            this
          );
        }),
        (t.prototype.parameter = function (t) {
          return ft(this.paramSchema, c('id', t));
        }),
        (t.prototype.equals = function (t, e) {
          var r = this.diff(t, e);
          return r && 0 === r.length;
        }),
        (t.prototype.diff = function (t, e) {
          if (this.state !== t.state) return !1;
          var r = e ? e(this) : this.paramSchema;
          return ye.changed(r, this.paramValues, t.paramValues);
        }),
        (t.clone = function (t) {
          return t.clone();
        }),
        t
      );
    })(),
    $e = (function () {
      function t(t, e, r, n) {
        (this._stateRegistry = t),
          (this._identifier = e),
          (this._identifier = e),
          (this._params = B({}, r || {})),
          (this._options = B({}, n || {})),
          (this._definition = t.matcher.find(e, this._options.relative));
      }
      return (
        (t.prototype.name = function () {
          return (
            (this._definition && this._definition.name) || this._identifier
          );
        }),
        (t.prototype.identifier = function () {
          return this._identifier;
        }),
        (t.prototype.params = function () {
          return this._params;
        }),
        (t.prototype.$state = function () {
          return this._definition;
        }),
        (t.prototype.state = function () {
          return this._definition && this._definition.self;
        }),
        (t.prototype.options = function () {
          return this._options;
        }),
        (t.prototype.exists = function () {
          return !(!this._definition || !this._definition.self);
        }),
        (t.prototype.valid = function () {
          return !this.error();
        }),
        (t.prototype.error = function () {
          var t = this.options().relative;
          if (!this._definition && t) {
            var e = t.name ? t.name : t;
            return (
              "Could not resolve '" + this.name() + "' from state '" + e + "'"
            );
          }
          return this._definition
            ? this._definition.self
              ? void 0
              : "State '" + this.name() + "' has an invalid definition"
            : "No such state '" + this.name() + "'";
        }),
        (t.prototype.toString = function () {
          return "'" + this.name() + "'" + zt(this.params());
        }),
        (t.prototype.withState = function (e) {
          return new t(this._stateRegistry, e, this._params, this._options);
        }),
        (t.prototype.withParams = function (e, r) {
          void 0 === r && (r = !1);
          var n = r ? e : B({}, this._params, e);
          return new t(this._stateRegistry, this._identifier, n, this._options);
        }),
        (t.prototype.withOptions = function (e, r) {
          void 0 === r && (r = !1);
          var n = r ? e : B({}, this._options, e);
          return new t(this._stateRegistry, this._identifier, this._params, n);
        }),
        (t.isDef = function (t) {
          return (
            t && t.state && (k(t.state) || (O(t.state) && k(t.state.name)))
          );
        }),
        t
      );
    })(),
    be = (function () {
      function t() {}
      return (
        (t.makeTargetState = function (t, e) {
          var r = Tt(e).state;
          return new $e(t, r, e.map(s('paramValues')).reduce(it, {}), {});
        }),
        (t.buildPath = function (t) {
          var e = t.params();
          return t.$state().path.map(function (t) {
            return new Se(t).applyRawParams(e);
          });
        }),
        (t.buildToPath = function (e, r) {
          var n = t.buildPath(r);
          return r.options().inherit
            ? t.inheritParams(e, n, Object.keys(r.params()))
            : n;
        }),
        (t.applyViewConfigs = function (e, r, n) {
          r.filter(function (t) {
            return K(n, t.state);
          }).forEach(function (n) {
            var i = pt(n.state.views || {}),
              o = t.subPath(r, function (t) {
                return t === n;
              }),
              a = i.map(function (t) {
                return e.createViewConfig(o, t);
              });
            n.views = a.reduce(mt, []);
          });
        }),
        (t.inheritParams = function (t, e, r) {
          void 0 === r && (r = []);
          var n = t
            .map(function (t) {
              return t.paramSchema;
            })
            .reduce(mt, [])
            .filter(function (t) {
              return !t.inherit;
            })
            .map(s('id'));
          return e.map(function (e) {
            var i = B({}, e && e.paramValues),
              o = at(i, r);
            i = ut(i, r);
            var a,
              u,
              s,
              f = ut(
                ((a = t),
                (u = e.state),
                (s = ft(a, c('state', u))),
                B({}, s && s.paramValues) || {}),
                n,
              ),
              l = B(i, f, o);
            return new Se(e.state).applyRawParams(l);
          });
        }),
        (t.treeChanges = function (e, r, n) {
          for (
            var i, o, a, u, s, c, f = Math.min(e.length, r.length), l = 0;
            l < f &&
            e[l].state !== n &&
            ((i = e[l]), (o = r[l]), i.equals(o, t.nonDynamicParams));

          )
            l++;
          (u = (a = e).slice(0, l)), (s = a.slice(l));
          var h = u.map(function (t, e) {
            var n = t.clone();
            return (n.paramValues = r[e].paramValues), n;
          });
          return (
            (c = r.slice(l)),
            {
              from: a,
              to: h.concat(c),
              retained: u,
              retainedWithToParams: h,
              exiting: s,
              entering: c,
            }
          );
        }),
        (t.matching = function (t, e, r) {
          var n = !1;
          return Ct(t, e).reduce(function (t, e) {
            var i = e[0],
              o = e[1];
            return (n = n || !i.equals(o, r)) ? t : t.concat(i);
          }, []);
        }),
        (t.equals = function (e, r, n) {
          return (
            e.length === r.length && t.matching(e, r, n).length === e.length
          );
        }),
        (t.subPath = function (t, e) {
          var r = ft(t, e),
            n = t.indexOf(r);
          return -1 === n ? void 0 : t.slice(0, n + 1);
        }),
        (t.nonDynamicParams = function (t) {
          return t.state.parameters({ inherit: !1 }).filter(function (t) {
            return !t.dynamic;
          });
        }),
        (t.paramValues = function (t) {
          return t.reduce(function (t, e) {
            return B(t, e.paramValues);
          }, {});
        }),
        t
      );
    })(),
    Re = {
      when: { LAZY: 'LAZY', EAGER: 'EAGER' },
      async: { WAIT: 'WAIT', NOWAIT: 'NOWAIT' },
    },
    Ee = { when: 'LAZY', async: 'WAIT' },
    Ce = (function () {
      function t(e, r, n, i, o) {
        if (((this.resolved = !1), (this.promise = void 0), e instanceof t))
          B(this, e);
        else if (P(r)) {
          if (C(e))
            throw new Error('new Resolvable(): token argument is required');
          if (!P(r))
            throw new Error(
              'new Resolvable(): resolveFn argument must be a function',
            );
          (this.token = e),
            (this.policy = i),
            (this.resolveFn = r),
            (this.deps = n || []),
            (this.data = o),
            (this.resolved = void 0 !== o),
            (this.promise = this.resolved ? D.$q.when(this.data) : void 0);
        } else if (
          O(e) &&
          e.token &&
          (e.hasOwnProperty('resolveFn') || e.hasOwnProperty('data'))
        ) {
          var a = e;
          return new t(a.token, a.resolveFn, a.deps, a.policy, a.data);
        }
      }
      return (
        (t.prototype.getPolicy = function (t) {
          var e = this.policy || {},
            r = (t && t.resolvePolicy) || {};
          return {
            when: e.when || r.when || Ee.when,
            async: e.async || r.async || Ee.async,
          };
        }),
        (t.prototype.resolve = function (t, e) {
          var r = this,
            n = D.$q,
            i = t.findNode(this),
            o = i && i.state,
            a = this.getPolicy(o).async,
            u = P(a) ? a : z;
          return (this.promise = n
            .when()
            .then(function () {
              return n.all(
                t.getDependencies(r).map(function (r) {
                  return r.get(t, e);
                }),
              );
            })
            .then(function (t) {
              return r.resolveFn.apply(null, t);
            })
            .then(u)
            .then(function (t) {
              return (
                (r.data = t),
                (r.resolved = !0),
                (r.resolveFn = null),
                le.traceResolvableResolved(r, e),
                r.data
              );
            }));
        }),
        (t.prototype.get = function (t, e) {
          return this.promise || this.resolve(t, e);
        }),
        (t.prototype.toString = function () {
          return (
            'Resolvable(token: ' +
            zt(this.token) +
            ', requires: [' +
            this.deps.map(zt) +
            '])'
          );
        }),
        (t.prototype.clone = function () {
          return new t(this);
        }),
        (t.fromData = function (e, r) {
          return new t(
            e,
            function () {
              return r;
            },
            null,
            null,
            r,
          );
        }),
        t
      );
    })(),
    Pe = Re.when,
    Te = [Pe.EAGER, Pe.LAZY],
    ke = [Pe.EAGER],
    Oe = (function () {
      function t(t) {
        this._path = t;
      }
      return (
        (t.prototype.getTokens = function () {
          return this._path
            .reduce(function (t, e) {
              return t.concat(
                e.resolvables.map(function (t) {
                  return t.token;
                }),
              );
            }, [])
            .reduce(wt, []);
        }),
        (t.prototype.getResolvable = function (t) {
          return Tt(
            this._path
              .map(function (t) {
                return t.resolvables;
              })
              .reduce(mt, [])
              .filter(function (e) {
                return e.token === t;
              }),
          );
        }),
        (t.prototype.getPolicy = function (t) {
          var e = this.findNode(t);
          return t.getPolicy(e.state);
        }),
        (t.prototype.subContext = function (e) {
          return new t(
            be.subPath(this._path, function (t) {
              return t.state === e;
            }),
          );
        }),
        (t.prototype.addResolvables = function (t, e) {
          var r = ft(this._path, c('state', e)),
            n = t.map(function (t) {
              return t.token;
            });
          r.resolvables = r.resolvables
            .filter(function (t) {
              return -1 === n.indexOf(t.token);
            })
            .concat(t);
        }),
        (t.prototype.resolvePath = function (t, e) {
          var r = this;
          void 0 === t && (t = 'LAZY');
          var n = (K(Te, t) ? t : 'LAZY') === Re.when.EAGER ? ke : Te;
          le.traceResolvePath(this._path, t, e);
          var i = function (t, e) {
              return function (n) {
                return K(t, r.getPolicy(n)[e]);
              };
            },
            o = this._path.reduce(function (t, o) {
              var a = o.resolvables.filter(i(n, 'when')),
                u = a.filter(i(['NOWAIT'], 'async')),
                s = a.filter(l(i(['NOWAIT'], 'async'))),
                c = r.subContext(o.state),
                f = function (t) {
                  return t.get(c, e).then(function (e) {
                    return { token: t.token, value: e };
                  });
                };
              return u.forEach(f), t.concat(s.map(f));
            }, []);
          return D.$q.all(o);
        }),
        (t.prototype.injector = function () {
          return this._injector || (this._injector = new xe(this));
        }),
        (t.prototype.findNode = function (t) {
          return ft(this._path, function (e) {
            return K(e.resolvables, t);
          });
        }),
        (t.prototype.getDependencies = function (t) {
          var e = this,
            r = this.findNode(t),
            n = (
              be.subPath(this._path, function (t) {
                return t === r;
              }) || this._path
            )
              .reduce(function (t, e) {
                return t.concat(e.resolvables);
              }, [])
              .filter(function (e) {
                return e !== t;
              });
          return t.deps.map(function (t) {
            var r = n.filter(function (e) {
              return e.token === t;
            });
            if (r.length) return Tt(r);
            var i = e.injector().getNative(t);
            if (b(i))
              throw new Error(
                'Could not find Dependency Injection token: ' + zt(t),
              );
            return new Ce(
              t,
              function () {
                return i;
              },
              [],
              i,
            );
          });
        }),
        t
      );
    })(),
    xe = (function () {
      function t(t) {
        (this.context = t),
          (this.native = this.get('Native Injector') || D.$injector);
      }
      return (
        (t.prototype.get = function (t) {
          var e = this.context.getResolvable(t);
          if (e) {
            if ('NOWAIT' === this.context.getPolicy(e).async)
              return e.get(this.context);
            if (!e.resolved)
              throw new Error(
                'Resolvable async .get() not complete:' + zt(e.token),
              );
            return e.data;
          }
          return this.getNative(t);
        }),
        (t.prototype.getAsync = function (t) {
          var e = this.context.getResolvable(t);
          return e ? e.get(this.context) : D.$q.when(this.native.get(t));
        }),
        (t.prototype.getNative = function (t) {
          return this.native && this.native.get(t);
        }),
        t
      );
    })();
  function je(t) {
    return t.name;
  }
  function Ve(t) {
    return (
      (t.self.$$state = function () {
        return t;
      }),
      t.self
    );
  }
  function Ie(t) {
    return (
      t.parent &&
        t.parent.data &&
        (t.data = t.self.data = Q(t.parent.data, t.data)),
      t.data
    );
  }
  var He = function (t, e) {
      return function (r) {
        var n = r.self;
        if (n && n.url && n.name && n.name.match(/\.\*\*$/)) {
          var i = {};
          kt(n, i), (i.url += '{remainder:any}'), (n = i);
        }
        var o = r.parent,
          a = (function (t) {
            if (!k(t)) return !1;
            var e = '^' === t.charAt(0);
            return { val: e ? t.substring(1) : t, root: e };
          })(n.url),
          u = a ? t.compile(a.val, { state: n }) : n.url;
        if (!u) return null;
        if (!t.isMatcher(u))
          throw new Error("Invalid url '" + u + "' in state '" + r + "'");
        return a && a.root ? u : ((o && o.navigable) || e()).url.append(u);
      };
    },
    Ae = function (t) {
      return function (e) {
        return !t(e) && e.url ? e : e.parent ? e.parent.navigable : null;
      };
    };
  function De(t) {
    return t.parent ? t.parent.path.concat(t) : [t];
  }
  function qe(t) {
    var e = t.parent ? B({}, t.parent.includes) : {};
    return (e[t.name] = !0), e;
  }
  function Ue(t) {
    var e = function (t) {
        return t.provide || t.token;
      },
      r = _([
        [
          s('resolveFn'),
          function (t) {
            return new Ce(e(t), t.resolveFn, t.deps, t.policy);
          },
        ],
        [
          s('useFactory'),
          function (t) {
            return new Ce(
              e(t),
              t.useFactory,
              t.deps || t.dependencies,
              t.policy,
            );
          },
        ],
        [
          s('useClass'),
          function (t) {
            return new Ce(
              e(t),
              function () {
                return new t.useClass();
              },
              [],
              t.policy,
            );
          },
        ],
        [
          s('useValue'),
          function (t) {
            return new Ce(
              e(t),
              function () {
                return t.useValue;
              },
              [],
              t.policy,
              t.useValue,
            );
          },
        ],
        [
          s('useExisting'),
          function (t) {
            return new Ce(e(t), z, [t.useExisting], t.policy);
          },
        ],
      ]),
      n = _([
        [
          u(s('val'), k),
          function (t) {
            return new Ce(t.token, z, [t.val], t.policy);
          },
        ],
        [
          u(s('val'), x),
          function (t) {
            return new Ce(t.token, Tt(t.val), t.val.slice(0, -1), t.policy);
          },
        ],
        [
          u(s('val'), P),
          function (t) {
            return new Ce(
              t.token,
              t.val,
              (function (t) {
                var e = D.$injector;
                return (
                  t.$inject || (e && e.annotate(t, e.strictDi)) || 'deferred'
                );
              })(t.val),
              t.policy,
            );
          },
        ],
      ]),
      i = _([
        [
          m(Ce),
          function (t) {
            return t;
          },
        ],
        [
          function (t) {
            return !(!t.token || !t.resolveFn);
          },
          r,
        ],
        [
          function (t) {
            return !(
              (!t.provide && !t.token) ||
              !(t.useValue || t.useFactory || t.useExisting || t.useClass)
            );
          },
          r,
        ],
        [
          function (t) {
            return !!(t && t.val && (k(t.val) || x(t.val) || P(t.val)));
          },
          n,
        ],
        [
          y(!0),
          function (t) {
            throw new Error('Invalid resolve value: ' + zt(t));
          },
        ],
      ]),
      o = t.resolve;
    return (
      x(o)
        ? o
        : (function (t, e) {
            return Object.keys(t || {}).map(function (r) {
              return { token: r, val: t[r], deps: void 0, policy: e[r] };
            });
          })(o, t.resolvePolicy || {})
    ).map(i);
  }
  var Ne,
    Fe,
    Le = (function () {
      function t(t, e) {
        this.matcher = t;
        var r,
          n = this,
          i = function () {
            return t.find('');
          },
          o = function (t) {
            return '' === t.name;
          };
        this.builders = {
          name: [je],
          self: [Ve],
          parent: [
            function (e) {
              return o(e) ? null : t.find(n.parentName(e)) || i();
            },
          ],
          data: [Ie],
          url: [He(e, i)],
          navigable: [Ae(o)],
          params: [
            ((r = e.paramFactory),
            function (t) {
              var e = (t.url && t.url.parameters({ inherit: !1 })) || [],
                n = pt(
                  lt(ut(t.params || {}, e.map(s('id'))), function (e, n) {
                    return r.fromConfig(n, null, t.self);
                  }),
                );
              return e
                .concat(n)
                .map(function (t) {
                  return [t.id, t];
                })
                .reduce(Pt, {});
            }),
          ],
          views: [],
          path: [De],
          includes: [qe],
          resolvables: [Ue],
        };
      }
      return (
        (t.prototype.builder = function (t, e) {
          var r = this.builders,
            n = r[t] || [];
          return k(t) && !R(e)
            ? n.length > 1
              ? n
              : n[0]
            : k(t) && P(e)
            ? ((r[t] = n),
              r[t].push(e),
              function () {
                return r[t].splice(r[t].indexOf(e, 1)) && null;
              })
            : void 0;
        }),
        (t.prototype.build = function (t) {
          var e = this.matcher,
            r = this.builders,
            n = this.parentName(t);
          if (n && !e.find(n, void 0, !1)) return null;
          for (var i in r)
            if (r.hasOwnProperty(i)) {
              var o = r[i].reduce(function (t, e) {
                return function (r) {
                  return e(r, t);
                };
              }, W);
              t[i] = o(t);
            }
          return t;
        }),
        (t.prototype.parentName = function (t) {
          var e = t.name || '',
            r = e.split('.');
          if (('**' === r.pop() && r.pop(), r.length)) {
            if (t.parent)
              throw new Error(
                "States that specify the 'parent:' property should not have a '.' in their name (" +
                  e +
                  ')',
              );
            return r.join('.');
          }
          return t.parent ? (k(t.parent) ? t.parent : t.parent.name) : '';
        }),
        (t.prototype.name = function (t) {
          var e = t.name;
          if (-1 !== e.indexOf('.') || !t.parent) return e;
          var r = k(t.parent) ? t.parent : t.parent.name;
          return r ? r + '.' + e : e;
        }),
        t
      );
    })(),
    Me = (function () {
      function t(e) {
        return t.create(e || {});
      }
      return (
        (t.create = function (e) {
          e = t.isStateClass(e) ? new e() : e;
          var r = Q(Q(e, t.prototype));
          return (
            (e.$$state = function () {
              return r;
            }),
            (r.self = e),
            (r.__stateObjectCache = { nameGlob: Ht.fromString(r.name) }),
            r
          );
        }),
        (t.prototype.is = function (t) {
          return this === t || this.self === t || this.fqn() === t;
        }),
        (t.prototype.fqn = function () {
          if (!(this.parent && this.parent instanceof this.constructor))
            return this.name;
          var t = this.parent.fqn();
          return t ? t + '.' + this.name : this.name;
        }),
        (t.prototype.root = function () {
          return (this.parent && this.parent.root()) || this;
        }),
        (t.prototype.parameters = function (t) {
          return (
            ((t = nt(t, { inherit: !0, matchingKeys: null })).inherit &&
              this.parent &&
              this.parent.parameters()) ||
            []
          )
            .concat(pt(this.params))
            .filter(function (e) {
              return !t.matchingKeys || t.matchingKeys.hasOwnProperty(e.id);
            });
        }),
        (t.prototype.parameter = function (t, e) {
          return (
            void 0 === e && (e = {}),
            (this.url && this.url.parameter(t, e)) ||
              ft(pt(this.params), c('id', t)) ||
              (e.inherit && this.parent && this.parent.parameter(t))
          );
        }),
        (t.prototype.toString = function () {
          return this.fqn();
        }),
        (t.isStateClass = function (t) {
          return P(t) && !0 === t.__uiRouterState;
        }),
        (t.isStateDeclaration = function (t) {
          return P(t.$$state);
        }),
        (t.isState = function (t) {
          return O(t.__stateObjectCache);
        }),
        t
      );
    })(),
    Be = (function () {
      function t(t) {
        this._states = t;
      }
      return (
        (t.prototype.isRelative = function (t) {
          return 0 === (t = t || '').indexOf('.') || 0 === t.indexOf('^');
        }),
        (t.prototype.find = function (t, e, r) {
          if ((void 0 === r && (r = !0), t || '' === t)) {
            var n = k(t),
              i = n ? t : t.name;
            this.isRelative(i) && (i = this.resolvePath(i, e));
            var o = this._states[i];
            if (o && (n || !(n || (o !== t && o.self !== t)))) return o;
            if (n && r) {
              var a = pt(this._states).filter(function (t) {
                return (
                  t.__stateObjectCache.nameGlob &&
                  t.__stateObjectCache.nameGlob.matches(i)
                );
              });
              return (
                a.length > 1 &&
                  ne.error(
                    'stateMatcher.find: Found multiple matches for ' +
                      i +
                      ' using glob: ',
                    a.map(function (t) {
                      return t.name;
                    }),
                  ),
                a[0]
              );
            }
          }
        }),
        (t.prototype.resolvePath = function (t, e) {
          if (!e)
            throw new Error("No reference point given for path '" + t + "'");
          for (
            var r = this.find(e), n = t.split('.'), i = n.length, o = 0, a = r;
            o < i;
            o++
          )
            if ('' !== n[o] || 0 !== o) {
              if ('^' !== n[o]) break;
              if (!a.parent)
                throw new Error(
                  "Path '" + t + "' not valid for state '" + r.name + "'",
                );
              a = a.parent;
            } else a = r;
          var u = n.slice(o).join('.');
          return a.name + (a.name && u ? '.' : '') + u;
        }),
        t
      );
    })(),
    Ge = (function () {
      function t(t, e, r, n) {
        (this.router = t),
          (this.states = e),
          (this.builder = r),
          (this.listeners = n),
          (this.queue = []);
      }
      return (
        (t.prototype.dispose = function () {
          this.queue = [];
        }),
        (t.prototype.register = function (t) {
          var e = this.queue,
            r = Me.create(t),
            n = r.name;
          if (!k(n)) throw new Error('State must have a valid name');
          if (this.states.hasOwnProperty(n) || K(e.map(s('name')), n))
            throw new Error("State '" + n + "' is already defined");
          return e.push(r), this.flush(), r;
        }),
        (t.prototype.flush = function () {
          for (
            var t = this,
              e = this.queue,
              r = this.states,
              n = this.builder,
              i = [],
              o = [],
              a = {},
              u = function (e) {
                return t.states.hasOwnProperty(e) && t.states[e];
              },
              s = function () {
                i.length &&
                  t.listeners.forEach(function (t) {
                    return t(
                      'registered',
                      i.map(function (t) {
                        return t.self;
                      }),
                    );
                  });
              };
            e.length > 0;

          ) {
            var c = e.shift(),
              f = c.name,
              l = n.build(c),
              h = o.indexOf(c);
            if (l) {
              var p = u(f);
              if (p && p.name === f)
                throw new Error("State '" + f + "' is already defined");
              var v = u(f + '.**');
              v && this.router.stateRegistry.deregister(v),
                (r[f] = c),
                this.attachRoute(c),
                h >= 0 && o.splice(h, 1),
                i.push(c);
            } else {
              var d = a[f];
              if (((a[f] = e.length), h >= 0 && d === e.length))
                return e.push(c), s(), r;
              h < 0 && o.push(c), e.push(c);
            }
          }
          return s(), r;
        }),
        (t.prototype.attachRoute = function (t) {
          if (!t.abstract && t.url) {
            var e = this.router.urlService.rules;
            e.rule(e.urlRuleFactory.create(t));
          }
        }),
        t
      );
    })(),
    ze = (function () {
      function t(t) {
        (this.router = t),
          (this.states = {}),
          (this.listeners = []),
          (this.matcher = new Be(this.states)),
          (this.builder = new Le(this.matcher, t.urlMatcherFactory)),
          (this.stateQueue = new Ge(
            t,
            this.states,
            this.builder,
            this.listeners,
          )),
          this._registerRoot();
      }
      return (
        (t.prototype._registerRoot = function () {
          (this._root = this.stateQueue.register({
            name: '',
            url: '^',
            views: null,
            params: { '#': { value: null, type: 'hash', dynamic: !0 } },
            abstract: !0,
          })).navigable = null;
        }),
        (t.prototype.dispose = function () {
          var t = this;
          this.stateQueue.dispose(),
            (this.listeners = []),
            this.get().forEach(function (e) {
              return t.get(e) && t.deregister(e);
            });
        }),
        (t.prototype.onStatesChanged = function (t) {
          return (
            this.listeners.push(t),
            function () {
              Z(this.listeners)(t);
            }.bind(this)
          );
        }),
        (t.prototype.root = function () {
          return this._root;
        }),
        (t.prototype.register = function (t) {
          return this.stateQueue.register(t);
        }),
        (t.prototype._deregisterTree = function (t) {
          var e = this,
            r = this.get().map(function (t) {
              return t.$$state();
            }),
            n = function (t) {
              var e = r.filter(function (e) {
                return -1 !== t.indexOf(e.parent);
              });
              return 0 === e.length ? e : e.concat(n(e));
            },
            i = n([t]),
            o = [t].concat(i).reverse();
          return (
            o.forEach(function (t) {
              var r = e.router.urlService.rules;
              r
                .rules()
                .filter(c('state', t))
                .forEach(function (t) {
                  return r.removeRule(t);
                }),
                delete e.states[t.name];
            }),
            o
          );
        }),
        (t.prototype.deregister = function (t) {
          var e = this.get(t);
          if (!e) throw new Error("Can't deregister state; not found: " + t);
          var r = this._deregisterTree(e.$$state());
          return (
            this.listeners.forEach(function (t) {
              return t(
                'deregistered',
                r.map(function (t) {
                  return t.self;
                }),
              );
            }),
            r
          );
        }),
        (t.prototype.get = function (t, e) {
          var r = this;
          if (0 === arguments.length)
            return Object.keys(this.states).map(function (t) {
              return r.states[t].self;
            });
          var n = this.matcher.find(t, e);
          return (n && n.self) || null;
        }),
        (t.prototype.decorator = function (t, e) {
          return this.builder.builder(t, e);
        }),
        t
      );
    })();
  ((Ne = t.TransitionHookPhase || (t.TransitionHookPhase = {}))[
    (Ne.CREATE = 0)
  ] = 'CREATE'),
    (Ne[(Ne.BEFORE = 1)] = 'BEFORE'),
    (Ne[(Ne.RUN = 2)] = 'RUN'),
    (Ne[(Ne.SUCCESS = 3)] = 'SUCCESS'),
    (Ne[(Ne.ERROR = 4)] = 'ERROR'),
    ((Fe = t.TransitionHookScope || (t.TransitionHookScope = {}))[
      (Fe.TRANSITION = 0)
    ] = 'TRANSITION'),
    (Fe[(Fe.STATE = 1)] = 'STATE');
  var We = { current: W, transition: null, traceData: {}, bind: null },
    Je = (function () {
      function e(e, r, n, i) {
        var o = this;
        (this.transition = e),
          (this.stateContext = r),
          (this.registeredHook = n),
          (this.options = i),
          (this.isSuperseded = function () {
            return (
              o.type.hookPhase === t.TransitionHookPhase.RUN &&
              !o.options.transition.isActive()
            );
          }),
          (this.options = nt(i, We)),
          (this.type = n.eventType);
      }
      return (
        (e.chain = function (t, e) {
          return t.reduce(function (t, e) {
            return t.then(function () {
              return e.invokeHook();
            });
          }, e || D.$q.when());
        }),
        (e.invokeHooks = function (t, r) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n].invokeHook();
            if (H(i)) {
              var o = t.slice(n + 1);
              return e.chain(o, i).then(r);
            }
          }
          return r();
        }),
        (e.runAllHooks = function (t) {
          t.forEach(function (t) {
            return t.invokeHook();
          });
        }),
        (e.prototype.logError = function (t) {
          this.transition.router.stateService.defaultErrorHandler()(t);
        }),
        (e.prototype.invokeHook = function () {
          var t = this,
            e = this.registeredHook;
          if (!e._deregistered) {
            var r = this.getNotCurrentRejection();
            if (r) return r;
            var n = this.options;
            le.traceHookInvocation(this, this.transition, n);
            var i = function (r) {
                return e.eventType.getErrorHandler(t)(r);
              },
              o = function (r) {
                return e.eventType.getResultHandler(t)(r);
              };
            try {
              var a = e.callback.call(n.bind, t.transition, t.stateContext);
              return !this.type.synchronous && H(a)
                ? a
                    .catch(function (t) {
                      return qt.normalize(t).toPromise();
                    })
                    .then(o, i)
                : o(a);
            } catch (t) {
              return i(qt.normalize(t));
            } finally {
              e.invokeLimit &&
                ++e.invokeCount >= e.invokeLimit &&
                e.deregister();
            }
          }
        }),
        (e.prototype.handleHookResult = function (t) {
          var e = this,
            r = this.getNotCurrentRejection();
          return (
            r ||
            (H(t)
              ? t.then(function (t) {
                  return e.handleHookResult(t);
                })
              : (le.traceHookResult(t, this.transition, this.options),
                !1 === t
                  ? qt.aborted('Hook aborted transition').toPromise()
                  : m($e)(t)
                  ? qt.redirected(t).toPromise()
                  : void 0))
          );
        }),
        (e.prototype.getNotCurrentRejection = function () {
          var t = this.transition.router;
          return t._disposed
            ? qt
                .aborted(
                  'UIRouter instance #' +
                    t.$id +
                    ' has been stopped (disposed)',
                )
                .toPromise()
            : this.transition._aborted
            ? qt.aborted().toPromise()
            : this.isSuperseded()
            ? qt.superseded(this.options.current()).toPromise()
            : void 0;
        }),
        (e.prototype.toString = function () {
          var t = this.options,
            e = this.registeredHook;
          return (
            (f('traceData.hookType')(t) || 'internal') +
            ' context: ' +
            (f('traceData.context.state.name')(t) ||
              f('traceData.context')(t) ||
              'unknown') +
            ', ' +
            Ut(200, Mt(e.callback))
          );
        }),
        (e.HANDLE_RESULT = function (t) {
          return function (e) {
            return t.handleHookResult(e);
          };
        }),
        (e.LOG_REJECTED_RESULT = function (t) {
          return function (e) {
            H(e) &&
              e.catch(function (e) {
                return t.logError(qt.normalize(e));
              });
          };
        }),
        (e.LOG_ERROR = function (t) {
          return function (e) {
            return t.logError(e);
          };
        }),
        (e.REJECT_ERROR = function (t) {
          return function (t) {
            return It(t);
          };
        }),
        (e.THROW_ERROR = function (t) {
          return function (t) {
            throw t;
          };
        }),
        e
      );
    })();
  function Qe(t, e, r) {
    var n = k(e) ? [e] : e;
    return !!(
      P(n)
        ? n
        : function (t) {
            for (var e = n, r = 0; r < e.length; r++) {
              var i = new Ht(e[r]);
              if ((i && i.matches(t.name)) || (!i && e[r] === t.name))
                return !0;
            }
            return !1;
          }
    )(t, r);
  }
  var Ke = (function () {
    function e(t, e, r, n, i, o) {
      void 0 === o && (o = {}),
        (this.tranSvc = t),
        (this.eventType = e),
        (this.callback = r),
        (this.matchCriteria = n),
        (this.removeHookFromRegistry = i),
        (this.invokeCount = 0),
        (this._deregistered = !1),
        (this.priority = o.priority || 0),
        (this.bind = o.bind || null),
        (this.invokeLimit = o.invokeLimit);
    }
    return (
      (e.prototype._matchingNodes = function (t, e, r) {
        if (!0 === e) return t;
        var n = t.filter(function (t) {
          return Qe(t.state, e, r);
        });
        return n.length ? n : null;
      }),
      (e.prototype._getDefaultMatchCriteria = function () {
        return lt(this.tranSvc._pluginapi._getPathTypes(), function () {
          return !0;
        });
      }),
      (e.prototype._getMatchingNodes = function (e, r) {
        var n = this,
          i = B(this._getDefaultMatchCriteria(), this.matchCriteria);
        return pt(this.tranSvc._pluginapi._getPathTypes()).reduce(function (
          o,
          a,
        ) {
          var u = a.scope === t.TransitionHookScope.STATE,
            s = e[a.name] || [],
            c = u ? s : [Tt(s)];
          return (o[a.name] = n._matchingNodes(c, i[a.name], r)), o;
        },
        {});
      }),
      (e.prototype.matches = function (t, e) {
        var r = this._getMatchingNodes(t, e);
        return pt(r).every(z) ? r : null;
      }),
      (e.prototype.deregister = function () {
        this.removeHookFromRegistry(this), (this._deregistered = !0);
      }),
      e
    );
  })();
  function Ye(t, e, r) {
    var n = ((t._registeredHooks = t._registeredHooks || {})[r.name] = []),
      i = Z(n);
    function o(t, o, a) {
      void 0 === a && (a = {});
      var u = new Ke(e, r, o, t, i, a);
      return n.push(u), u.deregister.bind(u);
    }
    return (t[r.name] = o), o;
  }
  var Ze = (function () {
    function e(t) {
      this.transition = t;
    }
    return (
      (e.prototype.buildHooksForPhase = function (t) {
        var e = this;
        return this.transition.router.transitionService._pluginapi
          ._getEvents(t)
          .map(function (t) {
            return e.buildHooks(t);
          })
          .reduce(mt, [])
          .filter(z);
      }),
      (e.prototype.buildHooks = function (e) {
        var r = this.transition,
          n = r.treeChanges(),
          i = this.getMatchingHooks(e, n, r);
        if (!i) return [];
        var o = { transition: r, current: r.options().current };
        return i
          .map(function (i) {
            return i.matches(n, r)[e.criteriaMatchPath.name].map(function (n) {
              var a = B(
                  { bind: i.bind, traceData: { hookType: e.name, context: n } },
                  o,
                ),
                u =
                  e.criteriaMatchPath.scope === t.TransitionHookScope.STATE
                    ? n.state.self
                    : null,
                s = new Je(r, u, i, a);
              return { hook: i, node: n, transitionHook: s };
            });
          })
          .reduce(mt, [])
          .sort(
            (function (t) {
              void 0 === t && (t = !1);
              return function (e, r) {
                var n = t ? -1 : 1,
                  i = (e.node.state.path.length - r.node.state.path.length) * n;
                return 0 !== i ? i : r.hook.priority - e.hook.priority;
              };
            })(e.reverseSort),
          )
          .map(function (t) {
            return t.transitionHook;
          });
      }),
      (e.prototype.getMatchingHooks = function (e, r, n) {
        var i = e.hookPhase === t.TransitionHookPhase.CREATE,
          o = this.transition.router.transitionService;
        return (i ? [o] : [this.transition, o])
          .map(function (t) {
            return t.getHooks(e.name);
          })
          .filter($t(x, 'broken event named: ' + e.name))
          .reduce(mt, [])
          .filter(function (t) {
            return t.matches(r, n);
          });
      }),
      e
    );
  })();
  var Xe = s('self'),
    tr = (function () {
      function e(e, r, n) {
        var i = this;
        if (
          ((this._deferred = D.$q.defer()),
          (this.promise = this._deferred.promise),
          (this._registeredHooks = {}),
          (this._hookBuilder = new Ze(this)),
          (this.isActive = function () {
            return i.router.globals.transition === i;
          }),
          (this.router = n),
          (this._targetState = r),
          !r.valid())
        )
          throw new Error(r.error());
        (this._options = B({ current: y(this) }, r.options())),
          (this.$id = n.transitionService._transitionCount++);
        var o = be.buildToPath(e, r);
        (this._treeChanges = be.treeChanges(e, o, this._options.reloadState)),
          this.createTransitionHookRegFns();
        var a = this._hookBuilder.buildHooksForPhase(
          t.TransitionHookPhase.CREATE,
        );
        Je.invokeHooks(a, function () {
          return null;
        }),
          this.applyViewConfigs(n);
      }
      return (
        (e.prototype.onBefore = function (t, e, r) {}),
        (e.prototype.onStart = function (t, e, r) {}),
        (e.prototype.onExit = function (t, e, r) {}),
        (e.prototype.onRetain = function (t, e, r) {}),
        (e.prototype.onEnter = function (t, e, r) {}),
        (e.prototype.onFinish = function (t, e, r) {}),
        (e.prototype.onSuccess = function (t, e, r) {}),
        (e.prototype.onError = function (t, e, r) {}),
        (e.prototype.createTransitionHookRegFns = function () {
          var e = this;
          this.router.transitionService._pluginapi
            ._getEvents()
            .filter(function (e) {
              return e.hookPhase !== t.TransitionHookPhase.CREATE;
            })
            .forEach(function (t) {
              return Ye(e, e.router.transitionService, t);
            });
        }),
        (e.prototype.getHooks = function (t) {
          return this._registeredHooks[t];
        }),
        (e.prototype.applyViewConfigs = function (t) {
          var e = this._treeChanges.entering.map(function (t) {
            return t.state;
          });
          be.applyViewConfigs(
            t.transitionService.$view,
            this._treeChanges.to,
            e,
          );
        }),
        (e.prototype.$from = function () {
          return Tt(this._treeChanges.from).state;
        }),
        (e.prototype.$to = function () {
          return Tt(this._treeChanges.to).state;
        }),
        (e.prototype.from = function () {
          return this.$from().self;
        }),
        (e.prototype.to = function () {
          return this.$to().self;
        }),
        (e.prototype.targetState = function () {
          return this._targetState;
        }),
        (e.prototype.is = function (t) {
          return t instanceof e
            ? this.is({ to: t.$to().name, from: t.$from().name })
            : !(
                (t.to && !Qe(this.$to(), t.to, this)) ||
                (t.from && !Qe(this.$from(), t.from, this))
              );
        }),
        (e.prototype.params = function (t) {
          return (
            void 0 === t && (t = 'to'),
            Object.freeze(
              this._treeChanges[t].map(s('paramValues')).reduce(it, {}),
            )
          );
        }),
        (e.prototype.paramsChanged = function () {
          var t = this.params('from'),
            e = this.params('to'),
            r = []
              .concat(this._treeChanges.to)
              .concat(this._treeChanges.from)
              .map(function (t) {
                return t.paramSchema;
              })
              .reduce(gt, [])
              .reduce(wt, []);
          return ye.changed(r, t, e).reduce(function (t, r) {
            return (t[r.id] = e[r.id]), t;
          }, {});
        }),
        (e.prototype.injector = function (t, e) {
          void 0 === e && (e = 'to');
          var r = this._treeChanges[e];
          return (
            t &&
              (r = be.subPath(r, function (e) {
                return e.state === t || e.state.name === t;
              })),
            new Oe(r).injector()
          );
        }),
        (e.prototype.getResolveTokens = function (t) {
          return (
            void 0 === t && (t = 'to'), new Oe(this._treeChanges[t]).getTokens()
          );
        }),
        (e.prototype.addResolvable = function (t, e) {
          void 0 === e && (e = ''), (t = m(Ce)(t) ? t : new Ce(t));
          var r = 'string' == typeof e ? e : e.name,
            n = this._treeChanges.to,
            i = ft(n, function (t) {
              return t.state.name === r;
            });
          new Oe(n).addResolvables([t], i.state);
        }),
        (e.prototype.redirectedFrom = function () {
          return this._options.redirectedFrom || null;
        }),
        (e.prototype.originalTransition = function () {
          var t = this.redirectedFrom();
          return (t && t.originalTransition()) || this;
        }),
        (e.prototype.options = function () {
          return this._options;
        }),
        (e.prototype.entering = function () {
          return ht(this._treeChanges.entering, s('state')).map(Xe);
        }),
        (e.prototype.exiting = function () {
          return ht(this._treeChanges.exiting, s('state')).map(Xe).reverse();
        }),
        (e.prototype.retained = function () {
          return ht(this._treeChanges.retained, s('state')).map(Xe);
        }),
        (e.prototype.views = function (t, e) {
          void 0 === t && (t = 'entering');
          var r = this._treeChanges[t];
          return (r = e ? r.filter(c('state', e)) : r)
            .map(s('views'))
            .filter(z)
            .reduce(mt, []);
        }),
        (e.prototype.treeChanges = function (t) {
          return t ? this._treeChanges[t] : this._treeChanges;
        }),
        (e.prototype.redirect = function (t) {
          for (var e = 1, r = this; null != (r = r.redirectedFrom()); )
            if (++e > 20)
              throw new Error(
                'Too many consecutive Transition redirects (20+)',
              );
          var n = { redirectedFrom: this, source: 'redirect' };
          'url' === this.options().source &&
            !1 !== t.options().location &&
            (n.location = 'replace');
          var i = B({}, this.options(), t.options(), n);
          t = t.withOptions(i, !0);
          var o,
            a = this.router.transitionService.create(this._treeChanges.from, t),
            u = this._treeChanges.entering,
            s = a._treeChanges.entering;
          return (
            be
              .matching(s, u, be.nonDynamicParams)
              .filter(
                l(
                  ((o = t.options().reloadState),
                  function (t) {
                    return o && t.state.includes[o.name];
                  }),
                ),
              )
              .forEach(function (t, e) {
                t.resolvables = u[e].resolvables;
              }),
            a
          );
        }),
        (e.prototype._changedParams = function () {
          var t = this._treeChanges;
          if (
            !this._options.reload &&
            !t.exiting.length &&
            !t.entering.length &&
            t.to.length === t.from.length &&
            !Ct(t.to, t.from)
              .map(function (t) {
                return t[0].state !== t[1].state;
              })
              .reduce(dt, !1)
          ) {
            var e = t.to.map(function (t) {
                return t.paramSchema;
              }),
              r = [t.to, t.from].map(function (t) {
                return t.map(function (t) {
                  return t.paramValues;
                });
              });
            return Ct(e, r[0], r[1])
              .map(function (t) {
                var e = t[0],
                  r = t[1],
                  n = t[2];
                return ye.changed(e, r, n);
              })
              .reduce(mt, []);
          }
        }),
        (e.prototype.dynamic = function () {
          var t = this._changedParams();
          return (
            !!t &&
            t
              .map(function (t) {
                return t.dynamic;
              })
              .reduce(dt, !1)
          );
        }),
        (e.prototype.ignored = function () {
          return !!this._ignoredReason();
        }),
        (e.prototype._ignoredReason = function () {
          var t = this.router.globals.transition,
            e = this._options.reloadState,
            r = function (t, r) {
              if (t.length !== r.length) return !1;
              var n = be.matching(t, r);
              return (
                t.length ===
                n.filter(function (t) {
                  return !e || !t.state.includes[e.name];
                }).length
              );
            },
            n = this.treeChanges(),
            i = t && t.treeChanges();
          return i && r(i.to, n.to) && r(i.exiting, n.exiting)
            ? 'SameAsPending'
            : 0 === n.exiting.length &&
              0 === n.entering.length &&
              r(n.from, n.to)
            ? 'SameAsCurrent'
            : void 0;
        }),
        (e.prototype.run = function () {
          var e = this,
            r = Je.runAllHooks,
            n = function (t) {
              return e._hookBuilder.buildHooksForPhase(t);
            },
            i = n(t.TransitionHookPhase.BEFORE);
          return (
            Je.invokeHooks(i, function () {
              var t = e.router.globals;
              return (
                (t.lastStartedTransitionId = e.$id),
                (t.transition = e),
                t.transitionHistory.enqueue(e),
                le.traceTransitionStart(e),
                D.$q.when(void 0)
              );
            })
              .then(function () {
                var e = n(t.TransitionHookPhase.RUN);
                return Je.invokeHooks(e, function () {
                  return D.$q.when(void 0);
                });
              })
              .then(
                function () {
                  le.traceSuccess(e.$to(), e),
                    (e.success = !0),
                    e._deferred.resolve(e.to()),
                    r(n(t.TransitionHookPhase.SUCCESS));
                },
                function (i) {
                  le.traceError(i, e),
                    (e.success = !1),
                    e._deferred.reject(i),
                    (e._error = i),
                    r(n(t.TransitionHookPhase.ERROR));
                },
              ),
            this.promise
          );
        }),
        (e.prototype.valid = function () {
          return !this.error() || void 0 !== this.success;
        }),
        (e.prototype.abort = function () {
          b(this.success) && (this._aborted = !0);
        }),
        (e.prototype.error = function () {
          var t = this.$to();
          if (t.self.abstract)
            return qt.invalid(
              "Cannot transition to abstract state '" + t.name + "'",
            );
          var e = t.parameters(),
            r = this.params(),
            n = e.filter(function (t) {
              return !t.validates(r[t.id]);
            });
          if (n.length) {
            var i = n
                .map(function (t) {
                  return '[' + t.id + ':' + zt(r[t.id]) + ']';
                })
                .join(', '),
              o =
                "The following parameter values are not valid for state '" +
                t.name +
                "': " +
                i;
            return qt.invalid(o);
          }
          return !1 === this.success ? this._error : void 0;
        }),
        (e.prototype.toString = function () {
          var t = this.from(),
            e = this.to(),
            r = function (t) {
              return null !== t['#'] && void 0 !== t['#'] ? t : ut(t, ['#']);
            };
          return (
            'Transition#' +
            this.$id +
            "( '" +
            (O(t) ? t.name : t) +
            "'" +
            zt(r(this._treeChanges.from.map(s('paramValues')).reduce(it, {}))) +
            ' -> ' +
            (this.valid() ? '' : '(X) ') +
            "'" +
            (O(e) ? e.name : e) +
            "'" +
            zt(r(this.params())) +
            ' )'
          );
        }),
        (e.diToken = e),
        e
      );
    })();
  function er(t, e) {
    var r = ['', ''],
      n = t.replace(/[\\\[\]\^$*+?.()|{}]/g, '\\$&');
    if (!e) return n;
    switch (e.squash) {
      case !1:
        r = ['(', ')' + (e.isOptional ? '?' : '')];
        break;
      case !0:
        (n = n.replace(/\/$/, '')), (r = ['(?:/(', ')|/)?']);
        break;
      default:
        r = ['(' + e.squash + '|', ')?'];
    }
    return n + r[0] + e.type.pattern.source + r[1];
  }
  var rr = te('/'),
    nr = {
      state: { params: {} },
      strict: !0,
      caseInsensitive: !0,
      decodeParams: !0,
    },
    ir = (function () {
      function e(t, r, n, i) {
        var o = this;
        (this._cache = { path: [this] }),
          (this._children = []),
          (this._params = []),
          (this._segments = []),
          (this._compiled = []),
          (this.config = i = nt(i, nr)),
          (this.pattern = t);
        for (
          var a,
            u,
            s,
            f =
              /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
            l =
              /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
            h = [],
            p = 0,
            v = function (r) {
              if (!e.nameValidator.test(r))
                throw new Error(
                  "Invalid parameter name '" + r + "' in pattern '" + t + "'",
                );
              if (ft(o._params, c('id', r)))
                throw new Error(
                  "Duplicate parameter name '" + r + "' in pattern '" + t + "'",
                );
            },
            d = function (e, n) {
              var i,
                a = e[2] || e[3],
                u = n ? e[4] : e[4] || ('*' === e[1] ? '[\\s\\S]*' : null);
              return {
                id: a,
                regexp: u,
                segment: t.substring(p, e.index),
                type: u
                  ? r.type(u) ||
                    ((i = u),
                    Q(r.type(n ? 'query' : 'path'), {
                      pattern: new RegExp(
                        i,
                        o.config.caseInsensitive ? 'i' : void 0,
                      ),
                    }))
                  : null,
              };
            };
          (a = f.exec(t)) && !((u = d(a, !1)).segment.indexOf('?') >= 0);

        )
          v(u.id),
            this._params.push(n.fromPath(u.id, u.type, i.state)),
            this._segments.push(u.segment),
            h.push([u.segment, Tt(this._params)]),
            (p = f.lastIndex);
        var m = (s = t.substring(p)).indexOf('?');
        if (m >= 0) {
          var g = s.substring(m);
          if (((s = s.substring(0, m)), g.length > 0))
            for (p = 0; (a = l.exec(g)); )
              v((u = d(a, !0)).id),
                this._params.push(n.fromSearch(u.id, u.type, i.state)),
                (p = f.lastIndex);
        }
        this._segments.push(s),
          (this._compiled = h
            .map(function (t) {
              return er.apply(null, t);
            })
            .concat(er(s)));
      }
      return (
        (e.encodeDashes = function (t) {
          return encodeURIComponent(t).replace(/-/g, function (t) {
            return '%5C%' + t.charCodeAt(0).toString(16).toUpperCase();
          });
        }),
        (e.pathSegmentsAndParams = function (e) {
          return Ct(
            e._segments,
            e._params
              .filter(function (e) {
                return e.location === t.DefType.PATH;
              })
              .concat(void 0),
          )
            .reduce(mt, [])
            .filter(function (t) {
              return '' !== t && R(t);
            });
        }),
        (e.queryParams = function (e) {
          return e._params.filter(function (e) {
            return e.location === t.DefType.SEARCH;
          });
        }),
        (e.compare = function (t, r) {
          var n = function (t) {
              return (t._cache.weights =
                t._cache.weights ||
                (function (t) {
                  return (t._cache.segments =
                    t._cache.segments ||
                    t._cache.path
                      .map(e.pathSegmentsAndParams)
                      .reduce(mt, [])
                      .reduce(ee, [])
                      .map(function (t) {
                        return k(t) ? rr(t) : t;
                      })
                      .reduce(mt, []));
                })(t).map(function (t) {
                  return '/' === t
                    ? 1
                    : k(t)
                    ? 2
                    : t instanceof ye
                    ? 3
                    : void 0;
                }));
            },
            i = n(t),
            o = n(r);
          !(function (t, e, r) {
            for (var n = Math.max(t.length, e.length); t.length < n; )
              t.push(r);
            for (; e.length < n; ) e.push(r);
          })(i, o, 0);
          var a,
            u,
            s = Ct(i, o);
          for (u = 0; u < s.length; u++)
            if (0 !== (a = s[u][0] - s[u][1])) return a;
          return 0;
        }),
        (e.prototype.append = function (t) {
          return (
            this._children.push(t),
            (t._cache = {
              path: this._cache.path.concat(t),
              parent: this,
              pattern: null,
            }),
            t
          );
        }),
        (e.prototype.isRoot = function () {
          return this._cache.path[0] === this;
        }),
        (e.prototype.toString = function () {
          return this.pattern;
        }),
        (e.prototype._getDecodedParamValue = function (t, e) {
          return (
            R(t) &&
              (this.config.decodeParams &&
                !e.type.raw &&
                (t = x(t)
                  ? t.map(function (t) {
                      return decodeURIComponent(t);
                    })
                  : decodeURIComponent(t)),
              (t = e.type.decode(t))),
            e.value(t)
          );
        }),
        (e.prototype.exec = function (t, e, r, n) {
          var i = this;
          void 0 === e && (e = {});
          var o,
            a,
            u,
            c = ((o = this._cache),
            (a = 'pattern'),
            (u = function () {
              return new RegExp(
                [
                  '^',
                  _t(i._cache.path.map(s('_compiled'))).join(''),
                  !1 === i.config.strict ? '/?' : '',
                  '$',
                ].join(''),
                i.config.caseInsensitive ? 'i' : void 0,
              );
            }),
            (o[a] = o[a] || u())).exec(t);
          if (!c) return null;
          var f,
            l,
            h = this.parameters(),
            p = h.filter(function (t) {
              return !t.isSearch();
            }),
            v = h.filter(function (t) {
              return t.isSearch();
            }),
            d = this._cache.path
              .map(function (t) {
                return t._segments.length - 1;
              })
              .reduce(function (t, e) {
                return t + e;
              }),
            m = {};
          if (d !== c.length - 1)
            throw new Error(
              "Unbalanced capture group in route '" + this.pattern + "'",
            );
          for (var g = 0; g < d; g++) {
            for (var y = p[g], w = c[g + 1], _ = 0; _ < y.replace.length; _++)
              y.replace[_].from === w && (w = y.replace[_].to);
            w &&
              !0 === y.array &&
              ((f = void 0),
              (l = void 0),
              (l = ht(
                (f = function (t) {
                  return t.split('').reverse().join('');
                })(w).split(/-(?!\\)/),
                f,
              )),
              (w = ht(l, function (t) {
                return t.replace(/\\-/g, '-');
              }).reverse())),
              (m[y.id] = this._getDecodedParamValue(w, y));
          }
          return (
            v.forEach(function (t) {
              for (var r = e[t.id], n = 0; n < t.replace.length; n++)
                t.replace[n].from === r && (r = t.replace[n].to);
              m[t.id] = i._getDecodedParamValue(r, t);
            }),
            r && (m['#'] = r),
            m
          );
        }),
        (e.prototype.parameters = function (t) {
          return (
            void 0 === t && (t = {}),
            !1 === t.inherit
              ? this._params
              : _t(
                  this._cache.path.map(function (t) {
                    return t._params;
                  }),
                )
          );
        }),
        (e.prototype.parameter = function (t, e) {
          var r = this;
          void 0 === e && (e = {});
          var n = this._cache.parent;
          return (
            (function () {
              for (var e = 0, n = r._params; e < n.length; e++) {
                var i = n[e];
                if (i.id === t) return i;
              }
            })() ||
            (!1 !== e.inherit && n && n.parameter(t, e)) ||
            null
          );
        }),
        (e.prototype.validates = function (t) {
          return (
            (t = t || {}),
            this.parameters()
              .filter(function (e) {
                return t.hasOwnProperty(e.id);
              })
              .map(function (e) {
                return (function (t, e) {
                  return !t || t.validates(e);
                })(e, t[e.id]);
              })
              .reduce(vt, !0)
          );
        }),
        (e.prototype.format = function (t) {
          void 0 === t && (t = {});
          var r = this._cache.path,
            n = r
              .map(e.pathSegmentsAndParams)
              .reduce(mt, [])
              .map(function (t) {
                return k(t) ? t : o(t);
              }),
            i = r.map(e.queryParams).reduce(mt, []).map(o);
          if (
            n.concat(i).filter(function (t) {
              return !1 === t.isValid;
            }).length
          )
            return null;
          function o(e) {
            var r = e.value(t[e.id]),
              n = e.validates(r),
              i = e.isDefaultValue(r),
              o = !!i && e.squash,
              a = e.type.encode(r);
            return {
              param: e,
              value: r,
              isValid: n,
              isDefaultValue: i,
              squash: o,
              encoded: a,
            };
          }
          var a = n.reduce(function (t, r) {
              if (k(r)) return t + r;
              var n = r.squash,
                i = r.encoded,
                o = r.param;
              return !0 === n
                ? t.match(/\/$/)
                  ? t.slice(0, -1)
                  : t
                : k(n)
                ? t + n
                : !1 !== n || null == i
                ? t
                : x(i)
                ? t + ht(i, e.encodeDashes).join('-')
                : o.raw
                ? t + i
                : t + encodeURIComponent(i);
            }, ''),
            u = i
              .map(function (t) {
                var e = t.param,
                  r = t.squash,
                  n = t.encoded,
                  i = t.isDefaultValue;
                if (
                  !(null == n || (i && !1 !== r)) &&
                  (x(n) || (n = [n]), 0 !== n.length)
                )
                  return (
                    e.raw || (n = ht(n, encodeURIComponent)),
                    n.map(function (t) {
                      return e.id + '=' + t;
                    })
                  );
              })
              .filter(z)
              .reduce(mt, [])
              .join('&');
          return a + (u ? '?' + u : '') + (t['#'] ? '#' + t['#'] : '');
        }),
        (e.nameValidator = /^\w+([-.]+\w+)*(?:\[\])?$/),
        e
      );
    })(),
    or = function () {
      return (or =
        Object.assign ||
        function (t) {
          for (var e, r = 1, n = arguments.length; r < n; r++)
            for (var i in (e = arguments[r]))
              Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i]);
          return t;
        }).apply(this, arguments);
    },
    ar = (function () {
      function e(t) {
        this.router = t;
      }
      return (
        (e.prototype.fromConfig = function (e, r, n) {
          return new ye(
            e,
            r,
            t.DefType.CONFIG,
            this.router.urlService.config,
            n,
          );
        }),
        (e.prototype.fromPath = function (e, r, n) {
          return new ye(e, r, t.DefType.PATH, this.router.urlService.config, n);
        }),
        (e.prototype.fromSearch = function (e, r, n) {
          return new ye(
            e,
            r,
            t.DefType.SEARCH,
            this.router.urlService.config,
            n,
          );
        }),
        e
      );
    })(),
    ur = (function () {
      function t(t) {
        var e = this;
        (this.router = t),
          (this.paramFactory = new ar(this.router)),
          (this.UrlMatcher = ir),
          (this.Param = ye),
          (this.caseInsensitive = function (t) {
            return e.router.urlService.config.caseInsensitive(t);
          }),
          (this.defaultSquashPolicy = function (t) {
            return e.router.urlService.config.defaultSquashPolicy(t);
          }),
          (this.strictMode = function (t) {
            return e.router.urlService.config.strictMode(t);
          }),
          (this.type = function (t, r, n) {
            return e.router.urlService.config.type(t, r, n) || e;
          });
      }
      return (
        (t.prototype.compile = function (t, e) {
          var r = this.router.urlService.config,
            n = e && !e.state && e.params;
          e = n ? or({ state: { params: n } }, e) : e;
          var i = {
            strict: r._isStrictMode,
            caseInsensitive: r._isCaseInsensitive,
            decodeParams: r._decodeParams,
          };
          return new ir(t, r.paramTypes, this.paramFactory, B(i, e));
        }),
        (t.prototype.isMatcher = function (t) {
          if (!O(t)) return !1;
          var e = !0;
          return (
            M(ir.prototype, function (r, n) {
              P(r) && (e = e && R(t[n]) && P(t[n]));
            }),
            e
          );
        }),
        (t.prototype.$get = function () {
          var t = this.router.urlService.config;
          return (
            (t.paramTypes.enqueue = !1), t.paramTypes._flushTypeQueue(), this
          );
        }),
        t
      );
    })(),
    sr = (function () {
      function t(t) {
        this.router = t;
      }
      return (
        (t.prototype.compile = function (t) {
          return this.router.urlMatcherFactory.compile(t);
        }),
        (t.prototype.create = function (t, e) {
          var r = this,
            n = Me.isState,
            i = Me.isStateDeclaration,
            o = _([
              [
                k,
                function (t) {
                  return o(r.compile(t));
                },
              ],
              [
                m(ir),
                function (t) {
                  return r.fromUrlMatcher(t, e);
                },
              ],
              [
                p(n, i),
                function (t) {
                  return r.fromState(t, r.router);
                },
              ],
              [
                m(RegExp),
                function (t) {
                  return r.fromRegExp(t, e);
                },
              ],
              [
                P,
                function (t) {
                  return new cr(t, e);
                },
              ],
            ]),
            a = o(t);
          if (!a) throw new Error("invalid 'what' in when()");
          return a;
        }),
        (t.prototype.fromUrlMatcher = function (t, e) {
          var r = e;
          k(e) && (e = this.router.urlMatcherFactory.compile(e)),
            m(ir)(e) &&
              (r = function (t) {
                return e.format(t);
              });
          var n = {
            urlMatcher: t,
            matchPriority: function (e) {
              var r = t.parameters().filter(function (t) {
                return t.isOptional;
              });
              return r.length
                ? r.filter(function (t) {
                    return e[t.id];
                  }).length / r.length
                : 1e-6;
            },
            type: 'URLMATCHER',
          };
          return B(
            new cr(function (e) {
              var r = t.exec(e.path, e.search, e.hash);
              return t.validates(r) && r;
            }, r),
            n,
          );
        }),
        (t.prototype.fromState = function (t, e) {
          var r = Me.isStateDeclaration(t) ? t.$$state() : t,
            n = { state: r, type: 'STATE' };
          return B(
            this.fromUrlMatcher(r.url, function (t) {
              var n = e.stateService,
                i = e.globals;
              n.href(r, t) !== n.href(i.current, i.params) &&
                n.transitionTo(r, t, { inherit: !0, source: 'url' });
            }),
            n,
          );
        }),
        (t.prototype.fromRegExp = function (t, e) {
          if (t.global || t.sticky)
            throw new Error('Rule RegExp must not be global or sticky');
          var r = k(e)
              ? function (t) {
                  return e.replace(/\$(\$|\d{1,2})/, function (e, r) {
                    return t['$' === r ? 0 : Number(r)];
                  });
                }
              : e,
            n = { regexp: t, type: 'REGEXP' };
          return B(
            new cr(function (e) {
              return t.exec(e.path);
            }, r),
            n,
          );
        }),
        (t.isUrlRule = function (t) {
          return (
            t &&
            ['type', 'match', 'handler'].every(function (e) {
              return R(t[e]);
            })
          );
        }),
        t
      );
    })(),
    cr = function (t, e) {
      var r = this;
      (this.match = t),
        (this.type = 'RAW'),
        (this.matchPriority = function (t) {
          return 0 - r.$id;
        }),
        (this.handler = e || z);
    };
  var fr,
    lr = (function () {
      function t(t) {
        var e = this;
        (this.router = t),
          (this.sync = function (t) {
            return e.router.urlService.sync(t);
          }),
          (this.listen = function (t) {
            return e.router.urlService.listen(t);
          }),
          (this.deferIntercept = function (t) {
            return e.router.urlService.deferIntercept(t);
          }),
          (this.match = function (t) {
            return e.router.urlService.match(t);
          }),
          (this.initial = function (t) {
            return e.router.urlService.rules.initial(t);
          }),
          (this.otherwise = function (t) {
            return e.router.urlService.rules.otherwise(t);
          }),
          (this.removeRule = function (t) {
            return e.router.urlService.rules.removeRule(t);
          }),
          (this.rule = function (t) {
            return e.router.urlService.rules.rule(t);
          }),
          (this.rules = function () {
            return e.router.urlService.rules.rules();
          }),
          (this.sort = function (t) {
            return e.router.urlService.rules.sort(t);
          }),
          (this.when = function (t, r, n) {
            return e.router.urlService.rules.when(t, r, n);
          }),
          (this.urlRuleFactory = new sr(t));
      }
      return (
        (t.prototype.update = function (t) {
          var e = this.router.locationService;
          t
            ? (this.location = e.url())
            : e.url() !== this.location && e.url(this.location, !0);
        }),
        (t.prototype.push = function (t, e, r) {
          var n = r && !!r.replace;
          this.router.urlService.url(t.format(e || {}), n);
        }),
        (t.prototype.href = function (t, e, r) {
          var n = t.format(e);
          if (null == n) return null;
          r = r || { absolute: !1 };
          var i = this.router.urlService.config,
            o = i.html5Mode();
          if (
            (o || null === n || (n = '#' + i.hashPrefix() + n),
            (n = (function (t, e, r, n) {
              return '/' === n ? t : e ? Qt(n) + t : r ? n.slice(1) + t : t;
            })(n, o, r.absolute, i.baseHref())),
            !r.absolute || !n)
          )
            return n;
          var a = !o && n ? '/' : '',
            u = i.port(),
            s = 80 === u || 443 === u ? '' : ':' + u;
          return [i.protocol(), '://', i.host(), s, a, n].join('');
        }),
        Object.defineProperty(t.prototype, 'interceptDeferred', {
          get: function () {
            return this.router.urlService.interceptDeferred;
          },
          enumerable: !1,
          configurable: !0,
        }),
        t
      );
    })(),
    hr = (function () {
      function t(t) {
        var e = this;
        (this.router = t),
          (this._uiViews = []),
          (this._viewConfigs = []),
          (this._viewConfigFactories = {}),
          (this._listeners = []),
          (this._pluginapi = {
            _rootViewContext: this._rootViewContext.bind(this),
            _viewConfigFactory: this._viewConfigFactory.bind(this),
            _registeredUIView: function (t) {
              return ft(e._uiViews, function (r) {
                return e.router.$id + '.' + r.id === t;
              });
            },
            _registeredUIViews: function () {
              return e._uiViews;
            },
            _activeViewConfigs: function () {
              return e._viewConfigs;
            },
            _onSync: function (t) {
              return (
                e._listeners.push(t),
                function () {
                  return Z(e._listeners, t);
                }
              );
            },
          });
      }
      return (
        (t.normalizeUIViewTarget = function (t, e) {
          void 0 === e && (e = '');
          var r = e.split('@'),
            n = r[0] || '$default',
            i = k(r[1]) ? r[1] : '^',
            o = /^(\^(?:\.\^)*)\.(.*$)/.exec(n);
          o && ((i = o[1]), (n = o[2])),
            '!' === n.charAt(0) && ((n = n.substr(1)), (i = ''));
          if (/^(\^(?:\.\^)*)$/.exec(i)) {
            var a = i.split('.').reduce(function (t, e) {
              return t.parent;
            }, t);
            i = a.name;
          } else '.' === i && (i = t.name);
          return { uiViewName: n, uiViewContextAnchor: i };
        }),
        (t.prototype._rootViewContext = function (t) {
          return (this._rootContext = t || this._rootContext);
        }),
        (t.prototype._viewConfigFactory = function (t, e) {
          this._viewConfigFactories[t] = e;
        }),
        (t.prototype.createViewConfig = function (t, e) {
          var r = this._viewConfigFactories[e.$type];
          if (!r)
            throw new Error(
              'ViewService: No view config factory registered for type ' +
                e.$type,
            );
          var n = r(t, e);
          return x(n) ? n : [n];
        }),
        (t.prototype.deactivateViewConfig = function (t) {
          le.traceViewServiceEvent('<- Removing', t), Z(this._viewConfigs, t);
        }),
        (t.prototype.activateViewConfig = function (t) {
          le.traceViewServiceEvent('-> Registering', t),
            this._viewConfigs.push(t);
        }),
        (t.prototype.sync = function () {
          var e = this,
            r = this._uiViews
              .map(function (t) {
                return [t.fqn, t];
              })
              .reduce(Pt, {});
          function n(t) {
            for (var e = t.viewDecl.$context, r = 0; ++r && e.parent; )
              e = e.parent;
            return r;
          }
          var i = o(function (t, e, r, n) {
              return e * (t(r) - t(n));
            }),
            a = this._uiViews
              .sort(
                i(function (t) {
                  var e = function (t) {
                    return t && t.parent ? e(t.parent) + 1 : 1;
                  };
                  return 1e4 * t.fqn.split('.').length + e(t.creationContext);
                }, 1),
              )
              .map(function (o) {
                var a = e._viewConfigs.filter(t.matches(r, o));
                return (
                  a.length > 1 && a.sort(i(n, -1)),
                  { uiView: o, viewConfig: a[0] }
                );
              }),
            u = a.map(function (t) {
              return t.viewConfig;
            }),
            s = this._viewConfigs
              .filter(function (t) {
                return !K(u, t);
              })
              .map(function (t) {
                return { uiView: void 0, viewConfig: t };
              });
          a.forEach(function (t) {
            -1 !== e._uiViews.indexOf(t.uiView) &&
              t.uiView.configUpdated(t.viewConfig);
          });
          var c = a.concat(s);
          this._listeners.forEach(function (t) {
            return t(c);
          }),
            le.traceViewSync(c);
        }),
        (t.prototype.registerUIView = function (t) {
          le.traceViewServiceUIViewEvent('-> Registering', t);
          var e = this._uiViews;
          return (
            e.filter(function (e) {
              return e.fqn === t.fqn && e.$type === t.$type;
            }).length &&
              le.traceViewServiceUIViewEvent('!!!! duplicate uiView named:', t),
            e.push(t),
            this.sync(),
            function () {
              -1 !== e.indexOf(t)
                ? (le.traceViewServiceUIViewEvent('<- Deregistering', t),
                  Z(e)(t))
                : le.traceViewServiceUIViewEvent(
                    'Tried removing non-registered uiView',
                    t,
                  );
            }
          );
        }),
        (t.prototype.available = function () {
          return this._uiViews.map(s('fqn'));
        }),
        (t.prototype.active = function () {
          return this._uiViews.filter(s('$config')).map(s('name'));
        }),
        (t.matches = function (t, e) {
          return function (r) {
            if (e.$type !== r.viewDecl.$type) return !1;
            var n = r.viewDecl,
              i = n.$uiViewName.split('.'),
              o = e.fqn.split('.');
            if (!G(i, o.slice(0 - i.length))) return !1;
            var a = 1 - i.length || void 0,
              u = o.slice(0, a).join('.'),
              s = t[u].creationContext;
            return n.$uiViewContextAnchor === (s && s.name);
          };
        }),
        t
      );
    })(),
    pr = (function () {
      function t() {
        (this.params = new _e()),
          (this.lastStartedTransitionId = -1),
          (this.transitionHistory = new At([], 1)),
          (this.successfulTransitions = new At([], 1));
      }
      return (
        (t.prototype.dispose = function () {
          this.transitionHistory.clear(),
            this.successfulTransitions.clear(),
            (this.transition = null);
        }),
        t
      );
    })();
  function vr(t) {
    if (!(P(t) || k(t) || m($e)(t) || $e.isDef(t)))
      throw new Error(
        "'handler' must be a string, function, TargetState, or have a state: 'newtarget' property",
      );
    return P(t) ? t : y(t);
  }
  fr = function (t, e) {
    var r = (function (t, e) {
      return (e.priority || 0) - (t.priority || 0);
    })(t, e);
    return 0 !== r ||
      0 !==
        (r = (function (t, e) {
          var r = { STATE: 4, URLMATCHER: 4, REGEXP: 3, RAW: 2, OTHER: 1 };
          return (r[t.type] || 0) - (r[e.type] || 0);
        })(t, e)) ||
      0 !==
        (r = (function (t, e) {
          return t.urlMatcher && e.urlMatcher
            ? ir.compare(t.urlMatcher, e.urlMatcher)
            : 0;
        })(t, e))
      ? r
      : (function (t, e) {
          var r = { STATE: !0, URLMATCHER: !0 };
          return r[t.type] && r[e.type] ? 0 : (t.$id || 0) - (e.$id || 0);
        })(t, e);
  };
  var dr = (function () {
      function t(t) {
        (this.router = t),
          (this._sortFn = fr),
          (this._rules = []),
          (this._id = 0),
          (this.urlRuleFactory = new sr(t));
      }
      return (
        (t.prototype.dispose = function (t) {
          (this._rules = []), delete this._otherwiseFn;
        }),
        (t.prototype.initial = function (t) {
          var e = vr(t);
          this.rule(
            this.urlRuleFactory.create(function (t, e) {
              return (
                0 === e.globals.transitionHistory.size() &&
                !!/^\/?$/.exec(t.path)
              );
            }, e),
          );
        }),
        (t.prototype.otherwise = function (t) {
          var e = vr(t);
          (this._otherwiseFn = this.urlRuleFactory.create(y(!0), e)),
            (this._sorted = !1);
        }),
        (t.prototype.removeRule = function (t) {
          Z(this._rules, t);
        }),
        (t.prototype.rule = function (t) {
          var e = this;
          if (!sr.isUrlRule(t)) throw new Error('invalid rule');
          return (
            (t.$id = this._id++),
            (t.priority = t.priority || 0),
            this._rules.push(t),
            (this._sorted = !1),
            function () {
              return e.removeRule(t);
            }
          );
        }),
        (t.prototype.rules = function () {
          return (
            this.ensureSorted(),
            this._rules.concat(this._otherwiseFn ? [this._otherwiseFn] : [])
          );
        }),
        (t.prototype.sort = function (t) {
          for (
            var e = this.stableSort(
                this._rules,
                (this._sortFn = t || this._sortFn),
              ),
              r = 0,
              n = 0;
            n < e.length;
            n++
          )
            (e[n]._group = r),
              n < e.length - 1 && 0 !== this._sortFn(e[n], e[n + 1]) && r++;
          (this._rules = e), (this._sorted = !0);
        }),
        (t.prototype.ensureSorted = function () {
          this._sorted || this.sort();
        }),
        (t.prototype.stableSort = function (t, e) {
          var r = t.map(function (t, e) {
            return { elem: t, idx: e };
          });
          return (
            r.sort(function (t, r) {
              var n = e(t.elem, r.elem);
              return 0 === n ? t.idx - r.idx : n;
            }),
            r.map(function (t) {
              return t.elem;
            })
          );
        }),
        (t.prototype.when = function (t, e, r) {
          var n = this.urlRuleFactory.create(t, e);
          return (
            R(r && r.priority) && (n.priority = r.priority), this.rule(n), n
          );
        }),
        t
      );
    })(),
    mr = (function () {
      function t(t) {
        var e = this;
        (this.router = t),
          (this.paramTypes = new we()),
          (this._decodeParams = !0),
          (this._isCaseInsensitive = !1),
          (this._isStrictMode = !0),
          (this._defaultSquashPolicy = !1),
          (this.dispose = function () {
            return e.paramTypes.dispose();
          }),
          (this.baseHref = function () {
            return e.router.locationConfig.baseHref();
          }),
          (this.hashPrefix = function (t) {
            return e.router.locationConfig.hashPrefix(t);
          }),
          (this.host = function () {
            return e.router.locationConfig.host();
          }),
          (this.html5Mode = function () {
            return e.router.locationConfig.html5Mode();
          }),
          (this.port = function () {
            return e.router.locationConfig.port();
          }),
          (this.protocol = function () {
            return e.router.locationConfig.protocol();
          });
      }
      return (
        (t.prototype.caseInsensitive = function (t) {
          return (this._isCaseInsensitive = R(t) ? t : this._isCaseInsensitive);
        }),
        (t.prototype.defaultSquashPolicy = function (t) {
          if (R(t) && !0 !== t && !1 !== t && !k(t))
            throw new Error(
              'Invalid squash policy: ' +
                t +
                '. Valid policies: false, true, arbitrary-string',
            );
          return (this._defaultSquashPolicy = R(t)
            ? t
            : this._defaultSquashPolicy);
        }),
        (t.prototype.strictMode = function (t) {
          return (this._isStrictMode = R(t) ? t : this._isStrictMode);
        }),
        (t.prototype.type = function (t, e, r) {
          var n = this.paramTypes.type(t, e, r);
          return R(e) ? this : n;
        }),
        t
      );
    })(),
    gr = (function () {
      function t(t) {
        var e = this;
        (this.router = t),
          (this.interceptDeferred = !1),
          (this.rules = new dr(this.router)),
          (this.config = new mr(this.router)),
          (this.url = function (t, r, n) {
            return e.router.locationService.url(t, r, n);
          }),
          (this.path = function () {
            return e.router.locationService.path();
          }),
          (this.search = function () {
            return e.router.locationService.search();
          }),
          (this.hash = function () {
            return e.router.locationService.hash();
          }),
          (this.onChange = function (t) {
            return e.router.locationService.onChange(t);
          });
      }
      return (
        (t.prototype.dispose = function () {
          this.listen(!1), this.rules.dispose();
        }),
        (t.prototype.parts = function () {
          return {
            path: this.path(),
            search: this.search(),
            hash: this.hash(),
          };
        }),
        (t.prototype.sync = function (t) {
          if (!t || !t.defaultPrevented) {
            var e = this.router,
              r = e.urlService,
              n = e.stateService,
              i = { path: r.path(), search: r.search(), hash: r.hash() },
              o = this.match(i);
            _([
              [
                k,
                function (t) {
                  return r.url(t, !0);
                },
              ],
              [
                $e.isDef,
                function (t) {
                  return n.go(t.state, t.params, t.options);
                },
              ],
              [
                m($e),
                function (t) {
                  return n.go(t.state(), t.params(), t.options());
                },
              ],
            ])(o && o.rule.handler(o.match, i, this.router));
          }
        }),
        (t.prototype.listen = function (t) {
          var e = this;
          if (!1 !== t)
            return (this._stopListeningFn =
              this._stopListeningFn ||
              this.router.urlService.onChange(function (t) {
                return e.sync(t);
              }));
          this._stopListeningFn && this._stopListeningFn(),
            delete this._stopListeningFn;
        }),
        (t.prototype.deferIntercept = function (t) {
          void 0 === t && (t = !0), (this.interceptDeferred = t);
        }),
        (t.prototype.match = function (t) {
          var e = this;
          t = B({ path: '', search: {}, hash: '' }, t);
          for (
            var r, n, i, o = this.rules.rules(), a = 0;
            a < o.length && (!r || r.rule._group === o[a]._group);
            a++
          ) {
            var u =
              ((n = o[a]),
              (i = void 0),
              (i = n.match(t, e.router)) && {
                match: i,
                rule: n,
                weight: n.matchPriority(i),
              });
            r = !r || (u && u.weight > r.weight) ? u : r;
          }
          return r;
        }),
        t
      );
    })(),
    yr = 0,
    wr = A('LocationServices', ['url', 'path', 'search', 'hash', 'onChange']),
    _r = A('LocationConfig', [
      'port',
      'protocol',
      'host',
      'baseHref',
      'html5Mode',
      'hashPrefix',
    ]),
    Sr = (function () {
      function t(t, e) {
        void 0 === t && (t = wr),
          void 0 === e && (e = _r),
          (this.locationService = t),
          (this.locationConfig = e),
          (this.$id = yr++),
          (this._disposed = !1),
          (this._disposables = []),
          (this.trace = le),
          (this.viewService = new hr(this)),
          (this.globals = new pr()),
          (this.transitionService = new Mr(this)),
          (this.urlMatcherFactory = new ur(this)),
          (this.urlRouter = new lr(this)),
          (this.urlService = new gr(this)),
          (this.stateRegistry = new ze(this)),
          (this.stateService = new Br(this)),
          (this._plugins = {}),
          this.viewService._pluginapi._rootViewContext(
            this.stateRegistry.root(),
          ),
          (this.globals.$current = this.stateRegistry.root()),
          (this.globals.current = this.globals.$current.self),
          this.disposable(this.globals),
          this.disposable(this.stateService),
          this.disposable(this.stateRegistry),
          this.disposable(this.transitionService),
          this.disposable(this.urlService),
          this.disposable(t),
          this.disposable(e);
      }
      return (
        (t.prototype.disposable = function (t) {
          this._disposables.push(t);
        }),
        (t.prototype.dispose = function (t) {
          var e = this;
          t && P(t.dispose)
            ? t.dispose(this)
            : ((this._disposed = !0),
              this._disposables.slice().forEach(function (t) {
                try {
                  'function' == typeof t.dispose && t.dispose(e),
                    Z(e._disposables, t);
                } catch (t) {}
              }));
        }),
        (t.prototype.plugin = function (t, e) {
          void 0 === e && (e = {});
          var r = new t(this, e);
          if (!r.name)
            throw new Error('Required property `name` missing on plugin: ' + r);
          return this._disposables.push(r), (this._plugins[r.name] = r);
        }),
        (t.prototype.getPlugin = function (t) {
          return t ? this._plugins[t] : pt(this._plugins);
        }),
        t
      );
    })();
  function $r(t) {
    t.addResolvable(Ce.fromData(Sr, t.router), ''),
      t.addResolvable(Ce.fromData(tr, t), ''),
      t.addResolvable(Ce.fromData('$transition$', t), ''),
      t.addResolvable(Ce.fromData('$stateParams', t.params()), ''),
      t.entering().forEach(function (e) {
        t.addResolvable(Ce.fromData('$state$', e), e);
      });
  }
  var br = K(['$transition$', tr]),
    Rr = function (t) {
      var e = pt(t.treeChanges()).reduce(mt, []).reduce(wt, []),
        r = function (t) {
          return br(t.token) ? Ce.fromData(t.token, null) : t;
        };
      e.forEach(function (t) {
        t.resolvables = t.resolvables.map(r);
      });
    },
    Er = function (t) {
      var e = t.to().redirectTo;
      if (e) {
        var r = t.router.stateService;
        return P(e) ? D.$q.when(e(t)).then(n) : n(e);
      }
      function n(e) {
        if (e)
          return e instanceof $e
            ? e
            : k(e)
            ? r.target(e, t.params(), t.options())
            : e.state || e.params
            ? r.target(e.state || t.to(), e.params || t.params(), t.options())
            : void 0;
      }
    };
  function Cr(t) {
    return function (e, r) {
      return (0, r.$$state()[t])(e, r);
    };
  }
  var Pr = Cr('onExit'),
    Tr = Cr('onRetain'),
    kr = Cr('onEnter'),
    Or = function (t) {
      return new Oe(t.treeChanges().to).resolvePath('EAGER', t).then(W);
    },
    xr = function (t, e) {
      return new Oe(t.treeChanges().to)
        .subContext(e.$$state())
        .resolvePath('LAZY', t)
        .then(W);
    },
    jr = function (t) {
      return new Oe(t.treeChanges().to).resolvePath('LAZY', t).then(W);
    },
    Vr = function (t) {
      var e = D.$q,
        r = t.views('entering');
      if (r.length)
        return e
          .all(
            r.map(function (t) {
              return e.when(t.load());
            }),
          )
          .then(W);
    },
    Ir = function (t) {
      var e = t.views('entering'),
        r = t.views('exiting');
      if (e.length || r.length) {
        var n = t.router.viewService;
        r.forEach(function (t) {
          return n.deactivateViewConfig(t);
        }),
          e.forEach(function (t) {
            return n.activateViewConfig(t);
          }),
          n.sync();
      }
    },
    Hr = function (t) {
      var e = t.router.globals,
        r = function () {
          e.transition === t && (e.transition = null);
        };
      t.onSuccess(
        {},
        function () {
          e.successfulTransitions.enqueue(t),
            (e.$current = t.$to()),
            (e.current = e.$current.self),
            kt(t.params(), e.params);
        },
        { priority: 1e4 },
      ),
        t.promise.then(r, r);
    },
    Ar = function (t) {
      var e = t.options(),
        r = t.router.stateService,
        n = t.router.urlRouter;
      if ('url' !== e.source && e.location && r.$current.navigable) {
        var i = { replace: 'replace' === e.location };
        n.push(r.$current.navigable.url, r.params, i);
      }
      n.update(!0);
    },
    Dr = function (t) {
      var e = t.router;
      var r = t
        .entering()
        .filter(function (t) {
          return !!t.$$state().lazyLoad;
        })
        .map(function (e) {
          return qr(t, e);
        });
      return D.$q.all(r).then(function () {
        if ('url' !== t.originalTransition().options().source) {
          var r = t.targetState();
          return e.stateService.target(r.identifier(), r.params(), r.options());
        }
        var n = e.urlService,
          i = n.match(n.parts()),
          o = i && i.rule;
        if (o && 'STATE' === o.type) {
          var a = o.state,
            u = i.match;
          return e.stateService.target(a, u, t.options());
        }
        e.urlService.sync();
      });
    };
  function qr(t, e) {
    var r = e.$$state().lazyLoad,
      n = r._promise;
    if (!n) {
      n = r._promise = D.$q
        .when(r(t, e))
        .then(function (e) {
          e &&
            Array.isArray(e.states) &&
            e.states.forEach(function (e) {
              return t.router.stateRegistry.register(e);
            });
          return e;
        })
        .then(
          function (t) {
            return (
              delete e.lazyLoad,
              delete e.$$state().lazyLoad,
              delete r._promise,
              t
            );
          },
          function (t) {
            return delete r._promise, D.$q.reject(t);
          },
        );
    }
    return n;
  }
  var Ur = function (t, e, r, n, i, o, a, u) {
    void 0 === i && (i = !1),
      void 0 === o && (o = Je.HANDLE_RESULT),
      void 0 === a && (a = Je.REJECT_ERROR),
      void 0 === u && (u = !1),
      (this.name = t),
      (this.hookPhase = e),
      (this.hookOrder = r),
      (this.criteriaMatchPath = n),
      (this.reverseSort = i),
      (this.getResultHandler = o),
      (this.getErrorHandler = a),
      (this.synchronous = u);
  };
  function Nr(t) {
    var e = t._ignoredReason();
    if (e) {
      le.traceTransitionIgnored(t);
      var r = t.router.globals.transition;
      return 'SameAsCurrent' === e && r && r.abort(), qt.ignored().toPromise();
    }
  }
  function Fr(t) {
    if (!t.valid()) throw new Error(t.error().toString());
  }
  var Lr = {
      location: !0,
      relative: null,
      inherit: !1,
      notify: !0,
      reload: !1,
      supercede: !0,
      custom: {},
      current: function () {
        return null;
      },
      source: 'unknown',
    },
    Mr = (function () {
      function e(t) {
        (this._transitionCount = 0),
          (this._eventTypes = []),
          (this._registeredHooks = {}),
          (this._criteriaPaths = {}),
          (this._router = t),
          (this.$view = t.viewService),
          (this._deregisterHookFns = {}),
          (this._pluginapi = J(y(this), {}, y(this), [
            '_definePathType',
            '_defineEvent',
            '_getPathTypes',
            '_getEvents',
            'getHooks',
          ])),
          this._defineCorePaths(),
          this._defineCoreEvents(),
          this._registerCoreTransitionHooks(),
          t.globals.successfulTransitions.onEvict(Rr);
      }
      return (
        (e.prototype.onCreate = function (t, e, r) {}),
        (e.prototype.onBefore = function (t, e, r) {}),
        (e.prototype.onStart = function (t, e, r) {}),
        (e.prototype.onExit = function (t, e, r) {}),
        (e.prototype.onRetain = function (t, e, r) {}),
        (e.prototype.onEnter = function (t, e, r) {}),
        (e.prototype.onFinish = function (t, e, r) {}),
        (e.prototype.onSuccess = function (t, e, r) {}),
        (e.prototype.onError = function (t, e, r) {}),
        (e.prototype.dispose = function (t) {
          pt(this._registeredHooks).forEach(function (t) {
            return t.forEach(function (e) {
              (e._deregistered = !0), Z(t, e);
            });
          });
        }),
        (e.prototype.create = function (t, e) {
          return new tr(t, e, this._router);
        }),
        (e.prototype._defineCoreEvents = function () {
          var e = t.TransitionHookPhase,
            r = Je,
            n = this._criteriaPaths;
          this._defineEvent(
            'onCreate',
            e.CREATE,
            0,
            n.to,
            !1,
            r.LOG_REJECTED_RESULT,
            r.THROW_ERROR,
            !0,
          ),
            this._defineEvent('onBefore', e.BEFORE, 0, n.to),
            this._defineEvent('onStart', e.RUN, 0, n.to),
            this._defineEvent('onExit', e.RUN, 100, n.exiting, !0),
            this._defineEvent('onRetain', e.RUN, 200, n.retained),
            this._defineEvent('onEnter', e.RUN, 300, n.entering),
            this._defineEvent('onFinish', e.RUN, 400, n.to),
            this._defineEvent(
              'onSuccess',
              e.SUCCESS,
              0,
              n.to,
              !1,
              r.LOG_REJECTED_RESULT,
              r.LOG_ERROR,
              !0,
            ),
            this._defineEvent(
              'onError',
              e.ERROR,
              0,
              n.to,
              !1,
              r.LOG_REJECTED_RESULT,
              r.LOG_ERROR,
              !0,
            );
        }),
        (e.prototype._defineCorePaths = function () {
          var e = t.TransitionHookScope.STATE,
            r = t.TransitionHookScope.TRANSITION;
          this._definePathType('to', r),
            this._definePathType('from', r),
            this._definePathType('exiting', e),
            this._definePathType('retained', e),
            this._definePathType('entering', e);
        }),
        (e.prototype._defineEvent = function (t, e, r, n, i, o, a, u) {
          void 0 === i && (i = !1),
            void 0 === o && (o = Je.HANDLE_RESULT),
            void 0 === a && (a = Je.REJECT_ERROR),
            void 0 === u && (u = !1);
          var s = new Ur(t, e, r, n, i, o, a, u);
          this._eventTypes.push(s), Ye(this, this, s);
        }),
        (e.prototype._getEvents = function (t) {
          return (
            R(t)
              ? this._eventTypes.filter(function (e) {
                  return e.hookPhase === t;
                })
              : this._eventTypes.slice()
          ).sort(function (t, e) {
            var r = t.hookPhase - e.hookPhase;
            return 0 === r ? t.hookOrder - e.hookOrder : r;
          });
        }),
        (e.prototype._definePathType = function (t, e) {
          this._criteriaPaths[t] = { name: t, scope: e };
        }),
        (e.prototype._getPathTypes = function () {
          return this._criteriaPaths;
        }),
        (e.prototype.getHooks = function (t) {
          return this._registeredHooks[t];
        }),
        (e.prototype._registerCoreTransitionHooks = function () {
          var t = this._deregisterHookFns;
          (t.addCoreResolves = this.onCreate({}, $r)),
            (t.ignored = (function (t) {
              return t.onBefore({}, Nr, { priority: -9999 });
            })(this)),
            (t.invalid = (function (t) {
              return t.onBefore({}, Fr, { priority: -1e4 });
            })(this)),
            (t.redirectTo = (function (t) {
              return t.onStart(
                {
                  to: function (t) {
                    return !!t.redirectTo;
                  },
                },
                Er,
              );
            })(this)),
            (t.onExit = (function (t) {
              return t.onExit(
                {
                  exiting: function (t) {
                    return !!t.onExit;
                  },
                },
                Pr,
              );
            })(this)),
            (t.onRetain = (function (t) {
              return t.onRetain(
                {
                  retained: function (t) {
                    return !!t.onRetain;
                  },
                },
                Tr,
              );
            })(this)),
            (t.onEnter = (function (t) {
              return t.onEnter(
                {
                  entering: function (t) {
                    return !!t.onEnter;
                  },
                },
                kr,
              );
            })(this)),
            (t.eagerResolve = (function (t) {
              return t.onStart({}, Or, { priority: 1e3 });
            })(this)),
            (t.lazyResolve = (function (t) {
              return t.onEnter({ entering: y(!0) }, xr, { priority: 1e3 });
            })(this)),
            (t.resolveAll = (function (t) {
              return t.onFinish({}, jr, { priority: 1e3 });
            })(this)),
            (t.loadViews = (function (t) {
              return t.onFinish({}, Vr);
            })(this)),
            (t.activateViews = (function (t) {
              return t.onSuccess({}, Ir);
            })(this)),
            (t.updateGlobals = (function (t) {
              return t.onCreate({}, Hr);
            })(this)),
            (t.updateUrl = (function (t) {
              return t.onSuccess({}, Ar, { priority: 9999 });
            })(this)),
            (t.lazyLoad = (function (t) {
              return t.onBefore(
                {
                  entering: function (t) {
                    return !!t.lazyLoad;
                  },
                },
                Dr,
              );
            })(this));
        }),
        e
      );
    })(),
    Br = (function () {
      function e(t) {
        (this.router = t),
          (this.invalidCallbacks = []),
          (this._defaultErrorHandler = function (t) {
            t instanceof Error && t.stack
              ? (console.error(t), console.error(t.stack))
              : t instanceof qt
              ? (console.error(t.toString()),
                t.detail && t.detail.stack && console.error(t.detail.stack))
              : console.error(t);
          });
        var r = Object.keys(e.prototype).filter(
          l(K(['current', '$current', 'params', 'transition'])),
        );
        J(y(e.prototype), this, y(this), r);
      }
      return (
        Object.defineProperty(e.prototype, 'transition', {
          get: function () {
            return this.router.globals.transition;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'params', {
          get: function () {
            return this.router.globals.params;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, 'current', {
          get: function () {
            return this.router.globals.current;
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(e.prototype, '$current', {
          get: function () {
            return this.router.globals.$current;
          },
          enumerable: !1,
          configurable: !0,
        }),
        (e.prototype.dispose = function () {
          this.defaultErrorHandler(W), (this.invalidCallbacks = []);
        }),
        (e.prototype._handleInvalidTargetState = function (t, e) {
          var r = this,
            n = be.makeTargetState(this.router.stateRegistry, t),
            i = this.router.globals,
            o = function () {
              return i.transitionHistory.peekTail();
            },
            a = o(),
            u = new At(this.invalidCallbacks.slice()),
            s = new Oe(t).injector(),
            c = function (t) {
              if (t instanceof $e) {
                var e = t;
                return (e = r.target(
                  e.identifier(),
                  e.params(),
                  e.options(),
                )).valid()
                  ? o() !== a
                    ? qt.superseded().toPromise()
                    : r.transitionTo(e.identifier(), e.params(), e.options())
                  : qt.invalid(e.error()).toPromise();
              }
            };
          return (function t() {
            var r = u.dequeue();
            return void 0 === r
              ? qt.invalid(e.error()).toPromise()
              : D.$q
                  .when(r(e, n, s))
                  .then(c)
                  .then(function (e) {
                    return e || t();
                  });
          })();
        }),
        (e.prototype.onInvalid = function (t) {
          return (
            this.invalidCallbacks.push(t),
            function () {
              Z(this.invalidCallbacks)(t);
            }.bind(this)
          );
        }),
        (e.prototype.reload = function (t) {
          return this.transitionTo(this.current, this.params, {
            reload: !R(t) || t,
            inherit: !1,
            notify: !1,
          });
        }),
        (e.prototype.go = function (t, e, r) {
          var n = nt(r, { relative: this.$current, inherit: !0 }, Lr);
          return this.transitionTo(t, e, n);
        }),
        (e.prototype.target = function (t, e, r) {
          if ((void 0 === r && (r = {}), O(r.reload) && !r.reload.name))
            throw new Error('Invalid reload state object');
          var n = this.router.stateRegistry;
          if (
            ((r.reloadState =
              !0 === r.reload
                ? n.root()
                : n.matcher.find(r.reload, r.relative)),
            r.reload && !r.reloadState)
          )
            throw new Error(
              "No such reload state '" +
                (k(r.reload) ? r.reload : r.reload.name) +
                "'",
            );
          return new $e(this.router.stateRegistry, t, e, r);
        }),
        (e.prototype.getCurrentPath = function () {
          var t = this,
            e = this.router.globals.successfulTransitions.peekTail();
          return e
            ? e.treeChanges().to
            : [new Se(t.router.stateRegistry.root())];
        }),
        (e.prototype.transitionTo = function (e, r, n) {
          var i = this;
          void 0 === r && (r = {}), void 0 === n && (n = {});
          var o = this.router,
            a = o.globals;
          n = nt(n, Lr);
          var u = function () {
            return a.transition;
          };
          n = B(n, { current: u });
          var s = this.target(e, r, n),
            c = this.getCurrentPath();
          if (!s.exists()) return this._handleInvalidTargetState(c, s);
          if (!s.valid()) return It(s.error());
          if (!1 === n.supercede && u())
            return qt
              .ignored(
                'Another transition is in progress and supercede has been set to false in TransitionOptions for the transition. So the transition was ignored in favour of the existing one in progress.',
              )
              .toPromise();
          var f = function (e) {
              return function (r) {
                if (r instanceof qt) {
                  var n = o.globals.lastStartedTransitionId <= e.$id;
                  if (r.type === t.RejectType.IGNORED)
                    return n && o.urlRouter.update(), D.$q.when(a.current);
                  var u = r.detail;
                  if (
                    r.type === t.RejectType.SUPERSEDED &&
                    r.redirected &&
                    u instanceof $e
                  ) {
                    var s = e.redirect(u);
                    return s.run().catch(f(s));
                  }
                  if (r.type === t.RejectType.ABORTED)
                    return n && o.urlRouter.update(), D.$q.reject(r);
                }
                return i.defaultErrorHandler()(r), D.$q.reject(r);
              };
            },
            l = this.router.transitionService.create(c, s),
            h = l.run().catch(f(l));
          return Vt(h), B(h, { transition: l });
        }),
        (e.prototype.is = function (t, e, r) {
          r = nt(r, { relative: this.$current });
          var n = this.router.stateRegistry.matcher.find(t, r.relative);
          if (R(n)) {
            if (this.$current !== n) return !1;
            if (!e) return !0;
            var i = n.parameters({ inherit: !0, matchingKeys: e });
            return ye.equals(i, ye.values(i, e), this.params);
          }
        }),
        (e.prototype.includes = function (t, e, r) {
          r = nt(r, { relative: this.$current });
          var n = k(t) && Ht.fromString(t);
          if (n) {
            if (!n.matches(this.$current.name)) return !1;
            t = this.$current.name;
          }
          var i = this.router.stateRegistry.matcher.find(t, r.relative),
            o = this.$current.includes;
          if (R(i)) {
            if (!R(o[i.name])) return !1;
            if (!e) return !0;
            var a = i.parameters({ inherit: !0, matchingKeys: e });
            return ye.equals(a, ye.values(a, e), this.params);
          }
        }),
        (e.prototype.href = function (t, e, r) {
          (r = nt(r, {
            lossy: !0,
            inherit: !0,
            absolute: !1,
            relative: this.$current,
          })),
            (e = e || {});
          var n = this.router.stateRegistry.matcher.find(t, r.relative);
          if (!R(n)) return null;
          r.inherit && (e = this.params.$inherit(e, this.$current, n));
          var i = n && r.lossy ? n.navigable : n;
          return i && void 0 !== i.url && null !== i.url
            ? this.router.urlRouter.href(i.url, e, { absolute: r.absolute })
            : null;
        }),
        (e.prototype.defaultErrorHandler = function (t) {
          return (this._defaultErrorHandler = t || this._defaultErrorHandler);
        }),
        (e.prototype.get = function (t, e) {
          var r = this.router.stateRegistry;
          return 0 === arguments.length
            ? r.get()
            : r.get(t, e || this.$current);
        }),
        (e.prototype.lazyLoad = function (t, e) {
          var r = this.get(t);
          if (!r || !r.lazyLoad) throw new Error('Can not lazy load ' + t);
          var n = this.getCurrentPath(),
            i = be.makeTargetState(this.router.stateRegistry, n);
          return qr((e = e || this.router.transitionService.create(n, i)), r);
        }),
        e
      );
    })(),
    Gr = {
      when: function (t) {
        return new Promise(function (e, r) {
          return e(t);
        });
      },
      reject: function (t) {
        return new Promise(function (e, r) {
          r(t);
        });
      },
      defer: function () {
        var t = {};
        return (
          (t.promise = new Promise(function (e, r) {
            (t.resolve = e), (t.reject = r);
          })),
          t
        );
      },
      all: function (t) {
        if (x(t)) return Promise.all(t);
        if (O(t)) {
          var e = Object.keys(t).map(function (e) {
            return t[e].then(function (t) {
              return { key: e, val: t };
            });
          });
          return Gr.all(e).then(function (t) {
            return t.reduce(function (t, e) {
              return (t[e.key] = e.val), t;
            }, {});
          });
        }
      },
    },
    zr = {},
    Wr = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
    Jr = /([^\s,]+)/g,
    Qr = {
      get: function (t) {
        return zr[t];
      },
      has: function (t) {
        return null != Qr.get(t);
      },
      invoke: function (t, e, r) {
        var n = B({}, zr, r || {}),
          i = Qr.annotate(t),
          o = $t(
            function (t) {
              return n.hasOwnProperty(t);
            },
            function (t) {
              return "DI can't find injectable: '" + t + "'";
            },
          ),
          a = i.filter(o).map(function (t) {
            return n[t];
          });
        return P(t) ? t.apply(e, a) : t.slice(-1)[0].apply(e, a);
      },
      annotate: function (t) {
        if (!I(t)) throw new Error('Not an injectable function: ' + t);
        if (t && t.$inject) return t.$inject;
        if (x(t)) return t.slice(0, -1);
        var e = t.toString().replace(Wr, '');
        return e.slice(e.indexOf('(') + 1, e.indexOf(')')).match(Jr) || [];
      },
    },
    Kr = function (t, e) {
      var r = e[0],
        n = e[1];
      return (
        t.hasOwnProperty(r)
          ? x(t[r])
            ? t[r].push(n)
            : (t[r] = [t[r], n])
          : (t[r] = n),
        t
      );
    },
    Yr = function (t) {
      return t.split('&').filter(z).map(Zt).reduce(Kr, {});
    };
  function Zr(t) {
    var e = function (t) {
        return t || '';
      },
      r = Kt(t).map(e),
      n = r[0],
      i = r[1],
      o = Yt(n).map(e);
    return { path: o[0], search: o[1], hash: i, url: t };
  }
  var Xr = function (t) {
    var e = t.path(),
      r = t.search(),
      n = t.hash(),
      i = Object.keys(r)
        .map(function (t) {
          var e = r[t];
          return (x(e) ? e : [e]).map(function (e) {
            return t + '=' + e;
          });
        })
        .reduce(mt, [])
        .join('&');
    return e + (i ? '?' + i : '') + (n ? '#' + n : '');
  };
  function tn(t, e, r, n) {
    return function (i) {
      var o = (i.locationService = new r(i)),
        a = (i.locationConfig = new n(i, e));
      return {
        name: t,
        service: o,
        configuration: a,
        dispose: function (t) {
          t.dispose(o), t.dispose(a);
        },
      };
    };
  }
  var en,
    rn = (function () {
      function t(t, e) {
        var r = this;
        (this.fireAfterUpdate = e),
          (this._listeners = []),
          (this._listener = function (t) {
            return r._listeners.forEach(function (e) {
              return e(t);
            });
          }),
          (this.hash = function () {
            return Zr(r._get()).hash;
          }),
          (this.path = function () {
            return Zr(r._get()).path;
          }),
          (this.search = function () {
            return Yr(Zr(r._get()).search);
          }),
          (this._location = U.location),
          (this._history = U.history);
      }
      return (
        (t.prototype.url = function (t, e) {
          return (
            void 0 === e && (e = !0),
            R(t) &&
              t !== this._get() &&
              (this._set(null, null, t, e),
              this.fireAfterUpdate &&
                this._listeners.forEach(function (e) {
                  return e({ url: t });
                })),
            Xr(this)
          );
        }),
        (t.prototype.onChange = function (t) {
          var e = this;
          return (
            this._listeners.push(t),
            function () {
              return Z(e._listeners, t);
            }
          );
        }),
        (t.prototype.dispose = function (t) {
          rt(this._listeners);
        }),
        t
      );
    })(),
    nn =
      ((en = function (t, e) {
        return (en =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, e) {
              t.__proto__ = e;
            }) ||
          function (t, e) {
            for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
          })(t, e);
      }),
      function (t, e) {
        function r() {
          this.constructor = t;
        }
        en(t, e),
          (t.prototype =
            null === e
              ? Object.create(e)
              : ((r.prototype = e.prototype), new r()));
      }),
    on = (function (t) {
      function e(e) {
        var r = t.call(this, e, !1) || this;
        return U.addEventListener('hashchange', r._listener, !1), r;
      }
      return (
        nn(e, t),
        (e.prototype._get = function () {
          return Xt(this._location.hash);
        }),
        (e.prototype._set = function (t, e, r, n) {
          this._location.hash = r;
        }),
        (e.prototype.dispose = function (e) {
          t.prototype.dispose.call(this, e),
            U.removeEventListener('hashchange', this._listener);
        }),
        e
      );
    })(rn),
    an = (function () {
      var t = function (e, r) {
        return (t =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, e) {
              t.__proto__ = e;
            }) ||
          function (t, e) {
            for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
          })(e, r);
      };
      return function (e, r) {
        function n() {
          this.constructor = e;
        }
        t(e, r),
          (e.prototype =
            null === r
              ? Object.create(r)
              : ((n.prototype = r.prototype), new n()));
      };
    })(),
    un = (function (t) {
      function e(e) {
        return t.call(this, e, !0) || this;
      }
      return (
        an(e, t),
        (e.prototype._get = function () {
          return this._url;
        }),
        (e.prototype._set = function (t, e, r, n) {
          this._url = r;
        }),
        e
      );
    })(rn),
    sn = (function () {
      var t = function (e, r) {
        return (t =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (t, e) {
              t.__proto__ = e;
            }) ||
          function (t, e) {
            for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
          })(e, r);
      };
      return function (e, r) {
        function n() {
          this.constructor = e;
        }
        t(e, r),
          (e.prototype =
            null === r
              ? Object.create(r)
              : ((n.prototype = r.prototype), new n()));
      };
    })(),
    cn = (function (t) {
      function e(e) {
        var r = t.call(this, e, !0) || this;
        return (
          (r._config = e.urlService.config),
          U.addEventListener('popstate', r._listener, !1),
          r
        );
      }
      return (
        sn(e, t),
        (e.prototype._getBasePrefix = function () {
          return Qt(this._config.baseHref());
        }),
        (e.prototype._get = function () {
          var t = this._location,
            e = t.pathname,
            r = t.hash,
            n = t.search;
          (n = Yt(n)[1]), (r = Kt(r)[1]);
          var i = this._getBasePrefix(),
            o = e === this._config.baseHref(),
            a = e.substr(0, i.length) === i;
          return (
            (e = o ? '/' : a ? e.substring(i.length) : e) +
            (n ? '?' + n : '') +
            (r ? '#' + r : '')
          );
        }),
        (e.prototype._set = function (t, e, r, n) {
          var i = this._getBasePrefix(),
            o = r && '/' !== r[0] ? '/' : '',
            a = '' === r || '/' === r ? this._config.baseHref() : i + o + r;
          n
            ? this._history.replaceState(t, e, a)
            : this._history.pushState(t, e, a);
        }),
        (e.prototype.dispose = function (e) {
          t.prototype.dispose.call(this, e),
            U.removeEventListener('popstate', this._listener);
        }),
        e
      );
    })(rn),
    fn = function () {
      var t = this;
      (this.dispose = W),
        (this._baseHref = ''),
        (this._port = 80),
        (this._protocol = 'http'),
        (this._host = 'localhost'),
        (this._hashPrefix = ''),
        (this.port = function () {
          return t._port;
        }),
        (this.protocol = function () {
          return t._protocol;
        }),
        (this.host = function () {
          return t._host;
        }),
        (this.baseHref = function () {
          return t._baseHref;
        }),
        (this.html5Mode = function () {
          return !1;
        }),
        (this.hashPrefix = function (e) {
          return R(e) ? (t._hashPrefix = e) : t._hashPrefix;
        });
    },
    ln = (function () {
      function t(t, e) {
        void 0 === e && (e = !1),
          (this._isHtml5 = e),
          (this._baseHref = void 0),
          (this._hashPrefix = '');
      }
      return (
        (t.prototype.port = function () {
          return location.port
            ? Number(location.port)
            : 'https' === this.protocol()
            ? 443
            : 80;
        }),
        (t.prototype.protocol = function () {
          return location.protocol.replace(/:/g, '');
        }),
        (t.prototype.host = function () {
          return location.hostname;
        }),
        (t.prototype.html5Mode = function () {
          return this._isHtml5;
        }),
        (t.prototype.hashPrefix = function (t) {
          return R(t) ? (this._hashPrefix = t) : this._hashPrefix;
        }),
        (t.prototype.baseHref = function (t) {
          return (
            R(t) && (this._baseHref = t),
            b(this._baseHref) && (this._baseHref = this.getBaseHref()),
            this._baseHref
          );
        }),
        (t.prototype.getBaseHref = function () {
          var t = document.getElementsByTagName('base')[0];
          return t && t.href
            ? t.href.replace(/^([^/:]*:)?\/\/[^/]*/, '')
            : this._isHtml5
            ? '/'
            : location.pathname || '/';
        }),
        (t.prototype.dispose = function () {}),
        t
      );
    })();
  function hn(t) {
    return (
      (D.$injector = Qr),
      (D.$q = Gr),
      {
        name: 'vanilla.services',
        $q: Gr,
        $injector: Qr,
        dispose: function () {
          return null;
        },
      }
    );
  }
  var pn = tn('vanilla.hashBangLocation', !1, on, ln),
    vn = tn('vanilla.pushStateLocation', !0, cn, ln),
    dn = tn('vanilla.memoryLocation', !1, un, fn),
    mn = (function () {
      function t() {}
      return (t.prototype.dispose = function (t) {}), t;
    })(),
    gn = Object.freeze({
      __proto__: null,
      root: U,
      fromJson: F,
      toJson: L,
      forEach: M,
      extend: B,
      equals: G,
      identity: z,
      noop: W,
      createProxyFunctions: J,
      inherit: Q,
      inArray: K,
      _inArray: Y,
      removeFrom: Z,
      _removeFrom: X,
      pushTo: tt,
      _pushTo: et,
      deregAll: rt,
      defaults: nt,
      mergeR: it,
      ancestors: ot,
      pick: at,
      omit: ut,
      pluck: st,
      filter: ct,
      find: ft,
      mapObj: lt,
      map: ht,
      values: pt,
      allTrueR: vt,
      anyTrueR: dt,
      unnestR: mt,
      flattenR: gt,
      pushR: yt,
      uniqR: wt,
      unnest: _t,
      flatten: St,
      assertPredicate: $t,
      assertMap: bt,
      assertFn: Rt,
      pairs: Et,
      arrayTuples: Ct,
      applyPairs: Pt,
      tail: Tt,
      copy: kt,
      _extend: Ot,
      silenceUncaughtInPromise: Vt,
      silentRejection: It,
      makeStub: A,
      services: D,
      Glob: Ht,
      curry: o,
      compose: a,
      pipe: u,
      prop: s,
      propEq: c,
      parse: f,
      not: l,
      and: h,
      or: p,
      all: v,
      any: d,
      is: m,
      eq: g,
      val: y,
      invoke: w,
      pattern: _,
      isUndefined: b,
      isDefined: R,
      isNull: E,
      isNullOrUndefined: C,
      isFunction: P,
      isNumber: T,
      isString: k,
      isObject: O,
      isArray: x,
      isDate: j,
      isRegExp: V,
      isInjectable: I,
      isPromise: H,
      Queue: At,
      maxLength: Ut,
      padString: Nt,
      kebobString: Ft,
      functionToString: Lt,
      fnToString: Mt,
      stringify: zt,
      beforeAfterSubstr: Wt,
      hostRegex: Jt,
      stripLastPathElement: Qt,
      splitHash: Kt,
      splitQuery: Yt,
      splitEqual: Zt,
      trimHashVal: Xt,
      splitOnDelim: te,
      joinNeighborsR: ee,
      get Category() {
        return t.Category;
      },
      Trace: fe,
      trace: le,
      get DefType() {
        return t.DefType;
      },
      Param: ye,
      ParamTypes: we,
      StateParams: _e,
      ParamType: he,
      PathNode: Se,
      PathUtils: be,
      resolvePolicies: Re,
      defaultResolvePolicy: Ee,
      Resolvable: Ce,
      NATIVE_INJECTOR_TOKEN: 'Native Injector',
      ResolveContext: Oe,
      resolvablesBuilder: Ue,
      StateBuilder: Le,
      StateObject: Me,
      StateMatcher: Be,
      StateQueueManager: Ge,
      StateRegistry: ze,
      StateService: Br,
      TargetState: $e,
      get TransitionHookPhase() {
        return t.TransitionHookPhase;
      },
      get TransitionHookScope() {
        return t.TransitionHookScope;
      },
      HookBuilder: Ze,
      matchState: Qe,
      RegisteredHook: Ke,
      makeEvent: Ye,
      get RejectType() {
        return t.RejectType;
      },
      Rejection: qt,
      Transition: tr,
      TransitionHook: Je,
      TransitionEventType: Ur,
      defaultTransOpts: Lr,
      TransitionService: Mr,
      UrlRules: dr,
      UrlConfig: mr,
      UrlMatcher: ir,
      ParamFactory: ar,
      UrlMatcherFactory: ur,
      UrlRouter: lr,
      UrlRuleFactory: sr,
      BaseUrlRule: cr,
      UrlService: gr,
      ViewService: hr,
      UIRouterGlobals: pr,
      UIRouter: Sr,
      $q: Gr,
      $injector: Qr,
      BaseLocationServices: rn,
      HashLocationService: on,
      MemoryLocationService: un,
      PushStateLocationService: cn,
      MemoryLocationConfig: fn,
      BrowserLocationConfig: ln,
      keyValsToObjectR: Kr,
      getParams: Yr,
      parseUrl: Zr,
      buildUrl: Xr,
      locationPluginFactory: tn,
      servicesPlugin: hn,
      hashLocationPlugin: pn,
      pushStateLocationPlugin: vn,
      memoryLocationPlugin: dn,
      UIRouterPluginBase: mn,
    });
  function yn() {
    var t = null;
    return function (e, r) {
      return (t = t || D.$injector.get('$templateFactory')), [new $n(e, r, t)];
    };
  }
  var wn = function (t, e) {
    return t.reduce(function (t, r) {
      return t || R(e[r]);
    }, !1);
  };
  function _n(t) {
    if (!t.parent) return {};
    var e = ['component', 'bindings', 'componentProvider'],
      r = [
        'templateProvider',
        'templateUrl',
        'template',
        'notify',
        'async',
      ].concat([
        'controller',
        'controllerProvider',
        'controllerAs',
        'resolveAs',
      ]),
      n = e.concat(r);
    if (R(t.views) && wn(n, t))
      throw new Error(
        "State '" +
          t.name +
          "' has a 'views' object. It cannot also have \"view properties\" at the state level.  Move the following properties into a view (in the 'views' object):  " +
          n
            .filter(function (e) {
              return R(t[e]);
            })
            .join(', '),
      );
    var i = {},
      o = t.views || { $default: at(t, n) };
    return (
      M(o, function (n, o) {
        if (
          ((o = o || '$default'),
          k(n) && (n = { component: n }),
          (n = B({}, n)),
          wn(e, n) && wn(r, n))
        )
          throw new Error(
            'Cannot combine: ' +
              e.join('|') +
              ' with: ' +
              r.join('|') +
              " in stateview: '" +
              o +
              '@' +
              t.name +
              "'",
          );
        (n.resolveAs = n.resolveAs || '$resolve'),
          (n.$type = 'ng1'),
          (n.$context = t),
          (n.$name = o);
        var a = hr.normalizeUIViewTarget(n.$context, n.$name);
        (n.$uiViewName = a.uiViewName),
          (n.$uiViewContextAnchor = a.uiViewContextAnchor),
          (i[o] = n);
      }),
      i
    );
  }
  var Sn = 0,
    $n = (function () {
      function t(t, e, r) {
        var n = this;
        (this.path = t),
          (this.viewDecl = e),
          (this.factory = r),
          (this.$id = Sn++),
          (this.loaded = !1),
          (this.getTemplate = function (t, e) {
            return n.component
              ? n.factory.makeComponentTemplate(
                  t,
                  e,
                  n.component,
                  n.viewDecl.bindings,
                )
              : n.template;
          });
      }
      return (
        (t.prototype.load = function () {
          var t = this,
            e = D.$q,
            r = new Oe(this.path),
            n = this.path.reduce(function (t, e) {
              return B(t, e.paramValues);
            }, {}),
            i = {
              template: e.when(this.factory.fromConfig(this.viewDecl, n, r)),
              controller: e.when(this.getController(r)),
            };
          return e.all(i).then(function (e) {
            return (
              le.traceViewServiceEvent('Loaded', t),
              (t.controller = e.controller),
              B(t, e.template),
              t
            );
          });
        }),
        (t.prototype.getController = function (t) {
          var e = this.viewDecl.controllerProvider;
          if (!I(e)) return this.viewDecl.controller;
          var r = D.$injector.annotate(e),
            n = x(e) ? Tt(e) : e;
          return new Ce('', n, r).get(t);
        }),
        t
      );
    })(),
    bn = (function () {
      function t() {
        var t = this;
        (this._useHttp = n.version.minor < 3),
          (this.$get = [
            '$http',
            '$templateCache',
            '$injector',
            function (e, r, n) {
              return (
                (t.$templateRequest =
                  n.has &&
                  n.has('$templateRequest') &&
                  n.get('$templateRequest')),
                (t.$http = e),
                (t.$templateCache = r),
                t
              );
            },
          ]);
      }
      return (
        (t.prototype.useHttpService = function (t) {
          this._useHttp = t;
        }),
        (t.prototype.fromConfig = function (t, e, r) {
          var n = function (t) {
              return D.$q.when(t).then(function (t) {
                return { template: t };
              });
            },
            i = function (t) {
              return D.$q.when(t).then(function (t) {
                return { component: t };
              });
            };
          return R(t.template)
            ? n(this.fromString(t.template, e))
            : R(t.templateUrl)
            ? n(this.fromUrl(t.templateUrl, e))
            : R(t.templateProvider)
            ? n(this.fromProvider(t.templateProvider, e, r))
            : R(t.component)
            ? i(t.component)
            : R(t.componentProvider)
            ? i(this.fromComponentProvider(t.componentProvider, e, r))
            : n('<ui-view></ui-view>');
        }),
        (t.prototype.fromString = function (t, e) {
          return P(t) ? t(e) : t;
        }),
        (t.prototype.fromUrl = function (t, e) {
          return (
            P(t) && (t = t(e)),
            null == t
              ? null
              : this._useHttp
              ? this.$http
                  .get(t, {
                    cache: this.$templateCache,
                    headers: { Accept: 'text/html' },
                  })
                  .then(function (t) {
                    return t.data;
                  })
              : this.$templateRequest(t)
          );
        }),
        (t.prototype.fromProvider = function (t, e, r) {
          var n = D.$injector.annotate(t),
            i = x(t) ? Tt(t) : t;
          return new Ce('', i, n).get(r);
        }),
        (t.prototype.fromComponentProvider = function (t, e, r) {
          var n = D.$injector.annotate(t),
            i = x(t) ? Tt(t) : t;
          return new Ce('', i, n).get(r);
        }),
        (t.prototype.makeComponentTemplate = function (t, e, r, i) {
          i = i || {};
          var o = n.version.minor >= 3 ? '::' : '',
            a = function (t) {
              var e = Ft(t);
              return /^(x|data)-/.exec(e) ? 'x-' + e : e;
            },
            u = (function (t) {
              var e = D.$injector.get(t + 'Directive');
              if (!e || !e.length)
                throw new Error("Unable to find component named '" + t + "'");
              return e.map(Rn).reduce(mt, []);
            })(r)
              .map(function (r) {
                var n = r.name,
                  u = r.type,
                  s = a(n);
                if (t.attr(s) && !i[n]) return s + "='" + t.attr(s) + "'";
                var c = i[n] || n;
                if ('@' === u) return s + "='{{" + o + '$resolve.' + c + "}}'";
                if ('&' === u) {
                  var f = e.getResolvable(c),
                    l = f && f.data,
                    h = (l && D.$injector.annotate(l)) || [];
                  return (
                    s +
                    "='$resolve." +
                    c +
                    (x(l) ? '[' + (l.length - 1) + ']' : '') +
                    '(' +
                    h.join(',') +
                    ")'"
                  );
                }
                return s + "='" + o + '$resolve.' + c + "'";
              })
              .join(' '),
            s = a(r);
          return '<' + s + ' ' + u + '></' + s + '>';
        }),
        t
      );
    })();
  var Rn = function (t) {
      return O(t.bindToController) ? En(t.bindToController) : En(t.scope);
    },
    En = function (t) {
      return Object.keys(t || {})
        .map(function (e) {
          return [e, /^([=<@&])[?]?(.*)/.exec(t[e])];
        })
        .filter(function (t) {
          return R(t) && x(t[1]);
        })
        .map(function (t) {
          return { name: t[1][2] || t[0], type: t[1][1] };
        });
    },
    Cn = (function () {
      function t(e, r) {
        (this.stateRegistry = e),
          (this.stateService = r),
          J(y(t.prototype), this, y(this));
      }
      return (
        (t.prototype.decorator = function (t, e) {
          return this.stateRegistry.decorator(t, e) || this;
        }),
        (t.prototype.state = function (t, e) {
          return (
            O(t) ? (e = t) : (e.name = t), this.stateRegistry.register(e), this
          );
        }),
        (t.prototype.onInvalid = function (t) {
          return this.stateService.onInvalid(t);
        }),
        t
      );
    })(),
    Pn = function (t) {
      return function (e) {
        var r = e[t],
          n = 'onExit' === t ? 'from' : 'to';
        return r
          ? function (t, e) {
              var i = new Oe(t.treeChanges(n)).subContext(e.$$state()),
                o = B(Bn(i), { $state$: e, $transition$: t });
              return D.$injector.invoke(r, this, o);
            }
          : void 0;
      };
    },
    Tn = (function () {
      function t(t) {
        (this._urlListeners = []), (this.$locationProvider = t);
        var e = y(t);
        J(e, this, e, ['hashPrefix']);
      }
      return (
        (t.monkeyPatchPathParameterType = function (t) {
          var e = t.urlMatcherFactory.type('path');
          (e.encode = function (t) {
            return null != t
              ? t.toString().replace(/(~|\/)/g, function (t) {
                  return { '~': '~~', '/': '~2F' }[t];
                })
              : t;
          }),
            (e.decode = function (t) {
              return null != t
                ? t.toString().replace(/(~~|~2F)/g, function (t) {
                    return { '~~': '~', '~2F': '/' }[t];
                  })
                : t;
            });
        }),
        (t.prototype.dispose = function () {}),
        (t.prototype.onChange = function (t) {
          var e = this;
          return (
            this._urlListeners.push(t),
            function () {
              return Z(e._urlListeners)(t);
            }
          );
        }),
        (t.prototype.html5Mode = function () {
          var t = this.$locationProvider.html5Mode();
          return (t = O(t) ? t.enabled : t) && this.$sniffer.history;
        }),
        (t.prototype.baseHref = function () {
          return (
            this._baseHref ||
            (this._baseHref =
              this.$browser.baseHref() || this.$window.location.pathname)
          );
        }),
        (t.prototype.url = function (t, e, r) {
          return (
            void 0 === e && (e = !1),
            R(t) && this.$location.url(t),
            e && this.$location.replace(),
            r && this.$location.state(r),
            this.$location.url()
          );
        }),
        (t.prototype._runtimeServices = function (t, e, r, n, i) {
          var o = this;
          (this.$location = e),
            (this.$sniffer = r),
            (this.$browser = n),
            (this.$window = i),
            t.$on('$locationChangeSuccess', function (t) {
              return o._urlListeners.forEach(function (e) {
                return e(t);
              });
            });
          var a = y(e);
          J(a, this, a, ['replace', 'path', 'search', 'hash']),
            J(a, this, a, ['port', 'protocol', 'host']);
        }),
        t
      );
    })(),
    kn = (function () {
      function t(t) {
        this.router = t;
      }
      return (
        (t.injectableHandler = function (t, e) {
          return function (r) {
            return D.$injector.invoke(e, null, {
              $match: r,
              $stateParams: t.globals.params,
            });
          };
        }),
        (t.prototype.$get = function () {
          var t = this.router.urlService;
          return (
            this.router.urlRouter.update(!0),
            t.interceptDeferred || t.listen(),
            this.router.urlRouter
          );
        }),
        (t.prototype.rule = function (t) {
          var e = this;
          if (!P(t)) throw new Error("'rule' must be a function");
          var r = new cr(function () {
            return t(D.$injector, e.router.locationService);
          }, z);
          return this.router.urlService.rules.rule(r), this;
        }),
        (t.prototype.otherwise = function (t) {
          var e = this,
            r = this.router.urlService.rules;
          if (k(t)) r.otherwise(t);
          else {
            if (!P(t)) throw new Error("'rule' must be a string or function");
            r.otherwise(function () {
              return t(D.$injector, e.router.locationService);
            });
          }
          return this;
        }),
        (t.prototype.when = function (e, r) {
          return (
            (x(r) || P(r)) && (r = t.injectableHandler(this.router, r)),
            this.router.urlService.rules.when(e, r),
            this
          );
        }),
        (t.prototype.deferIntercept = function (t) {
          this.router.urlService.deferIntercept(t);
        }),
        t
      );
    })();
  n.module('ui.router.angular1', []);
  var On = n.module('ui.router.init', ['ng']),
    xn = n.module('ui.router.util', ['ui.router.init']),
    jn = n.module('ui.router.router', ['ui.router.util']),
    Vn = n.module('ui.router.state', [
      'ui.router.router',
      'ui.router.util',
      'ui.router.angular1',
    ]),
    In = n.module('ui.router', [
      'ui.router.init',
      'ui.router.state',
      'ui.router.angular1',
    ]),
    Hn = (n.module('ui.router.compat', ['ui.router']), null);
  function An(t) {
    ((Hn = this.router = new Sr()).stateProvider = new Cn(
      Hn.stateRegistry,
      Hn.stateService,
    )),
      Hn.stateRegistry.decorator('views', _n),
      Hn.stateRegistry.decorator('onExit', Pn('onExit')),
      Hn.stateRegistry.decorator('onRetain', Pn('onRetain')),
      Hn.stateRegistry.decorator('onEnter', Pn('onEnter')),
      Hn.viewService._pluginapi._viewConfigFactory('ng1', yn()),
      (Hn.urlService.config._decodeParams = !1);
    var e = (Hn.locationService = Hn.locationConfig = new Tn(t));
    function r(t, r, n, i, o, a, u) {
      return (
        e._runtimeServices(o, t, i, r, n), delete Hn.router, delete Hn.$get, Hn
      );
    }
    return (
      Tn.monkeyPatchPathParameterType(Hn),
      (Hn.router = Hn),
      (Hn.$get = r),
      (r.$inject = [
        '$location',
        '$browser',
        '$window',
        '$sniffer',
        '$rootScope',
        '$http',
        '$templateCache',
      ]),
      Hn
    );
  }
  An.$inject = ['$locationProvider'];
  var Dn = function (t) {
    return [
      '$uiRouterProvider',
      function (e) {
        var r = e.router[t];
        return (
          (r.$get = function () {
            return r;
          }),
          r
        );
      },
    ];
  };
  function qn(t, e, r) {
    if (
      ((D.$injector = t),
      (D.$q = e),
      !Object.prototype.hasOwnProperty.call(t, 'strictDi'))
    )
      try {
        t.invoke(function (t) {});
      } catch (e) {
        t.strictDi = !!/strict mode/.exec(e && e.toString());
      }
    r.stateRegistry
      .get()
      .map(function (t) {
        return t.$$state().resolvables;
      })
      .reduce(mt, [])
      .filter(function (t) {
        return 'deferred' === t.deps;
      })
      .forEach(function (e) {
        return (e.deps = t.annotate(e.resolveFn, t.strictDi));
      });
  }
  qn.$inject = ['$injector', '$q', '$uiRouter'];
  function Un(t) {
    t.$watch(function () {
      le.approximateDigests++;
    });
  }
  (Un.$inject = ['$rootScope']),
    On.provider('$uiRouter', An),
    jn.provider('$urlRouter', [
      '$uiRouterProvider',
      function (t) {
        return (t.urlRouterProvider = new kn(t));
      },
    ]),
    xn.provider('$urlService', Dn('urlService')),
    xn.provider('$urlMatcherFactory', [
      '$uiRouterProvider',
      function () {
        return Hn.urlMatcherFactory;
      },
    ]),
    xn.provider('$templateFactory', function () {
      return new bn();
    }),
    Vn.provider('$stateRegistry', Dn('stateRegistry')),
    Vn.provider('$uiRouterGlobals', Dn('globals')),
    Vn.provider('$transitions', Dn('transitionService')),
    Vn.provider('$state', [
      '$uiRouterProvider',
      function () {
        return B(Hn.stateProvider, {
          $get: function () {
            return Hn.stateService;
          },
        });
      },
    ]),
    Vn.factory('$stateParams', [
      '$uiRouter',
      function (t) {
        return t.globals.params;
      },
    ]),
    In.factory('$view', function () {
      return Hn.viewService;
    }),
    In.service('$trace', function () {
      return le;
    }),
    In.run(Un),
    xn.run(['$urlMatcherFactory', function (t) {}]),
    Vn.run(['$state', function (t) {}]),
    jn.run(['$urlRouter', function (t) {}]),
    On.run(qn);
  var Nn,
    Fn,
    Ln,
    Mn,
    Bn = function (t) {
      return t
        .getTokens()
        .filter(k)
        .map(function (e) {
          var r = t.getResolvable(e);
          return [e, 'NOWAIT' === t.getPolicy(r).async ? r.promise : r.data];
        })
        .reduce(Pt, {});
    };
  function Gn(t) {
    var e = t.match(/^\s*({[^}]*})\s*$/);
    e && (t = '(' + e[1] + ')');
    var r = t.replace(/\n/g, ' ').match(/^\s*([^(]*?)\s*(\((.*)\))?\s*$/);
    if (!r || 4 !== r.length) throw new Error("Invalid state ref '" + t + "'");
    return { state: r[1] || null, paramExpr: r[3] || null };
  }
  function zn(t) {
    var e = t.parent().inheritedData('$uiView'),
      r = f('$cfg.path')(e);
    return r ? Tt(r).state.name : void 0;
  }
  function Wn(t, e, r) {
    var n = r.uiState || t.current.name,
      i = B(
        (function (t, e) {
          return { relative: zn(t) || e.$current, inherit: !0, source: 'sref' };
        })(e, t),
        r.uiStateOpts || {},
      ),
      o = t.href(n, r.uiStateParams, i);
    return {
      uiState: n,
      uiStateParams: r.uiStateParams,
      uiStateOpts: i,
      href: o,
    };
  }
  function Jn(t) {
    var e =
        '[object SVGAnimatedString]' ===
        Object.prototype.toString.call(t.prop('href')),
      r = 'FORM' === t[0].nodeName;
    return {
      attr: r ? 'action' : e ? 'xlink:href' : 'href',
      isAnchor: 'A' === t.prop('tagName').toUpperCase(),
      clickable: !r,
    };
  }
  function Qn(t, e, r, n, i) {
    return function (o) {
      var a = o.which || o.button,
        u = i();
      if (
        !(
          a > 1 ||
          o.ctrlKey ||
          o.metaKey ||
          o.shiftKey ||
          o.altKey ||
          t.attr('target')
        )
      ) {
        var s = r(function () {
          t.attr('disabled') || e.go(u.uiState, u.uiStateParams, u.uiStateOpts);
        });
        o.preventDefault();
        var c = n.isAnchor && !u.href ? 1 : 0;
        o.preventDefault = function () {
          c-- <= 0 && r.cancel(s);
        };
      }
    };
  }
  function Kn(t, e, r, n) {
    var i;
    n && (i = n.events), x(i) || (i = ['click']);
    for (var o = t.on ? 'on' : 'bind', a = 0, u = i; a < u.length; a++) {
      var s = u[a];
      t[o](s, r);
    }
    e.$on('$destroy', function () {
      for (var e = t.off ? 'off' : 'unbind', n = 0, o = i; n < o.length; n++) {
        var a = o[n];
        t[e](a, r);
      }
    });
  }
  function Yn(t) {
    var e = function (e, r, n) {
      return t.is(e, r, n);
    };
    return (e.$stateful = !0), e;
  }
  function Zn(t) {
    var e = function (e, r, n) {
      return t.includes(e, r, n);
    };
    return (e.$stateful = !0), e;
  }
  function Xn(t, e, r, i, o) {
    var a = f('viewDecl.controllerAs'),
      u = f('viewDecl.resolveAs');
    return {
      restrict: 'ECA',
      priority: -400,
      compile: function (i) {
        var s = i.html();
        return (
          i.empty(),
          function (i, c) {
            var f = c.data('$uiView');
            if (!f) return c.html(s), void t(c.contents())(i);
            var l = f.$cfg || { viewDecl: {}, getTemplate: W },
              h = l.path && new Oe(l.path);
            c.html(l.getTemplate(c, h) || s),
              le.traceUIViewFill(f.$uiView, c.html());
            var p = t(c.contents()),
              v = l.controller,
              d = a(l),
              m = u(l),
              g = h && Bn(h);
            if (((i[m] = g), v)) {
              var y = e(v, B({}, g, { $scope: i, $element: c }));
              d && ((i[d] = y), (i[d][m] = g)),
                c.data('$ngControllerController', y),
                c.children().data('$ngControllerController', y),
                ri(o, r, y, i, l);
            }
            if (k(l.component))
              var w = Ft(l.component),
                _ = new RegExp('^(x-|data-)?' + w + '$', 'i'),
                S = i.$watch(
                  function () {
                    var t = [].slice.call(c[0].children).filter(function (t) {
                      return t && t.tagName && _.exec(t.tagName);
                    });
                    return (
                      t && n.element(t).data('$' + l.component + 'Controller')
                    );
                  },
                  function (t) {
                    t && (ri(o, r, t, i, l), S());
                  },
                );
            p(i);
          }
        );
      },
    };
  }
  (Nn = [
    '$uiRouter',
    '$timeout',
    function (t, e) {
      var r = t.stateService;
      return {
        restrict: 'A',
        require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
        link: function (n, i, o, a) {
          var u = Jn(i),
            s = a[1] || a[0],
            c = null,
            f = {},
            l = function () {
              return Wn(r, i, f);
            },
            h = Gn(o.uiSref);
          function p() {
            var t = l();
            c && c(),
              s && (c = s.$$addStateInfo(t.uiState, t.uiStateParams)),
              null != t.href && o.$set(u.attr, t.href);
          }
          if (
            ((f.uiState = h.state),
            (f.uiStateOpts = o.uiSrefOpts ? n.$eval(o.uiSrefOpts) : {}),
            h.paramExpr &&
              (n.$watch(
                h.paramExpr,
                function (t) {
                  (f.uiStateParams = B({}, t)), p();
                },
                !0,
              ),
              (f.uiStateParams = B({}, n.$eval(h.paramExpr)))),
            p(),
            n.$on('$destroy', t.stateRegistry.onStatesChanged(p)),
            n.$on('$destroy', t.transitionService.onSuccess({}, p)),
            u.clickable)
          ) {
            var v = Qn(i, r, e, u, l);
            Kn(i, n, v, f.uiStateOpts);
          }
        },
      };
    },
  ]),
    (Fn = [
      '$uiRouter',
      '$timeout',
      function (t, e) {
        var r = t.stateService;
        return {
          restrict: 'A',
          require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
          link: function (n, i, o, a) {
            var u,
              s = Jn(i),
              c = a[1] || a[0],
              f = null,
              l = {},
              h = function () {
                return Wn(r, i, l);
              },
              p = ['uiState', 'uiStateParams', 'uiStateOpts'],
              v = p.reduce(function (t, e) {
                return (t[e] = W), t;
              }, {});
            function d() {
              var t = h();
              f && f(),
                c && (f = c.$$addStateInfo(t.uiState, t.uiStateParams)),
                null != t.href && o.$set(s.attr, t.href);
            }
            p.forEach(function (t) {
              (l[t] = o[t] ? n.$eval(o[t]) : null),
                o.$observe(t, function (e) {
                  v[t](),
                    (v[t] = n.$watch(
                      e,
                      function (e) {
                        (l[t] = e), d();
                      },
                      !0,
                    ));
                });
            }),
              d(),
              n.$on('$destroy', t.stateRegistry.onStatesChanged(d)),
              n.$on('$destroy', t.transitionService.onSuccess({}, d)),
              s.clickable &&
                ((u = Qn(i, r, e, s, h)), Kn(i, n, u, l.uiStateOpts));
          },
        };
      },
    ]),
    (Ln = [
      '$state',
      '$stateParams',
      '$interpolate',
      '$uiRouter',
      function (t, e, r, n) {
        return {
          restrict: 'A',
          controller: [
            '$scope',
            '$element',
            '$attrs',
            function (e, i, o) {
              var a,
                u,
                s,
                c,
                f,
                l = [];
              a = r(o.uiSrefActiveEq || '', !1)(e);
              try {
                u = e.$eval(o.uiSrefActive);
              } catch (t) {}
              function h(t) {
                t.promise.then(m, W);
              }
              function p() {
                v(u);
              }
              function v(t) {
                O(t) &&
                  ((l = []),
                  M(t, function (t, r) {
                    var n = function (t, r) {
                      var n = Gn(t);
                      d(n.state, e.$eval(n.paramExpr), r);
                    };
                    k(t)
                      ? n(t, r)
                      : x(t) &&
                        M(t, function (t) {
                          n(t, r);
                        });
                  }));
              }
              function d(e, r, n) {
                var o = {
                  state: t.get(e, zn(i)) || { name: e },
                  params: r,
                  activeClass: n,
                };
                return (
                  l.push(o),
                  function () {
                    Z(l)(o);
                  }
                );
              }
              function m() {
                var r = function (t) {
                    return t.split(/\s/).filter(z);
                  },
                  n = function (t) {
                    return t
                      .map(function (t) {
                        return t.activeClass;
                      })
                      .map(r)
                      .reduce(mt, []);
                  },
                  o = n(l).concat(r(a)).reduce(wt, []),
                  u = n(
                    l.filter(function (e) {
                      return t.includes(e.state.name, e.params);
                    }),
                  ),
                  s = !!l.filter(function (e) {
                    return t.is(e.state.name, e.params);
                  }).length
                    ? r(a)
                    : [],
                  c = u.concat(s).reduce(wt, []),
                  f = o.filter(function (t) {
                    return !K(c, t);
                  });
                e.$evalAsync(function () {
                  c.forEach(function (t) {
                    return i.addClass(t);
                  }),
                    f.forEach(function (t) {
                      return i.removeClass(t);
                    });
                });
              }
              v((u = u || r(o.uiSrefActive || '', !1)(e))),
                (this.$$addStateInfo = function (t, e) {
                  if (!(O(u) && l.length > 0)) {
                    var r = d(t, e, u);
                    return m(), r;
                  }
                }),
                e.$on(
                  '$destroy',
                  ((s = n.stateRegistry.onStatesChanged(p)),
                  (c = n.transitionService.onStart({}, h)),
                  (f = e.$on('$stateChangeSuccess', m)),
                  function () {
                    s(), c(), f();
                  }),
                ),
                n.globals.transition && h(n.globals.transition),
                m();
            },
          ],
        };
      },
    ]),
    n
      .module('ui.router.state')
      .directive('uiSref', Nn)
      .directive('uiSrefActive', Ln)
      .directive('uiSrefActiveEq', Ln)
      .directive('uiState', Fn),
    (Yn.$inject = ['$state']),
    (Zn.$inject = ['$state']),
    n
      .module('ui.router.state')
      .filter('isState', Yn)
      .filter('includedByState', Zn),
    (Mn = [
      '$view',
      '$animate',
      '$uiViewScroll',
      '$interpolate',
      '$q',
      function (t, e, r, i, o) {
        var a = {
            $cfg: { viewDecl: { $context: t._pluginapi._rootViewContext() } },
            $uiView: {},
          },
          u = {
            count: 0,
            restrict: 'ECA',
            terminal: !0,
            priority: 400,
            transclude: 'element',
            compile: function (s, c, l) {
              return function (s, c, h) {
                var p,
                  v,
                  d,
                  m,
                  g = h.onload || '',
                  y = h.autoscroll,
                  w = {
                    enter: function (t, r, i) {
                      n.version.minor > 2
                        ? e.enter(t, null, r).then(i)
                        : e.enter(t, null, r, i);
                    },
                    leave: function (t, r) {
                      n.version.minor > 2 ? e.leave(t).then(r) : e.leave(t, r);
                    },
                  },
                  _ = c.inheritedData('$uiView') || a,
                  S = i(h.uiView || h.name || '')(s) || '$default',
                  $ = {
                    $type: 'ng1',
                    id: u.count++,
                    name: S,
                    fqn: _.$uiView.fqn ? _.$uiView.fqn + '.' + S : S,
                    config: null,
                    configUpdated: function (t) {
                      if (t && !(t instanceof $n)) return;
                      if (((e = m), (r = t), e === r)) return;
                      var e, r;
                      le.traceUIViewConfigUpdated(
                        $,
                        t && t.viewDecl && t.viewDecl.$context,
                      ),
                        (m = t),
                        E(t);
                    },
                    get creationContext() {
                      var t = f('$cfg.viewDecl.$context')(_),
                        e = f('$uiView.creationContext')(_);
                      return t || e;
                    },
                  };
                le.traceUIViewEvent('Linking', $),
                  c.data('$uiView', { $uiView: $ }),
                  E();
                var b = t.registerUIView($);
                function E(t) {
                  var e = s.$new(),
                    n = o.defer(),
                    i = o.defer(),
                    a = { $cfg: t, $uiView: $ },
                    u = {
                      $animEnter: n.promise,
                      $animLeave: i.promise,
                      $$animLeave: i,
                    };
                  e.$emit('$viewContentLoading', S);
                  var f = l(e, function (t) {
                    t.data('$uiViewAnim', u),
                      t.data('$uiView', a),
                      w.enter(t, c, function () {
                        n.resolve(),
                          d && d.$emit('$viewContentAnimationEnded'),
                          ((R(y) && !y) || s.$eval(y)) && r(t);
                      }),
                      (function () {
                        if (
                          (p &&
                            (le.traceUIViewEvent(
                              'Removing (previous) el',
                              p.data('$uiView'),
                            ),
                            p.remove(),
                            (p = null)),
                          d &&
                            (le.traceUIViewEvent('Destroying scope', $),
                            d.$destroy(),
                            (d = null)),
                          v)
                        ) {
                          var t = v.data('$uiViewAnim');
                          le.traceUIViewEvent('Animate out', t),
                            w.leave(v, function () {
                              t.$$animLeave.resolve(), (p = null);
                            }),
                            (p = v),
                            (v = null);
                        }
                      })();
                  });
                  (v = f),
                    (d = e).$emit('$viewContentLoaded', t || m),
                    d.$eval(g);
                }
                s.$on('$destroy', function () {
                  le.traceUIViewEvent('Destroying/Unregistering', $), b();
                });
              };
            },
          };
        return u;
      },
    ]),
    (Xn.$inject = ['$compile', '$controller', '$transitions', '$view', '$q']);
  var ti = 'function' == typeof n.module('ui.router').component,
    ei = 0;
  function ri(t, e, r, n, i) {
    !P(r.$onInit) ||
      ((i.viewDecl.component || i.viewDecl.componentProvider) && ti) ||
      r.$onInit();
    var o = Tt(i.path).state.self,
      a = { bind: r };
    if (P(r.uiOnParamsChanged)) {
      var u = new Oe(i.path).getResolvable('$transition$').data;
      n.$on(
        '$destroy',
        e.onSuccess(
          {},
          function (t) {
            if (t !== u && -1 === t.exiting().indexOf(o)) {
              var e = t.params('to'),
                n = t.params('from'),
                i = function (t) {
                  return t.paramSchema;
                },
                a = t.treeChanges('to').map(i).reduce(mt, []),
                s = t.treeChanges('from').map(i).reduce(mt, []),
                c = a.filter(function (t) {
                  var r = s.indexOf(t);
                  return -1 === r || !s[r].type.equals(e[t.id], n[t.id]);
                });
              if (c.length) {
                var f = c.map(function (t) {
                    return t.id;
                  }),
                  l = ct(e, function (t, e) {
                    return -1 !== f.indexOf(e);
                  });
                r.uiOnParamsChanged(l, t);
              }
            }
          },
          a,
        ),
      );
    }
    if (P(r.uiCanExit)) {
      var s = ei++,
        c = function (t) {
          return (
            !!t &&
            ((t._uiCanExitIds && !0 === t._uiCanExitIds[s]) ||
              c(t.redirectedFrom()))
          );
        },
        f = { exiting: o.name };
      n.$on(
        '$destroy',
        e.onBefore(
          f,
          function (e) {
            var n,
              i = (e._uiCanExitIds = e._uiCanExitIds || {});
            return (
              c(e) ||
                (n = t.when(r.uiCanExit(e))).then(function (t) {
                  return (i[s] = !1 !== t);
                }),
              n
            );
          },
          a,
        ),
      );
    }
  }
  n.module('ui.router.state').directive('uiView', Mn),
    n.module('ui.router.state').directive('uiView', Xn),
    n.module('ui.router.state').provider('$uiViewScroll', function () {
      var t = !1;
      (this.useAnchorScroll = function () {
        t = !0;
      }),
        (this.$get = [
          '$anchorScroll',
          '$timeout',
          function (e, r) {
            return t
              ? e
              : function (t) {
                  return r(
                    function () {
                      t[0].scrollIntoView();
                    },
                    0,
                    !1,
                  );
                };
          },
        ]);
    });
  (t.$injector = Qr),
    (t.$q = Gr),
    (t.BaseLocationServices = rn),
    (t.BaseUrlRule = cr),
    (t.BrowserLocationConfig = ln),
    (t.Glob = Ht),
    (t.HashLocationService = on),
    (t.HookBuilder = Ze),
    (t.MemoryLocationConfig = fn),
    (t.MemoryLocationService = un),
    (t.NATIVE_INJECTOR_TOKEN = 'Native Injector'),
    (t.Ng1ViewConfig = $n),
    (t.Param = ye),
    (t.ParamFactory = ar),
    (t.ParamType = he),
    (t.ParamTypes = we),
    (t.PathNode = Se),
    (t.PathUtils = be),
    (t.PushStateLocationService = cn),
    (t.Queue = At),
    (t.RegisteredHook = Ke),
    (t.Rejection = qt),
    (t.Resolvable = Ce),
    (t.ResolveContext = Oe),
    (t.StateBuilder = Le),
    (t.StateMatcher = Be),
    (t.StateObject = Me),
    (t.StateParams = _e),
    (t.StateProvider = Cn),
    (t.StateQueueManager = Ge),
    (t.StateRegistry = ze),
    (t.StateService = Br),
    (t.TargetState = $e),
    (t.Trace = fe),
    (t.Transition = tr),
    (t.TransitionEventType = Ur),
    (t.TransitionHook = Je),
    (t.TransitionService = Mr),
    (t.UIRouter = Sr),
    (t.UIRouterGlobals = pr),
    (t.UIRouterPluginBase = mn),
    (t.UrlConfig = mr),
    (t.UrlMatcher = ir),
    (t.UrlMatcherFactory = ur),
    (t.UrlRouter = lr),
    (t.UrlRouterProvider = kn),
    (t.UrlRuleFactory = sr),
    (t.UrlRules = dr),
    (t.UrlService = gr),
    (t.ViewService = hr),
    (t._extend = Ot),
    (t._inArray = Y),
    (t._pushTo = et),
    (t._removeFrom = X),
    (t.all = v),
    (t.allTrueR = vt),
    (t.ancestors = ot),
    (t.and = h),
    (t.any = d),
    (t.anyTrueR = dt),
    (t.applyPairs = Pt),
    (t.arrayTuples = Ct),
    (t.assertFn = Rt),
    (t.assertMap = bt),
    (t.assertPredicate = $t),
    (t.beforeAfterSubstr = Wt),
    (t.buildUrl = Xr),
    (t.compose = a),
    (t.copy = kt),
    (t.core = gn),
    (t.createProxyFunctions = J),
    (t.curry = o),
    (t.default = 'ui.router'),
    (t.defaultResolvePolicy = Ee),
    (t.defaultTransOpts = Lr),
    (t.defaults = nt),
    (t.deregAll = rt),
    (t.eq = g),
    (t.equals = G),
    (t.extend = B),
    (t.filter = ct),
    (t.find = ft),
    (t.flatten = St),
    (t.flattenR = gt),
    (t.fnToString = Mt),
    (t.forEach = M),
    (t.fromJson = F),
    (t.functionToString = Lt),
    (t.getLocals = Bn),
    (t.getNg1ViewConfigFactory = yn),
    (t.getParams = Yr),
    (t.hashLocationPlugin = pn),
    (t.hostRegex = Jt),
    (t.identity = z),
    (t.inArray = K),
    (t.inherit = Q),
    (t.invoke = w),
    (t.is = m),
    (t.isArray = x),
    (t.isDate = j),
    (t.isDefined = R),
    (t.isFunction = P),
    (t.isInjectable = I),
    (t.isNull = E),
    (t.isNullOrUndefined = C),
    (t.isNumber = T),
    (t.isObject = O),
    (t.isPromise = H),
    (t.isRegExp = V),
    (t.isString = k),
    (t.isUndefined = b),
    (t.joinNeighborsR = ee),
    (t.kebobString = Ft),
    (t.keyValsToObjectR = Kr),
    (t.locationPluginFactory = tn),
    (t.makeEvent = Ye),
    (t.makeStub = A),
    (t.map = ht),
    (t.mapObj = lt),
    (t.matchState = Qe),
    (t.maxLength = Ut),
    (t.memoryLocationPlugin = dn),
    (t.mergeR = it),
    (t.ng1ViewsBuilder = _n),
    (t.noop = W),
    (t.not = l),
    (t.omit = ut),
    (t.or = p),
    (t.padString = Nt),
    (t.pairs = Et),
    (t.parse = f),
    (t.parseUrl = Zr),
    (t.pattern = _),
    (t.pick = at),
    (t.pipe = u),
    (t.pluck = st),
    (t.prop = s),
    (t.propEq = c),
    (t.pushR = yt),
    (t.pushStateLocationPlugin = vn),
    (t.pushTo = tt),
    (t.removeFrom = Z),
    (t.resolvablesBuilder = Ue),
    (t.resolvePolicies = Re),
    (t.root = U),
    (t.services = D),
    (t.servicesPlugin = hn),
    (t.silenceUncaughtInPromise = Vt),
    (t.silentRejection = It),
    (t.splitEqual = Zt),
    (t.splitHash = Kt),
    (t.splitOnDelim = te),
    (t.splitQuery = Yt),
    (t.stringify = zt),
    (t.stripLastPathElement = Qt),
    (t.tail = Tt),
    (t.toJson = L),
    (t.trace = le),
    (t.trimHashVal = Xt),
    (t.uniqR = wt),
    (t.unnest = _t),
    (t.unnestR = mt),
    (t.val = y),
    (t.values = pt),
    (t.watchDigests = Un),
    Object.defineProperty(t, '__esModule', { value: !0 });
});
//# sourceMappingURL=angular-ui-router.min.js.map
