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
    (items, link) => {
      const keyParts = generateLinkKeyParts(link);

      R.addIndex(R.reduce)(([prevPart, prevKey], part, idx) => {
        if (!part) part = 0;

        const key = `${prevKey || ""}/${part}`;

        let linkIDs = [];
        if (items.has(key)) {
          linkIDs = items.get(key).linkIDs;
        }

        let browserItem = {
          key,
          linkIDs: [...linkIDs, link.id],
          indent: idx,
          label: `${part}`,
          isError: false
        };

        const r = /(.+\.[a-zA-Z]{2,4})(\/[a-zA-Z0-9]{5}-\d{5}-\d{5})?/;
        const filepathParts = r.exec(key);

        if (!filepathParts) {
          browserItem = {
            ...browserItem,
            type: "directory",
            path: key,
            sortKeys: {}
          };
        } else {
          const path = filepathParts[1];

          if (!filepathParts[2]) {
            browserItem = {
              ...browserItem,
              path,
              sortKeys: {},
              type: "group"
            };
          } else {
            browserItem = {
              ...browserItem,
              label: `${prevPart}`,
              path,
              isError: link.status === "MISSING",
              pageNumber: Number(filepathParts[2].slice(7, 12)),
              sortKeys: {
                parentPage: filepathParts[2].slice(1, 6),
                page: Number(filepathParts[2].slice(7, 12)),
                id: Number(filepathParts[2].slice(13))
              },
              type: "file"
            };
          }
        }

        items.set(key, browserItem);

        return [part, key];
      }, "")(keyParts);

      return items;
    },
    browserItems,
    links
  );

  return R.zipObj([...browserItems.keys()], [...browserItems.values()]);
};
