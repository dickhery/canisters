const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DXMaWJol.js","assets/index-BpKfS_dG.js","assets/index-B2Jnob71.css"])))=>i.map(i=>d[i]);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _result, _queries, _options, _observers, _combinedResult, _lastCombine, _lastResult, _lastQueryHashes, _observerMatches, _QueriesObserver_instances, trackResult_fn, combineResult_fn, findMatchingObservers_fn, onUpdate_fn, notify_fn, _a;
import { S as Subscribable, n as notifyManager, s as shallowEqualObjects, o as replaceEqualDeep, p as useQueryClient, r as reactExports, q as noop, c as createLucideIcon, t as keepPreviousData, _ as __vitePreload, j as jsxRuntimeExports, B as Button, X, v as useNavigate, C as CopyableId, w as formatCycles, x as formatTimestamp, a as cn } from "./index-BpKfS_dG.js";
import { Q as QueryObserver, u as useIsRestoring, a as useQueryErrorResetBoundary, e as ensureSuspenseTimers, b as ensurePreventErrorBoundaryRetry, c as useClearResetErrorBoundary, s as shouldSuspend, f as fetchOptimistic, g as getHasError, d as useListCanisters, h as useGetAppPrincipal, i as useActor, I as Input, S as Skeleton, j as useAddCanister, L as Label, k as useRemoveCanister, l as useRenameCanister, m as createActor } from "./index-DXMaWJol.js";
import { P as PaginationControls } from "./PaginationControls-D2IYkIAi.js";
import { S as StatusBadge, D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CBVsfKDh.js";
import { T as Trash2, P as Pencil } from "./trash-2-Bp3065G-.js";
function difference(array1, array2) {
  const excludeSet = new Set(array2);
  return array1.filter((x) => !excludeSet.has(x));
}
function replaceAt(array, index, value) {
  const copy = array.slice(0);
  copy[index] = value;
  return copy;
}
var QueriesObserver = (_a = class extends Subscribable {
  constructor(client, queries, options) {
    super();
    __privateAdd(this, _QueriesObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _result);
    __privateAdd(this, _queries);
    __privateAdd(this, _options);
    __privateAdd(this, _observers);
    __privateAdd(this, _combinedResult);
    __privateAdd(this, _lastCombine);
    __privateAdd(this, _lastResult);
    __privateAdd(this, _lastQueryHashes);
    __privateAdd(this, _observerMatches, []);
    __privateSet(this, _client, client);
    __privateSet(this, _options, options);
    __privateSet(this, _queries, []);
    __privateSet(this, _observers, []);
    __privateSet(this, _result, []);
    this.setQueries(queries);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _observers).forEach((observer) => {
        observer.subscribe((result) => {
          __privateMethod(this, _QueriesObserver_instances, onUpdate_fn).call(this, observer, result);
        });
      });
    }
  }
  onUnsubscribe() {
    if (!this.listeners.size) {
      this.destroy();
    }
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateGet(this, _observers).forEach((observer) => {
      observer.destroy();
    });
  }
  setQueries(queries, options) {
    __privateSet(this, _queries, queries);
    __privateSet(this, _options, options);
    notifyManager.batch(() => {
      const prevObservers = __privateGet(this, _observers);
      const newObserverMatches = __privateMethod(this, _QueriesObserver_instances, findMatchingObservers_fn).call(this, __privateGet(this, _queries));
      newObserverMatches.forEach(
        (match) => match.observer.setOptions(match.defaultedQueryOptions)
      );
      const newObservers = newObserverMatches.map((match) => match.observer);
      const newResult = newObservers.map(
        (observer) => observer.getCurrentResult()
      );
      const hasLengthChange = prevObservers.length !== newObservers.length;
      const hasIndexChange = newObservers.some(
        (observer, index) => observer !== prevObservers[index]
      );
      const hasStructuralChange = hasLengthChange || hasIndexChange;
      const hasResultChange = hasStructuralChange ? true : newResult.some((result, index) => {
        const prev = __privateGet(this, _result)[index];
        return !prev || !shallowEqualObjects(result, prev);
      });
      if (!hasStructuralChange && !hasResultChange) return;
      if (hasStructuralChange) {
        __privateSet(this, _observerMatches, newObserverMatches);
        __privateSet(this, _observers, newObservers);
      }
      __privateSet(this, _result, newResult);
      if (!this.hasListeners()) return;
      if (hasStructuralChange) {
        difference(prevObservers, newObservers).forEach((observer) => {
          observer.destroy();
        });
        difference(newObservers, prevObservers).forEach((observer) => {
          observer.subscribe((result) => {
            __privateMethod(this, _QueriesObserver_instances, onUpdate_fn).call(this, observer, result);
          });
        });
      }
      __privateMethod(this, _QueriesObserver_instances, notify_fn).call(this);
    });
  }
  getCurrentResult() {
    return __privateGet(this, _result);
  }
  getQueries() {
    return __privateGet(this, _observers).map((observer) => observer.getCurrentQuery());
  }
  getObservers() {
    return __privateGet(this, _observers);
  }
  getOptimisticResult(queries, combine) {
    const matches = __privateMethod(this, _QueriesObserver_instances, findMatchingObservers_fn).call(this, queries);
    const result = matches.map(
      (match) => match.observer.getOptimisticResult(match.defaultedQueryOptions)
    );
    const queryHashes = matches.map(
      (match) => match.defaultedQueryOptions.queryHash
    );
    return [
      result,
      (r) => {
        return __privateMethod(this, _QueriesObserver_instances, combineResult_fn).call(this, r ?? result, combine, queryHashes);
      },
      () => {
        return __privateMethod(this, _QueriesObserver_instances, trackResult_fn).call(this, result, matches);
      }
    ];
  }
}, _client = new WeakMap(), _result = new WeakMap(), _queries = new WeakMap(), _options = new WeakMap(), _observers = new WeakMap(), _combinedResult = new WeakMap(), _lastCombine = new WeakMap(), _lastResult = new WeakMap(), _lastQueryHashes = new WeakMap(), _observerMatches = new WeakMap(), _QueriesObserver_instances = new WeakSet(), trackResult_fn = function(result, matches) {
  return matches.map((match, index) => {
    const observerResult = result[index];
    return !match.defaultedQueryOptions.notifyOnChangeProps ? match.observer.trackResult(observerResult, (accessedProp) => {
      matches.forEach((m) => {
        m.observer.trackProp(accessedProp);
      });
    }) : observerResult;
  });
}, combineResult_fn = function(input, combine, queryHashes) {
  if (combine) {
    const lastHashes = __privateGet(this, _lastQueryHashes);
    const queryHashesChanged = queryHashes !== void 0 && lastHashes !== void 0 && (lastHashes.length !== queryHashes.length || queryHashes.some((hash, i) => hash !== lastHashes[i]));
    if (!__privateGet(this, _combinedResult) || __privateGet(this, _result) !== __privateGet(this, _lastResult) || queryHashesChanged || combine !== __privateGet(this, _lastCombine)) {
      __privateSet(this, _lastCombine, combine);
      __privateSet(this, _lastResult, __privateGet(this, _result));
      if (queryHashes !== void 0) {
        __privateSet(this, _lastQueryHashes, queryHashes);
      }
      __privateSet(this, _combinedResult, replaceEqualDeep(
        __privateGet(this, _combinedResult),
        combine(input)
      ));
    }
    return __privateGet(this, _combinedResult);
  }
  return input;
}, findMatchingObservers_fn = function(queries) {
  const prevObserversMap = /* @__PURE__ */ new Map();
  __privateGet(this, _observers).forEach((observer) => {
    const key = observer.options.queryHash;
    if (!key) return;
    const previousObservers = prevObserversMap.get(key);
    if (previousObservers) {
      previousObservers.push(observer);
    } else {
      prevObserversMap.set(key, [observer]);
    }
  });
  const observers = [];
  queries.forEach((options) => {
    var _a2;
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const match = (_a2 = prevObserversMap.get(defaultedOptions.queryHash)) == null ? void 0 : _a2.shift();
    const observer = match ?? new QueryObserver(__privateGet(this, _client), defaultedOptions);
    observers.push({
      defaultedQueryOptions: defaultedOptions,
      observer
    });
  });
  return observers;
}, onUpdate_fn = function(observer, result) {
  const index = __privateGet(this, _observers).indexOf(observer);
  if (index !== -1) {
    __privateSet(this, _result, replaceAt(__privateGet(this, _result), index, result));
    __privateMethod(this, _QueriesObserver_instances, notify_fn).call(this);
  }
}, notify_fn = function() {
  var _a2;
  if (this.hasListeners()) {
    const previousResult = __privateGet(this, _combinedResult);
    const newTracked = __privateMethod(this, _QueriesObserver_instances, trackResult_fn).call(this, __privateGet(this, _result), __privateGet(this, _observerMatches));
    const newResult = __privateMethod(this, _QueriesObserver_instances, combineResult_fn).call(this, newTracked, (_a2 = __privateGet(this, _options)) == null ? void 0 : _a2.combine);
    if (previousResult !== newResult) {
      notifyManager.batch(() => {
        this.listeners.forEach((listener) => {
          listener(__privateGet(this, _result));
        });
      });
    }
  }
}, _a);
function useQueries({
  queries,
  ...options
}, queryClient) {
  const client = useQueryClient();
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedQueries = reactExports.useMemo(
    () => queries.map((opts) => {
      const defaultedOptions = client.defaultQueryOptions(
        opts
      );
      defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
      return defaultedOptions;
    }),
    [queries, client, isRestoring]
  );
  defaultedQueries.forEach((queryOptions) => {
    ensureSuspenseTimers(queryOptions);
    const query = client.getQueryCache().get(queryOptions.queryHash);
    ensurePreventErrorBoundaryRetry(queryOptions, errorResetBoundary, query);
  });
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = reactExports.useState(
    () => new QueriesObserver(
      client,
      defaultedQueries,
      options
    )
  );
  const [optimisticResult, getCombinedResult, trackResult] = observer.getOptimisticResult(
    defaultedQueries,
    options.combine
  );
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop,
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setQueries(
      defaultedQueries,
      options
    );
  }, [defaultedQueries, options, observer]);
  const shouldAtLeastOneSuspend = optimisticResult.some(
    (result, index) => shouldSuspend(defaultedQueries[index], result)
  );
  const suspensePromises = shouldAtLeastOneSuspend ? optimisticResult.flatMap((result, index) => {
    const opts = defaultedQueries[index];
    if (opts && shouldSuspend(opts, result)) {
      const queryObserver = new QueryObserver(client, opts);
      return fetchOptimistic(opts, queryObserver, errorResetBoundary);
    }
    return [];
  }) : [];
  if (suspensePromises.length > 0) {
    throw Promise.all(suspensePromises);
  }
  const firstSingleResultWhichShouldThrow = optimisticResult.find(
    (result, index) => {
      const query = defaultedQueries[index];
      return query && getHasError({
        result,
        errorResetBoundary,
        throwOnError: query.throwOnError,
        query: client.getQueryCache().get(query.queryHash),
        suspense: query.suspense
      });
    }
  );
  if (firstSingleResultWhichShouldThrow == null ? void 0 : firstSingleResultWhichShouldThrow.error) {
    throw firstSingleResultWhichShouldThrow.error;
  }
  return getCombinedResult(trackResult());
}
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
      key: "hh9hay"
    }
  ],
  ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }],
  ["path", { d: "M12 22V12", key: "d0xqtd" }]
];
const Box = createLucideIcon("box", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 12h8", key: "1wcyev" }],
  ["path", { d: "M12 8v8", key: "napkw2" }]
];
const CirclePlus = createLucideIcon("circle-plus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];
const BLINK_OFFSETS = [
  0,
  0.37,
  0.74,
  0.13,
  0.51,
  0.88,
  0.26,
  0.63,
  0.19,
  0.56,
  0.93,
  0.31,
  0.68,
  0.07,
  0.44,
  0.81,
  0.22,
  0.59,
  0.96,
  0.33
];
const getBlinkDelay = (index) => BLINK_OFFSETS[index % BLINK_OFFSETS.length];
function AddCanisterModal({ open, onClose }) {
  const [canisterId, setCanisterId] = reactExports.useState("");
  const [customName, setCustomName] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const { mutate, isPending } = useAddCanister();
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = canisterId.trim();
    if (!trimmed) {
      setError("CANISTER ID IS REQUIRED.");
      return;
    }
    const principalRegex = /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;
    if (!principalRegex.test(trimmed)) {
      setError("ERR: INVALID FORMAT — EXPECTED: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx");
      return;
    }
    setError("");
    mutate(
      { canisterId: trimmed, customName: customName.trim() },
      {
        onSuccess: () => {
          setCanisterId("");
          setCustomName("");
          onClose();
        }
      }
    );
  };
  const handleClose = () => {
    if (!isPending) {
      setCanisterId("");
      setCustomName("");
      setError("");
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-primary/40 font-mono",
      "data-ocid": "add_canister.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm", children: ">_ TRACK NEW CANISTER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "font-mono text-[10px] text-muted-foreground tracking-[0.12em]", children: "PASTE YOUR CANISTER PRINCIPAL ID TO BEGIN MONITORING CYCLE BALANCE AND STATUS." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-id",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "CANISTER ID ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-id",
                placeholder: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx",
                value: canisterId,
                onChange: (e) => {
                  setCanisterId(e.target.value);
                  if (error) setError("");
                },
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "add_canister.input",
                autoFocus: true
              }
            ),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "font-mono text-[10px] text-destructive uppercase tracking-wider",
                "data-ocid": "add_canister.field_error",
                children: error
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-name",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "CUSTOM NAME",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 font-normal", children: "(OPT)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-name",
                placeholder: "e.g. Ledger Service",
                value: customName,
                onChange: (e) => setCustomName(e.target.value),
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "add_canister.name_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: handleClose,
                disabled: isPending,
                "data-ocid": "add_canister.cancel_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase border-border/50 hover:border-border",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: isPending,
                "data-ocid": "add_canister.submit_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: isPending ? "REGISTERING…" : "[ENTER] TRACK"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function DeleteConfirmModal({ canister, onClose }) {
  const { mutate, isPending } = useRemoveCanister();
  const handleConfirm = () => {
    if (!canister) return;
    mutate(canister.canisterId.toString(), { onSuccess: onClose });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open: !!canister,
      onOpenChange: (v) => !v && !isPending && onClose(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          className: "sm:max-w-sm bg-card border-destructive/40 font-mono",
          "data-ocid": "delete_canister.dialog",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm tracking-[0.2em] text-destructive uppercase", children: "⚠ REMOVE CANISTER" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "font-mono text-[10px] text-muted-foreground tracking-wider", children: [
                "STOP TRACKING",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium font-mono", children: (canister == null ? void 0 : canister.customName) || `${canister == null ? void 0 : canister.canisterId.toString().slice(0, 12)}…` }),
                "? THIS DOES NOT DELETE THE CANISTER ON-CHAIN."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: onClose,
                  disabled: isPending,
                  "data-ocid": "delete_canister.cancel_button",
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                  children: "[ESC] CANCEL"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "destructive",
                  onClick: handleConfirm,
                  disabled: isPending,
                  "data-ocid": "delete_canister.confirm_button",
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                  children: isPending ? "REMOVING…" : "[DEL] REMOVE"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function RenameCell({ canister, index }) {
  const [editing, setEditing] = reactExports.useState(false);
  const [value, setValue] = reactExports.useState(canister.customName);
  const inputRef = reactExports.useRef(null);
  const { mutate, isPending } = useRenameCanister();
  reactExports.useEffect(() => {
    var _a2;
    if (editing) (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
  }, [editing]);
  const commit = () => {
    const trimmed = value.trim();
    if (trimmed === canister.customName) {
      setEditing(false);
      return;
    }
    mutate(
      { canisterId: canister.canisterId.toString(), newName: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          value,
          onChange: (e) => setValue(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setValue(canister.customName);
              setEditing(false);
            }
          },
          onBlur: commit,
          className: "h-6 font-mono text-xs px-2 py-0 min-w-0 max-w-[160px] bg-background border-primary/40 focus:border-primary",
          disabled: isPending,
          "data-ocid": `canister.rename_input.${index}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setValue(canister.customName);
            setEditing(false);
          },
          className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
          "aria-label": "Cancel rename",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => setEditing(true),
      className: cn(
        "group flex items-center gap-1 text-left min-w-0 w-full",
        "hover:text-primary transition-colors font-mono"
      ),
      "data-ocid": `canister.name.${index}`,
      "aria-label": `Rename ${canister.customName || "unnamed canister"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-xs text-foreground group-hover:text-primary transition-colors uppercase tracking-[0.08em]", children: canister.customName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60 italic", children: "UNNAMED" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" })
      ]
    }
  );
}
function CtrlBadge({ isControlled }) {
  if (isControlled === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-muted-foreground/30 tracking-widest select-none", children: "[?]" });
  }
  if (isControlled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "font-mono text-[9px] font-bold tracking-widest text-accent retro-glow-accent",
        title: "App controller is set — this canister can be managed",
        children: "◆CTRL"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "font-mono text-[9px] font-bold tracking-widest",
      style: { color: "oklch(0.78 0.18 75)" },
      title: "App controller NOT set — top-ups and controller actions may fail",
      children: "◇NO-CTRL"
    }
  );
}
function SkeletonRow() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-14" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6" }) })
  ] });
}
function CanisterRow({
  canister,
  index,
  isControlled,
  onDelete
}) {
  const navigate = useNavigate();
  const handleRowClick = (e) => {
    const target = e.target;
    if (target.closest("button") || target.closest("input") || target.closest("[data-no-navigate]"))
      return;
    navigate({
      to: "/canisters/$canisterId",
      params: { canisterId: canister.canisterId.toString() }
    });
  };
  const handleRowKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleRowClick(e);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: cn(
        "border-b border-border/20 cursor-pointer group font-mono",
        "hover:bg-primary/5 hover:border-primary/20 transition-colors duration-100"
      ),
      onClick: handleRowClick,
      onKeyDown: handleRowKeyDown,
      "data-ocid": `canister.item.${index}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 min-w-[140px] max-w-[200px]", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/30 text-[10px] select-none", children: "├─" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RenameCell, { canister, index })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CopyableId,
          {
            id: canister.canisterId.toString(),
            label: "Canister ID",
            startChars: 5,
            endChars: 4,
            "data-ocid": `canister.copy_id.${index}`
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-primary tabular-nums retro-glow-sm", children: formatCycles(canister.cycleBalance ?? 0n) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatusBadge,
            {
              status: canister.status,
              blinkDelay: getBlinkDelay(index - 1)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBadge, { isControlled })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground", children: canister.lastChecked > 0n ? formatTimestamp(canister.lastChecked) : "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              onDelete(canister);
            },
            className: cn(
              "inline-flex items-center justify-center h-6 w-6 border border-transparent",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30",
              "transition-colors duration-100 opacity-0 group-hover:opacity-100"
            ),
            "aria-label": "Remove canister",
            "data-ocid": `canister.delete_button.${index}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
          }
        ) })
      ]
    }
  );
}
function CanistersPage() {
  const [page, setPage] = reactExports.useState(1);
  const [search, setSearch] = reactExports.useState("");
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(
    null
  );
  const prevSearchRef = reactExports.useRef(search);
  const { data, isLoading } = useListCanisters(BigInt(page - 1));
  const { data: appPrincipal } = useGetAppPrincipal();
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const items = (data == null ? void 0 : data.items) ?? [];
  const total = Number((data == null ? void 0 : data.total) ?? 0n);
  const pageSize = Number((data == null ? void 0 : data.pageSize) ?? 20n);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = reactExports.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (c) => c.customName.toLowerCase().includes(q) || c.canisterId.toString().toLowerCase().includes(q)
    );
  }, [items, search]);
  const detailQueries = useQueries({
    queries: filtered.map((c) => ({
      queryKey: ["canisters", "details", c.canisterId.toString()],
      queryFn: async () => {
        const { Principal } = await __vitePreload(async () => {
          const { Principal: Principal2 } = await import("./index-DXMaWJol.js").then((n) => n.x);
          return { Principal: Principal2 };
        }, true ? __vite__mapDeps([0,1,2]) : void 0);
        return actor.getCanisterDetails(
          Principal.fromText(c.canisterId.toString())
        );
      },
      enabled: !!actor && !actorFetching && filtered.length > 0,
      staleTime: 6e4,
      // Keep previous controller data while re-fetching so badge doesn't flicker
      placeholderData: keepPreviousData
    }))
  });
  const controlledMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    filtered.forEach((c, i) => {
      const q = detailQueries[i];
      if (!q || q.isPending) {
        map.set(c.canisterId.toString(), void 0);
      } else if (!q.data) {
        map.set(c.canisterId.toString(), void 0);
      } else {
        const isCtrl = appPrincipal ? q.data.controllers.some((ctrl) => ctrl.toString() === appPrincipal) : void 0;
        map.set(c.canisterId.toString(), isCtrl);
      }
    });
    return map;
  }, [filtered, detailQueries, appPrincipal]);
  const handleSearchChange = (value) => {
    if (value !== prevSearchRef.current) {
      prevSearchRef.current = value;
      setPage(1);
    }
    setSearch(value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col min-h-full font-mono",
      "data-ocid": "canisters.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 border-b border-border/40 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-primary/40 tracking-widest select-none mb-0.5", children: "┌─[ CANISTER REGISTRY ]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow", children: ">_ CANISTERS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-0.5 tracking-[0.12em]", children: isLoading ? "LOADING…" : `${total} CANISTER${total !== 1 ? "S" : ""} TRACKED` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: () => setShowAddModal(true),
                className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 shrink-0",
                "data-ocid": "canisters.add_button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-3.5 w-3.5" }),
                  "[A] TRACK CANISTER"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "SEARCH BY NAME OR CANISTER ID...",
                value: search,
                onChange: (e) => handleSearchChange(e.target.value),
                className: "pl-8 h-8 font-mono text-xs bg-background border-border/50 focus:border-primary uppercase placeholder:normal-case",
                "data-ocid": "canisters.search_input"
              }
            ),
            search && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleSearchChange(""),
                className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                "aria-label": "Clear search",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[640px] text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/40 bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CANISTER_NAME" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CANISTER_ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CYCLES" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "STATUS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "LAST_CHECKED" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: isLoading ? SKELETON_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRow, {}, k)) : filtered.length > 0 ? filtered.map((canister, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CanisterRow,
            {
              canister,
              index: i + 1,
              isControlled: controlledMap.get(
                canister.canisterId.toString()
              ),
              onDelete: setDeleteTarget
            },
            canister.canisterId.toString()
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, children: search ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-14 text-center gap-3",
              "data-ocid": "canisters.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 text-muted-foreground/40" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]", children: [
                    "NO_RESULTS: “",
                    search,
                    "”"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1", children: "TRY A DIFFERENT NAME OR CANISTER ID" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    onClick: () => handleSearchChange(""),
                    className: "font-mono text-[10px] tracking-[0.2em] uppercase mt-1",
                    children: "CLEAR SEARCH"
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex flex-col items-center justify-center py-16 text-center gap-4",
              "data-ocid": "canisters.empty_state",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 border border-primary/30 bg-primary/10 flex items-center justify-center retro-box-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "h-7 w-7 text-primary" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground uppercase tracking-[0.2em]", children: "NO_CANISTERS_REGISTERED" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 max-w-xs tracking-wider", children: "ADD A CANISTER ID TO MONITOR ITS CYCLE BALANCE AND STATUS" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    onClick: () => setShowAddModal(true),
                    className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 mt-1",
                    "data-ocid": "canisters.empty_add_button",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-3.5 w-3.5" }),
                      "TRACK FIRST CANISTER"
                    ]
                  }
                )
              ]
            }
          ) }) }) })
        ] }) }),
        !isLoading && total > 0 && !search && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/40 px-4 py-2 bg-card/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaginationControls,
          {
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
            "data-ocid": "canisters.pagination"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AddCanisterModal,
          {
            open: showAddModal,
            onClose: () => setShowAddModal(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DeleteConfirmModal,
          {
            canister: deleteTarget,
            onClose: () => setDeleteTarget(null)
          }
        )
      ]
    }
  );
}
export {
  CanistersPage as default
};
