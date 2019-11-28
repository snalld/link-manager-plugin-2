export const getDescendentsByIndex = (index, items) => {
  let descendents = []
  let originalItem = items[index]
  
  // TODO: convert to `do while`
  let idx = index + 1
  let currentItem = items[idx]
  while (idx < items.length && currentItem.indent > originalItem.indent) {
    descendents.push(currentItem)
    
    idx++
    currentItem = items[idx]
  }

  return descendents
}
