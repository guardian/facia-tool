export default function config(state = {}, action) {
  switch (action.type) {
    case 'CONFIG_RECEIVED':
      return action.config || {};

    default:
      return state;
  }
}
