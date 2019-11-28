export const hasManyChildrenByIndex = (index, items) => {
  let item = items[index]
  let nextItem
  let childCount = 0
  let idx = index
  while (idx < items.length - 1 && childCount < 2) {
    idx++
    nextItem = items[idx]
    if (nextItem.indent <= item.indent) break
    if (nextItem.indent === item.indent + 1) childCount++
  }
  return !!childCount
}
