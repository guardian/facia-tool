import $ from 'jquery';
import CollectionsLoader from 'test/utils/collections-loader';
import * as dom from 'test/utils/dom-nodes';
import * as wait from 'test/utils/wait';
import {CONST} from 'modules/vars';

describe('Visited articles', function () {
    beforeEach(function () {
        this.testInstance = new CollectionsLoader();
    });
    afterEach(function () {
        this.testInstance.dispose();
        localStorage.clear();
    });
    function opacity (node) {
        return Number($(node).css('opacity'));
    }

    it('marks an article visited from visited articles list as visited', function (done) {
        this.testInstance.load()
        .then(() => {
            $('.tool--small--copy-to-clipboard', dom.latestArticle(1)).click();
        })
        .then(() => {
            $('.tool--small--href', dom.latestArticle(1)).click();
        })
        .then(() => {
            expect(opacity(dom.latestArticle(1))).toBeCloseTo(0.6, 2);
            expect(opacity($('.element__headline', dom.collection(0)))).toBeCloseTo(1);
            expect(opacity('.clipboard .article')).toBeCloseTo(1);
        })
        .then(done)
        .catch(done.fail);
    });

    it('marks an article visited from clipboard as visited in visited articles list', function (done) {
        this.testInstance.load()
        .then(() => {
            $('.tool--small--copy-to-clipboard', dom.latestArticle(1)).click();
        })
        .then(() => {
            $('.clipboard .tool--small--href').click();
        })
        .then(() => {
            expect(opacity((dom.latestArticle(1)))).toBeCloseTo(0.6);
            expect(opacity($('.element__headline', dom.collection(0)))).toBeCloseTo(1);
            expect(opacity(('.clipboard .article'))).toBeCloseTo(1);
        })
        .then(done)
        .catch(done.fail);
    });

    it('displays article as visited after redrawing data', function (done) {

        var originalDetectPendingChangesInClipboard= CONST.detectPendingChangesInClipboard;
        CONST.detectPendingChangesInClipboard = 300;
        this.testInstance.load()
        .then(() => {
            $('.tool--small--copy-to-clipboard', dom.latestArticle(1)).click();
        })
        .then(() => {
            $('.tool--small--href', dom.latestArticle(1)).click();
        })
        .then(() => wait.ms(CONST.detectPendingChangesInClipboard + 50))
        .then(() => this.testInstance.dispose())
        .then(() => {
            CONST.detectPendingChangesInClipboard = originalDetectPendingChangesInClipboard;
            this.testInstance = new CollectionsLoader();
            return this.testInstance.load(true);
        })
        .then(() => {
            expect(opacity((dom.latestArticle(1)))).toBeCloseTo(0.6);
            expect(opacity($('.element__headline', dom.collection(0)))).toBeCloseTo(1);
            expect(opacity(('.clipboard .article'))).toBeCloseTo(1);
        })
        .then(done)
        .catch(done.fail);
    });
});

