export const walkParentTreeUntil = (condition, index, browserItems) => {
  let lastParent = browserItems[index]
  let result = false

  do {
    index--

    let parent = browserItems[index]
    if (!parent) return false

    if (parent.indent >= lastParent.indent) continue
    lastParent = parent

    result = condition(parent)
    if (!!result) break
  } while (index > 0)

  return index
}
