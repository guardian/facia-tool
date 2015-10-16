define([
    'modules/vars',
    'knockout',
    'underscore',
    'jquery',
    'constants/article-meta-fields',
    'utils/alert',
    'utils/as-observable-props',
    'utils/deep-get',
    'utils/full-trim',
    'utils/human-time',
    'utils/is-guardian-url',
    'utils/logger',
    'utils/mediator',
    'utils/populate-observables',
    'utils/report-errors',
    'utils/sanitize-html',
    'utils/snap',
    'utils/url-abs-path',
    'utils/url-host',
    'utils/visited-article-storage',
    'modules/copied-article',
    'modules/authed-ajax',
    'modules/content-api',
    'models/collections/editor',
    'models/group'
],
    function (
        vars,
        ko,
        _,
        $,
        metaFields,
        alert,
        asObservableProps,
        deepGet,
        fullTrim,
        humanTime,
        isGuardianUrl,
        logger,
        mediator,
        populateObservables,
        reportErrors,
        sanitizeHtml,
        snap,
        urlAbsPath,
        urlHost,
        visitedArticleStorage,
        copiedArticle,
        authedAjax,
        contentApi,
        Editor,
        Group
    ) {
        alert = alert.default;
        deepGet = deepGet.default;
        fullTrim = fullTrim.default;
        isGuardianUrl = isGuardianUrl.default;
        urlHost = urlHost.default;
        sanitizeHtml = sanitizeHtml.default;
        urlAbsPath = urlAbsPath.default;
        asObservableProps = asObservableProps.default;
        populateObservables = populateObservables.default;
        mediator = mediator.default;
        humanTime = humanTime.default;
        visitedArticleStorage = visitedArticleStorage.default;
        copiedArticle = copiedArticle.default;
        logger = logger.default;
        Group = Group.default;
        reportErrors = reportErrors.default;
        metaFields = metaFields.default;

        var createEditor = Editor.default.create;

        var capiProps = [
                'webUrl',
                'webPublicationDate',
                'sectionName'],

            capiFields = [
                'headline',
                'trailText',
                'byline',
                'isLive',
                'firstPublicationDate',
                'scheduledPublicationDate',
                'thumbnail',
                'secureThumbnail'];

        function Article(opts, withCapiData) {
            var self = this;

            opts = opts || {};

            this.dropTarget = true;
            this.id = ko.observable(opts.id);

            this.group = opts.group;

            this.front = opts.group ? opts.group.front : null;

            this.props = asObservableProps(capiProps);
            this.props.webPublicationDate.extend({ notify: 'always' });

            this.fields = asObservableProps(capiFields);

            this.meta = asObservableProps(_.pluck(metaFields, 'key'));

            populateObservables(this.meta, opts.meta);

            this.metaDefaults = {};

            this.collectionMetaDefaults = deepGet(opts, '.group.parent.itemDefaults');

            this.uneditable = opts.uneditable;

            this.slimEditor = opts.slimEditor;

            this.state = asObservableProps([
                'enableContentOverrides',
                'underDrag',
                'underControlDrag',
                'isOpen',
                'isLiveBlog',
                'isLoaded',
                'isEmpty',
                'visited',
                'inDynamicCollection',
                'tone',
                'primaryTag',
                'sectionName',
                'hasMainVideo',
                'imageCutoutSrcFromCapi',
                'ophanUrl',
                'sparkUrl',
                'premium']);

            this.state.enableContentOverrides(this.meta.snapType() !== 'latest');
            this.state.inDynamicCollection(deepGet(opts, '.group.parent.isDynamic'));
            this.state.visited(opts.visited);

            this.frontPublicationDate = opts.frontPublicationDate;
            this.frontPublicationTime = ko.observable();
            this.scheduledPublicationTime = ko.observable();

            this.editors = ko.observableArray();

            this.editorsDisplay = ko.observableArray();

            this.headline = ko.pureComputed(function () {
                var meta = this.meta, fields = this.fields;
                if (this.state.enableContentOverrides()) {
                    return meta.headline() || fields.headline() || (meta.snapType() ? 'No headline!' : 'Loading...');
                } else {
                    return '{ ' + meta.customKicker() + ' }';
                }
            }, this);

            this.headlineLength = ko.pureComputed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length;
            }, this);

            this.headlineLengthAlert = ko.pureComputed(function() {
                return (this.meta.headline() || this.fields.headline() || '').length > vars.CONST.restrictedHeadlineLength;
            }, this);


            this.webPublicationTime = ko.pureComputed(function(){
                return humanTime(this.props.webPublicationDate());
            }, this);

            this.viewUrl = ko.pureComputed(function() {
                var url;
                if (this.fields.isLive() === 'false') {
                    url = vars.CONST.previewBase + '/' + urlAbsPath(this.props.webUrl());
                } else {
                    url = this.meta.href() || this.props.webUrl();

                    if (url && !/^https?:\/\//.test(url)) {
                        url = 'http://' + vars.CONST.mainDomain + url;
                    }
                }

                return url;
            }, this);

            // Populate supporting
            if (this.group && this.group.parentType !== 'Article') {
                this.meta.supporting = new Group({
                    parent: self,
                    parentType: 'Article',
                    omitItem: self.save.bind(self),
                    front: self.front
                });

                this.meta.supporting.items(_.map((opts.meta || {}).supporting, function (item) {
                    return new Article(_.extend(item, {
                        group: self.meta.supporting
                    }));
                }));

                contentApi.decorateItems(this.meta.supporting.items());
            }

            if (withCapiData) {
                this.addCapiData(opts);
            } else {
                this.updateEditorsDisplay();
            }

            this.thumbImage = ko.pureComputed(function () {
                var meta = this.meta,
                    fields = this.fields,
                    state = this.state;

                if (meta.imageReplace() && meta.imageSrc()) {
                    return meta.imageSrc();
                } else if (meta.imageCutoutReplace()) {
                    return meta.imageCutoutSrc() || state.imageCutoutSrcFromCapi() || fields.secureThumbnail() || fields.thumbnail();
                } else if (meta.imageSlideshowReplace && meta.imageSlideshowReplace() && meta.slideshow() && meta.slideshow()[0]) {
                    return meta.slideshow()[0].src;
                } else {
                    return fields.secureThumbnail() || fields.thumbnail();
                }
            }, this);
        }

        Article.prototype.copy = function () {
            copiedArticle.set(this);
        };

        Article.prototype.copyToClipboard = function () {
            mediator.emit('copy:to:clipboard', this.get());
        };

        Article.prototype.setVisitedToTrue = function () {
            visitedArticleStorage.addArticleToStorage(this.id());
            mediator.emit('set:article:to:visited', this.id());
            return true;
        };

        Article.prototype.paste = function () {
            var sourceItem = copiedArticle.get(true);

            if (!sourceItem || sourceItem.id === this.id()) { return; }

            mediator.emit('drop', {
                sourceItem: sourceItem.article.get(),
                sourceGroup: sourceItem.group
            }, this, this.group);
        };

        Article.prototype.metaDisplayer = function (opts, index, all) {
            var self = this,
                display,
                label;

            if (opts.type === 'boolean') {
                display = opts.editable;
                display = display && (this.meta[opts.key] || function() {})();
                display = display && (opts.omitIfNo ? _.some(all, function(editor) { return editor.key === opts.omitIfNo && self.meta[editor.key](); }) : true);
                display = display && (opts.omitForSupporting ? this.group.parentType !== 'Article' : true);

                label = _.chain([
                    opts.label,
                    _.result(this.state, opts.labelState),
                    _.result(this.meta,  opts.labelMeta)
                ])
                .compact()
                .value()
                .join(': ');

                return display ? label : false;
            } else {
                return false;
            }
        };

        Article.prototype.addCapiData = function(opts) {
            var missingProps;

            populateObservables(this.props,  opts);
            populateObservables(this.fields, opts.fields);

            this.setRelativeTimes();

            missingProps = [
                'webUrl',
                'fields',
                'fields.headline'
            ].filter(function(prop) {return !deepGet(opts, prop); });

            if (missingProps.length) {
                mediator.emit('capi:error', 'ContentApi is returning invalid data. Fronts may not update.');
                logger.error('ContentApi missing: "' + missingProps.join('", "') + '" for ' + this.id());
            } else {
                this.state.isLoaded(true);
                this.state.sectionName(this.props.sectionName());
                this.state.primaryTag(getPrimaryTag(opts));
                this.state.imageCutoutSrcFromCapi(getContributorImage(opts));
                this.state.hasMainVideo(getMainMediaType(opts) === 'video');
                this.state.tone(opts.frontsMeta && opts.frontsMeta.tone);
                this.state.ophanUrl(vars.CONST.ophanBase + '?path=/' + urlAbsPath(opts.webUrl));
                this.state.premium(isPremium(opts));
                if (deepGet(opts, '.fields.liveBloggingNow') === 'true') {
                    this.state.isLiveBlog(true);
                }

                this.metaDefaults = _.extend(deepGet(opts, '.frontsMeta.defaults') || {}, this.collectionMetaDefaults);

                populateObservables(this.meta, this.metaDefaults);

                this.updateEditorsDisplay();
            }
        };

        Article.prototype.updateEditorsDisplay = function() {
            if (!this.uneditable) {
                this.editorsDisplay(metaFields.map(this.metaDisplayer, this).filter(Boolean));
            }
        };

        Article.prototype.setRelativeTimes = function() {
            this.frontPublicationTime(humanTime(this.frontPublicationDate));
            this.scheduledPublicationTime(humanTime(this.fields.scheduledPublicationDate()));
        };

        Article.prototype.get = function() {
            return {
                id:   this.id(),
                meta: this.getMeta()
            };
        };

        Article.prototype.normalizeDropTarget = function() {
            return {
                isAfter: false,
                target: this
            };
        };

        Article.prototype.getMeta = function() {
            var self = this,
                cleanMeta;

            cleanMeta = _.chain(self.meta)
                .pairs()
                // execute any knockout values:
                .map(function(p){ return [p[0], _.isFunction(p[1]) ? p[1]() : p[1]]; })
                // trim and sanitize strings:
                .map(function(p){ return [p[0], sanitizeHtml(fullTrim(p[1]))]; })
                // reject vals that are equivalent to their defaults (if set)
                .filter(function(p){ return _.has(self.metaDefaults, p[0]) ? self.metaDefaults[p[0]] !== p[1] : !!p[1]; })
                // reject vals that are equivalent to the fields (if any) that they're overwriting:
                .filter(function(p){ return _.isUndefined(self.fields[p[0]]) || p[1] !== fullTrim(self.fields[p[0]]()); })
                // convert numbers to strings:
                .map(function(p){ return [p[0], _.isNumber(p[1]) ? '' + p[1] : p[1]]; })
                // recurse into supporting links
                .map(function(p) {
                    return [p[0], p[0] === 'supporting' ? _.map(p[1].items(), function(item) {
                        return item.get();
                    }) : p[1]];
                })
                // clean sparse arrays
                .map(function (p) {
                    return [p[0], _.isArray(p[1]) ? _.filter(p[1], function (item) { return !!item; }) : p[1]];
                })
                // drop empty arrays:
                .filter(function(p){ return _.isArray(p[1]) ? p[1].length : true; })
                // recurse convert numbers to strings:
                .map(function(p){ return [p[0], _.isArray(p[1]) ? _.map(p[1], function (nested) {
                    return _.isObject(nested) ? _.mapObject(nested, function (val) {
                        return _.isNumber(val) ? '' + val : val;
                    }) : nested; }) : p[1]];
                })
                // return as obj, or as undefined if empty (this omits it from any subsequent JSON.stringify result)
                .reduce(function(obj, p) {
                    obj = obj || {};
                    obj[p[0]] = p[1];
                    return obj;
                }, {})
                .value();

            if (this.group && this.group.parentType === 'Collection') {
                cleanMeta.group = this.group.index + '';
            }

            return _.isEmpty(cleanMeta) ? undefined : cleanMeta;
        };

        Article.prototype.save = function() {
            if (!this.group.parent) {
                return;
            }

            if (this.group.parentType === 'Article') {
                this.group.parent.save();
                return;
            }

            if (this.group.parentType === 'Collection') {
                this.group.parent.setPending(true);

                authedAjax.updateCollections({
                    update: {
                        collection: this.group.parent,
                        item:       this.id(),
                        position:   this.id(),
                        itemMeta:   this.getMeta(),
                        mode:       this.front.mode()
                    }
                });
            }
        };

        Article.prototype.convertToSnap = function() {
            var id = this.id(),
                href = isGuardianUrl(id) ? '/' + urlAbsPath(id) : id;

            this.meta.href(href);
            this.id(snap.generateId());
            this.updateEditorsDisplay();
        };

        Article.prototype.convertToLinkSnap = function() {
            if (!this.meta.headline()) {
                this.decorateFromOpenGraph();
            }

            this.meta.snapType('link');

            this.convertToSnap();
        };

        Article.prototype.convertToLatestSnap = function(kicker) {
            this.meta.snapType('latest');
            this.meta.snapUri(urlAbsPath(this.id()));

            this.meta.showKickerCustom(true);
            this.meta.customKicker(kicker);

            this.meta.headline(undefined);
            this.meta.trailText(undefined);
            this.meta.byline(undefined);

            this.state.enableContentOverrides(false);

            this.convertToSnap();
        };

        Article.prototype.decorateFromOpenGraph = function() {
            var self = this,
                url = this.id(),
                isOnSite = isGuardianUrl(url);

            this.meta.headline('Fetching headline...');

            authedAjax.request({
                url: '/http/proxy/' + url + (isOnSite ? '?view=mobile' : ''),
                type: 'GET'
            })
            .then(function(response) {
                var doc = document.createElement('div'),
                    title,
                    og = {};

                doc.innerHTML = response;

                Array.prototype.forEach.call(doc.querySelectorAll('meta[property^="og:"]'), function(tag) {
                    og[tag.getAttribute('property').replace(/^og\:/, '')] = tag.getAttribute('content');
                });

                title = doc.querySelector('title');
                title = title ? title.innerHTML : undefined;

                self.meta.headline(og.title || title);
                self.meta.trailText(og.description);

                if(!isOnSite) {
                    self.meta.byline(og.site_name || urlHost(url).replace(/^www\./, ''));
                    self.meta.showByline(true);
                }

                self.updateEditorsDisplay();
            })
            .catch(function(ex) {
                self.meta.headline(undefined);
                reportErrors(ex);
            });
        };

        Article.prototype.open = function(article, evt) {
            if (this.uneditable) { return; }

            if (this.meta.supporting) { this.meta.supporting.items().forEach(function(sublink) { sublink.close(); }); }

            if (!this.state.isOpen()) {
                if (this.editors().length === 0) {
                    this.editors(metaFields.map(function (field) {
                        return createEditor(field, this, metaFields);
                    }, this).filter(Boolean));
                }
                this.state.isOpen(true);
                mediator.emit(
                    'ui:open',
                    _.chain(this.editors())
                     .filter(function(editor) { return editor.type === 'text' && editor.displayEditor(); })
                     .map(function(editor) { return editor.meta; })
                     .first()
                     .value(),
                    this,
                    this.front
                );
            } else {
                mediator.emit('ui:open', null, null, this.front);
            }

            if ($(evt.target).hasClass('allow-default-click')) {
                return true;
            }
        };

        Article.prototype.close = function() {
            if (this.state.isOpen()) {
                this.state.isOpen(false);
                this.updateEditorsDisplay();
            }
            mediator.emit('ui:close', {
                targetGroup: this.group
            });
        };

        Article.prototype.closeAndSave = function() {
            this.close();
            this.save();
            return false;
        };

        Article.prototype.closeWithoutSaving = function() {
            this.close();
            if ( this.group && this.group.parentType === 'Collection' ) {
                this.group.parent.replaceArticle(this.id());
            }
            return false;
        };

        Article.prototype.omitItem = function () {
            this.group.omitItem(this);
        };

        Article.prototype.dispose = function () {
            if (this.meta.supporting) {
                this.meta.supporting.dispose();
            }
            this.editors().forEach(function (editor) {
                editor.dispose();
            });
            this.editors.removeAll();
        };

        function getMainMediaType(contentApiArticle) {
            return _.chain(contentApiArticle.elements).where({relation: 'main'}).pluck('type').first().value();
        }

        function getPrimaryTag(contentApiArticle) {
            return _.chain(contentApiArticle.tags).pluck('webTitle').first().value();
        }

        function getContributorImage(contentApiArticle) {
            return _.chain(contentApiArticle.tags).where({type: 'contributor'}).pluck('bylineLargeImageUrl').first().value();
        }

        function isPremium(contentApiArticle) {
            return contentApiArticle.fields.membershipAccess === 'members-only' ||
                contentApiArticle.fields.membershipAccess === 'paid-members-only' ||
                !!_.find(contentApiArticle.tags, {id: 'news/series/looking-back'});
        }

        return Article;
    });
