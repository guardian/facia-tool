define([
    'modules/vars',
    'knockout',
    'underscore',
    'jquery',
    'constants/article-meta-fields',
    'utils/alert',
    'utils/as-observable-props',
    'utils/deep-get',
    'utils/human-time',
    'utils/is-guardian-url',
    'utils/is-preview-url',
    'utils/logger',
    'utils/mediator',
    'utils/open-graph',
    'utils/populate-observables',
    'utils/serialize-article-meta',
    'utils/snap',
    'utils/url-abs-path',
    'utils/visited-article-storage',
    'utils/article-collection',
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
        humanTime,
        isGuardianUrl,
        isPreviewUrl,
        logger,
        mediator,
        openGraph,
        populateObservables,
        serializeArticleMeta,
        snap,
        urlAbsPath,
        visitedArticleStorage,
        articleCollection,
        copiedArticle,
        authedAjax,
        contentApi,
        Editor,
        Group
    ) {
        alert = alert.default;
        deepGet = deepGet.default;
        isGuardianUrl = isGuardianUrl.default;
        isPreviewUrl = isPreviewUrl.default;
        urlAbsPath = urlAbsPath.default;
        asObservableProps = asObservableProps.default;
        serializeArticleMeta = serializeArticleMeta.default;
        populateObservables = populateObservables.default;
        mediator = mediator.default;
        humanTime = humanTime.default;
        visitedArticleStorage = visitedArticleStorage.default;
        articleCollection = articleCollection.default;
        copiedArticle = copiedArticle.default;
        logger = logger.default;
        Group = Group.default;
        metaFields = metaFields.default;
        openGraph = openGraph.default;

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
            this.publishedBy = opts.publishedBy;
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
            var asObject = {
                id: this.id()
            };
            var meta = serializeArticleMeta(this);
            if (meta) {
                asObject.meta = meta;
            }
            return asObject;
        };

        Article.prototype.normalizeDropTarget = function() {
            return {
                isAfter: false,
                target: this
            };
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
                        itemMeta:   serializeArticleMeta(this),
                        mode:       this.front.mode()
                    }
                });
            }
        };

        Article.prototype.convertToSnap = function() {
            var id = this.id();
            var href;

            if (isGuardianUrl(id) || isPreviewUrl(id)) {
                href = '/' + urlAbsPath(id);
            } else {
                href = id;
            }

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
            var thisArticle = this;

            this.meta.headline('Fetching headline...');

            return openGraph(this.id())
            .then(function (data) {
                thisArticle.meta.headline(data.title);
                thisArticle.meta.trailText(data.description);

                if (data.siteName) {
                    thisArticle.meta.byline(data.siteName);
                    thisArticle.meta.showByline(true);
                }
            })
            .catch(function () {
                thisArticle.meta.headline('Invalid page');
            })
            .then(function () {
                thisArticle.updateEditorsDisplay();
            });
        };

        Article.prototype.open = function(article, evt) {
            if (this.uneditable) { return; }

            if (this.meta.supporting) { this.meta.supporting.items().forEach(function(sublink) { sublink.close(); }); }

            var collection = articleCollection(this);
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
                    this.front,
                    collection
                );
            } else {
                mediator.emit('ui:open', null, null, this.front, collection);
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
            var collection = articleCollection(this);
            mediator.emit('ui:close', {
                targetGroup: this.group
            }, collection);
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
            var contributors = _.chain(contentApiArticle.tags).where({type: 'contributor'});

            return contributors.value().length === 1 ? contributors.pluck('bylineLargeImageUrl').first().value() : undefined;

        }

        function isPremium(contentApiArticle) {
            return contentApiArticle.fields.membershipAccess === 'members-only' ||
                contentApiArticle.fields.membershipAccess === 'paid-members-only' ||
                !!_.find(contentApiArticle.tags, {id: 'news/series/looking-back'});
        }

        return Article;
    });
