import ko from 'knockout';
import * as vars from 'modules/vars';
import validate from 'utils/validate-image-src';
import GridUtil from 'grid-util-js';
import images from 'test/utils/images';

describe('Validate images', function () {
    beforeEach(function () {
        images.setup();

        this.originalModel = vars.model;
        vars.setModel({
            state: ko.observable({
                defaults: { apiBaseUrl: '/api.grid', mediaBaseUrl: 'http://media' }
            })
        });

        validate.gridInstance = new GridUtil('/api.grid');
    });
    afterEach(function () {
        images.dispose();
        validate.gridInstance = null;
        vars.setModel(this.originalModel);
    });

    describe('- invalid', function () {
        it('missing images', function (done) {
            validate()
            .then(done.fail, function (err) {
                expect(err.message).toMatch(/missing/i);
                done();
            });
        });

        it('unknown domain', function (done) {
            validate('http://another-host/image.png')
            .then(done.fail, function (err) {
                expect(err.message).toMatch(/images must come/i);
                done();
            });
        });
    });

    describe('- from image CDN', function () {
        it('fails if the image can\'t be found', function (done) {
            validate(images.path('this_image_doesnt_exists__promised.png'))
            .then(done.fail, err => {
                expect(err.message).toMatch(/could not be found/i);
                done();
            });
        });

        it('fails if the image is too big', function (done) {
            var criteria = {
                maxWidth: 50
            };

            validate(images.path('square.png'), criteria)
            .then(done.fail, err => {
                expect(err.message).toMatch(/cannot be more/i);
                done();
            });
        });

        it('fails if the image is too small', function (done) {
            var criteria = {
                minWidth: 200
            };

            validate(images.path('square.png'), criteria)
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

            validate(images.path('square.png'), criteria)
            .then(done.fail, err => {
                expect(err.message).toMatch(/aspect ratio/i);
                done();
            });
        });

        it('works with no criteria', function (done) {
            validate(images.path('square.png'))
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

            validate(images.path('square.png'), criteria)
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
            validate(images.imgIX('square.png?s=82a57a91afadd159bb4639d6b798f6c5&other=params'))
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
            validate.gridInstance.getImage = () => {
                return Promise.reject('error while loading');
            };

            validate('http://grid.co.uk/1234567890123456789012345678901234567890')
            .then(done.fail, err => {
                expect(err.message).toMatch(/unable to locate/i);
                done();
            });
        });

        describe('- link include crop id', function () {
            it('fails if crop id is invalid', function (done) {
                validate.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: {
                            exports: [{ id: 'nice_crop_id' }]
                        }
                    });
                };

                validate('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop')
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('fails if crop doesn\'t respect criteria', function (done) {
                validate.gridInstance.getImage = () => {
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

                validate('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop', {
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
                validate.gridInstance.getImage = () => {
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

                validate('http://grid.co.uk/1234567890123456789012345678901234567890?crop=image_crop', {
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
                validate.gridInstance.getImage = () => {
                    return Promise.resolve({
                        data: { exports: [] }
                    });
                };

                validate('http://grid.co.uk/1234567890123456789012345678901234567890')
                .then(done.fail, err => {
                    expect(err.message).toMatch(/does not have a valid crop/i);
                    done();
                });
            });

            it('fails if crops don\'t respect criteria', function (done) {
                validate.gridInstance.getImage = () => {
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

                validate('http://grid.co.uk/1234567890123456789012345678901234567890', {
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
                validate.gridInstance.getImage = () => {
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

                validate('http://grid.co.uk/1234567890123456789012345678901234567890', {
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
                validate.gridInstance.getImage = () => {
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

                validate('http://grid.co.uk/1234567890123456789012345678901234567890')
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
});
