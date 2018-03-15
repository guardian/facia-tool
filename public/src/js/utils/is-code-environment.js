export default function (defaults) {
    return defaults.env === 'code' && !defaults.dev;
}
