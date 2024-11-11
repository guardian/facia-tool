import $ from 'jquery';
import ko from 'knockout';
import _ from 'underscore';
import Editor from 'models/article/editor';
import all from 'test/fixtures/all-editors';
import drag from 'test/utils/drag';
import images from 'test/utils/images';
import inject from 'test/utils/inject';
import textInside from 'test/utils/text-inside';
import 'widgets/trail-editor.html!text';
import * as wait from 'test/utils/wait';
import * as mockjax from 'test/utils/mockjax';

describe('Editors', function () {
    beforeEach(function () {
        images.setup();
        this.article = {
            meta: {},
            fields: {},
            state: { enableContentOverrides: ko.observable(true) },
            group: {
                parentType: 'Collection',
                parent: {}
            }
        };
        all.forEach(field => this.article.meta[field.key] = ko.observable());
        this.editors = all.map(field => Editor.create(field, this.article, all)).filter(Boolean);

        this.ko = inject(`
            <!-- ko foreach: editors -->
                <trail-editor-widget params="context: $context"></trail-editor-widget>
            <!-- /ko -->
        `);
        this.scope = mockjax.scope();
        this.scope({
            url: '/api/usage',
            responseText: {},
            method: 'post'
        });
        return this.ko.apply({ editors: this.editors });
    });
    afterEach(function () {
        images.dispose();
        this.ko.dispose();
        this.scope.clear();
    });

    it('toggles boolean values', function (done) {
        $('.editor--boolean--one').click();
        expect($('.editor--boolean--one').hasClass('selected')).toBe(true);
        expect($('.element__field').is(':visible')).toBe(true);
        wait.ms(150).then(() => {
            // the field visibility is rate limited
            expect($('.editor__length').length).toBe(1);

            // Select another singleton
            $('.editor--boolean--two').click();
            expect($('.editor--boolean--one').hasClass('selected')).toBe(false);
            expect($('.element__field').is(':visible')).toBe(false);
            expect($('.editor--boolean--two').hasClass('selected')).toBe(true);

            $('.editor--boolean--three').click();
            expect($('.editor--boolean--one').hasClass('selected')).toBe(false);
            expect($('.element__field').is(':visible')).toBe(false);
            expect($('.editor--boolean--two').hasClass('selected')).toBe(false);
            expect($('.editor--boolean--three').hasClass('selected')).toBe(true);

            $('.editor--boolean--one').click();
            expect($('.editor--boolean--one').hasClass('selected')).toBe(true);
            expect($('.element__field').is(':visible')).toBe(true);
            expect($('.editor__length').length).toBe(1);
            $('.element__field').val('more than 5 letters').change();
            expect(textInside('.editor__length')).toBe('-' + ('more than 5 letters'.length - 5));

            $('.editor__revert').click();
            expect($('.element__field').val()).toBe('');

            // Toggle off
            $('.editor--boolean--one').click();
            expect($('.editor--boolean--one').hasClass('selected')).toBe(false);
            expect($('.element__field').is(':visible')).toBe(false);

            return wait.ms(150);
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('validates inputs', function (done) {
        var imageEditor = _.find(this.editors, editor => editor.key === 'image');
        spyOn(imageEditor, 'validateImage').and.callThrough();

        $('.element__image').val(images.path('square.png')).change();
        expect(imageEditor.validateImage).toHaveBeenCalled();
        Promise.resolve(imageEditor.validateImage.calls.first().returnValue).then(() => {
            expect(this.article.meta.image()).toMatch(/square\.png/);
            expect(this.article.meta.imageWidth()).toBe(140);
            expect(this.article.meta.imageHeight()).toBe(140);

            imageEditor.validateImage.calls.reset();

            // invalid input
            $('.element__image').val(images.path('this_image_doesnt_exists__promised.png')).change();
            return imageEditor.validateImage.calls.first().returnValue;
        })
        .then(() => {
            expect(this.article.meta.image()).toBeUndefined();
            expect(this.article.meta.imageWidth()).toBeUndefined();
            expect(this.article.meta.imageHeight()).toBeUndefined();
        })
        .then(() => done())
        .catch(done.fail);
    });

    it('list editor with drop in editor', function (done) {
        var listEditor = _.find(this.editors, editor => editor.key === 'list').items[0];
        spyOn(listEditor, 'assignToObjectElement').and.callThrough();

        var firstBlock = $('.editor--image')[0];
        var secondBlock = $('.editor--image')[1];
        var sourceImage = new drag.Media([{
            secureUrl: images.path('squarefour.png'),
            dimensions: { width: 400, height: 400 }
        }], 'imageOrigin');
        sourceImage.dropInEditor(firstBlock)
        .then(() => {
            var listImages = this.article.meta.list();
            expect(listImages.length).toBe(3);
            expect(listImages[0].origin).toEqual('imageOrigin');
            expect(listImages[0].src).toMatch(/squarefour\.png/);
            expect(listImages[0].width).toBe(400);
            expect(listImages[0].height).toBe(400);
            expect(listImages[1]).toBeUndefined();
            expect(listImages[2]).toBeUndefined();

            // drag the same image to the second position
            sourceImage = new drag.MediaMeta(listImages[0]);
            return sourceImage.dropInEditor(secondBlock);
        })
        .then(() => {
            var listImages = this.article.meta.list();
            expect(listImages.length).toBe(3);
            expect(listImages[0].origin).toEqual('imageOrigin');
            expect(listImages[0].src).toMatch(/squarefour\.png/);
            expect(listImages[0].width).toBe(400);
            expect(listImages[0].height).toBe(400);

            expect(listImages[1].origin).toEqual('imageOrigin');
            expect(listImages[1].src).toMatch(/squarefour\.png/);
            expect(listImages[1].width).toBe(400);
            expect(listImages[1].height).toBe(400);

            expect(listImages[2]).toBeUndefined();

            return sourceImage.dropInEditor(firstBlock);
        })
        .then(() => {
            var listImages = this.article.meta.list();
            expect(listImages[1].origin).toEqual('imageOrigin');
            expect(listImages[1].src).toMatch(/squarefour\.png/);
            expect(listImages[1].width).toBe(400);
            expect(listImages[1].height).toBe(400);
            expect(listImages[2]).toBeUndefined();
        })
        .then(() => done())
        .catch(done.fail);
    });
});
