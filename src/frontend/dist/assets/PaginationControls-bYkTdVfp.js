import { c as createLucideIcon, j as jsxRuntimeExports, B as Button, m as cn } from "./index-BDHQLcS7.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  className,
  "data-ocid": dataOcid
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": dataOcid,
      className: cn(
        "flex items-center justify-between gap-3 px-2 py-1.5 font-mono",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: onPrev,
            disabled: !canPrev,
            "data-ocid": dataOcid ? `${dataOcid}.pagination_prev` : void 0,
            className: "h-7 px-2 font-mono text-[10px] tracking-widest uppercase border-border/50 hover:border-primary/40",
            "aria-label": "Previous page",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-3 w-3 mr-1" }),
              "[PREV]"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-muted-foreground tabular-nums tracking-widest", children: [
          "PAGE ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: page }),
          " /",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: totalPages })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: onNext,
            disabled: !canNext,
            "data-ocid": dataOcid ? `${dataOcid}.pagination_next` : void 0,
            className: "h-7 px-2 font-mono text-[10px] tracking-widest uppercase border-border/50 hover:border-primary/40",
            "aria-label": "Next page",
            children: [
              "[NEXT]",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 ml-1" })
            ]
          }
        )
      ]
    }
  );
}
export {
  PaginationControls as P
};
