'use strict';

const URL_PATTERN = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/([^/?#]*))?([^?#]*)(\?[^#]*)?(#.*)?$/i;

function parse(value) {
    const href = String(value === undefined || value === null ? '' : value);
    const match = URL_PATTERN.exec(href) || [];
    const pathname = match[3] || null;
    const search = match[4] || null;

    return {
        href,
        protocol: match[1] ? match[1].toLowerCase() : null,
        host: match[2] === undefined ? null : match[2],
        pathname,
        search,
        hash: match[5] || null,
        path: pathname || search ? (pathname || '') + (search || '') : null
    };
}

function resolve(from, to) {
    if (!from || parse(to).protocol) {
        return to;
    }

    if (to.startsWith('#')) {
        return from.split('#')[0] + to;
    }

    try {
        return new URL(to, from).href;
    } catch {
        return to;
    }
}

module.exports = { parse, resolve };
