import $ from 'jquery';
import ko from 'knockout';
import _ from 'underscore';
import Editor from 'models/collections/editor';
import all from 'test/fixtures/all-editors';
import drag from 'test/utils/drag';
import images from 'test/utils/images';
import inject from 'test/utils/inject';
import textInside from 'test/utils/text-inside';
import 'widgets/trail-editor.html!text';
import * as wait from 'test/utils/wait';

describe('Editors', function () {
    beforeEach(function (done) {
        images.setup();
        this.article = {
            meta: {},
            fields: {},
            state: { enableContentOverrides: ko.observable(true) }
        };
        all.forEach(field => this.article.meta[field.key] = ko.observable());
        this.editors = all.map(field => Editor.create(field, this.article, all)).filter(Boolean);

        this.ko = inject(`
            <!-- ko foreach: editors -->
                <trail-editor-widget params="context: $context"></trail-editor-widget>
            <!-- /ko -->
        `);
        this.ko.apply({ editors: this.editors }).then(done);
    });
    afterEach(function () {
        images.dispose();
        this.ko.dispose();
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
        .then(done)
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
        .then(done)
        .catch(done.fail);
    });

    it('list editor with drop in editor', function (done) {
        var listEditor = _.find(this.editors, editor => editor.key === 'list').items[0];
        spyOn(listEditor, 'validateListImage').and.callThrough();

        var target = $('.editor--image')[0];
        var sourceImage = new drag.Media([{
            file: images.path('squarefour.png'),
            dimensions: { width: 400, height: 400 }
        }], 'imageOrigin');
        drag.droppable(target).dropInEditor(target, sourceImage);

        expect(listEditor.validateListImage).toHaveBeenCalled();
        listEditor.validateListImage.calls.first().returnValue.then(() => {
            var listImages = this.article.meta.list();
            expect(listImages.length).toBe(3);
            expect(listImages[0].origin).toEqual('imageOrigin');
            expect(listImages[0].src).toMatch(/squarefour\.png/);
            expect(listImages[0].width).toBe(400);
            expect(listImages[0].height).toBe(400);
            expect(listImages[1]).toBeUndefined();
            expect(listImages[2]).toBeUndefined();

            listEditor.validateListImage.calls.reset();

            // invalid input
            sourceImage = new drag.Media([{
                file: images.path('this_image_doesnt_exists__promised.png'),
                dimensions: { width: 400, height: 400 }
            }], 'fakeOrigin');
        drag.droppable(target).dropInEditor(target, sourceImage);
            return listEditor.validateListImage.calls.first().returnValue;
        })
        .then(() => {
            var listImages = this.article.meta.list();
            expect(listImages[0]).toBeUndefined();
            expect(listImages[1]).toBeUndefined();
            expect(listImages[2]).toBeUndefined();
        })
        .then(done)
        .catch(done.fail);
    });
});
