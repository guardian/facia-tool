import $ from 'jquery';
import drag from 'test/utils/drag';
import images from 'test/utils/images';
import Page from 'test/utils/page';
import * as wait from 'test/utils/wait';
import * as mockjax from 'test/utils/mockjax';

describe('Media Service', function () {
    beforeEach(function (done) {
        images.setup();
        this.testPage = new Page('/test?layout=latest,front:uk', {}, done);
        this.scope = mockjax.scope();
        this.scope({
            url: '/api/usage',
            responseText: {},
            method: 'post'
        });
    });
    afterEach(function (done) {
        images.dispose();
        this.testPage.dispose(done);
        this.scope.clear();
    });

    it('drags an image from the grid', function (done) {
        const testPage = this.testPage;

        this.testPage.regions.front().collection(1).group(1).trail(1).open()
        .then(expectArticleOpen)
        .then(dragFromTheGrid)
        .then(openCutoutImageEditor)
        .then(dragCutoutFromGrid)
        .then(dragInvalidImage)
        .then(saveArticle)
        .then(() => done())
        .catch(done.fail);

        function expectArticleOpen (trail) {
            expect($('.tool--done', trail.dom).is(':visible')).toBe(true);
            return trail;
        }
        function dragFromTheGrid (trail) {
            const sourceImage = new drag.Media([{
                secureUrl: images.path('fivethree.png'),
                dimensions: { width: 500, height: 200 }
            }], 'testImageOrigin');
            return sourceImage.dropTo(trail.innerDroppable())
            .then(() => {
                expect(trail.thumbUrl()).toMatch(/fivethree\.png/);
                expect(trail.isMetadataSelected('imageReplace')).toBe(true);
            })
            .then(() => trail);
        }
        function openCutoutImageEditor (trail) {
            return trail.toggleMetadata('imageCutoutReplace')
            .then(() => {
                expect(trail.isMetadataSelected('imageReplace')).toBe(false);
                expect(trail.isMetadataSelected('imageCutoutReplace')).toBe(true);
            })
            .then(() => trail);
        }
        function dragCutoutFromGrid (trail) {
            var sourceImage = new drag.Media([{
                secureUrl: images.path('squarefour.png'),
                dimensions: { width: 400, height: 400 }
            }], 'cutoutImageOrigin');
            return sourceImage.dropInEditor(
                trail.field('imageCutoutSrc')
            )
            .then(() => {
                expect(trail.thumbUrl()).toMatch(/squarefour\.png/);
                expect(trail.isMetadataSelected('imageCutoutReplace')).toBe(true);
            })
            .then(() => trail);
        }
        function dragInvalidImage (trail) {
            return trail.toggleMetadata('imageReplace')
            .then(() => {
                var sourceImage = new drag.Media([{
                    secureUrl: 'This image is too small',
                    dimensions: { width: 100, height: 60 }
                }], 'tooBig');
                return sourceImage.dropInEditor(
                    trail.field('imageSrc')
                );
            })
            // Wait for the alert to appear
            .then(() => wait.ms(200))
            .then(() => {
                expect(testPage.regions.alert().isVisible()).toBe(true);
                expect(testPage.regions.alert().message()).toMatch(/valid asset/);

                return testPage.regions.alert().close();
            })
            .then(() => trail);
        }
        function saveArticle (trail) {
            return testPage.actions.edit(() => trail.save())
            .assertRequest(request => {
                expect(request.url).toBe('/edits');
                expect(request.data).toEqual({
                    type: 'Update',
                    update: {
                        live: false,
                        draft: true,
                        id: 'latest',
                        item: 'internal-code/page/1',
                        position: 'internal-code/page/1',
                        itemMeta: {
                            group: '0',
                            imageCutoutSrc: images.path('squarefour.png'),
                            imageCutoutSrcHeight: '400',
                            imageCutoutSrcWidth: '400',
                            imageCutoutSrcOrigin: 'cutoutImageOrigin',
                            imageReplace: true
                        }
                    }
                });
            })
            .respondWith({
                latest: {
                    draft: [{
                        id: 'internal-code/page/1',
                        meta: {
                            imageReplace: true,
                            imageSrc: 'something dragged from media'
                        }
                    }]
                }
            })
            .done;
        }
    });
});
