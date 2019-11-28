export const setCollapsedByIndex = (state, index, value) => {
  let browserItems = state.browserItems;
  return {
    ...state,
    browserItems: [
      ...browserItems.slice(0, index),
      {
        ...browserItems[index],
        isCollapsed: value
      },
      ...browserItems.slice(index + 1)
    ]
  };
};
