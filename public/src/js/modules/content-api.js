import _ from 'underscore';
import {CONST} from 'modules/vars';
import {request} from 'modules/authed-ajax';
import * as cache from 'modules/cache';
import modalDialog from 'modules/modal-dialog';
import internalPageCode from 'utils/internal-page-code';
import articlePath from 'utils/article-path';
import urlQuery from 'utils/url-query';
import isGuardianUrl from 'utils/is-guardian-url';
import mediator from 'utils/mediator';
import * as snap from 'utils/snap';
import reportErrors from 'utils/report-errors';

function populate(article, capiData) {
    article.addCapiData(capiData);
}

function getTagOrSectionTitle(response) {
    return _.chain([response.tag, response.section])
        .pluck('webTitle')
        .filter(Boolean)
        .first()
        .value();
}

function fetchContent(apiUrl, {
    forceLive = false
} = {}) {
    return request({
        url: (forceLive ? CONST.apiLiveBase : CONST.apiSearchBase) + '/' + apiUrl
    }).then(function(resp) {
        if (!resp.response
            || _.intersection(['content', 'editorsPicks', 'results', 'mostViewed'], _.keys(resp.response)).length === 0
            || resp.response.status === 'error') {
            return;
        } else if (resp.response.content) {
            return {
                content: [resp.response.content],
                title: getTagOrSectionTitle(resp.response)
            };
        } else {
            return {
                content: _.chain(['editorsPicks', 'results', 'mostViewed'])
                    .filter(function(key) { return _.isArray(resp.response[key]); })
                    .map(function(key) { return resp.response[key]; })
                    .flatten()
                    .value(),
                title: getTagOrSectionTitle(resp.response)
            };
        }
    })
    // swallow error
    .catch(function () {});
}

function validateItem (item) {
    return new Promise(function (resolve, reject) {
        var snapId = snap.validateId(item.id()),
            capiId = articlePath(item.id()),
            data = cache.get('contentApi', capiId);

        if (snapId) {
            item.id(snapId);
            resolve(item);

        } else if (data) {
            item.id(capiId);
            populate(item, data);
            resolve(item);

        } else {
            // Tag combiners need conversion from tag1+tag2 to search?tag=tag1,tag2
            if (capiId.match(/\+/) && isGuardianUrl(item.id())) {
                capiId = 'search?tag=' + capiId.split(/\+/).join(',') + '&';
            } else {
                capiId += '?';
            }

            capiId += CONST.apiSearchParams;

            fetchContent(capiId)
            .then(function(res = {}) {
                var results = res.content,
                    resultsTitle = res.title || 'Unknown title',
                    capiItem,
                    pageCode,
                    err;

                // ContentApi item
                if (results && results.length === 1) {
                    capiItem = results[0];
                    pageCode = internalPageCode(capiItem);
                    if (pageCode) {
                        capiItem.capiId = capiItem.id;
                        populate(item, capiItem);
                        cache.put('contentApi', pageCode, capiItem);

                        const maybeUrlParams = decodeURIComponent(urlQuery(item.id()));
                        const maybeBlockId = maybeUrlParams.split('with:block-')[1];

                        if (maybeBlockId) {
                            item.meta.blockId(maybeBlockId);
                        }
                        item.id(pageCode);
                    } else {
                        err = 'Sorry, that article is malformed (has no internalPageCode)';
                    }

                // A snap, but not an absolute url
                } else if (!item.id().match(/^https?:\/\//)) {
                    err = 'Sorry, URLs must begin with http...';

                // A snap, but snaps can only be created to the Clipboard
                } else if (item.group.parentType !== 'Clipboard') {
                    err = 'Sorry, special links must be dragged to the Clipboard, initially';

                // A snap, but a link off of the tool itself
                } else if (item.id().indexOf(window.location.hostname) > -1) {
                    err = 'Sorry, that link cannot be added to a front';

                // A snap, that's setting it's own type, ie via dragged-in query params
                } else if (item.meta.snapType()) {
                    item.convertToSnap();

                // A snap, of type 'latest', ie.  where the target is a Guardian tag/section page.
                } else if (results && results.length > 1) {
                    modalDialog.confirm({
                        name: 'select_snap_type',
                        data: {
                            prefix: CONST.latestSnapPrefix,
                            resultsTitle: resultsTitle
                        }
                    }).then(function () {
                        item.convertToLatestSnap(resultsTitle);
                        resolve(item);
                    }, function () {
                        item.convertToLinkSnap();
                        resolve(item);
                    });

                    // Waiting for the modal to be closed
                    return;

                    // A snap, of default type 'link'.
                } else {
                    item.convertToLinkSnap();
                }

                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(item);
                }
            });
        }
    });
}

function fetchContentByIds(ids) {
    var capiIds = _.chain(ids)
        .filter(function(id) { return !snap.validateId(id); })
        .map(function(id) { return encodeURIComponent(id); })
        .value();

    if (capiIds.length) {
        return fetchContent('search?ids=' + capiIds.join(',') + '&' + CONST.apiSearchParams);
    } else {
        return Promise.resolve();
    }
}

function decorateBatch (articles) {
    var ids = [];

    articles.forEach(function(article){
        var data = cache.get('contentApi', article.id());
        if (data) {
            populate(article, data);
        } else {
            ids.push(article.id());
        }
    });

    return fetchContentByIds(ids)
    .then(function(res = {}) {
        var results = res.content;
        if (!_.isArray(results)) {
            return;
        }

        results.forEach(function(result) {
            var pageCode = internalPageCode(result);

            if (pageCode) {
                result.capiId = result.id;
                cache.put('contentApi', pageCode, result);

                _.filter(articles, function(article) {
                    var id = article.id();
                    return id === pageCode;
                }).forEach(function(article) {
                    populate(article, result);
                });
            }
        });

       _.chain(articles)
        // legacy-snaps
        .filter(function(article) { return !article.meta.href(); })

        .filter(function(article) { return !article.meta.snapType(); })
        .each(function(article) {
            article.state.isEmpty(!article.state.isLoaded());
        });
    })
    .catch(reportErrors);
}

function decorateItems (articles) {
    var num = CONST.capiBatchSize || 10,
        pending = [];

    _.each(_.range(0, articles.length, num), function(index) {
        pending.push(decorateBatch(articles.slice(index, index + num)));
    });

    return Promise.all(pending);
}

function fetchMetaForPath(path) {
    return request({
        url: CONST.apiSearchBase + '/' + path + '?page-size=0'
    }).then(function(resp) {
        return !resp.response ? {} :
           _.chain(['tag', 'section'])
            .map(function(key) { return resp.response[key]; })
            .filter(function(obj) { return _.isObject(obj); })
            .reduce(function(m, obj) {
                m.section = m.section || _.last((obj.id || obj.sectionId || '').split('/'));
                m.webTitle = m.webTitle || obj.webTitle;
                m.description = m.description || obj.description; // upcoming in Capi, at time of writing
                m.title = m.title || obj.title; // this may never be added to Capi, or may under another name
                return m;
             }, {})
            .value();
    })
    // swallow error
    .catch(function () {});
}

function dateYyyymmdd() {
    var d = new Date();
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(function(p) { return p < 10 ? '0' + p : p; }).join('-');
}

function fetchLatest (options) {
    var propName, term, filter;

    options = _.extend({
        article: '',
        term: '',
        filter: '',
        filterType: '',
        page: 1,
        pageSize: CONST.searchPageSize || 25,
        isDraft: true
    }, options);
    term = options.term;
    filter = options.filter;

    let url = (options.isDraft ? CONST.apiSearchBase : CONST.apiLiveBase) + '/';

    if (options.article) {
        term = options.article;
        propName = 'content';
        url += term + '?' + CONST.apiSearchParams;
    } else {
        term = encodeURIComponent(term.trim());
        propName = 'results';
        url += (options.isDraft ? 'content/scheduled?' : 'search?') + CONST.apiSearchParams;
        url += options.isDraft ?
            '&order-by=oldest&from-date=' + dateYyyymmdd() :
            '&order-by=newest';
        url += '&page-size=' + options.pageSize;
        url += '&page=' + options.page;
        url += term ? '&q=' + term : '';
        url += filter ? '&' + options.filterType + '=' + encodeURIComponent(filter) : '';
    }

    return request({
        url: url
    }).then(function (data) {
        return handleFetchLatestResponse(data, propName, term || filter);
    }, function (xhr) {
        if (xhr.status === 200) {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.json) {
                mediator.emit('capi:error', parsed.errors[0]);
                return handleFetchLatestResponse(parsed.json, propName, term || filter);
            }
        }
        throw new Error('Content API error (' + xhr.status + '). Content is currently unavailable');
    });
}

function handleFetchLatestResponse (data, propName, isSearch) {
    const filteredData = cleanFetchResponse(data, propName);

    if (!isSearch && !filteredData[propName].length) {
        throw new Error('Sorry, the Content API is not currently returning content');
    } else {
        return filteredData;
    }
}

function cleanFetchResponse (data, propName) {
    const rawArticles = data.response && data.response[propName] ? [].concat(data.response[propName]) : [];

    return _.extend({}, data.response, {
        results: _.filter(rawArticles, opts => opts.fields && opts.fields.headline && !isCommercialArticle(opts))
    });
}

function isCommercialArticle(article) {
    if (!article) {
        return false;
    }

    if (article.isHosted) {
        return true;
    }

    if (!article.tags) {
        return false;
    }

    return article.tags.some(tag => tag.type === 'paid-content');
}

export {
    fetchContent,
    fetchMetaForPath,
    decorateItems,
    validateItem,
    fetchLatest
};
