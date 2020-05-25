
function getEnv() {
    const raw = process.env;

    const stringified = {
        'process.env': Object.keys(raw).reduce(function (env, key) {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {})
    };

    return {
        raw,
        stringified
    };
}

module.exports = getEnv;
