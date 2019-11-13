export const asyncSubscriptionHandler = fn => state => [state, (() => [fn])()];
