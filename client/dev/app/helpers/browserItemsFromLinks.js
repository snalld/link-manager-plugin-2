import * as R from "ramda";

import { pad } from "./strings";

const generateLinkKeyParts = R.compose(
  R.converge(R.concat, [
    R.compose(R.split(":"), R.prop("path")),
    R.compose(
      str => [str],
      R.join("-"),
      R.map(el => pad("0", 5, el || 0)),
      R.props(["parentPage", "page", "id"])
    )
  ])
);

export const browserItemsFromLinks = links => {
  const browserItems = new Map();
  R.reduce(
    (acc, link) => {
      const keyParts = generateLinkKeyParts(link);
      R.addIndex(R.reduce)(([prevPart, prevKey], part, idx) => {
        if (!part) part = 0;
        const key = `${prevKey || ""}/${part}`;
        if (acc.has(key)) return [part, key];
        let browserItem = {
          // key,
          indent: idx,
          label: `/${part}`
        };
        let filepathParts = /(.+\.[a-zA-Z]{3,4})(\/[a-zA-Z0-9]{5}-\d{5}-\d{5})?/.exec(
          key
        );
        if (!filepathParts) {
          browserItem = {
            ...browserItem,
            type: "directory",
            sortKeys: {
              path: key
            }
          };
        } else {
          const path = filepathParts[1];
          if (!filepathParts[2]) {
            browserItem = {
              ...browserItem,
              sortKeys: {
                path
              },
              type: "group"
            };
          } else {
            browserItem = {
              ...browserItem,
              label: `/${prevPart}`,
              sortKeys: {
                path,
                parentPage: filepathParts[2].slice(1, 6),
                page: Number(filepathParts[2].slice(7, 12)),
                id: Number(filepathParts[2].slice(13))
              },
              type: "file"
            };
          }
        }
        acc.set(key, browserItem);
        return [part, key];
      }, "")(keyParts);
      return acc;
    },
    browserItems,
    links
  );
  const v = [...browserItems.values()];
  return v;
  // console.log(R.sortWith([R.ascend(R.prop('path')), R.ascend(R.prop('id'))])(v))
  return browserItems;
};
