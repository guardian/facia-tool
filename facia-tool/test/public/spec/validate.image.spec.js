import {validateImageSrc, validateImageEvent} from 'utils/validate-image-src';
import grid from 'utils/grid';
import GridUtil from 'grid-util-js';
import images from 'test/utils/images';

describe('Validate images', function () {
    beforeEach(function () {
        images.setup();
        images.setModel();

        grid.gridInstance = new GridUtil({
            apiBaseUrl: '/api.grid'
        });
    });
    afterEach(function () {
        images.dispose();
        grid.gridInstance = null;
    });

    describe('- invalid', function () {
        it('missing images', function (done) {
            validateImageSrc()
            .then(done.fail, function (err) {
                expect(err.message).toMatch(/missing/i);
                done();
            });
        });

        it('unknown domain', function (done) {
            validateImageSrc('http://another-host/image.png')
            .then(done.fail, function (err) {
                expect(err.message).toMatch(/images must come/i);
                done();
            });
        });
    });

    describe('- from image CDN', function () {
        it('fails if the image can\'t be found', function (done) {
            validateImageSrc(images.path('this_image_doesnt_exists__promised.png'))
            .then(done.fail, err => {
                expect(err.message).toMatch(/could not be found/i);
                done();
            });
        });

        it('fails if the image is too big', function (done) {
            var criteria = {
                maxWidth: 50
            };

            validateImageSrc(images.path('square.png'), criteria)
            .then(done.fail, err => {
                expect(err.message).toMatch(/cannot be more/i);
                done();
            });
        });

        it('fails if the image is too small', function (done) {
            var criteria = {
                minWidth: 200
            };

            validateImageSrc(images.path('square.png'), criteria)
            .then(done.fail, err => {
                expect(err.message).toMatch(/cannot be less/i);
                done();
            });
        });

        it('fails if the aspect ratio is wrong', function (done) {
            var criteria = {
                widthAspectRatio: 5,
                heightAspectRatio: 3
            };

            validateImageSrc(images.path('square.png'), criteria)
            .then(done.fail, err => {
                expect(err.message).toMatch(/aspect ratio/i);
                done();
            });
        });

        it('works with no criteria', function (done) {
            validateImageSrc(images.path('square.png'))
            .then(image => {
                expect(image.width).toBe(140);
                expect(image.height).toBe(140);
                expect(image.src).toMatch(/square\.png/);
                expect(image.origin).toMatch(/square\.png/);
                done();
            }, done.fail);
        });

        it('works with if all criteria are met', function (done) {
            var criteria = {
                minWidth: 100,
                maxWidth: 200,
                widthAspectRatio: 1,
                heightAspectRatio: 1
            };

            validateImageSrc(images.path('square.png'), criteria)
            .then(image => {
                expect(image.width).toBe(140);
                expect(image.height).toBe(140);
                expect(image.src).toMatch(/square\.png/);
                expect(image.origin).toMatch(/square\.png/);
                done();
            }, done.fail);
        });
    });

    describe('- from imgIX', function () {
        it('strips unnecessary parameters', function (done) {
            validateImageSrc(images.imgIX('square.png?s=82a57a91afadd159bb4639d6b798f6c5&other=params'))
            .then(function (image) {
                expect(image.width).toBe(140);
                expect(image.height).toBe(140);
                expect(image.src).toMatch(/square\.png$/);
                expect(image.origin).toMatch(/square\.png$/);
                done();
            }, done.fail);
        });
    });

    describe('- from the Grid', function () {
        it('fails if media is not accessible', function (done) {
            grid.gridInstance.getImage = () => {
                return Promise.reject('error while loading');
            };

            validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890')
            .then(done.fail, err => {
                expect(err.message).toMatch(/unable to locate/i);
                done();
            });
        });

        describe('- link include crop id', function () {
            it('fails if crop id is invalid', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{ id: 'nice_crop_id' }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop')
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('fails if crop doesn\'t respect criteria', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{
                                id: 'image_crop',
                                assets: [
                                    { dimensions: { width: 5000, height: 100 } },
                                    { dimensions: { width: 500, height: 10 } },
                                    { dimensions: { width: 50, height: 1 } }
                                ]
                            }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop', {
                    minWidth: 100,
                    maxWidth: 1000,
                    widthAspectRatio: 5,
                    heightAspectRatio: 4
                })
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('gets the specified asset', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{
                                id: 'image_crop',
                                assets: [
                                    { dimensions: { width: 1400, height: 1400 } },
                                    {
                                        file: images.path('square.png'),
                                        dimensions: { width: 140, height: 140 }
                                    }
                                ]
                            }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop', {
                    minWidth: 100,
                    maxWidth: 1000,
                    widthAspectRatio: 1,
                    heightAspectRatio: 1
                })
                .then(image => {
                    expect(image.width).toBe(140);
                    expect(image.height).toBe(140);
                    expect(image.src).toMatch(/square\.png$/);
                    expect(image.origin).toBe('http://media/image/1234567890123456789012345678901234567890');
                })
                .then(done)
                .catch(done.fail);
            });
        });

        describe('- link does not include crop id', function () {
            it('fails if there are no crops', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: { exports: [] }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890')
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('fails if crops don\'t respect criteria', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{
                                id: 'image_crop',
                                assets: [
                                    { dimensions: { width: 5000, height: 100 } },
                                    { dimensions: { width: 500, height: 10 } },
                                    { dimensions: { width: 50, height: 1 } }
                                ]
                            }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890', {
                    minWidth: 100,
                    maxWidth: 1000,
                    widthAspectRatio: 5,
                    heightAspectRatio: 4
                })
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('gets the first valid asset', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{
                                id: 'image_crop',
                                assets: [
                                    { dimensions: { width: 1400, height: 1400 } },
                                    {
                                        file: images.path('square.png'),
                                        dimensions: { width: 140, height: 140 }
                                    }
                                ]
                            }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890', {
                    minWidth: 100,
                    maxWidth: 1000,
                    widthAspectRatio: 1,
                    heightAspectRatio: 1
                })
                .then(image => {
                    expect(image.width).toBe(140);
                    expect(image.height).toBe(140);
                    expect(image.src).toMatch(/square\.png$/);
                    expect(image.origin).toBe('http://media/image/1234567890123456789012345678901234567890');
                })
                .then(done)
                .catch(done.fail);
            });

            it('gets the first asset when no criteria', function (done) {
                grid.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{
                                id: 'image_crop',
                                assets: [
                                    {
                                        file: images.path('square.png'),
                                        dimensions: { width: 800, height: 800 }
                                    }, {
                                        file: 'thumbnail',
                                        dimensions: { width: 140, height: 140 }
                                    }
                                ]
                            }]
                        }
                    });
                };

                validateImageSrc('http://grid.co.uk/1234567890123456789012345678901234567890')
                .then(image => {
                    expect(image.width).toBe(140);
                    expect(image.height).toBe(140);
                    expect(image.src).toMatch(/square\.png$/);
                    expect(image.origin).toBe('http://media/image/1234567890123456789012345678901234567890');
                    expect(image.thumb).toBe('thumbnail');
                })
                .then(done)
                .catch(done.fail);
            });
        });
    });

    describe('- from copy paste event', function () {
        it('fails with invalid item', function (done) {
            grid.gridInstance.getCropFromEvent = () => null;

            validateImageEvent({})
            .then(done.fail, err => {
                expect(err.message).toMatch(/invalid image/i);
                done();
            });
        });

        it('fails when no suitable assets', function (done) {
            grid.gridInstance.getCropFromEvent = () => {
                return {
                    assets: [{
                        file: images.path('square.png'),
                        dimensions: { width: 800, height: 800 }
                    }]
                };
            };

            validateImageEvent({}, {
                maxWidth: 500
            })
            .then(done.fail, err => {
                expect(err.message).toMatch(/does not have a valid asset/i);
                done();
            });
        });

        it('fails when the image 404', function (done) {
            grid.gridInstance.getCropFromEvent = () => {
                return {
                    assets: [{
                        file: 'this_image_doesnt_exists__promised.png',
                        dimensions: { width: 800, height: 800 }
                    }]
                };
            };

            validateImageEvent({})
            .then(done.fail, err => {
                expect(err.message).toMatch(/could not be found/i);
                done();
            });
        });

        it('fails when the actual image doesn\'t validate', function (done) {
            grid.gridInstance.getCropFromEvent = () => {
                return {
                    assets: [{
                        file: images.path('square.png'),
                        dimensions: { width: 800, height: 800 }
                    }]
                };
            };

            validateImageEvent({}, {
                widthAspectRatio: 4,
                heightAspectRatio: 1
            })
            .then(done.fail, err => {
                expect(err.message).toMatch(/aspect ratio/i);
                done();
            });
        });

        it('resolves correctly', function (done) {
            grid.gridInstance.getCropFromEvent = () => {
                return {
                    assets: [{
                        file: images.path('square.png'),
                        dimensions: { width: 800, height: 800 }
                    }, {
                        file: images.path('thumb.png'),
                        dimensions: { width: 400, height: 400 }
                    }],
                    id: 'mediaID'
                };
            };
            grid.gridInstance.getGridUrlFromEvent = () => 'http://media/image/mediaID';

            validateImageEvent({}, {
                widthAspectRatio: 1,
                heightAspectRatio: 1
            })
            .then(image => {
                expect(image.width).toBe(140);
                expect(image.height).toBe(140);
                expect(image.src).toMatch(/square\.png$/);
                expect(image.origin).toBe('http://media/image/mediaID');
                expect(image.thumb).toMatch(/thumb\.png$/);
            })
            .then(done)
            .catch(done.fail);
        });

        it('resolves correctly when it contains a URL', function (done) {
            grid.gridInstance.getCropFromEvent = () => {};
            grid.gridInstance.getGridUrlFromEvent = () => 'http://grid.co.uk/1234567890123456789012345678901234567890';
            grid.gridInstance.getImage = () => Promise.resolve({
                data: {
                    exports: [{
                        id: 'crop_id',
                        assets: [{
                            file: images.path('square.png'),
                            dimensions: { width: 800, height: 800 }
                        }]
                    }]
                }
            });

            validateImageEvent({}, {
                widthAspectRatio: 1,
                heightAspectRatio: 1
            })
            .then(image => {
                expect(image.width).toBe(140);
                expect(image.height).toBe(140);
                expect(image.src).toMatch(/square\.png$/);
                expect(image.origin).toBe('http://media/image/1234567890123456789012345678901234567890');
                expect(image.thumb).toMatch(/square\.png$/);
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
